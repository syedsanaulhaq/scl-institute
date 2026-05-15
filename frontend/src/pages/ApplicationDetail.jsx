import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    Mail,
    Phone,
    Calendar,
    User,
    MapPin,
    BookOpen,
    GraduationCap,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Edit,
    Loader2,
    ShieldAlert,
    ShieldCheck,
    ClipboardCheck
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const formatDate = (value) => {
    if (!value) return 'N/A';
    try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return value; }
};

const statusConfig = {
    submitted:            { label: 'Pending Review',       bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500' },
    under_review:         { label: 'Under Review',         bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    accepted:             { label: 'Accepted',             bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
    approved:             { label: 'Approved',             bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
    rejected:             { label: 'Rejected',             bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500' },
    conditional_accept:   { label: 'Conditional Accept',   bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
    interview_scheduled:  { label: 'Interview Scheduled',  bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
};

const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || { label: status?.replace(/_/g, ' ') || 'Unknown', bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

const Field = ({ label, value, className = '' }) => (
    <div className={className}>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
    </div>
);

const SectionCard = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

// ── Gate check — same logic as ApplicationRequests & ApplicationReview ──────────
const gateCheck = (req, app) => {
    const area = (req.area || '').toLowerCase();

    if (area.includes('english') || area.includes('language') || area.includes('ielts') || area.includes('proficiency')) {
        const prof = (app.english_proficiency || '').trim();
        const score = parseFloat(app.english_score) || 0;
        if (!prof) return { status: 'fail', verdict: 'No English qualification provided', value: '—' };
        const p = prof.toUpperCase();
        if (p.includes('IELTS'))  return score >= 5.5 ? { status: 'pass', verdict: `IELTS ${score} ≥ 5.5`,   value: `IELTS ${score}` } : { status: 'fail', verdict: `IELTS ${score} — minimum 5.5 required`, value: `IELTS ${score}` };
        if (p.includes('TOEFL'))  return score >= 60  ? { status: 'pass', verdict: `TOEFL ${score} ≥ 60`,    value: `TOEFL ${score}` } : { status: 'fail', verdict: `TOEFL ${score} — minimum 60 required`,  value: `TOEFL ${score}` };
        if (p.includes('PTE'))    return score >= 42  ? { status: 'pass', verdict: `PTE ${score} ≥ 42`,      value: `PTE ${score}`   } : { status: 'fail', verdict: `PTE ${score} — minimum 42 required`,    value: `PTE ${score}`   };
        if (['NATIVE','FIRST LANGUAGE','UK','EXEMPT'].some(k => p.includes(k))) return { status: 'pass', verdict: 'Native/exempt — no test required', value: prof };
        return { status: 'review', verdict: `${prof} — manual verification needed`, value: `${prof}${score ? ` ${score}` : ''}` };
    }

    if (area.includes('entry') || area.includes('qualification') || area.includes('academic') || area.includes('minimum qual')) {
        const qual = (app.highest_qualification || '').toLowerCase();
        if (!qual) return { status: 'fail', verdict: 'No qualification recorded', value: '—' };
        const level3Plus = ['a-level','a level','as level','btec','nvq level 3','level 3','hnc','hnd','access to he','access to higher','foundation degree','fd ','degree','bachelor','bsc','ba ','msc','ma ','phd','pgce','diploma of higher','higher national'];
        if (level3Plus.some(q => qual.includes(q))) return { status: 'pass', verdict: 'Meets Level 3+ entry requirement', value: app.highest_qualification };
        const hasExp = (app.relevant_work_experience || '').trim().length > 20;
        if (hasExp) return { status: 'review', verdict: `${app.highest_qualification} below Level 3 — work experience to be assessed`, value: app.highest_qualification };
        return { status: 'fail', verdict: `${app.highest_qualification} does not meet Level 3 entry requirement`, value: app.highest_qualification };
    }

    if (area.includes('rpl') || area.includes('prior learning') || area.includes('credit transfer')) {
        const exp = (app.relevant_work_experience || '').trim();
        if (exp.length > 20) return { status: 'review', verdict: 'Work/prior learning provided — RPL assessment required', value: exp.slice(0, 50) + (exp.length > 50 ? '…' : '') };
        return { status: 'review', verdict: 'No prior learning documented — RPL not applicable', value: '—' };
    }

    if (area.includes('documentation') || area.includes('enrolment doc') || area.includes('enrollment doc')) {
        return (req.compliance_status || '').toLowerCase() === 'completed'
            ? { status: 'pass', verdict: 'Documentation checklist completed', value: 'Completed' }
            : { status: 'review', verdict: 'ID, qualifications & visa to be verified at enrolment', value: 'Pending' };
    }

    return { status: 'review', verdict: 'Reviewed by admissions team', value: 'N/A' };
};

const ApplicationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inductionContext, setInductionContext] = useState(null);
    const [inductionLoading, setInductionLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/students/applications/${id}`);
                if (res.data?.success) {
                    setApp(res.data.data?.application || res.data.data);
                } else {
                    setError('Application not found.');
                }
            } catch {
                setError('Failed to load application.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    useEffect(() => {
        if (!app?.course_code) return;
        setInductionLoading(true);
        axios.get(`${API_URL}/induction-driven/induction-context/${app.course_code}`)
            .then(r => setInductionContext(r.data?.data || null))
            .catch(() => setInductionContext(null))
            .finally(() => setInductionLoading(false));
    }, [app?.course_code]);

    const gateResult = useMemo(() => {
        if (!inductionContext || !app) return null;
        const section4 = inductionContext.sections?.[4] || [];
        if (!section4.length) return null;
        const results = section4.map(req => ({ req, check: gateCheck(req, app) }));
        const failCount   = results.filter(r => r.check.status === 'fail').length;
        const reviewCount = results.filter(r => r.check.status === 'review').length;
        const passCount   = results.filter(r => r.check.status === 'pass').length;
        const overall = failCount > 0 ? 'fail' : reviewCount > 0 ? 'review' : 'pass';
        return { results, section5: inductionContext.sections?.[5] || [], failCount, reviewCount, passCount, overall, version: inductionContext.version, course_code: inductionContext.course_code };
    }, [inductionContext, app]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !app) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-gray-700 font-medium">{error || 'Application not found.'}</p>
                <button onClick={() => navigate('/applications')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Back to Applications
                </button>
            </div>
        );
    }

    const gateColors = {
        fail:   { headerBg: 'bg-red-600',    badge: 'bg-red-100 text-red-700',    rowBorder: 'border-red-200',    rowBg: 'bg-red-50',    icon: '✗', iconCls: 'text-red-600 bg-red-100',    textCls: 'text-red-700' },
        review: { headerBg: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700',rowBorder: 'border-amber-200',  rowBg: 'bg-amber-50',  icon: '⚠', iconCls: 'text-amber-600 bg-amber-100',  textCls: 'text-amber-700' },
        pass:   { headerBg: 'bg-emerald-600',badge: 'bg-emerald-100 text-emerald-700',rowBorder: 'border-emerald-200',rowBg: 'bg-emerald-50',icon: '✓', iconCls: 'text-emerald-600 bg-emerald-100',textCls: 'text-emerald-700' },
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Top bar ── */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/applications')}
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            Back to Applications
                        </button>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Application</span>
                            <span className="text-sm font-mono font-bold text-blue-700">{app.application_reference}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={app.application_status} />
                        <button
                            onClick={() => navigate(`/applications/${id}/edit`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                        </button>
                        <button
                            onClick={() => navigate(`/applications/${id}/review`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            Review &amp; Decision
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Hero header ── */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                                {(app.first_name?.[0] || '?').toUpperCase()}{(app.last_name?.[0] || '').toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{app.first_name} {app.middle_names ? `${app.middle_names} ` : ''}{app.last_name}</h1>
                                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-blue-200 text-sm">
                                    {app.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{app.email}</span>}
                                    {app.contact_number && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{app.contact_number}</span>}
                                    {app.submitted_at && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Submitted {formatDate(app.submitted_at)}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block text-right">
                            <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">Course</p>
                            <p className="text-white font-semibold">{app.course_title || '—'}</p>
                            <p className="text-blue-200 text-sm font-mono">{app.course_code}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">

                {/* Induction Gate — shown first, prominently */}
                {inductionLoading && (
                    <div className="bg-white rounded-xl border border-purple-200 p-4 flex items-center gap-3 text-purple-700 shadow-sm">
                        <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                        <span className="text-sm font-medium">Running induction scrutiny check for {app.course_code}…</span>
                    </div>
                )}

                {!inductionLoading && gateResult && (() => {
                    const overall = gateResult.overall;
                    const gc = gateColors[overall];
                    const overallLabel = overall === 'fail' ? 'INDUCTION GATE: FAILED' : overall === 'review' ? 'INDUCTION GATE: REVIEW REQUIRED' : 'INDUCTION GATE: ALL CONDITIONS MET';
                    const overallSub = overall === 'fail'
                        ? `${gateResult.failCount} entry condition(s) not met — cannot proceed to offer`
                        : overall === 'review'
                        ? `${gateResult.passCount} passed · ${gateResult.reviewCount} require manual verification`
                        : `All ${gateResult.passCount} admission requirements satisfied`;

                    return (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Title bar */}
                            <div className="flex items-center justify-between px-5 py-3 bg-purple-700">
                                <div className="flex items-center gap-2 text-white">
                                    {overall === 'pass' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                    <span className="text-sm font-bold uppercase tracking-wide">Induction Scrutiny Gate</span>
                                </div>
                                <span className="text-purple-200 text-xs font-mono">{gateResult.course_code} · v{gateResult.version}</span>
                            </div>

                            {/* Overall result banner */}
                            <div className={`${gc.headerBg} px-5 py-4 flex items-center gap-4`}>
                                <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">{gc.icon}</span>
                                <div className="flex-1">
                                    <p className="text-white font-bold tracking-wide">{overallLabel}</p>
                                    <p className="text-white/80 text-sm mt-0.5">{overallSub}</p>
                                </div>
                                <div className="hidden sm:flex gap-4 text-white/70 text-xs text-right">
                                    <div><div className="text-white font-bold text-lg">{gateResult.passCount}</div>PASS</div>
                                    <div><div className="text-white font-bold text-lg">{gateResult.reviewCount}</div>REVIEW</div>
                                    <div><div className="text-white font-bold text-lg">{gateResult.failCount}</div>FAIL</div>
                                </div>
                            </div>

                            {/* Per-requirement rows */}
                            <div className="p-5 bg-gray-50 space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Section 4 — Admission &amp; Enrolment Conditions</p>
                                    <div className="space-y-2">
                                        {gateResult.results.map(({ req, check }, i) => {
                                            const c = gateColors[check.status];
                                            return (
                                                <div key={i} className={`rounded-lg border ${c.rowBorder} ${c.rowBg} p-3.5 flex gap-3 items-start`}>
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.iconCls}`}>{c.icon}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="text-sm font-semibold text-gray-800">{req.area}</p>
                                                            {check.value && check.value !== 'N/A' && (
                                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${c.rowBorder} bg-white/70 font-medium ${c.textCls} flex-shrink-0`}>
                                                                    {check.value}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {req.description && <p className="text-xs text-gray-500 mt-0.5">{req.description}</p>}
                                                        <p className={`text-xs mt-1 font-medium ${c.textCls}`}>{check.verdict}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {gateResult.section5.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Section 5 — Fee Structure (Informational)</p>
                                        <div className="grid sm:grid-cols-2 gap-2">
                                            {gateResult.section5.map((r, i) => (
                                                <div key={i} className="bg-white rounded-lg border border-gray-200 px-3 py-2.5 flex justify-between items-start gap-2">
                                                    <span className="text-sm font-medium text-gray-700">{r.area}</span>
                                                    <span className="text-xs text-gray-400 text-right">{r.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {overall === 'fail' && (
                                    <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 flex items-start gap-2">
                                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700 font-medium">
                                            Offer and Conditional Offer are blocked on the review form until failed conditions are resolved or overridden with documented justification.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Two-column layout for detail sections */}
                <div className="grid md:grid-cols-2 gap-5">
                    <SectionCard icon={User} title="Personal Information">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Full Name" value={`${app.first_name || ''} ${app.middle_names || ''} ${app.last_name || ''}`.trim()} className="col-span-2" />
                            <Field label="Date of Birth" value={formatDate(app.date_of_birth)} />
                            <Field label="Gender" value={app.gender} />
                            <Field label="Nationality" value={app.nationality} />
                            <Field label="Country" value={app.country_of_residence} />
                            <Field label="Email" value={app.email} className="col-span-2" />
                            <Field label="Phone" value={app.contact_number} className="col-span-2" />
                        </div>
                    </SectionCard>

                    <SectionCard icon={MapPin} title="Address">
                        <div className="space-y-3">
                            <Field label="Address Line 1" value={app.address_line1} />
                            {app.address_line2 && <Field label="Address Line 2" value={app.address_line2} />}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Town / City" value={app.town_city} />
                                <Field label="Postcode" value={app.postcode} />
                            </div>
                            <Field label="Country" value={app.country_of_residence} />
                        </div>
                    </SectionCard>

                    <SectionCard icon={BookOpen} title="Course Selection">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Course Title" value={app.course_title} className="col-span-2" />
                            <Field label="Course Code" value={app.course_code} />
                            <Field label="Course Type" value={app.course_type} />
                            <Field label="Mode of Study" value={app.mode_of_study} />
                            <Field label="Entry Route" value={app.entry_route} />
                            <Field label="Intake Start" value={formatDate(app.intake_start_date)} className="col-span-2" />
                        </div>
                    </SectionCard>

                    <SectionCard icon={GraduationCap} title="Academic Background">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Highest Qualification" value={app.highest_qualification} className="col-span-2" />
                            <Field label="Institution" value={app.institution_name} className="col-span-2" />
                            <Field label="Year Completed" value={app.year_completed} />
                            <Field label="English Proficiency" value={app.english_proficiency} />
                            <Field label="English Score" value={app.english_score} />
                        </div>
                        {app.relevant_work_experience && (
                            <div className="mt-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Work Experience</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{app.relevant_work_experience}</p>
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Personal Statement */}
                {app.personal_statement && (
                    <SectionCard icon={FileText} title="Personal Statement">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{app.personal_statement}</p>
                    </SectionCard>
                )}

                {/* Status summary + quick action bar */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Current Status</p>
                            <StatusBadge status={app.application_status} />
                        </div>
                        <div className="hidden sm:block h-8 w-px bg-gray-200" />
                        <div className="hidden sm:block">
                            <p className="text-xs text-gray-500 mb-0.5">Submitted</p>
                            <p className="text-sm font-medium text-gray-900">{formatDate(app.submitted_at)}</p>
                        </div>
                        {app.updated_at && (
                            <>
                                <div className="hidden sm:block h-8 w-px bg-gray-200" />
                                <div className="hidden sm:block">
                                    <p className="text-xs text-gray-500 mb-0.5">Last Updated</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDate(app.updated_at)}</p>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(`/applications/${id}/edit`)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Application
                        </button>
                        <button
                            onClick={() => navigate(`/applications/${id}/review`)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            <ClipboardCheck className="w-4 h-4" />
                            Review &amp; Decision
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetail;

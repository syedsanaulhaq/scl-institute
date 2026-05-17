import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Loader2, BookOpen, ClipboardList, HelpCircle, MessageSquare, FileText, Link2, Layout, AlertCircle } from 'lucide-react';
import { fetchTeacherPortalData } from '../../utils/teacherPortal';

const STAT_CONFIG = [
    { key: 'assign',   label: 'Assignments', icon: ClipboardList, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
    { key: 'quiz',     label: 'Quizzes',     icon: HelpCircle,    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    { key: 'forum',    label: 'Forums',      icon: MessageSquare, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
    { key: 'resource', label: 'Resources',   icon: FileText,      color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
    { key: 'url',      label: 'Links',       icon: Link2,         color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
    { key: 'page',     label: 'Pages',       icon: Layout,        color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
    { key: 'modules',  label: 'Total Modules', icon: BookOpen,    color: '#1F2937', bg: '#F3F4F6', border: '#D1D5DB' },
];

const TeacherReports = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [courseRows, setCourseRows] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const result = await fetchTeacherPortalData(user?.email);
                setCourseRows(result.courseRows || []);
            } catch (err) {
                console.error('Failed to load teacher reports:', err);
                setError('Unable to load report data.');
            } finally {
                setLoading(false);
            }
        };
        if (user?.email) load();
    }, [user]);

    const totals = useMemo(() => courseRows.reduce((acc, c) => {
        acc.assign  += c.counts.assign;
        acc.quiz    += c.counts.quiz;
        acc.forum   += c.counts.forum;
        acc.resource+= c.counts.resource;
        acc.url     += c.counts.url;
        acc.page    += c.counts.page;
        acc.modules += c.moduleCount;
        return acc;
    }, { assign: 0, quiz: 0, forum: 0, resource: 0, url: 0, page: 0, modules: 0 }), [courseRows]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: '#2563EB' }} />
                <p className="mt-3 text-sm" style={{ color: '#6B7280' }}>Loading reports…</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-6">
            <div className="rounded-xl border p-6 text-center" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
                <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#DC2626' }} />
                <p style={{ color: '#B91C1C' }}>{error}</p>
            </div>
        </div>
    );

    return (
        <div className="px-5 pt-4 pb-8" style={{ background: '#FFFFFF', minHeight: '100vh' }}>

            {/* Page Header */}
            <div className="mb-6">
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9CA3AF' }}>Overview</p>
                <h1 className="text-2xl font-bold mt-0.5" style={{ color: '#1F2937' }}>
                    Teaching <span style={{ color: '#2563EB' }}>Report</span>
                </h1>
                <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Activity and assessment breakdown across your courses.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
                {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg, border }) => (
                    <div key={key} className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${border}` }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: '#fff', border: `1px solid ${border}` }}>
                            <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#1F2937' }}>{totals[key]}</p>
                        <p className="text-xs font-medium mt-0.5" style={{ color, fontSize: '11px', letterSpacing: '0.03em' }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Course Breakdown Table */}
            <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                        <BarChart3 className="w-4 h-4" style={{ color: '#2563EB' }} />
                        Course Breakdown
                    </h2>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                        {courseRows.length} course{courseRows.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {courseRows.length === 0 ? (
                    <div className="p-12 text-center" style={{ color: '#9CA3AF' }}>
                        <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No courses found for reporting.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                    <th className="text-left px-5 py-3" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#6B7280' }}>Course</th>
                                    <th className="text-left px-4 py-3" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#6B7280' }}>Code</th>
                                    {STAT_CONFIG.slice(0, 6).map(s => (
                                        <th key={s.key} className="text-right px-4 py-3" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#6B7280' }}>{s.label}</th>
                                    ))}
                                    <th className="text-right px-5 py-3" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#6B7280' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseRows.map((row, idx) => {
                                    const initials = row.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';
                                    return (
                                        <tr key={row.id} className="transition-colors hover:bg-blue-50"
                                            style={{ borderBottom: idx < courseRows.length - 1 ? '1px solid #F3F4F6' : 'none', background: idx % 2 === 1 ? '#FAFAFA' : '#fff' }}>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                                        style={{ background: '#EFF6FF', color: '#2563EB' }}>{initials}</div>
                                                    <span className="font-medium text-sm" style={{ color: '#1F2937' }}>{row.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: '#F3F4F6', color: '#374151' }}>{row.code}</span>
                                            </td>
                                            {[row.counts.assign, row.counts.quiz, row.counts.forum, row.counts.resource, row.counts.url, row.counts.page].map((val, i) => (
                                                <td key={i} className="px-4 py-3.5 text-right">
                                                    {val > 0 ? (
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                                            style={{ background: STAT_CONFIG[i].bg, color: STAT_CONFIG[i].color }}>
                                                            {val}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs" style={{ color: '#D1D5DB' }}>—</span>
                                                    )}
                                                </td>
                                            ))}
                                            <td className="px-5 py-3.5 text-right">
                                                <span className="text-sm font-bold" style={{ color: '#1F2937' }}>{row.moduleCount}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: '#F9FAFB', borderTop: '2px solid #E5E7EB' }}>
                                    <td className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: '#6B7280' }} colSpan={2}>Totals</td>
                                    {[totals.assign, totals.quiz, totals.forum, totals.resource, totals.url, totals.page].map((val, i) => (
                                        <td key={i} className="px-4 py-3 text-right">
                                            <span className="text-sm font-bold" style={{ color: STAT_CONFIG[i].color }}>{val}</span>
                                        </td>
                                    ))}
                                    <td className="px-5 py-3 text-right text-sm font-bold" style={{ color: '#1F2937' }}>{totals.modules}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherReports;


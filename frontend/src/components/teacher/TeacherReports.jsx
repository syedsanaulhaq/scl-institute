import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Loader2, BookOpen, ClipboardList, HelpCircle, MessageSquare, FileText, Link2, Layout, AlertCircle, ExternalLink, TrendingUp, Award, ChevronUp, ChevronDown } from 'lucide-react';
import { fetchTeacherPortalData } from '../../utils/teacherPortal';
import { openMoodleSSO } from '../../utils/ssoService';

const TYPES = [
    { key: 'assign',   label: 'Assignments', short: 'Assign', icon: ClipboardList, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
    { key: 'quiz',     label: 'Quizzes',     short: 'Quiz',   icon: HelpCircle,    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    { key: 'forum',    label: 'Forums',      short: 'Forum',  icon: MessageSquare, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
    { key: 'resource', label: 'Resources',   short: 'Res',    icon: FileText,      color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
    { key: 'url',      label: 'Links',       short: 'Links',  icon: Link2,         color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
    { key: 'page',     label: 'Pages',       short: 'Pages',  icon: Layout,        color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
];

const TeacherReports = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [courseRows, setCourseRows] = useState([]);
    const [ssoLoading, setSsoLoading] = useState(false);
    const [sortKey, setSortKey] = useState('modules');
    const [sortDir, setSortDir] = useState('desc');

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true); setError('');
                const result = await fetchTeacherPortalData(user?.email);
                setCourseRows(result.courseRows || []);
            } catch (err) {
                console.error('Failed to load teacher reports:', err);
                setError('Unable to load report data.');
            } finally { setLoading(false); }
        };
        if (user?.email) load();
    }, [user]);

    const handleOpenCourse = async (courseId) => {
        try { setSsoLoading(true); await openMoodleSSO(`/course/view.php?id=${courseId}`); }
        catch { /* silent */ } finally { setSsoLoading(false); }
    };

    const totals = useMemo(() => courseRows.reduce((acc, c) => {
        TYPES.forEach(t => { acc[t.key] = (acc[t.key] || 0) + c.counts[t.key]; });
        acc.modules += c.moduleCount;
        return acc;
    }, { assign: 0, quiz: 0, forum: 0, resource: 0, url: 0, page: 0, modules: 0 }), [courseRows]);

    const totalActivities = TYPES.reduce((s, t) => s + (totals[t.key] || 0), 0);
    const maxModules = useMemo(() => Math.max(...courseRows.map(r => r.moduleCount), 1), [courseRows]);
    const topCourse  = useMemo(() => courseRows.length > 0 ? courseRows.reduce((b, c) => c.moduleCount > b.moduleCount ? c : b, courseRows[0]) : null, [courseRows]);
    const emptyCourses = useMemo(() => courseRows.filter(r => r.moduleCount === 0), [courseRows]);

    const sortedRows = useMemo(() => {
        return [...courseRows].sort((a, b) => {
            const va = sortKey === 'modules' ? a.moduleCount : sortKey === 'name' ? a.name : (a.counts[sortKey] || 0);
            const vb = sortKey === 'modules' ? b.moduleCount : sortKey === 'name' ? b.name : (b.counts[sortKey] || 0);
            if (sortDir === 'asc') return va > vb ? 1 : -1;
            return va < vb ? 1 : -1;
        });
    }, [courseRows, sortKey, sortDir]);

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const SortIcon = ({ k }) => sortKey !== k ? null : sortDir === 'asc'
        ? <ChevronUp className="w-3 h-3 inline-block ml-0.5" />
        : <ChevronDown className="w-3 h-3 inline-block ml-0.5" />;

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

            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9CA3AF' }}>Overview</p>
                    <h1 className="text-2xl font-bold mt-0.5" style={{ color: '#1F2937' }}>Teaching <span style={{ color: '#2563EB' }}>Report</span></h1>
                    <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Activity and assessment breakdown across all your courses.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Last updated</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: '#374151' }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
                {[...TYPES, { key: 'modules', label: 'Total Modules', short: 'Total', icon: BookOpen, color: '#1F2937', bg: '#F3F4F6', border: '#D1D5DB' }].map(({ key, label, icon: Icon, color, bg, border }) => (
                    <div key={key} className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${border}` }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: '#fff', border: `1px solid ${border}` }}>
                            <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#1F2937' }}>{totals[key] || 0}</p>
                        <p style={{ color, fontSize: '11px', fontWeight: 600, letterSpacing: '0.03em', marginTop: '2px' }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

                {/* Horizontal bar chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-5" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center gap-2 mb-5">
                        <BarChart3 className="w-4 h-4" style={{ color: '#2563EB' }} />
                        <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Activity Distribution</h2>
                    </div>
                    <div className="space-y-4">
                        {TYPES.map(({ key, label, color }) => {
                            const val = totals[key] || 0;
                            const pct = totalActivities > 0 ? Math.round((val / totalActivities) * 100) : 0;
                            return (
                                <div key={key}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-medium" style={{ color: '#374151' }}>{label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold tabular-nums" style={{ color }}>{val}</span>
                                            <span className="text-xs tabular-nums w-8 text-right" style={{ color: '#9CA3AF' }}>{pct}%</span>
                                        </div>
                                    </div>
                                    <div className="h-3 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color, minWidth: val > 0 ? '4px' : '0' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Stacked total bar */}
                    {totalActivities > 0 && (
                        <div className="mt-5 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
                            <p className="text-xs font-medium mb-2" style={{ color: '#6B7280' }}>Overall mix ({totalActivities} activities)</p>
                            <div className="h-4 rounded-full overflow-hidden flex">
                                {TYPES.map(t => {
                                    const w = totalActivities > 0 ? ((totals[t.key] || 0) / totalActivities) * 100 : 0;
                                    return w > 0 ? <div key={t.key} title={`${t.label}: ${totals[t.key]}`} style={{ width: `${w}%`, background: t.color }} /> : null;
                                })}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                {TYPES.filter(t => (totals[t.key] || 0) > 0).map(t => (
                                    <span key={t.key} className="flex items-center gap-1" style={{ fontSize: '11px', color: '#6B7280' }}>
                                        <span className="w-2 h-2 rounded-sm inline-block" style={{ background: t.color }} />{t.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right panel: highlights */}
                <div className="flex flex-col gap-4">
                    {topCourse && (
                        <div className="bg-white rounded-xl border shadow-sm p-5" style={{ borderColor: '#E5E7EB' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="w-4 h-4" style={{ color: '#F59E0B' }} />
                                <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Most Active Course</h3>
                            </div>
                            <div className="rounded-lg p-3 mb-3" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                                <p className="text-sm font-semibold line-clamp-2" style={{ color: '#1F2937' }}>{topCourse.name}</p>
                                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{topCourse.code}</p>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-2xl font-bold" style={{ color: '#D97706' }}>{topCourse.moduleCount}</span>
                                    <span className="text-xs" style={{ color: '#6B7280' }}>modules</span>
                                </div>
                                <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: '#FDE68A' }}>
                                    <div className="h-full rounded-full" style={{ width: `${Math.round((topCourse.moduleCount / maxModules) * 100)}%`, background: '#D97706' }} />
                                </div>
                            </div>
                            <button onClick={() => handleOpenCourse(topCourse.id)} disabled={ssoLoading}
                                className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg transition hover:opacity-90 disabled:opacity-50"
                                style={{ background: '#2563EB', color: '#fff' }}>
                                <ExternalLink className="w-3.5 h-3.5" /> Open in LMS
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-xl border shadow-sm p-5 flex-1" style={{ borderColor: '#E5E7EB' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4" style={{ color: '#10B981' }} />
                            <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Quick Stats</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Total Courses', value: courseRows.length, color: '#1F2937' },
                                { label: 'Total Activities', value: totalActivities, color: '#2563EB' },
                                { label: 'Avg per Course', value: courseRows.length > 0 ? (totals.modules / courseRows.length).toFixed(1) : 0, color: '#059669' },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #F9FAFB' }}>
                                    <span className="text-xs" style={{ color: '#6B7280' }}>{s.label}</span>
                                    <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                                </div>
                            ))}
                            {emptyCourses.length > 0 && (
                                <div className="flex items-center justify-between py-2 rounded-lg px-2" style={{ background: '#FEF2F2' }}>
                                    <span className="text-xs font-medium" style={{ color: '#DC2626' }}>Empty Courses</span>
                                    <span className="text-sm font-bold" style={{ color: '#DC2626' }}>{emptyCourses.length}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Course table */}
            <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                        <BarChart3 className="w-4 h-4" style={{ color: '#2563EB' }} />
                        Course Breakdown
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#EFF6FF', color: '#2563EB' }}>{courseRows.length}</span>
                    </h2>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Click a row to open in LMS · Click headers to sort</p>
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
                                    <th className="text-left px-5 py-3 cursor-pointer select-none" onClick={() => toggleSort('name')}
                                        style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: sortKey === 'name' ? '#2563EB' : '#6B7280' }}>
                                        Course <SortIcon k="name" />
                                    </th>
                                    <th className="text-left px-4 py-3" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#6B7280' }}>Code</th>
                                    {TYPES.map(t => (
                                        <th key={t.key} className="text-right px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort(t.key)}
                                            style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: sortKey === t.key ? t.color : '#6B7280' }}>
                                            {t.short} <SortIcon k={t.key} />
                                        </th>
                                    ))}
                                    <th className="text-right px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort('modules')}
                                        style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: sortKey === 'modules' ? '#1F2937' : '#6B7280' }}>
                                        Total <SortIcon k="modules" />
                                    </th>
                                    <th className="px-5 py-3" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#6B7280' }}>Mix</th>
                                    <th className="w-10 px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {sortedRows.map((row, idx) => {
                                    const initials = row.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';
                                    const rowTotal = TYPES.reduce((s, t) => s + row.counts[t.key], 0);
                                    return (
                                        <tr key={row.id} onClick={() => handleOpenCourse(row.id)}
                                            className="cursor-pointer group"
                                            style={{ borderBottom: idx < sortedRows.length - 1 ? '1px solid #F3F4F6' : 'none', background: idx % 2 === 1 ? '#FAFAFA' : '#fff', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 1 ? '#FAFAFA' : '#fff'}>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                                        style={{ background: '#EFF6FF', color: '#2563EB' }}>{initials}</div>
                                                    <div>
                                                        <p className="font-medium text-sm" style={{ color: '#1F2937' }}>{row.name}</p>
                                                        {row.cohortLabel && <p className="text-xs" style={{ color: '#9CA3AF' }}>{row.cohortLabel}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: '#F3F4F6', color: '#374151' }}>{row.code}</span>
                                            </td>
                                            {TYPES.map(t => {
                                                const val = row.counts[t.key];
                                                return (
                                                    <td key={t.key} className="px-4 py-3.5 text-right">
                                                        {val > 0
                                                            ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: t.bg, color: t.color }}>{val}</span>
                                                            : <span style={{ color: '#E5E7EB', fontSize: '12px' }}>—</span>}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-sm font-bold" style={{ color: '#1F2937' }}>{row.moduleCount}</span>
                                                    <div className="h-1 rounded-full overflow-hidden" style={{ background: '#E5E7EB', width: '36px' }}>
                                                        <div className="h-full rounded-full" style={{ width: `${Math.round((row.moduleCount / maxModules) * 100)}%`, background: '#2563EB' }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {rowTotal > 0 ? (
                                                    <div className="h-3 rounded-full overflow-hidden flex" style={{ width: '80px' }}>
                                                        {TYPES.map(t => {
                                                            const w = Math.round((row.counts[t.key] / rowTotal) * 100);
                                                            return w > 0 ? <div key={t.key} title={`${t.label}: ${row.counts[t.key]}`} style={{ width: `${w}%`, background: t.color, height: '100%' }} /> : null;
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="h-3 rounded-full" style={{ width: '80px', background: '#F3F4F6' }} />
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="w-7 h-7 rounded-lg items-center justify-center hidden group-hover:flex" style={{ background: '#EFF6FF' }}>
                                                    <ExternalLink className="w-3.5 h-3.5" style={{ color: '#2563EB' }} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: '#F9FAFB', borderTop: '2px solid #E5E7EB' }}>
                                    <td className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: '#6B7280' }} colSpan={2}>Totals</td>
                                    {TYPES.map(t => (
                                        <td key={t.key} className="px-4 py-3 text-right">
                                            <span className="text-sm font-bold" style={{ color: t.color }}>{totals[t.key] || 0}</span>
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: '#1F2937' }} colSpan={3}>{totals.modules}</td>
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


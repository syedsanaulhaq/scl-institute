import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { fetchTeacherPortalData } from '../../utils/teacherPortal';

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

        if (user?.email) {
            load();
        }
    }, [user]);

    const totals = useMemo(() => {
        return courseRows.reduce((acc, c) => {
            acc.assign += c.counts.assign;
            acc.quiz += c.counts.quiz;
            acc.forum += c.counts.forum;
            acc.resource += c.counts.resource;
            acc.url += c.counts.url;
            acc.page += c.counts.page;
            acc.modules += c.moduleCount;
            return acc;
        }, { assign: 0, quiz: 0, forum: 0, resource: 0, url: 0, page: 0, modules: 0 });
    }, [courseRows]);

    if (loading) {
        return <div className="p-8 text-center text-gray-600"><Loader2 className="w-7 h-7 animate-spin inline-block mr-2" />Loading reports...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Reports</h1>
                <p className="text-gray-600">Course-level activity and assessment breakdown across your teaching scope.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Overall Summary</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 text-sm">
                    <Summary label="Assignments" value={totals.assign} />
                    <Summary label="Quizzes" value={totals.quiz} />
                    <Summary label="Forums" value={totals.forum} />
                    <Summary label="Resources" value={totals.resource} />
                    <Summary label="Links" value={totals.url} />
                    <Summary label="Pages" value={totals.page} />
                    <Summary label="Total Modules" value={totals.modules} />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 text-sm text-gray-600">{courseRows.length} course rows</div>
                {courseRows.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No courses found for reporting.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="text-left px-4 py-3">Course</th>
                                    <th className="text-left px-4 py-3">Code</th>
                                    <th className="text-right px-4 py-3">Assignments</th>
                                    <th className="text-right px-4 py-3">Quizzes</th>
                                    <th className="text-right px-4 py-3">Forums</th>
                                    <th className="text-right px-4 py-3">Resources</th>
                                    <th className="text-right px-4 py-3">Links</th>
                                    <th className="text-right px-4 py-3">Pages</th>
                                    <th className="text-right px-4 py-3">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {courseRows.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{row.code}</td>
                                        <td className="px-4 py-3 text-right">{row.counts.assign}</td>
                                        <td className="px-4 py-3 text-right">{row.counts.quiz}</td>
                                        <td className="px-4 py-3 text-right">{row.counts.forum}</td>
                                        <td className="px-4 py-3 text-right">{row.counts.resource}</td>
                                        <td className="px-4 py-3 text-right">{row.counts.url}</td>
                                        <td className="px-4 py-3 text-right">{row.counts.page}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-blue-700">{row.moduleCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const Summary = ({ label, value }) => (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
        <p className="text-gray-500 text-xs uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
);

export default TeacherReports;

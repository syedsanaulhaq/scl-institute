import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardCheck, BarChart3, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import { openMoodleSSO } from '../../utils/ssoService';
import { fetchTeacherPortalData } from '../../utils/teacherPortal';

const TeacherDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState({ courseRows: [], summary: null, activities: [] });

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const result = await fetchTeacherPortalData(user?.email);
                setData(result);
            } catch (err) {
                console.error('Failed to load teacher dashboard:', err);
                setError('Unable to load teacher dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        if (user?.email) {
            load();
        }
    }, [user]);

    const topCourses = useMemo(() => {
        return [...(data.courseRows || [])]
            .sort((a, b) => b.moduleCount - a.moduleCount)
            .slice(0, 6);
    }, [data.courseRows]);

    const recentAssessments = useMemo(() => {
        return (data.activities || [])
            .filter((a) => a.type === 'assign' || a.type === 'quiz')
            .slice(0, 8);
    }, [data.activities]);

    const handleOpenMoodle = async (redirectTo = null) => {
        try {
            await openMoodleSSO(user?.email, { redirectTo });
        } catch (err) {
            console.error('Teacher SSO failed:', err);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-600">
                <Loader2 className="w-7 h-7 animate-spin inline-block mr-2" />
                Loading teacher dashboard...
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    const summary = data.summary || {
        totalCourses: 0,
        teachingCourses: 0,
        moduleCount: 0,
        assessmentCount: 0,
        forumCount: 0,
        resourceCount: 0
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
                <p className="text-gray-600">Teaching overview, assessments, and reporting for your Moodle courses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <StatCard icon={BookOpen} label="Total Courses" value={summary.totalCourses} color="text-indigo-600" />
                <StatCard icon={ClipboardCheck} label="Assessments" value={summary.assessmentCount} color="text-emerald-600" />
                <StatCard icon={BarChart3} label="Activities" value={summary.moduleCount} color="text-blue-600" />
                <StatCard icon={MessageSquare} label="Forums" value={summary.forumCount} color="text-amber-600" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Top Courses by Activity</h2>
                        <button
                            onClick={() => navigate('/teacher/reports')}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            View Reports
                        </button>
                    </div>

                    {topCourses.length === 0 ? (
                        <p className="text-gray-500 text-sm">No courses available yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {topCourses.map((course) => (
                                <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">{course.name}</p>
                                            <p className="text-xs text-gray-500">{course.code}</p>
                                        </div>
                                        <button
                                            onClick={() => handleOpenMoodle(`/course/view.php?id=${course.id}`)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Open <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
                                        <span>Assignments: <strong>{course.counts.assign}</strong></span>
                                        <span>Quizzes: <strong>{course.counts.quiz}</strong></span>
                                        <span>Forums: <strong>{course.counts.forum}</strong></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Assessments</h2>
                        <button
                            onClick={() => navigate('/teacher/assessments')}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            Open
                        </button>
                    </div>

                    {recentAssessments.length === 0 ? (
                        <p className="text-gray-500 text-sm">No assessment activities found.</p>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-auto pr-1">
                            {recentAssessments.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{item.courseCode} • {item.courseName}</p>
                                    <p className="text-xs text-blue-600 mt-1 uppercase tracking-wide">{item.type}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{label}</p>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
);

export default TeacherDashboard;

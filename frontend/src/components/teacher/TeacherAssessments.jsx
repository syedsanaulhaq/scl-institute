import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Loader2, Search } from 'lucide-react';
import { openMoodleSSO } from '../../utils/ssoService';
import { fetchTeacherPortalData } from '../../utils/teacherPortal';

const TeacherAssessments = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activities, setActivities] = useState([]);
    const [query, setQuery] = useState('');
    const [type, setType] = useState('all');
    const [course, setCourse] = useState('all');

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const result = await fetchTeacherPortalData(user?.email);
                const assessmentRows = (result.activities || []).filter(
                    (item) => item.type === 'assign' || item.type === 'quiz' || item.type === 'forum'
                );
                setActivities(assessmentRows);
            } catch (err) {
                console.error('Failed to load teacher assessments:', err);
                setError('Unable to load assessment activities.');
            } finally {
                setLoading(false);
            }
        };

        if (user?.email) {
            load();
        }
    }, [user]);

    const courses = useMemo(() => {
        return [...new Set(activities.map((a) => a.courseName))].sort();
    }, [activities]);

    const filtered = useMemo(() => {
        return activities.filter((item) => {
            if (type !== 'all' && item.type !== type) return false;
            if (course !== 'all' && item.courseName !== course) return false;
            if (query && !item.title.toLowerCase().includes(query.toLowerCase())) return false;
            return true;
        });
    }, [activities, type, course, query]);

    const openActivity = async (item) => {
        try {
            await openMoodleSSO(user?.email, { redirectTo: `/mod/${item.type}/view.php?id=${item.moduleId}` });
        } catch (err) {
            console.error('Failed to open activity:', err);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-600"><Loader2 className="w-7 h-7 animate-spin inline-block mr-2" />Loading assessments...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Assessments</h1>
                <p className="text-gray-600">Assignments, quizzes, and forums across your teaching courses.</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by activity name"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">All Types</option>
                    <option value="assign">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="forum">Forum</option>
                </select>
                <select value={course} onChange={(e) => setCourse(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">All Courses</option>
                    {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 text-sm text-gray-600">{filtered.length} activity items</div>
                {filtered.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No activities match your filter.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filtered.map((item) => (
                            <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900">{item.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{item.courseCode} • {item.courseName}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 uppercase">{item.type}</span>
                                    <button
                                        onClick={() => openActivity(item)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Open <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherAssessments;

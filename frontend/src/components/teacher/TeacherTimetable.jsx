import { useEffect, useMemo, useState } from 'react';
import { Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { openMoodleSSO } from '../../utils/ssoService';
import { fetchTeacherPortalData } from '../../utils/teacherPortal';

const TeacherTimetable = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activities, setActivities] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('all');

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const result = await fetchTeacherPortalData(user?.email);
                setActivities(result.activities || []);
            } catch (err) {
                console.error('Failed to load teacher timetable:', err);
                setError('Unable to load teacher timetable.');
            } finally {
                setLoading(false);
            }
        };

        if (user?.email) {
            load();
        }
    }, [user]);

    const courseOptions = useMemo(() => {
        return [...new Set(activities.map((item) => item.courseName))].sort();
    }, [activities]);

    const filtered = useMemo(() => {
        return activities
            .filter((item) => selectedCourse === 'all' || item.courseName === selectedCourse)
            .sort((a, b) => a.courseName.localeCompare(b.courseName) || a.title.localeCompare(b.title));
    }, [activities, selectedCourse]);

    const openActivity = async (item) => {
        try {
            await openMoodleSSO(user?.email, { redirectTo: `/mod/${item.type}/view.php?id=${item.moduleId}` });
        } catch (err) {
            console.error('Failed to open timetable item:', err);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-600">
                <Loader2 className="w-7 h-7 animate-spin inline-block mr-2" />
                Loading timetable...
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Timetable</h1>
                <p className="text-gray-600">Teaching activities from courses where you are assigned as teacher.</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="text-sm text-gray-600">
                    {filtered.length} timetable item{filtered.length === 1 ? '' : 's'}
                </div>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="all">All Courses</option>
                    {courseOptions.map((course) => (
                        <option key={course} value={course}>{course}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        No timetable items found for your assigned teaching courses.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filtered.map((item) => (
                            <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900">{item.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{item.courseCode} • {item.courseName}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 uppercase">
                                        {item.type}
                                    </span>
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

export default TeacherTimetable;

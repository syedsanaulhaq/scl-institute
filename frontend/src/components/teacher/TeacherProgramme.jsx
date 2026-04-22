import { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, GraduationCap, ExternalLink, Loader2 } from 'lucide-react';
import { openMoodleSSO } from '../../utils/ssoService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const TeacherProgramme = ({ user }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ssoLoading, setSsoLoading] = useState(null);

    useEffect(() => {
        const fetchTeachingCourses = async () => {
            try {
                setLoading(true);
                setError('');

                // Fetch only courses where the user is assigned as teacher/editing teacher.
                const coursesRes = await axios.get(`${API_URL}/students/teacher-courses`, {
                    params: { email: user.email }
                });
                
                const myCourses = coursesRes.data?.data || [];
                setCourses(myCourses);
                
                console.log(`Loaded ${myCourses.length} teaching courses for ${user.email}`);
            } catch (err) {
                console.error('Error fetching teaching courses:', err);
                setError(err.response?.data?.message || 'Unable to load teaching courses');
            } finally {
                setLoading(false);
            }
        };

        if (user?.email) {
            fetchTeachingCourses();
        }
    }, [user]);

    const handleOpenCourseInMoodle = async (courseId) => {
        try {
            setSsoLoading(courseId);
            await openMoodleSSO(user.email, {
                redirectTo: `/course/view.php?id=${courseId}`
            });
        } catch (err) {
            console.error('Failed to open course in Moodle:', err);
        } finally {
            setSsoLoading(null);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading teaching courses...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                <p className="text-gray-600 mt-2">Only courses where you are assigned as a teacher are shown here.</p>
            </div>

            {courses.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">No teaching courses assigned yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Please contact admin if your teacher role assignments are missing.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-lg shadow border border-gray-100 p-5 flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                                <GraduationCap className="w-5 h-5 text-scl-purple" />
                                <span className="text-xs font-semibold text-gray-500">ID: {course.id}</span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 leading-tight">{course.name || course.course_title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{course.code || course.course_code || 'N/A'}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">Teacher</span>
                            </div>
                            {course.description && (
                                <p className="text-sm text-gray-500 mt-3 line-clamp-3">{course.description}</p>
                            )}
                            <div className="mt-auto pt-4">
                                <button
                                    onClick={() => handleOpenCourseInMoodle(course.moodle_course_id || course.id)}
                                    disabled={ssoLoading === (course.moodle_course_id || course.id)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-scl-purple hover:bg-scl-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {ssoLoading === (course.moodle_course_id || course.id) ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Opening...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink className="w-4 h-4" />
                                            <span>View in Moodle</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherProgramme;

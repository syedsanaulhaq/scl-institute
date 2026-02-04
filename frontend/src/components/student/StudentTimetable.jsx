import { useState, useEffect } from 'react';
import { Clock, MapPin, Video, Users, Calendar } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentTimetable = ({ user }) => {
    const [selectedWeek, setSelectedWeek] = useState('current');
    const [timetableData, setTimetableData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [eventTypeFilters, setEventTypeFilters] = useState({
        Lecture: true,
        Seminar: true,
        Workshop: true,
        Tutorial: true,
        Assignment: true,
        Quiz: true,
        Event: true
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const toggleEventType = (type) => {
        setEventTypeFilters(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    useEffect(() => {
        fetchTimetableData();
    }, [user]);

    const handleViewInMoodle = async (moodleUrl) => {
        try {
            const ssoPayload = { email: user?.email };
            
            // If moodleUrl is provided, add it as redirect_to so user goes straight to the activity after SSO
            if (moodleUrl) {
                ssoPayload.redirect_to = moodleUrl;
            }
            
            const response = await axios.post(`${API_URL}/sso/generate`, ssoPayload);
            if (response.data?.success && response.data?.redirectUrl) {
                window.open(response.data.redirectUrl, '_blank');
            } else {
                alert('Could not generate SSO token. Please try again.');
            }
        } catch (err) {
            console.error('SSO Error:', err);
            alert('Failed to authenticate with Moodle');
        }
    };

    const fetchTimetableData = async () => {
        try {
            setLoading(true);
            // Get student's application to find their course
            const appsResponse = await axios.get(`${API_URL}/students/applications`);
            if (appsResponse.data?.success) {
                const apps = appsResponse.data.data?.applications || [];
                const studentApp = apps.find(app => app.email === user?.email);
                
                if (studentApp) {
                    // Try to fetch timetable from backend (queries Moodle events/assignments)
                    try {
                        const timetableResponse = await axios.get(`${API_URL}/students/timetable/${studentApp.id}`);
                        if (timetableResponse.data?.success && Object.keys(timetableResponse.data.data || {}).length > 0) {
                            setTimetableData(timetableResponse.data.data);
                        } else {
                            // No data from backend, try to show message
                            setError('No schedule data available. Check your course in Moodle for events and assignments.');
                            setTimetableData({});
                        }
                    } catch (err) {
                        console.warn('Could not fetch timetable from backend:', err.message);
                        setError('Could not load schedule from Moodle. Data is pulled from course events and assignment due dates in Moodle.');
                        setTimetableData({});
                    }
                } else {
                    setError('No application found');
                }
            }
        } catch (err) {
            console.error('Error fetching timetable:', err);
            setError('Failed to load timetable data');
            setTimetableData({});
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Lecture': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'Seminar': return 'bg-green-100 text-green-700 border-green-300';
            case 'Workshop': return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'Tutorial': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'Assignment': return 'bg-red-100 text-red-700 border-red-300';
            case 'Quiz': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading timetable...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    // If no data from Moodle, show fallback message
    const hasData = Object.keys(timetableData).length > 0;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>
                <select 
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="current">Current Week</option>
                    <option value="next">Next Week</option>
                    <option value="all">Full Semester</option>
                </select>
            </div>

            {/* Legend with Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Filter by Event Type</h3>
                <div className="flex flex-wrap gap-3">
                    {Object.keys(eventTypeFilters).map(type => (
                        <button
                            key={type}
                            onClick={() => toggleEventType(type)}
                            className={`px-3 py-1 border rounded-lg text-sm font-medium transition ${
                                eventTypeFilters[type]
                                    ? getTypeColor(type)
                                    : 'bg-gray-50 text-gray-400 border-gray-300 opacity-50'
                            }`}
                        >
                            {eventTypeFilters[type] ? '✓ ' : ''}{type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Weekly Timetable */}
            {hasData ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x">
                        {days.map((day) => (
                            <div key={day} className="min-h-[400px]">
                                <div className="bg-gray-100 p-4 font-semibold text-gray-900 text-center border-b">
                                    {day}
                                </div>
                                <div className="p-3 space-y-3">
                                    {timetableData[day]?.filter(session => eventTypeFilters[session.type]).map((session, index) => (
                                        <div key={index} className={`p-3 rounded-lg border-l-4 ${getTypeColor(session.type)} border`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-semibold">{session.time}</span>
                                            </div>
                                            <p className="font-semibold text-sm mb-1">{session.module}</p>
                                            <p className="text-xs text-gray-600 mb-2">{session.code}</p>
                                            {session.room && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                                    {session.online ? (
                                                        <>
                                                            <Video className="w-3 h-3" />
                                                            <span>Online</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MapPin className="w-3 h-3" />
                                                            <span>{session.room}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            {session.instructor && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                                    <Users className="w-3 h-3" />
                                                    <span>{session.instructor}</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleViewInMoodle(session.moodle_url)}
                                                className="w-full mt-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition"
                                            >
                                                View in Moodle
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-8">
                    <div className="text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">No schedule data available</p>
                        <p className="text-sm text-gray-500">Schedule is pulled from:</p>
                        <ul className="text-sm text-gray-500 mt-2 space-y-1">
                            <li>• Course events created in Moodle</li>
                            <li>• Assignment due dates</li>
                            <li>• Quiz dates and deadlines</li>
                        </ul>
                        <p className="text-sm text-gray-600 mt-4">Add events to your course in Moodle to see them here.</p>
                        <button
                            onClick={handleViewInMoodle}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                        >
                            View Moodle Calendar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentTimetable;

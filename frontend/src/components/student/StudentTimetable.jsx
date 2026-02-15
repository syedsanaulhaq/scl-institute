import { useState, useEffect } from 'react';
import { Clock, MapPin, Video, Users, Calendar } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentTimetable = ({ user }) => {
    const [selectedWeek, setSelectedWeek] = useState('current');
    const [timetableData, setTimetableData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState(null);
    const [studentApplications, setStudentApplications] = useState([]);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
    const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'monthly'
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [eventTypeFilters, setEventTypeFilters] = useState({
        Lecture: true,
        Seminar: true,
        Workshop: true,
        Tutorial: true,
        Assignment: true,
        Quiz: true,
        Event: true,
        Forum: true,
        Lesson: true
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const toggleEventType = (type) => {
        setEventTypeFilters(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const getWeekRange = (option) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find Monday of current week
        const monday = new Date(today);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);

        if (option === 'current') {
            const friday = new Date(monday);
            friday.setDate(monday.getDate() + 4);
            return { start: monday, end: friday };
        } else if (option === 'next') {
            const nextMonday = new Date(monday);
            nextMonday.setDate(monday.getDate() + 7);
            const nextFriday = new Date(nextMonday);
            nextFriday.setDate(nextMonday.getDate() + 4);
            return { start: nextMonday, end: nextFriday };
        } else {
            // Full semester - 16 weeks from now
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + (16 * 7));
            return { start: today, end: endDate };
        }
    };

    const filterEventsByWeek = (data) => {
        // Return all events from backend - they're already organized by day of week
        // The backend pulls from Moodle events/assignments and creates a weekly schedule
        return data;
    };

    useEffect(() => {
        // Get email from: 1) user object, 2) URL params, 3) localStorage
        const getStudentEmail = () => {
            // First try user object
            if (user?.email) return user.email;
            
            // Then try URL params
            const params = new URLSearchParams(window.location.search);
            const emailParam = params.get('email');
            if (emailParam) return emailParam;
            
            // Then try localStorage
            const storedEmail = localStorage.getItem('studentEmail');
            if (storedEmail) return storedEmail;
            
            return null;
        };
        
        const email = getStudentEmail();
        setUserEmail(email);
        fetchAllApplications(email);
    }, [user]);

    useEffect(() => {
        if (selectedApplicationId) {
            fetchTimetableForApplication(selectedApplicationId);
        }
    }, [selectedApplicationId]);

    const handleViewInMoodle = async (moodleUrl) => {
        try {
            const emailToUse = userEmail || user?.email;
            if (!emailToUse) {
                alert('No email available for SSO');
                return;
            }
            
            const ssoPayload = { email: emailToUse };
            
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

    const fetchAllApplications = async (email) => {
        try {
            setLoading(true);
            
            if (!email) {
                setError('No email available. Please log in or provide email in URL (?email=...)');
                setLoading(false);
                return;
            }
            
            // Get student's applications
            const appsResponse = await axios.get(`${API_URL}/students/applications`);
            if (appsResponse.data?.success) {
                const apps = appsResponse.data.data?.applications || [];
                const studentApps = apps.filter(app => app.email === email);
                
                if (studentApps.length > 0) {
                    setStudentApplications(studentApps);
                    
                    // Prioritize main degree programmes for default selection
                    let defaultApp = studentApps.find(app => 
                        app.course_type && app.course_type.toLowerCase() !== 'short course' && app.course_type.toLowerCase() !== 'cpd'
                    ) || studentApps[0];
                    
                    setSelectedApplicationId(defaultApp.id);
                    console.log(`Found ${studentApps.length} applications, defaulting to ${defaultApp.course_title}`);
                } else {
                    setError(`No application found for ${email}`);
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to load applications');
            setLoading(false);
        }
    };

    const fetchTimetableForApplication = async (applicationId) => {
        try {
            setLoading(true);
            setError('');
            
            const timetableResponse = await axios.get(`${API_URL}/students/timetable/${applicationId}`);
            console.log('Timetable API Response:', timetableResponse.data);
            
            if (timetableResponse.data?.success && Object.keys(timetableResponse.data.data || {}).length > 0) {
                console.log('Setting timetable data:', timetableResponse.data.data);
                setTimetableData(timetableResponse.data.data);
            } else {
                console.log('No data from backend or empty response');
                setError('No schedule data available. Check your course in Moodle for events and assignments.');
                setTimetableData({});
            }
        } catch (err) {
            console.error('Error fetching timetable:', err);
            setError('Could not load schedule from Moodle. Data is pulled from course events and assignment due dates in Moodle.');
            setTimetableData({});
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (e) => {
        const appId = parseInt(e.target.value);
        setSelectedApplicationId(appId);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Lecture': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'Seminar': return 'bg-green-100 text-green-700 border-green-300';
            case 'Workshop': return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'Tutorial': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'Assignment': return 'bg-red-100 text-red-700 border-red-300';
            case 'Quiz': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'Forum': return 'bg-teal-100 text-teal-700 border-teal-300';
            case 'Lesson': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    // Monthly calendar functions
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const getEventsForDate = (date) => {
        const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
        return (timetableData[dayName] || []).filter(session => eventTypeFilters[session.type]);
    };

    const changeMonth = (direction) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    if (loading) {
        return <div className="p-8 text-center">Loading timetable...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    // Check if there are any actual events (not just empty day arrays)
    const hasData = Object.keys(timetableData).length > 0 && 
                    Object.values(timetableData).some(dayEvents => Array.isArray(dayEvents) && dayEvents.length > 0);
    
    console.log('Timetable Data:', timetableData);
    console.log('Has Data:', hasData);
    console.log('Event Type Filters:', eventTypeFilters);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>
                
                {/* View Mode Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('weekly')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            viewMode === 'weekly'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Weekly View
                    </button>
                    <button
                        onClick={() => setViewMode('monthly')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            viewMode === 'monthly'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Monthly View
                    </button>
                </div>
            </div>

            {/* Course Selector */}
            {studentApplications.length > 1 && (
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Course/Programme:
                    </label>
                    <select
                        id="course-select"
                        value={selectedApplicationId || ''}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {studentApplications.map(app => (
                            <option key={app.id} value={app.id}>
                                {app.course_title} ({app.course_code})
                            </option>
                        ))}
                    </select>
                </div>
            )}

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

            {/* Weekly Timetable Grid View */}
            {viewMode === 'weekly' && hasData ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-7 divide-y lg:divide-y-0 lg:divide-x">
                        {days.map((day) => (
                            <div key={day} className="min-h-[400px]">
                                <div className="bg-gray-100 p-4 font-semibold text-gray-900 text-center border-b">
                                    {day}
                                </div>
                                <div className="p-3 space-y-3">
                                    {filterEventsByWeek(timetableData)[day]?.filter(session => eventTypeFilters[session.type]).map((session, index) => (
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
            ) : viewMode === 'monthly' && hasData ? (
                // Monthly Calendar View
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                            ← Previous
                        </button>
                        <h2 className="text-lg font-bold text-gray-900">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button
                            onClick={() => changeMonth(1)}
                            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Next →
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 divide-x divide-y">
                        {/* Day Headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="p-2 bg-gray-50 text-center font-semibold text-sm text-gray-700">
                                {day}
                            </div>
                        ))}

                        {/* Calendar Days */}
                        {(() => {
                            const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                            const calendarDays = [];
                            
                            // Empty cells before first day
                            for (let i = 0; i < startingDayOfWeek; i++) {
                                calendarDays.push(
                                    <div key={`empty-${i}`} className="min-h-[120px] p-2 bg-gray-50"></div>
                                );
                            }
                            
                            // Days of the month
                            for (let day = 1; day <= daysInMonth; day++) {
                                const date = new Date(year, month, day);
                                const dayEvents = getEventsForDate(date);
                                const isToday = date.toDateString() === new Date().toDateString();
                                
                                calendarDays.push(
                                    <div key={day} className={`min-h-[120px] p-2 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
                                        <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                                            {day}
                                        </div>
                                        <div className="space-y-1">
                                            {dayEvents.slice(0, 3).map((event, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`text-xs p-1 rounded ${getTypeColor(event.type)} cursor-pointer hover:opacity-80`}
                                                    onClick={() => handleViewInMoodle(event.moodle_url)}
                                                    title={`${event.module} - ${event.time}`}
                                                >
                                                    <div className="font-semibold truncate">{event.type}</div>
                                                    <div className="truncate">{event.module}</div>
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-xs text-gray-500 font-medium">
                                                    +{dayEvents.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                            
                            return calendarDays;
                        })()}
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

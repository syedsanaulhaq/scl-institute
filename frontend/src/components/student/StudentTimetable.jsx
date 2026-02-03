import { useState } from 'react';
import { Clock, MapPin, Video, Users } from 'lucide-react';

const StudentTimetable = () => {
    const [selectedWeek, setSelectedWeek] = useState('current');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    const schedule = {
        Monday: [
            { time: '09:00 - 11:00', module: 'Business Fundamentals', code: 'BUS101', room: 'Room 301', type: 'Lecture', instructor: 'Dr. Smith' },
            { time: '14:00 - 16:00', module: 'Marketing Principles', code: 'BUS102', room: 'Room 205', type: 'Seminar', instructor: 'Prof. Johnson' }
        ],
        Tuesday: [
            { time: '10:00 - 12:00', module: 'Financial Accounting', code: 'BUS103', room: 'Room 401', type: 'Lecture', instructor: 'Dr. Williams' },
            { time: '13:00 - 15:00', module: 'Business Fundamentals', code: 'BUS101', room: 'Online', type: 'Workshop', instructor: 'Dr. Smith', online: true }
        ],
        Wednesday: [
            { time: '09:00 - 11:00', module: 'Marketing Principles', code: 'BUS102', room: 'Room 205', type: 'Lecture', instructor: 'Prof. Johnson' },
            { time: '15:00 - 17:00', module: 'Financial Accounting', code: 'BUS103', room: 'Room 302', type: 'Tutorial', instructor: 'Dr. Williams' }
        ],
        Thursday: [
            { time: '11:00 - 13:00', module: 'Business Fundamentals', code: 'BUS101', room: 'Room 301', type: 'Seminar', instructor: 'Dr. Smith' }
        ],
        Friday: [
            { time: '09:00 - 11:00', module: 'Marketing Principles', code: 'BUS102', room: 'Online', type: 'Lecture', instructor: 'Prof. Johnson', online: true },
            { time: '14:00 - 16:00', module: 'Financial Accounting', code: 'BUS103', room: 'Room 401', type: 'Workshop', instructor: 'Dr. Williams' }
        ]
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Lecture': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'Seminar': return 'bg-green-100 text-green-700 border-green-300';
            case 'Workshop': return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'Tutorial': return 'bg-orange-100 text-orange-700 border-orange-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

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

            {/* Legend */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Class Types</h3>
                <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-sm">Lecture</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-lg text-sm">Seminar</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 border border-purple-300 rounded-lg text-sm">Workshop</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 border border-orange-300 rounded-lg text-sm">Tutorial</span>
                </div>
            </div>

            {/* Weekly Timetable */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x">
                    {days.map((day) => (
                        <div key={day} className="min-h-[400px]">
                            <div className="bg-gray-100 p-4 font-semibold text-gray-900 text-center border-b">
                                {day}
                            </div>
                            <div className="p-3 space-y-3">
                                {schedule[day]?.map((session, index) => (
                                    <div key={index} className={`p-3 rounded-lg border-l-4 ${getTypeColor(session.type)} border`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-xs font-semibold">{session.time}</span>
                                        </div>
                                        <p className="font-semibold text-sm mb-1">{session.module}</p>
                                        <p className="text-xs text-gray-600 mb-2">{session.code}</p>
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
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <Users className="w-3 h-3" />
                                            <span>{session.instructor}</span>
                                        </div>
                                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(session.type)}`}>
                                            {session.type}
                                        </span>
                                    </div>
                                ))}
                                {(!schedule[day] || schedule[day].length === 0) && (
                                    <p className="text-sm text-gray-400 text-center py-8">No classes scheduled</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming Classes */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Classes</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            09:00
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">Business Fundamentals (BUS101)</p>
                            <p className="text-sm text-gray-600">Lecture • Room 301 • Dr. Smith</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">In 30 mins</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold">
                            14:00
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">Marketing Principles (BUS102)</p>
                            <p className="text-sm text-gray-600">Seminar • Room 205 • Prof. Johnson</p>
                        </div>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Later today</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentTimetable;

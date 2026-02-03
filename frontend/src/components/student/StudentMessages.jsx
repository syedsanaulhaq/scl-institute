import { useState } from 'react';
import { Mail, Send, Inbox, Archive, Bell } from 'lucide-react';

const StudentMessages = () => {
    const [selectedTab, setSelectedTab] = useState('inbox');

    const messages = [
        {
            id: 1,
            from: 'Dr. Smith',
            subject: 'BUS101 - Assignment Extension',
            preview: 'I am pleased to inform you that the deadline for the Strategic Analysis Report has been extended...',
            date: '2026-02-02',
            read: false,
            category: 'Academic'
        },
        {
            id: 2,
            from: 'Student Services',
            subject: 'Important: Fee Payment Reminder',
            preview: 'This is a reminder that your tuition fee payment for Semester 2 is due on...',
            date: '2026-02-01',
            read: true,
            category: 'Finance'
        },
        {
            id: 3,
            from: 'Prof. Johnson',
            subject: 'Marketing Campaign Presentation - Groups',
            preview: 'Please find attached the group allocations for the upcoming marketing presentation...',
            date: '2026-01-30',
            read: true,
            category: 'Academic'
        }
    ];

    const announcements = [
        {
            id: 1,
            title: 'Library Extended Hours During Exam Period',
            content: 'The library will be open 24/7 starting from March 1st to support students during the exam period.',
            date: '2026-02-03',
            priority: 'high'
        },
        {
            id: 2,
            title: 'Career Fair - February 15th',
            content: 'Join us for the annual Career Fair where leading employers will be recruiting students.',
            date: '2026-02-02',
            priority: 'medium'
        },
        {
            id: 3,
            title: 'Student Wellbeing Workshop',
            content: 'Free wellbeing workshop covering stress management and work-life balance.',
            date: '2026-01-29',
            priority: 'low'
        }
    ];

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">High Priority</span>;
            case 'medium':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Medium</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Info</span>;
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages & Announcements</h1>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setSelectedTab('inbox')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium ${selectedTab === 'inbox' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                    <Inbox className="w-4 h-4" />
                    Inbox
                    {messages.filter(m => !m.read).length > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                            {messages.filter(m => !m.read).length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setSelectedTab('announcements')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium ${selectedTab === 'announcements' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                    <Bell className="w-4 h-4" />
                    Announcements
                </button>
                <button
                    onClick={() => setSelectedTab('compose')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium ${selectedTab === 'compose' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                    <Send className="w-4 h-4" />
                    Compose
                </button>
            </div>

            {/* Inbox */}
            {selectedTab === 'inbox' && (
                <div className="bg-white rounded-lg shadow">
                    {messages.map((message) => (
                        <div 
                            key={message.id} 
                            className={`p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${!message.read ? 'bg-blue-50' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className={`font-semibold ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {message.subject}
                                        </h3>
                                        {!message.read && (
                                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">From: {message.from}</p>
                                    <p className="text-sm text-gray-500">{message.preview}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-xs text-gray-500 mb-2">{new Date(message.date).toLocaleDateString()}</p>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                        {message.category}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Announcements */}
            {selectedTab === 'announcements' && (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                                {getPriorityBadge(announcement.priority)}
                            </div>
                            <p className="text-gray-700 mb-3">{announcement.content}</p>
                            <p className="text-sm text-gray-500">Posted: {new Date(announcement.date).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Compose */}
            {selectedTab === 'compose' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Compose Message</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="">Select recipient...</option>
                                <option value="academic">Academic Department</option>
                                <option value="finance">Finance Office</option>
                                <option value="it">IT Support</option>
                                <option value="student-services">Student Services</option>
                                <option value="wellbeing">Wellbeing Team</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter subject..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea 
                                rows="8"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Type your message..."
                            ></textarea>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Send className="w-4 h-4" />
                                Send Message
                            </button>
                            <button type="button" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <Mail className="w-6 h-6 text-blue-600" />
                        <div className="text-left">
                            <p className="font-semibold text-gray-900">Contact Tutor</p>
                            <p className="text-xs text-gray-600">Send a message to your tutor</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <Bell className="w-6 h-6 text-green-600" />
                        <div className="text-left">
                            <p className="font-semibold text-gray-900">Support Request</p>
                            <p className="text-xs text-gray-600">Get help from student services</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <Archive className="w-6 h-6 text-purple-600" />
                        <div className="text-left">
                            <p className="font-semibold text-gray-900">Archive</p>
                            <p className="text-xs text-gray-600">View archived messages</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentMessages;

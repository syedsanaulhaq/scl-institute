import { useState } from 'react';
import { HelpCircle, Send, Clock, CheckCircle, MessageSquare, Phone, Mail, FileText } from 'lucide-react';

const StudentSupport = () => {
    const [selectedTab, setSelectedTab] = useState('tickets');

    const supportTickets = [
        {
            id: 'TKT-001',
            subject: 'Issue with LMS Access',
            category: 'IT Support',
            status: 'open',
            priority: 'high',
            createdDate: '2026-02-02',
            lastUpdate: '2026-02-02',
            messages: 3
        },
        {
            id: 'TKT-002',
            subject: 'Academic Extension Request',
            category: 'Academic',
            status: 'in_progress',
            priority: 'medium',
            createdDate: '2026-01-28',
            lastUpdate: '2026-01-30',
            messages: 5
        },
        {
            id: 'TKT-003',
            subject: 'Fee Payment Query',
            category: 'Finance',
            status: 'resolved',
            priority: 'low',
            createdDate: '2026-01-20',
            lastUpdate: '2026-01-22',
            messages: 2
        }
    ];

    const supportCategories = [
        { name: 'IT Support', icon: 'ðŸ’»', description: 'Technical issues, LMS access, login problems' },
        { name: 'Academic', icon: 'ðŸ“š', description: 'Academic advising, extensions, module queries' },
        { name: 'Finance', icon: 'ðŸ’³', description: 'Fee payments, invoices, financial support' },
        { name: 'Student Services', icon: 'ðŸŽ“', description: 'General enquiries, certificates, documentation' },
        { name: 'Wellbeing', icon: 'ðŸ’š', description: 'Mental health support, counseling, wellbeing' },
        { name: 'Accommodation', icon: 'ðŸ ', description: 'Housing support and accommodation queries' }
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <Clock className="w-3 h-3" /> Open
                </span>;
            case 'in_progress':
                return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    <Clock className="w-3 h-3" /> In Progress
                </span>;
            case 'resolved':
                return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> Resolved
                </span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {status}
                </span>;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">High</span>;
            case 'medium':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Medium</span>;
            case 'low':
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Low</span>;
            default:
                return null;
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Support & Help</h1>

            {/* Quick Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <Phone className="w-8 h-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Phone Support</h3>
                    <p className="text-sm text-gray-600 mb-2">+44 (0) 20 1234 5678</p>
                    <p className="text-xs text-gray-500">Mon-Fri, 9am-5pm</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <Mail className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                    <p className="text-sm text-gray-600 mb-2">support@sclinstitute.ac.uk</p>
                    <p className="text-xs text-gray-500">Response within 24 hours</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <MessageSquare className="w-8 h-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                    <p className="text-sm text-gray-600 mb-2">Chat with our team</p>
                    <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">Start Chat -></button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setSelectedTab('tickets')}
                    className={`px-4 py-2 font-medium ${selectedTab === 'tickets' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                    My Tickets
                </button>
                <button
                    onClick={() => setSelectedTab('new')}
                    className={`px-4 py-2 font-medium ${selectedTab === 'new' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                    New Request
                </button>
                <button
                    onClick={() => setSelectedTab('faq')}
                    className={`px-4 py-2 font-medium ${selectedTab === 'faq' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                    FAQ
                </button>
            </div>

            {/* My Tickets Tab */}
            {selectedTab === 'tickets' && (
                <div className="space-y-4">
                    {supportTickets.map((ticket) => (
                        <div key={ticket.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                                        {getPriorityBadge(ticket.priority)}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">Ticket ID: {ticket.id} | Category: {ticket.category}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>Created: {new Date(ticket.createdDate).toLocaleDateString('en-GB')}</span>
                                        <span>Last Update: {new Date(ticket.lastUpdate).toLocaleDateString('en-GB')}</span>
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            {ticket.messages} messages
                                        </span>
                                    </div>
                                </div>
                                {getStatusBadge(ticket.status)}
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                View Details ->
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* New Request Tab */}
            {selectedTab === 'new' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Support Category</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {supportCategories.map((category, index) => (
                                <button 
                                    key={index}
                                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-2 border-transparent hover:border-blue-500 transition-colors text-left"
                                >
                                    <span className="text-3xl">{category.icon}</span>
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-1">{category.name}</p>
                                        <p className="text-xs text-gray-600">{category.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Submit Support Request</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select category...</option>
                                    {supportCategories.map((cat, idx) => (
                                        <option key={idx} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="low">Low - General inquiry</option>
                                    <option value="medium">Medium - Needs attention</option>
                                    <option value="high">High - Urgent issue</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brief description of your issue..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea 
                                    rows="6"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Please provide detailed information about your request..."
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (optional)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Click to upload files or drag and drop</p>
                                    <p className="text-xs text-gray-500 mt-1">Max file size: 10MB</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <Send className="w-4 h-4" />
                                    Submit Request
                                </button>
                                <button type="button" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* FAQ Tab */}
            {selectedTab === 'faq' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">How do I reset my password?</h3>
                        <p className="text-sm text-gray-600">Click on "Forgot Password" on the login page and follow the instructions sent to your email.</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">How can I access the LMS?</h3>
                        <p className="text-sm text-gray-600">You can access the LMS by clicking on "Learning Materials" from your dashboard or visiting the LMS portal directly.</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Where can I find my timetable?</h3>
                        <p className="text-sm text-gray-600">Your timetable is available under the "Timetable" section in the student portal.</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">How do I submit an assignment?</h3>
                        <p className="text-sm text-gray-600">Go to "Assessments & Grades" section, find your assignment, and click the "Submit Work" button.</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Who do I contact for academic advice?</h3>
                        <p className="text-sm text-gray-600">You can contact your personal tutor or submit a support request under "Academic" category.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentSupport;


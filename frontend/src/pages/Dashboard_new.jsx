import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { openMoodleSSO } from '../utils/ssoService';
import {
    GraduationCap,
    Users,
    BookOpen,
    FileText,
    Mail,
    TrendingUp,
    Calendar,
    Star,
    Settings,
    LogOut,
    PlusCircle,
    Eye,
    BarChart3,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        applications: 0,
        pending_applications: 0,
        approved_applications: 0,
        enquiries: 0,
        pending_enquiries: 0,
        programs: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [recentEnquiries, setRecentEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Error parsing user data:', e);
                navigate('/login');
                return;
            }
        } else {
            navigate('/login');
            return;
        }

        fetchDashboardData();
    }, [navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('accessToken');
            const headers = token ? { 'Authorization': token } : {};
            
            // Fetch dashboard stats
            const statsResponse = await axios.get(`${API_URL}/admin/dashboard-stats`, {
                headers,
                withCredentials: true
            });
            setStats(statsResponse.data);

            // Fetch recent applications
            const applicationsResponse = await axios.get(`${API_URL}/admin/applications`, {
                headers,
                withCredentials: true
            });
            setRecentApplications(applicationsResponse.data.slice(0, 5)); // Get latest 5

            // Fetch recent enquiries
            const enquiriesResponse = await axios.get(`${API_URL}/admin/enquiries`, {
                headers,
                withCredentials: true
            });
            setRecentEnquiries(enquiriesResponse.data.slice(0, 5)); // Get latest 5

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleSSORedirect = async () => {
        if (user && user.email) {
            try {
                const success = await openMoodleSSO(user.email);
                if (!success) {
                    console.error('SSO generation failed');
                }
            } catch (error) {
                console.error('Error generating SSO token:', error);
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
            approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
            under_review: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="h-3 w-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <span className="text-lg text-gray-600">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <GraduationCap className="h-8 w-8 text-purple-600" />
                                <span className="text-xl font-bold text-gray-800">SCL Institute</span>
                            </div>
                            <span className="text-gray-400">|</span>
                            <span className="text-lg font-medium text-gray-600">Admin Dashboard</span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="font-medium text-gray-800">{user?.name || 'Admin User'}</div>
                                <div className="text-sm text-gray-500">{user?.role || 'Administrator'}</div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleSSORedirect}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Access LMS
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!</h1>
                    <p className="text-gray-600 mt-2">Here's an overview of your institution's current status</p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.applications}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pending_applications}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-3xl font-bold text-green-600">{stats.approved_applications}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Enquiries</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.enquiries}</p>
                            </div>
                            <Mail className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Enquiries</p>
                                <p className="text-3xl font-bold text-orange-600">{stats.pending_enquiries}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Programs</p>
                                <p className="text-3xl font-bold text-indigo-600">{stats.programs}</p>
                            </div>
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid lg:grid-cols-4 gap-6 mb-8">
                    <button 
                        onClick={() => navigate('/admin/applications')}
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800">Manage Applications</h3>
                            <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <p className="text-gray-600 text-sm">Review and process student applications</p>
                    </button>
                    
                    <button 
                        onClick={() => navigate('/admin/enquiries')}
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800">Handle Enquiries</h3>
                            <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-gray-600 text-sm">Respond to prospective student queries</p>
                    </button>
                    
                    <button 
                        onClick={() => navigate('/admin/programs')}
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800">Manage Programs</h3>
                            <BookOpen className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-gray-600 text-sm">Add, edit, and organize academic programs</p>
                    </button>
                    
                    <button 
                        onClick={() => navigate('/admin/reports')}
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800">View Reports</h3>
                            <BarChart3 className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-gray-600 text-sm">Generate insights and analytics</p>
                    </button>
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Recent Applications */}
                    <div className="bg-white rounded-xl shadow-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800">Recent Applications</h2>
                                <button 
                                    onClick={() => navigate('/admin/applications')}
                                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                >
                                    View All
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {recentApplications.length > 0 ? (
                                <div className="space-y-4">
                                    {recentApplications.map((application) => (
                                        <div key={application.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800">
                                                    {application.first_name} {application.last_name}
                                                </p>
                                                <p className="text-sm text-gray-600">{application.program_name}</p>
                                                <p className="text-xs text-gray-500">
                                                    Applied {formatDate(application.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {getStatusBadge(application.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No applications yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Enquiries */}
                    <div className="bg-white rounded-xl shadow-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800">Recent Enquiries</h2>
                                <button 
                                    onClick={() => navigate('/admin/enquiries')}
                                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                >
                                    View All
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {recentEnquiries.length > 0 ? (
                                <div className="space-y-4">
                                    {recentEnquiries.map((enquiry) => (
                                        <div key={enquiry.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Mail className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800">{enquiry.name}</p>
                                                <p className="text-sm text-gray-600">{enquiry.subject}</p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(enquiry.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {getStatusBadge(enquiry.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No enquiries yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
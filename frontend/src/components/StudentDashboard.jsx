import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  UserPlus,
  TrendingUp,
  Calendar,
  Filter,
  Plus,
  Eye,
  X
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Month');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ title: '', students: [], type: '' });

  // Extended student data for modal popups
  const allStudents = [
    { id: 1, name: 'Sarah Johnson', course: 'Business Administration HND', status: 'under_review', appliedDate: '2026-01-28', email: 'sarah.johnson@email.com', phone: '+971-50-123-4567' },
    { id: 2, name: 'Michael Chen', course: 'IT Degree', status: 'accepted', appliedDate: '2026-01-27', email: 'michael.chen@email.com', phone: '+971-55-234-5678' },
    { id: 3, name: 'Amara Okafor', course: 'Accounting HND', status: 'pending', appliedDate: '2026-01-27', email: 'amara.okafor@email.com', phone: '+971-52-345-6789' },
    { id: 4, name: 'David Smith', course: 'Project Management CPD', status: 'accepted', appliedDate: '2026-01-26', email: 'david.smith@email.com', phone: '+971-56-456-7890' },
    { id: 5, name: 'Lisa Rodriguez', course: 'English Language', status: 'interview_scheduled', appliedDate: '2026-01-25', email: 'lisa.rodriguez@email.com', phone: '+971-50-567-8901' },
    { id: 6, name: 'Ahmed Hassan', course: 'Computer Science', status: 'accepted', appliedDate: '2026-01-24', email: 'ahmed.hassan@email.com', phone: '+971-55-678-9012' },
    { id: 7, name: 'Fatima Al-Zahra', course: 'Business Administration', status: 'under_review', appliedDate: '2026-01-23', email: 'fatima.alzahra@email.com', phone: '+971-52-789-0123' },
    { id: 8, name: 'Omar Khalil', course: 'Engineering', status: 'pending', appliedDate: '2026-01-22', email: 'omar.khalil@email.com', phone: '+971-56-890-1234' },
    { id: 9, name: 'Aisha Mohamed', course: 'Medicine', status: 'under_review', appliedDate: '2026-01-21', email: 'aisha.mohamed@email.com', phone: '+971-50-901-2345' },
    { id: 10, name: 'Khalid Al-Mansoori', course: 'Computer Science', status: 'rejected', appliedDate: '2026-01-20', email: 'khalid.almansoori@email.com', phone: '+971-55-012-3456' }
  ];

  // Mock data for demonstration
  const dashboardStats = {
    totalApplications: 247,
    newApplications: 23,
    underReview: 45,
    accepted: 89,
    rejected: 12,
    pending: 78
  };

  const applicationTrends = [
    { date: '2026-01-01', applications: 12, accepted: 8, rejected: 2, pending: 2 },
    { date: '2026-01-05', applications: 18, accepted: 12, rejected: 3, pending: 3 },
    { date: '2026-01-10', applications: 25, accepted: 18, rejected: 4, pending: 3 },
    { date: '2026-01-15', applications: 31, accepted: 22, rejected: 5, pending: 4 },
    { date: '2026-01-20', applications: 28, accepted: 20, rejected: 4, pending: 4 },
    { date: '2026-01-25', applications: 35, accepted: 25, rejected: 6, pending: 4 },
    { date: '2026-01-28', applications: 42, accepted: 28, rejected: 8, pending: 6 },
  ];

  const courseApplications = [
    { course: 'Business Admin HND', applications: 89, accepted: 67, code: 'BUS101' },
    { course: 'IT Degree', applications: 76, accepted: 52, code: 'IT201' },
    { course: 'Accounting HND', applications: 45, accepted: 34, code: 'ACC301' },
    { course: 'English Language', applications: 23, accepted: 18, code: 'ENG401' },
    { course: 'Project Management', applications: 14, accepted: 12, code: 'PROJ501' },
  ];

  const statusDistribution = [
    { name: 'Accepted', value: 89, color: '#10B981' },
    { name: 'Under Review', value: 45, color: '#F59E0B' },
    { name: 'Pending', value: 78, color: '#6B7280' },
    { name: 'Rejected', value: 12, color: '#EF4444' }
  ];

  const monthlyStats = [
    { month: 'Sep', applications: 156, accepted: 124, rejected: 18 },
    { month: 'Oct', applications: 189, accepted: 142, rejected: 25 },
    { month: 'Nov', applications: 198, accepted: 156, rejected: 28 },
    { month: 'Dec', applications: 203, accepted: 167, rejected: 21 },
    { month: 'Jan', applications: 247, accepted: 189, rejected: 35 },
  ];

  const recentApplications = [
    {
      id: 'SCL20260001',
      studentId: 1,
      name: 'Sarah Johnson',
      course: 'Business Administration HND',
      status: 'under_review',
      appliedDate: '2026-01-28',
      email: 'sarah.johnson@email.com'
    },
    {
      id: 'SCL20260002', 
      studentId: 2,
      name: 'Michael Chen',
      course: 'IT Degree',
      status: 'accepted',
      appliedDate: '2026-01-27',
      email: 'michael.chen@email.com'
    },
    {
      id: 'SCL20260003',
      studentId: 3,
      name: 'Amara Okafor',
      course: 'Accounting HND',
      status: 'pending',
      appliedDate: '2026-01-27',
      email: 'amara.okafor@email.com'
    },
    {
      id: 'SCL20260004',
      studentId: 1,
      name: 'David Smith',
      course: 'Project Management CPD',
      status: 'accepted',
      appliedDate: '2026-01-26',
      email: 'david.smith@email.com'
    },
    {
      id: 'SCL20260005',
      studentId: 1,
      name: 'Lisa Rodriguez',
      course: 'English Language',
      status: 'interview_scheduled',
      appliedDate: '2026-01-25',
      email: 'lisa.rodriguez@email.com'
    }
  ];

  const getStatusColor = (status) => {
    const statusColors = {
      'accepted': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
      'under_review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pending': 'bg-gray-100 text-gray-800 border-gray-200',
      'interview_scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'conditional_accept': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return statusColors[status] || statusColors['pending'];
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'accepted': 'Accepted',
      'rejected': 'Rejected', 
      'under_review': 'Under Review',
      'pending': 'Pending Review',
      'interview_scheduled': 'Interview Scheduled',
      'conditional_accept': 'Conditional Accept'
    };
    return statusTexts[status] || 'Unknown';
  };

  const handleViewStudent = (studentId) => {
    navigate(`/student-detail/${studentId}`);
  };

  const handleCardClick = (cardType) => {
    let filteredStudents = [];
    let title = '';
    
    switch(cardType) {
      case 'total':
        filteredStudents = allStudents;
        title = 'All Applications';
        break;
      case 'under_review':
        filteredStudents = allStudents.filter(s => s.status === 'under_review');
        title = 'Applications Under Review';
        break;
      case 'accepted':
        filteredStudents = allStudents.filter(s => s.status === 'accepted');
        title = 'Accepted Applications';
        break;
      case 'new_week':
        // Filter for applications from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredStudents = allStudents.filter(s => new Date(s.appliedDate) >= weekAgo);
        title = 'New Applications This Week';
        break;
      default:
        filteredStudents = allStudents;
        title = 'All Applications';
    }
    
    setModalData({ title, students: filteredStudents, type: cardType });
    setModalOpen(true);
  };

  const StatCard = ({ title, value, change, icon: Icon, color, trend, onClick }) => (
    <div 
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow relative cursor-pointer hover:scale-105 transform transition-transform"
      onClick={onClick}
    >
      <div className="absolute top-3 right-3">
        <div className="p-1.5 rounded-lg bg-white/50 border border-gray-200/50">
          <Icon className="h-3 w-3 text-gray-400" />
        </div>
      </div>
      <div className="pr-10">
        <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value.toLocaleString()}</p>
        {change && (
          <div className={`flex items-center mt-1 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(change)}% from last month</span>
          </div>
        )}
      </div>
    </div>
  );

  // Modal Component
  const Modal = ({ isOpen, onClose, title, students }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="mb-4">
              <p className="text-sm text-gray-600">Total: {students.length} applications</p>
            </div>
            
            {students.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications found for this category.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.course}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(student.status)}`}>
                            {getStatusText(student.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(student.appliedDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              onClose();
                              handleViewStudent(student.id);
                            }}
                            className="flex items-center text-scl-purple hover:text-purple-700 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Student Admissions Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Monitor and manage student applications</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option>This Week</option>
                <option>This Month</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
              
              <button 
                onClick={() => navigate('/student-application')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Student
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Applications" 
            value={dashboardStats.totalApplications} 
            change={15} 
            trend={15}
            icon={FileText} 
            color="bg-blue-500"
            onClick={() => handleCardClick('total')}
          />
          <StatCard 
            title="Under Review" 
            value={dashboardStats.underReview} 
            icon={Clock} 
            color="bg-yellow-500"
            onClick={() => handleCardClick('under_review')}
          />
          <StatCard 
            title="Accepted" 
            value={dashboardStats.accepted} 
            change={12} 
            trend={12}
            icon={CheckCircle} 
            color="bg-emerald-500"
            onClick={() => handleCardClick('accepted')}
          />
          <StatCard 
            title="New This Week" 
            value={dashboardStats.newApplications} 
            change={8} 
            trend={8}
            icon={UserPlus} 
            color="bg-green-500"
            onClick={() => handleCardClick('new_week')}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Application Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Application Trends</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Last 30 days</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={applicationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Area type="monotone" dataKey="applications" stackId="1" stroke="#3B82F6" fill="#93C5FD" />
                <Area type="monotone" dataKey="accepted" stackId="2" stroke="#10B981" fill="#6EE7B7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Status</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Course Applications & Monthly Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Course Applications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Applications by Course</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseApplications}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="code" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#8884d8" name="Applications" />
                <Bar dataKey="accepted" fill="#82ca9d" name="Accepted" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={3} />
                <Line type="monotone" dataKey="accepted" stroke="#10B981" strokeWidth={3} />
                <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Applications Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              <div className="flex items-center space-x-3">
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Under Review</option>
                  <option>Accepted</option>
                  <option>Rejected</option>
                </select>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentApplications.map((application) => (
                  <tr 
                    key={application.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleViewStudent(application.studentId)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {application.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{application.name}</div>
                        <div className="text-sm text-gray-500">{application.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewStudent(application.studentId);
                          }}
                          className="flex items-center text-scl-purple hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-900 hover:bg-green-50 px-2 py-1 rounded transition-colors">
                          Review
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
              <span className="font-medium">247</span> results
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={modalData.title}
        students={modalData.students}
      />
    </div>
  );
};

export default StudentDashboard;
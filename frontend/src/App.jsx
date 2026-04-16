import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Layout from './components/Layout';
import StudentAdmissionForm from './components/StudentAdmissionForm';
import StudentDashboard from './components/StudentDashboard';
import StudentList from './components/StudentList';
import StudentDetail from './components/StudentDetail';
import StudentReport from './components/StudentReport';
import ApplicationRequests from './components/ApplicationRequests';
import ApplicantsList from './components/ApplicantsList';
import ApplicationReport from './components/ApplicationReport';
import ApplicationReview from './components/ApplicationReview';
import StudentPortalDashboard from './components/student/StudentPortalDashboard';
import StudentProfile from './components/student/StudentProfile';
import StudentAdmissions from './components/student/StudentAdmissions';
import StudentContract from './components/student/StudentContract';
import StudentCourseChanges from './components/student/StudentCourseChanges';
import StudentDocumentsCentre from './components/student/StudentDocumentsCentre';
import StudentMaterials from './components/student/StudentMaterials';
import StudentRightToStudy from './components/student/StudentRightToStudy';
import StudentProgramme from './components/student/StudentProgramme';
import TeacherProgramme from './components/teacher/TeacherProgramme';
import StudentTimetable from './components/student/StudentTimetable';
import StudentAssessments from './components/student/StudentAssessments';
import StudentGrades from './components/student/StudentGrades';
import StudentAttendance from './components/student/StudentAttendance';
import StudentLibrary from './components/student/StudentLibrary';
import StudentSupportHub from './components/student/StudentSupportHub';
import StudentFees from './components/student/StudentFees';
import StudentSupport from './components/student/StudentSupport';
import StudentNotifications from './pages/StudentNotifications';
import CourseAccreditations from './pages/CourseAccreditations';
import CourseAccreditationsDetail from './pages/CourseAccreditationsDetail';
import CourseAccreditationsView from './pages/CourseAccreditationsView';
import CourseMasterDetail from './pages/CourseMasterDetail';
import CourseInductions from './pages/CourseInductions';
import CourseInductionsDetail from './pages/CourseInductionsDetail';
import CourseVisits from './pages/CourseVisits';
import CourseVisitsDetail from './pages/CourseVisitsDetail';
import CourseLifecycleDashboard from './pages/CourseLifecycleDashboard';
import CourseRegistrations from './pages/CourseRegistrations';
import ProgrammeIntakes from './pages/ProgrammeIntakes';
import ManagerCourseChangeRequests from './components/ManagerCourseChangeRequests';
import AccountSettings from './components/AccountSettings';
import TeacherRegistrationForm from './components/TeacherRegistrationForm';
import TeacherRegistrationRequests from './components/TeacherRegistrationRequests';
import { getRoleContext } from './utils/roleAccess';
import { logoutMoodleSession } from './utils/ssoService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function App() {
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const hasVerifiedSessionRef = useRef(false);

    useEffect(() => {
        const verifySession = async () => {
            if (hasVerifiedSessionRef.current) {
                setIsInitialized(true);
                return;
            }
            hasVerifiedSessionRef.current = true;

            try {
                const storedUser = sessionStorage.getItem('user');
                const accessToken = sessionStorage.getItem('accessToken');
                if (storedUser && accessToken) {
                    // Verify the token against the live backend.
                    // If the server has restarted, it will no longer recognise the token
                    // and will return 401 — forcing the user to log in again.
                    const response = await axios.post(`${API_URL}/v1/auth/verify`, { token: accessToken });
                    if (response.data?.valid) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        sessionStorage.removeItem('user');
                        sessionStorage.removeItem('accessToken');
                        localStorage.removeItem('authToken');
                    }
                }
            } catch {
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('accessToken');
                localStorage.removeItem('authToken');
            } finally {
                setIsInitialized(true);
            }
        };
        verifySession();
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        logoutMoodleSession();
        setUser(null);
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        localStorage.removeItem('studentEmail');
        localStorage.removeItem('authToken');
    };

    if (!isInitialized) {
        return null;
    }

    const roleContext = getRoleContext(user);
    const canAccessStudentPortal = roleContext.canAccessStudentPortal;
    const canAccessManagementPortal = roleContext.canAccessManagementPortal;
    
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                {/* Protected Routes */}
                <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/" element={
                    user ? (
                        canAccessManagementPortal ? (
                            <Layout user={user} onLogout={handleLogout}>
                                <Dashboard user={user} onLogout={handleLogout} viewMode="manager" />
                            </Layout>
                        ) : roleContext.hasTeaching ? (
                            <Layout user={user} onLogout={handleLogout}>
                                <Dashboard user={user} onLogout={handleLogout} viewMode="teacher" />
                            </Layout>
                        ) : canAccessStudentPortal ? (
                            <Navigate to="/student/portal" replace />
                        ) : (
                            <Layout user={user} onLogout={handleLogout}>
                                <Dashboard user={user} onLogout={handleLogout} viewMode="auto" />
                            </Layout>
                        )
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/dashboard" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <Dashboard user={user} onLogout={handleLogout} viewMode="student" />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/teacher/dashboard" element={
                    user && roleContext.hasTeaching ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <Dashboard user={user} onLogout={handleLogout} viewMode="teacher" />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/portal" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentPortalDashboard user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/profile" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentProfile user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/settings" element={
                    user ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <AccountSettings user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/admissions" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentAdmissions user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/induction" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentAdmissions user={user} initialTab="induction" />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/contract" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentContract user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/course-changes" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentCourseChanges user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/documents" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentDocumentsCentre user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/materials" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentMaterials user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/right-to-study" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentRightToStudy user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/programme" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentProgramme user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/teacher/programme" element={
                    user && roleContext.hasTeaching ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <TeacherProgramme user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/timetable" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentTimetable user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/assessments" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentAssessments user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/grades" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentGrades user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/attendance" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentAttendance user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/library" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentLibrary user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/course-accreditations" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <Navigate to="/course-lifecycle" replace />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/course-accreditations/:id/view" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <CourseAccreditationsView user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/course-accreditations/:id" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <CourseAccreditationsDetail user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/course-master/new" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <CourseMasterDetail user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/course-inductions" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <Navigate to="/course-lifecycle" replace />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/course-inductions/:id" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <CourseInductionsDetail user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/course-visits" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <Navigate to="/course-lifecycle" replace />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/course-visits/:id" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <CourseVisitsDetail user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/course-lifecycle" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <CourseLifecycleDashboard user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/course-registrations" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <CourseRegistrations user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/programme-intakes" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <ProgrammeIntakes user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/support" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentSupportHub user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/messages" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentSupportHub user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/fees" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentFees user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/support" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentSupport user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/notifications" element={
                    user && canAccessStudentPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentNotifications user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/admin/dashboard" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <AdminDashboard user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/students" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentDashboard />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student-application" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentAdmissionForm />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/teacher-registration" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <TeacherRegistrationForm />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student-list" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentList />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/applicants" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <ApplicantsList />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/applications-report" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <ApplicationReport />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/applications" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <ApplicationRequests />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/teacher-registrations" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <TeacherRegistrationRequests user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student-detail/:id" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentDetail />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/applications/:id/review" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <ApplicationReview />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/applications/:id/edit" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentAdmissionForm isEditMode={true} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/students/report" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentReport />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/course-change-requests" element={
                    user && canAccessManagementPortal ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <ManagerCourseChangeRequests />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
            </Routes>
        </Router>
    );
}

export default App;

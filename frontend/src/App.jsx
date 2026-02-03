import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
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
import StudentProgramme from './components/student/StudentProgramme';
import StudentTimetable from './components/student/StudentTimetable';
import StudentAssessments from './components/student/StudentAssessments';
import StudentMessages from './components/student/StudentMessages';
import StudentFees from './components/student/StudentFees';
import StudentSupport from './components/student/StudentSupport';

function App() {
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        const accessToken = sessionStorage.getItem('accessToken');
        
        if (storedUser && accessToken) {
            try {
                const userData = JSON.parse(storedUser);
                // Restore user from sessionStorage without re-verifying token
                // SessionStorage persists during the same browser session
                setUser(userData);
            } catch (e) {
                // If parse fails, clear storage
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('accessToken');
            }
        }
        setIsInitialized(true);
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
    };

    if (!isInitialized) {
        return null;
    }

    return (
        <Router>
            <Routes>
                {/* Protected Routes */}
                <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/" element={
                    user ? (
                        user.role === 'student' ? (
                            <Layout user={user} onLogout={handleLogout}>
                                <StudentPortalDashboard user={user} />
                            </Layout>
                        ) : (
                            <Layout user={user} onLogout={handleLogout}>
                                <Dashboard user={user} onLogout={handleLogout} />
                            </Layout>
                        )
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/dashboard" element={
                    user && user.role === 'student' ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentPortalDashboard user={user} />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student/profile" element={
                    user && user.role === 'student' ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentProfile user={user} />
                                        <Route path="/student/admissions" element={
                                            user && user.role === 'student' ? (
                                                <Layout user={user} onLogout={handleLogout}>
                                                    <StudentAdmissions user={user} />
                                                </Layout>
                                            ) : (
                                                <LoginPage onLoginSuccess={handleLoginSuccess} />
                                            )
                                        } />
                                        <Route path="/student/programme" element={
                                            user && user.role === 'student' ? (
                                                <Layout user={user} onLogout={handleLogout}>
                                                    <StudentProgramme user={user} />
                                                </Layout>
                                            ) : (
                                                <LoginPage onLoginSuccess={handleLoginSuccess} />
                                            )
                                        } />
                                        <Route path="/student/timetable" element={
                                            user && user.role === 'student' ? (
                                                <Layout user={user} onLogout={handleLogout}>
                                                    <StudentTimetable user={user} />
                                                </Layout>
                                            ) : (
                                                <LoginPage onLoginSuccess={handleLoginSuccess} />
                                            )
                                        } />
                                        <Route path="/student/assessments" element={
                                            user && user.role === 'student' ? (
                                                <Layout user={user} onLogout={handleLogout}>
                                                    <StudentAssessments user={user} />
                                                </Layout>
                                            ) : (
                                                <LoginPage onLoginSuccess={handleLoginSuccess} />
                                            )
                                        } />
                                        <Route path="/student/messages" element={
                                            user && user.role === 'student' ? (
                                                <Layout user={user} onLogout={handleLogout}>
                                                    <StudentMessages user={user} />
                                                </Layout>
                                            ) : (
                                                <LoginPage onLoginSuccess={handleLoginSuccess} />
                                            )
                                        } />
                                        <Route path="/student/fees" element={
                                            user && user.role === 'student' ? (
                                                <Layout user={user} onLogout={handleLogout}>
                                                    <StudentFees user={user} />
                                                </Layout>
                                            ) : (
                                                <LoginPage onLoginSuccess={handleLoginSuccess} />
                                            )
                                        } />
                                        <Route path="/student/support" element={
                                            user && user.role === 'student' ? (
                                                <Layout user={user} onLogout={handleLogout}>
                                                    <StudentSupport user={user} />
                                                </Layout>
                                            ) : (
                                                <LoginPage onLoginSuccess={handleLoginSuccess} />
                                            )
                                        } />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/students" element={
                    user ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentDashboard />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student-application" element={
                    user ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentAdmissionForm />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student-list" element={
                    user ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentList />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/applicants" element={
                    user ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <ApplicantsList />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/applications-report" element={
                    user ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <ApplicationReport />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/applications" element={
                    user ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <ApplicationRequests />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/student-detail/:id" element={
                    user ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentDetail />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/applications/:id/review" element={
                    user ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <ApplicationReview />
                        </Layout>
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
                    )
                } />
                <Route path="/students/report" element={
                    user ? (
                        <Layout user={user} onLogout={handleLogout}>
                            <StudentReport />
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

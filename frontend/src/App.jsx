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

function App() {
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        const accessToken = sessionStorage.getItem('accessToken');
        
        if (storedUser && accessToken) {
            try {
                const userData = JSON.parse(storedUser);
                // Validate token by making a test request
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/v1/auth/verify`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }).then(() => {
                    setUser(userData);
                }).catch(() => {
                    // Token invalid, clear storage
                    sessionStorage.removeItem('user');
                    sessionStorage.removeItem('accessToken');
                    setUser(null);
                }).finally(() => {
                    setIsInitialized(true);
                });
            } catch (e) {
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('accessToken');
                setIsInitialized(true);
            }
        } else {
            setIsInitialized(true);
        }
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
                        <Layout user={user} onLogout={handleLogout}>
                            <Dashboard user={user} onLogout={handleLogout} />
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

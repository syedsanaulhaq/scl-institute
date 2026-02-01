import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import StudentAdmissionForm from './components/StudentAdmissionForm';
import StudentDashboard from './components/StudentDashboard';
import StudentList from './components/StudentList';
import StudentDetail from './components/StudentDetail';
import StudentReport from './components/StudentReport';

function App() {
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        setIsInitialized(true);
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
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

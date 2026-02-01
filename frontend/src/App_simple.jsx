import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PublicHome from './pages/PublicHome';
import ApplicationForm from './pages/ApplicationForm';
import AdminApplications from './pages/AdminApplications';
import './index.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<PublicHome />} />
                <Route path="/apply" element={<ApplicationForm />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin/applications" element={<AdminApplications />} />
            </Routes>
        </Router>
    );
}

export default App;
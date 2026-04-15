import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudentAdmissionForm from './components/StudentAdmissionForm';
import RegistrationLanding from './components/RegistrationLanding';
import TeacherRegistrationForm from './components/TeacherRegistrationForm';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/student-registration" replace />} />
                <Route path="/student-registration" element={<StudentAdmissionForm />} />
                <Route path="/teacher-registration" element={<TeacherRegistrationForm />} />
                <Route path="*" element={<RegistrationLanding />} />
            </Routes>
        </Router>
    );
}

export default App;
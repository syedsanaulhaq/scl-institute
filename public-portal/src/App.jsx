import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentAdmissionForm from './components/StudentAdmissionForm';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="*" element={<StudentAdmissionForm />} />
            </Routes>
        </Router>
    );
}

export default App;
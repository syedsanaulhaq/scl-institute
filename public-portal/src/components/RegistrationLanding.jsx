import { useNavigate } from 'react-router-dom';
import { GraduationCap, UserCheck } from 'lucide-react';

const RegistrationLanding = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
            {/* Header */}
            <header className="bg-[#0d2c57] shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                    <img src="/assets/scl_logo_collapsed_white.png" alt="Stratford College London" className="h-12 w-12 object-contain" />
                    <div>
                        <h1 className="text-xl font-bold text-white">Stratford College London</h1>
                        <p className="text-sm text-blue-100">Online Registration Portal</p>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-6 text-center">
                <h2 className="text-4xl font-bold mb-4">Welcome to SCL Registration Portal</h2>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                    Choose the type of registration below. Your application will be reviewed by our admissions team and you will be notified of the outcome.
                </p>
            </div>

            {/* Cards */}
            <div className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">

                    {/* Student Registration Card */}
                    <button
                        onClick={() => navigate('/student-registration')}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-blue-300 transition-all duration-200 p-10 text-left flex flex-col items-start gap-6 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                        <div className="w-16 h-16 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <GraduationCap className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Student Registration</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Apply to study at Stratford College London. Submit your personal details, choose your programme, upload supporting documents, and complete your enrolment application.
                            </p>
                        </div>
                        <div className="mt-auto w-full">
                            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 group-hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm">
                                Start Student Application
                            </span>
                        </div>
                    </button>

                    {/* Teacher Registration Card */}
                    <button
                        onClick={() => navigate('/teacher-registration')}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-indigo-300 transition-all duration-200 p-10 text-left flex flex-col items-start gap-6 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                    >
                        <div className="w-16 h-16 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                            <UserCheck className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Teacher Registration</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Register as a teacher or lecturer at Stratford College London. Select the course you wish to teach, upload your CV, and our admissions team will review your application.
                            </p>
                        </div>
                        <div className="mt-auto w-full">
                            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 group-hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm">
                                Start Teacher Application
                            </span>
                        </div>
                    </button>

                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Stratford College London. All rights reserved.
            </footer>
        </div>
    );
};

export default RegistrationLanding;

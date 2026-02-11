import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Design1 from './pages/Design1';
import Design2 from './pages/Design2';
import Design3 from './pages/Design3';
import StudentAdmissionForm from './components/StudentAdmissionForm';
import { Layout } from 'lucide-react';
import './index.css';

function App() {
    const [currentView, setCurrentView] = useState('home'); // Start with home (Design1)
    const [selectedDesign, setSelectedDesign] = useState('home');
    const [selectedTheme, setSelectedTheme] = useState('modern');
    const [showDesignPanel, setShowDesignPanel] = useState(false);
    const [lastReference, setLastReference] = useState('');

    const SelectedDesignComponent = {
        design1: Design1,
        design2: Design2,
        design3: Design3,
        home: Home
    }[selectedDesign] || Home;

    if (currentView === 'thankyou') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
                    <div className="max-w-7xl mx-auto px-6 py-10 text-center text-white">
                        <h1 className="text-3xl font-bold mb-2">Thank you for your request</h1>
                        <p className="text-blue-100">We will review your application and inform you accordingly.</p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 py-10">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="p-10 text-center">
                            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">✓</div>
                            <h2 className="text-2xl font-bold text-gray-900">Application Received</h2>
                            <p className="text-gray-600 mt-2">Please keep your reference number for future communication.</p>
                            <div className="mt-6 inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-6 py-4">
                                <span className="text-sm text-blue-700">Reference Number:</span>
                                <span className="ml-2 text-lg font-bold text-blue-900">{lastReference || 'N/A'}</span>
                            </div>
                            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => setCurrentView('home')}
                                    className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    Back to Home
                                </button>
                                <a
                                    href="http://localhost:3000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors font-semibold"
                                >
                                    Go to SCL System
                                </a>
                                <button
                                    onClick={() => setCurrentView('apply')}
                                    className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    Submit Another Application
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (currentView === 'apply') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <button
                            onClick={() => setCurrentView('home')}
                            className="text-white hover:text-blue-100 font-medium flex items-center gap-2 mb-4 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </button>
                        <div className="text-white">
                            <h1 className="text-3xl font-bold mb-2">Student Application</h1>
                            <p className="text-blue-100">Complete your application to join SCL Institute</p>
                        </div>
                    </div>
                </div>

                {/* Form Container with Professional Boundaries */}
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-8 py-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Form</h2>
                            <p className="text-gray-600">Please fill in all required information carefully. Fields marked with * are mandatory.</p>
                        </div>
                        
                        {/* Form Content */}
                        <div className="p-8">
                            <StudentAdmissionForm
                                onSubmitSuccess={(reference) => {
                                    setLastReference(reference);
                                    setCurrentView('thankyou');
                                }}
                            />
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 text-center text-gray-600 text-sm">
                        <p>Need help? Contact us at <span className="text-blue-600 font-semibold">admissions@sclinstitute.edu</span> or call <span className="text-blue-600 font-semibold">+44 20 1234 5678</span></p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Design Selector Button - Left Side */}
            <div className={`fixed top-2/3 left-0 transform -translate-y-1/2 z-30 transition-transform duration-300 ${
                showDesignPanel ? 'translate-x-64' : 'translate-x-0'
            }`}>
                <button
                    onClick={() => setShowDesignPanel(!showDesignPanel)}
                    className={`bg-white rounded-r-lg shadow-lg px-2 py-4 hover:shadow-xl transition-all duration-300 group border border-l-0 border-gray-100 hover:border-blue-200 ${
                        showDesignPanel ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    title="Change Design Layout"
                >
                    <Layout className={`h-5 w-5 transition-colors ${
                        showDesignPanel ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
                    }`} />
                </button>
            </div>

            {/* Design Selection Slide Panel - Left Side */}
            <div className={`fixed top-20 left-0 w-64 bg-white shadow-2xl rounded-r-lg transform transition-transform duration-300 z-30 border-r border-t border-b border-gray-200 overflow-hidden ${
                showDesignPanel ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="h-screen overflow-y-auto flex flex-col">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex-shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <Layout className="h-5 w-5" />
                                <h3 className="text-lg font-semibold">Design Layouts</h3>
                            </div>
                            <button
                                onClick={() => setShowDesignPanel(false)}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Choose Layout</p>
                        <div className="space-y-2">
                            {[
                                { id: 'design1', name: 'Modern Bold', icon: '🎨' },
                                { id: 'design2', name: 'Minimal Clean', icon: '✨' },
                                { id: 'design3', name: 'Corporate Pro', icon: '💼' }
                            ].map((design) => (
                                <button
                                    key={design.id}
                                    onClick={() => {
                                        setSelectedDesign(design.id);
                                        setShowDesignPanel(false);
                                    }}
                                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left flex items-center space-x-3 ${
                                        selectedDesign === design.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="text-2xl">{design.icon}</span>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-sm">{design.name}</h4>
                                    </div>
                                    {selectedDesign === design.id && (
                                        <div className="text-blue-600 text-lg">✓</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {showDesignPanel && (
                <div
                    className="fixed inset-0 bg-black/50 z-20"
                    onClick={() => setShowDesignPanel(false)}
                ></div>
            )}

            <SelectedDesignComponent
                selectedTheme={selectedTheme}
                onApplyNow={() => setCurrentView('apply')}
                onChangeTheme={(newTheme) => setSelectedTheme(newTheme)}
            />
        </div>
    );
}

export default App;
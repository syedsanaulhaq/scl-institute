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
    const [selectedDesign, setSelectedDesign] = useState('design1');
    const [selectedTheme, setSelectedTheme] = useState('modern');
    const [showDesignPanel, setShowDesignPanel] = useState(false);

    const SelectedDesignComponent = {
        design1: Design1,
        design2: Design2,
        design3: Design3,
        home: Home
    }[selectedDesign] || Design1;

    if (currentView === 'apply') {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm py-4 px-6 mb-6">
                    <button
                        onClick={() => setCurrentView('home')}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                    >
                        ← Back to Home
                    </button>
                </div>
                <div className="max-w-7xl mx-auto px-4">
                    <StudentAdmissionForm />
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
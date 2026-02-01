import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import ThemeSelector from './pages/ThemeSelector';
import PublicApplicationForm from './components/PublicApplicationForm';
import './index.css';

function App() {
    const [currentView, setCurrentView] = useState('home'); // Start with home instead of themes
    const [selectedTheme, setSelectedTheme] = useState('modern');

    if (currentView === 'apply') {
        return (
            <PublicApplicationForm 
                selectedTheme={selectedTheme}
                onBack={() => setCurrentView('home')}
            />
        );
    }

    if (currentView === 'home') {
        return (
            <div>
                <Home 
                    selectedTheme={selectedTheme}
                    onApplyNow={() => setCurrentView('apply')}
                    onChangeTheme={(newTheme) => setSelectedTheme(newTheme)}
                />
            </div>
        );
    }

    return (
        <div>
            <ThemeSelector 
                onThemeSelect={(theme) => {
                    setSelectedTheme(theme);
                    setCurrentView('home');
                }}
            />
        </div>
    );
}

export default App;
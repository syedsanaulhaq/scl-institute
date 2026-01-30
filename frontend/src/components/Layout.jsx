import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ user, onLogout, children }) => {
    // Sidebar starts collapsed by default and persists state across navigation
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved ? JSON.parse(saved) : false; // Default to collapsed
    });
    const location = useLocation();

    // Persist sidebar state to localStorage when toggled
    const toggleSidebar = () => {
        const newState = !isSidebarOpen;
        setIsSidebarOpen(newState);
        localStorage.setItem('sidebarOpen', JSON.stringify(newState));
    };

    return (
        <div className="min-h-screen bg-scl-bg">
            <Sidebar
                isOpen={isSidebarOpen}
                toggle={toggleSidebar}
                onLogout={onLogout}
                user={user}
            />

            <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'pl-56' : 'pl-16'}`}>
                <Navbar user={user} onLogout={onLogout} />

                <main className="p-6 max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;

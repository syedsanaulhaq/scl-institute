import { useState, useEffect, useCallback } from 'react';
import { X, GraduationCap, Maximize2, Minimize2 } from 'lucide-react';
import { registerLmsModal, unregisterLmsModal } from '../utils/ssoService';

const LmsModal = () => {
    const [url, setUrl] = useState(null);
    const [maximized, setMaximized] = useState(false);

    useEffect(() => {
        registerLmsModal(setUrl);
        return () => unregisterLmsModal();
    }, []);

    const handleClose = useCallback(() => {
        setUrl(null);
        setMaximized(false);
    }, []);

    // Close on Escape key
    useEffect(() => {
        if (!url) return;
        const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [url, handleClose]);

    if (!url) return null;

    return (
        /* Backdrop — blurs the page behind */
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
            style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', backgroundColor: 'rgba(15,23,42,0.55)' }}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
            {/* Popup window */}
            <div
                className="flex flex-col bg-white shadow-2xl overflow-hidden transition-all duration-300"
                style={{
                    width: maximized ? '100%' : '88vw',
                    height: maximized ? '100%' : '86vh',
                    maxWidth: maximized ? '100%' : '1400px',
                    borderRadius: maximized ? '0' : '16px',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3 shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15">
                            <GraduationCap size={16} className="text-white" />
                        </div>
                        <div>
                            <div className="text-white font-semibold text-sm leading-tight">Moodle LMS</div>
                            <div className="text-blue-200 text-xs">Stratford College London</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Maximise toggle */}
                        <button
                            onClick={() => setMaximized(m => !m)}
                            title={maximized ? 'Restore' : 'Maximise'}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-blue-200 hover:text-white hover:bg-white/15 transition-all"
                        >
                            {maximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                        </button>

                        {/* Close */}
                        <button
                            onClick={handleClose}
                            title="Close LMS (Esc)"
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-blue-200 hover:text-white hover:bg-red-500/80 transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px shrink-0" style={{ background: 'rgba(30,64,175,0.2)' }} />

                {/* iframe */}
                <iframe
                    src={url}
                    className="flex-1 w-full border-0"
                    title="Moodle LMS"
                    allow="fullscreen"
                />
            </div>
        </div>
    );
};

export default LmsModal;

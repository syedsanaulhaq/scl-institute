import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { registerLmsModal, unregisterLmsModal } from '../utils/ssoService';

const LmsModal = () => {
    const [url, setUrl] = useState(null);

    useEffect(() => {
        registerLmsModal(setUrl);
        return () => unregisterLmsModal();
    }, []);

    if (!url) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
            {/* Header bar */}
            <div
                className="flex items-center justify-between shrink-0 px-4 py-2"
                style={{ background: '#1e293b' }}
            >
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    <span className="text-white font-semibold text-sm tracking-wide">Moodle LMS</span>
                    <span className="text-slate-400 text-xs ml-2 hidden sm:inline">— close to return to SCL</span>
                </div>
                <button
                    onClick={() => setUrl(null)}
                    title="Close and return to SCL"
                    className="flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-red-600 transition-all px-3 py-1.5 rounded text-xs font-medium"
                >
                    <X size={14} />
                    Close LMS
                </button>
            </div>

            {/* iframe */}
            <iframe
                src={url}
                className="flex-1 w-full border-0 bg-white"
                title="Moodle LMS"
                allow="fullscreen"
            />
        </div>
    );
};

export default LmsModal;

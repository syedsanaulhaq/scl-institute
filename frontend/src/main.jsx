import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Polyfill Performance API methods that some browser extensions may strip,
// preventing React's scheduler from crashing with "clearMarks is not a function".
if (typeof window !== 'undefined' && window.performance) {
    if (typeof window.performance.mark !== 'function') window.performance.mark = () => {};
    if (typeof window.performance.clearMarks !== 'function') window.performance.clearMarks = () => {};
    if (typeof window.performance.measure !== 'function') window.performance.measure = () => {};
    if (typeof window.performance.clearMeasures !== 'function') window.performance.clearMeasures = () => {};
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

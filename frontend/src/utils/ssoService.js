/**
 * Centralized SSO Service
 * Handles all Single Sign-On operations for Moodle LMS access
 * Eliminates code duplication across components
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const LMS_WINDOW_NAME = 'scl_moodle_window';

let lmsWindowRef = null;

const POPUP_FEATURES = (() => {
    const w = Math.min(1280, Math.round(window.screen.width * 0.85));
    const h = Math.min(900, Math.round(window.screen.height * 0.85));
    const left = Math.round((window.screen.width - w) / 2);
    const top = Math.round((window.screen.height - h) / 2);
    return `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=yes`;
})();

const openOrReuseLmsWindow = (url, placeholderWindow = null) => {
    try {
        if (placeholderWindow && !placeholderWindow.closed) {
            placeholderWindow.location.href = url;
            placeholderWindow.focus();
            lmsWindowRef = placeholderWindow;
            return true;
        }

        if (lmsWindowRef && !lmsWindowRef.closed) {
            lmsWindowRef.location.href = url;
            lmsWindowRef.focus();
            return true;
        }

        const newWindow = window.open(url, LMS_WINDOW_NAME, POPUP_FEATURES);
        if (!newWindow) {
            return false;
        }

        lmsWindowRef = newWindow;
        lmsWindowRef.focus();
        return true;
    } catch (err) {
        console.error('[SSO] Failed to open/reuse LMS window:', err);
        return false;
    }
};

/**
 * Generate SSO token and return Moodle redirect URL
 * @param {string} email - User email address
 * @param {string} redirectTo - Optional redirect URL after SSO login
 * @returns {Promise<{success: boolean, redirectUrl?: string, error?: string}>}
 */
export const generateSSOToken = async (email, redirectTo = null) => {
    try {
        if (!email) {
            throw new Error('Email is required to generate SSO token');
        }

        const response = await axios.post(`${API_URL}/sso/generate`, {
            email,
            redirect_url: redirectTo,
            redirect_to: redirectTo
        });

        if (response.data?.success && response.data?.redirectUrl) {
            return {
                success: true,
                redirectUrl: response.data.redirectUrl
            };
        } else {
            return {
                success: false,
                error: response.data?.message || 'Failed to generate SSO token'
            };
        }
    } catch (err) {
        console.error('[SSO] Token generation failed:', err);
        return {
            success: false,
            error: err.response?.data?.message || err.message || 'Failed to generate SSO token'
        };
    }
};

/**
 * Open Moodle in a new window via SSO
 * @param {string} email - User email
 * @param {object} options - Configuration options
 * @returns {Promise<boolean>} - Success status
 */
export const openMoodleSSO = async (email, options = {}) => {
    const {
        newWindow = true,
        onError = null,
        onSuccess = null,
        redirectTo = null
    } = options;

    let placeholderWindow = null;

    try {
        if (newWindow) {
            placeholderWindow = window.open('', LMS_WINDOW_NAME, POPUP_FEATURES);
            if (!placeholderWindow) {
                const popupError = 'Popup blocked. Please allow popups for this site.';
                onError?.(popupError);
                return false;
            }
        }

        const result = await generateSSOToken(email, redirectTo);
        
        if (result.success) {
            if (newWindow) {
                const opened = openOrReuseLmsWindow(result.redirectUrl, placeholderWindow);
                if (!opened) {
                    const openError = 'Could not open Moodle window.';
                    onError?.(openError);
                    return false;
                }
            } else {
                window.location.href = result.redirectUrl;
            }
            onSuccess?.();
            return true;
        } else {
            const error = result.error || 'Failed to access Moodle';
            onError?.(error);
            throw new Error(error);
        }
    } catch (err) {
        if (placeholderWindow && !placeholderWindow.closed) {
            placeholderWindow.close();
        }
        const errorMessage = err.message || 'Failed to access Moodle LMS';
        onError?.(errorMessage);
        console.error('[SSO] Error:', errorMessage);
        return false;
    }
};

/**
 * Get Moodle URL configuration
 * @returns {string} - Moodle base URL
 */
export const getMoodleUrl = () => {
    return import.meta.env.VITE_MOODLE_URL || 'http://localhost:9090';
};

/**
 * Log out the active Moodle SSO window when the SCL user logs out.
 * Navigates the named Moodle window to Moodle's logout URL so the
 * server-side Moodle session is also invalidated.
 */
export const logoutMoodleSession = () => {
    try {
        const moodleUrl = getMoodleUrl();
        const logoutBaseUrl = `${moodleUrl}/local/sclsso/logout.php`;
        const silentLogoutUrl = `${logoutBaseUrl}?redirect=${encodeURIComponent('/login/index.php')}`;
        const windowLogoutUrl = `${logoutBaseUrl}?close=1&redirect=${encodeURIComponent('/login/index.php')}`;

        // Best-effort silent logout request for cases where the LMS window was closed manually.
        fetch(silentLogoutUrl, {
            method: 'GET',
            mode: 'no-cors',
            credentials: 'include',
            keepalive: true
        }).catch(() => {});

        if (lmsWindowRef && !lmsWindowRef.closed) {
            // Let the Moodle window complete server-side logout and close itself.
            lmsWindowRef.location.href = windowLogoutUrl;
        }
        lmsWindowRef = null;
    } catch (err) {
        // Cross-origin errors can occur if the window has already navigated
        // away; treat silently and clear the reference.
        console.warn('[SSO] Could not log out Moodle window:', err);
        lmsWindowRef = null;
    }
};

/**
 * Get SSO button configuration
 * @returns {object} - Button styles and text
 */
export const getSSOButtonConfig = () => {
    return {
        label: 'Access Moodle (SSO)',
        icon: 'GraduationCap',
        color: 'bg-indigo-600',
        hoverColor: 'hover:bg-indigo-700',
        textColor: 'text-white'
    };
};

export default {
    generateSSOToken,
    openMoodleSSO,
    getMoodleUrl,
    getSSOButtonConfig
};

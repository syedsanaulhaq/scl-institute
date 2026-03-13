/**
 * Centralized SSO Service
 * Handles all Single Sign-On operations for Moodle LMS access
 * Eliminates code duplication across components
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const LMS_WINDOW_NAME = 'scl_moodle_window';

let lmsWindowRef = null;

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

        const newWindow = window.open(url, LMS_WINDOW_NAME);
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
            placeholderWindow = window.open('', LMS_WINDOW_NAME);
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

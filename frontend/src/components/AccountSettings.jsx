import { useState } from 'react';
import axios from 'axios';
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AccountSettings = ({ user }) => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState(null);
    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const handlePasswordInputChange = (field, value) => {
        setPasswordData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage(null);

        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Please fill in all password fields.' });
            return;
        }

        if (newPassword.length < 8) {
            setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New password and confirm password do not match.' });
            return;
        }

        try {
            setPasswordSaving(true);
            const response = await axios.post(`${API_URL}/change-password`, {
                email: user?.email,
                currentPassword,
                newPassword
            });

            if (response.data?.success) {
                setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPasswordMessage({ type: 'error', text: response.data?.message || 'Failed to update password.' });
            }
        } catch (error) {
            setPasswordMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update password.'
            });
        } finally {
            setPasswordSaving(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-600 mt-2">Manage your account details and update your password.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium text-gray-900">{user?.name || '-'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{user?.email || '-'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-600">Role</p>
                            <p className="font-medium text-gray-900">{user?.role || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <h3 className="text-xl font-bold text-gray-900">Password Settings</h3>
                </div>

                {passwordMessage && (
                    <div className={`mb-4 p-3 rounded-lg border flex items-center gap-2 ${
                        passwordMessage.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                        <AlertCircle className="w-4 h-4" />
                        <span>{passwordMessage.text}</span>
                    </div>
                )}

                <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords.currentPassword ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('currentPassword')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={showPasswords.currentPassword ? 'Hide current password' : 'Show current password'}
                            >
                                {showPasswords.currentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords.newPassword ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('newPassword')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={showPasswords.newPassword ? 'Hide new password' : 'Show new password'}
                            >
                                {showPasswords.newPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirmPassword ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirmPassword')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={showPasswords.confirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                            >
                                {showPasswords.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <button
                            type="submit"
                            disabled={passwordSaving}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                        >
                            {passwordSaving ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;
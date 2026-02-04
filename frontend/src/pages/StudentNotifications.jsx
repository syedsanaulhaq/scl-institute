import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, XCircle, Clock, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState(null);
    const [ssoLoading, setSsoLoading] = useState(false);
    const [ssoError, setSsoError] = useState('');

    useEffect(() => {
        const storedEmail = localStorage.getItem('studentEmail');
        console.log('[NOTIFICATIONS PAGE] Stored email:', storedEmail);
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    useEffect(() => {
        if (!email) return;

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                console.log('[NOTIFICATIONS PAGE] Fetching for email:', email);
                const response = await axios.get(`${API_URL}/notifications/user/${email}`);
                console.log('[NOTIFICATIONS PAGE] Response:', response.data);
                if (response.data.success) {
                    setNotifications(response.data.notifications);
                }
            } catch (error) {
                console.error('[NOTIFICATIONS PAGE] Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, [email]);

    // Handle notification selection from URL parameter
    useEffect(() => {
        const notificationId = searchParams.get('id');
        console.log('[NOTIFICATIONS PAGE] Search param id:', notificationId);
        console.log('[NOTIFICATIONS PAGE] Current URL:', window.location.href);
        console.log('[NOTIFICATIONS PAGE] Notifications count:', notifications.length);
        
        if (notificationId && notifications.length > 0) {
            const notification = notifications.find(n => n.id === parseInt(notificationId));
            console.log('[NOTIFICATIONS PAGE] Found notification:', notification);
            if (notification) {
                setSelectedNotification(notification);
                console.log('[NOTIFICATIONS PAGE] Set selected notification');
            }
        }
    }, [searchParams, notifications]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.put(`${API_URL}/notifications/${notificationId}/read`);
            setNotifications(
                notifications.map(n =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.put(`${API_URL}/notifications/user/${email}/read-all`);
            setNotifications(
                notifications.map(n => ({ ...n, is_read: true }))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleAccessLMS = async () => {
        try {
            if (!email) return;
            setSsoLoading(true);
            setSsoError('');
            const response = await axios.post(`${API_URL}/sso/generate`, {
                email
            });

            if (response.data?.success && response.data?.redirectUrl) {
                window.open(response.data.redirectUrl, '_blank', 'noopener,noreferrer');
            } else {
                setSsoError('Failed to generate SSO link');
            }
        } catch (err) {
            setSsoError(err.response?.data?.message || 'Failed to access Moodle');
        } finally {
            setSsoLoading(false);
        }
    };

    const getFilteredNotifications = () => {
        if (filter === 'unread') {
            return notifications.filter(n => !n.is_read);
        }
        if (filter !== 'all') {
            return notifications.filter(n => n.type === filter);
        }
        return notifications;
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'welcome':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'conditional_offer':
                return <AlertCircle className="w-6 h-6 text-yellow-500" />;
            case 'rejection':
                return <XCircle className="w-6 h-6 text-red-500" />;
            case 'update':
                return <Clock className="w-6 h-6 text-blue-500" />;
            default:
                return <Mail className="w-6 h-6 text-gray-500" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'welcome':
                return 'bg-green-50 border-l-4 border-green-500';
            case 'conditional_offer':
                return 'bg-yellow-50 border-l-4 border-yellow-500';
            case 'rejection':
                return 'bg-red-50 border-l-4 border-red-500';
            case 'update':
                return 'bg-blue-50 border-l-4 border-blue-500';
            default:
                return 'bg-gray-50 border-l-4 border-gray-500';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatNotificationBody = (text) => {
        if (!text) return '';
        return text
            .replace(/https?:\/\/localhost:9090\S*/gi, 'Moodle LMS (use button below)')
            .replace(/https?:\/\/lms\.sclsandbox\.xyz\S*/gi, 'Moodle LMS (use button below)');
    };

    const filteredNotifications = getFilteredNotifications();
    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (selectedNotification) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => setSelectedNotification(null)}
                        className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Notifications
                    </button>

                    {/* Notification Detail */}
                    <div className={`${getNotificationColor(selectedNotification.type)} rounded-lg shadow-lg p-8`}>
                        <div className="flex items-start gap-4 mb-6">
                            {getNotificationIcon(selectedNotification.type)}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {selectedNotification.subject}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {formatDate(selectedNotification.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Notification Body */}
                        <div className="bg-white rounded p-6 mb-6">
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                {formatNotificationBody(selectedNotification.body || selectedNotification.message)}
                            </div>
                        </div>

                        {(selectedNotification?.notification_data?.moodle_url ||
                            (selectedNotification.body || selectedNotification.message || '').match(/https?:\/\/localhost:9090|https?:\/\/lms\.sclsandbox\.xyz/i)) && (
                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={handleAccessLMS}
                                    disabled={ssoLoading}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                                >
                                    Open Moodle (SSO)
                                </button>
                                {ssoError && (
                                    <p className="mt-2 text-sm text-red-600">{ssoError}</p>
                                )}
                            </div>
                        )}

                        {/* Data Section */}
                        {selectedNotification.notification_data && (
                            <div className="bg-white rounded p-6 mb-6">
                                <h3 className="font-bold text-gray-900 mb-4">Details</h3>
                                <div className="space-y-3">
                                    {typeof selectedNotification.notification_data === 'string' ? (
                                        <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
                                            {JSON.stringify(JSON.parse(selectedNotification.notification_data), null, 2)}
                                        </pre>
                                    ) : (
                                        Object.entries(selectedNotification.notification_data).map(([key, value]) => (
                                            <div key={key} className="border-b pb-3">
                                                <p className="text-sm font-medium text-gray-600">{key}</p>
                                                <p className="text-gray-900">
                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            {!selectedNotification.is_read && (
                                <button
                                    onClick={() => {
                                        handleMarkAsRead(selectedNotification.id);
                                        setSelectedNotification({ ...selectedNotification, is_read: true });
                                    }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Mark as Read
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
                    </div>
                    <p className="text-gray-600">
                        You have <span className="font-bold text-blue-600">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
                    <div className="flex flex-wrap">
                        {[
                            { label: 'All', value: 'all', count: notifications.length },
                            { label: 'Unread', value: 'unread', count: unreadCount },
                            { label: 'Welcome', value: 'welcome', count: notifications.filter(n => n.type === 'welcome').length },
                            { label: 'Offers', value: 'conditional_offer', count: notifications.filter(n => n.type === 'conditional_offer').length }
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setFilter(tab.value)}
                                className={`flex-1 px-6 py-4 font-medium transition-colors border-b-2 ${
                                    filter === tab.value
                                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {tab.label} <span className="ml-2 text-sm">({tab.count})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mark All as Read */}
                {unreadCount > 0 && (
                    <div className="mb-6">
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Mark all as read
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                onClick={() => {
                                    if (!notification.is_read) {
                                        handleMarkAsRead(notification.id);
                                    }
                                    setSelectedNotification(notification);
                                }}
                                className={`${getNotificationColor(notification.type)} p-6 rounded-lg cursor-pointer hover:shadow-lg transition-all ${
                                    !notification.is_read ? 'font-medium' : ''
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {notification.subject}
                                        </h3>
                                        <p className="text-gray-600 mt-2 line-clamp-2">
                                            {notification.message || notification.body?.split('\n')[0]}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {formatDate(notification.created_at)}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

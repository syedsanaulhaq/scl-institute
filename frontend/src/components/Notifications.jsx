import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Mail, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showPanel, setShowPanel] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread, welcome, conditional_offer
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState(null);

    // Get email from localStorage
    useEffect(() => {
        const storedEmail = localStorage.getItem('studentEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    // Fetch notifications
    useEffect(() => {
        if (!email) return;

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/notifications/user/${email}`);
                if (response.data.success) {
                    setNotifications(response.data.notifications);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUnreadCount = async () => {
            try {
                const response = await axios.get(`${API_URL}/notifications/unread-count/${email}`);
                if (response.data.success) {
                    setUnreadCount(response.data.unread_count);
                }
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        fetchNotifications();
        fetchUnreadCount();

        // Poll for new notifications every 10 seconds
        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, 10000);

        return () => clearInterval(interval);
    }, [email]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.put(`${API_URL}/notifications/${notificationId}/read`);
            setNotifications(
                notifications.map(n =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount(Math.max(0, unreadCount - 1));
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
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
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
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'conditional_offer':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'rejection':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'update':
                return <Clock className="w-5 h-5 text-blue-500" />;
            default:
                return <Mail className="w-5 h-5 text-gray-500" />;
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
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const filteredNotifications = getFilteredNotifications();

    return (
        <div className="relative">
            {/* Notification Bell Icon */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {showPanel && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg">Notifications</h3>
                            <p className="text-sm text-blue-100">{unreadCount} unread</p>
                        </div>
                        <button
                            onClick={() => setShowPanel(false)}
                            className="hover:bg-blue-600 p-1 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex border-b bg-gray-50">
                        {[
                            { label: 'All', value: 'all' },
                            { label: 'Unread', value: 'unread' },
                            { label: 'Welcome', value: 'welcome' },
                            { label: 'Offers', value: 'conditional_offer' }
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setFilter(tab.value)}
                                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                                    filter === tab.value
                                        ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Loading...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No notifications yet</p>
                            </div>
                        ) : (
                            filteredNotifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`${getNotificationColor(notification.type)} p-4 border-b hover:bg-opacity-80 transition-all cursor-pointer ${
                                        !notification.is_read ? 'font-medium' : ''
                                    }`}
                                    onClick={() => {
                                        console.log('[BELL POPUP] Clicked notification:', notification.id, notification.subject);
                                        if (!notification.is_read) {
                                            handleMarkAsRead(notification.id);
                                        }
                                        console.log('[BELL POPUP] Navigating with ID:', notification.id);
                                        // Force navigation by changing URL directly
                                        window.location.href = `/student/notifications?id=${notification.id}`;
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-gray-900">
                                                {notification.subject}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {notification.message ||
                                                    notification.body?.split('\n')[0] ||
                                                    'Click to view details'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {formatDate(notification.created_at)}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {unreadCount > 0 && filteredNotifications.length > 0 && (
                        <div className="bg-gray-50 p-3 border-t rounded-b-lg text-center">
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Mark all as read
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Button, Badge, ConfirmDialog } from '@/components/ui';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification, NotificationFilters } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

const notificationTypeColors: Record<string, string> = {
    habit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    habit_reminder: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    streak_milestone: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    daily_summary: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    weekly_insights: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    achievement: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    challenge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    challenge_update: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    community: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    community_activity: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    system: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    system_update: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    tips_tricks: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const notificationTypeIcons: Record<string, string> = {
    habit: '🎯',
    habit_reminder: '🎯',
    streak_milestone: '🔥',
    daily_summary: '📊',
    weekly_insights: '📈',
    achievement: '🏆',
    challenge: '🚀',
    challenge_update: '🏆',
    community: '👥',
    community_activity: '👥',
    system: '📢',
    system_update: '⚙️',
    tips_tricks: '💡',
};

const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        error,
        pagination,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
    } = useNotifications();

    const [filters, setFilters] = useState<NotificationFilters>({
        type: 'all',
        page: 1,
        limit: 20,
    });

    const [showFilters, setShowFilters] = useState(false);
    const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'warning' | 'info';
        confirmText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'warning',
        confirmText: 'Confirm',
    });

    useEffect(() => {
        console.log('Fetching notifications with filters:', filters);
        fetchNotifications(filters);
    }, [filters, fetchNotifications]);

    const handleNotificationClick = async (notification: Notification) => {
        console.log('Notification clicked:', notification.id, 'Read status:', notification.read);

        // Mark as read on ANY click (expand, collapse, or just clicking)
        if (!notification.read) {
            console.log('Marking notification as read:', notification.id);
            try {
                await markAsRead([notification.id]);
                console.log('Successfully marked as read');
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }

        // Toggle expansion
        const newExpandedNotifications = new Set(expandedNotifications);
        if (expandedNotifications.has(notification.id)) {
            newExpandedNotifications.delete(notification.id);
        } else {
            newExpandedNotifications.add(notification.id);
        }
        setExpandedNotifications(newExpandedNotifications);
    };

    const handleNavigateToAction = (notification: Notification, e: React.MouseEvent) => {
        e.stopPropagation();
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await markAsRead([notificationId]);
    };

    const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Notification',
            message: 'Are you sure you want to delete this notification? This action cannot be undone.',
            onConfirm: () => deleteNotification(notificationId),
            variant: 'danger',
            confirmText: 'Delete',
        });
    };

    const handleMarkAllAsRead = async () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Mark All as Read',
            message: 'Mark all notifications as read?',
            onConfirm: () => markAllAsRead(),
            variant: 'info',
            confirmText: 'Mark as Read',
        });
    };

    const handleDeleteAllRead = async () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete All Read',
            message: 'Delete all read notifications? This action cannot be undone.',
            onConfirm: () => deleteAllRead(),
            variant: 'danger',
            confirmText: 'Delete All',
        });
    };

    const handleFilterChange = (type: NotificationFilters['type']) => {
        setFilters({ ...filters, type, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Notifications
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Stay updated with your habit journey
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Badge variant="primary" className="px-3 py-1">
                                {unreadCount} unread
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Actions Bar */}
                <Card className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                            {unreadCount > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                >
                                    <CheckCheck className="h-4 w-4 mr-2" />
                                    Mark All Read
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDeleteAllRead}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Read
                            </Button>
                        </div>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-wrap gap-2">
                                {['all', 'habit', 'achievement', 'challenge', 'community', 'system'].map((type) => (
                                    <Button
                                        key={type}
                                        variant={filters.type === type ? 'primary' : 'outline'}
                                        size="sm"
                                        onClick={() => handleFilterChange(type as NotificationFilters['type'])}
                                    >
                                        {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Notifications List */}
                {loading && notifications.length === 0 ? (
                    <Card className="p-12">
                        <div className="flex flex-col items-center justify-center text-center">
                            <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
                        </div>
                    </Card>
                ) : error ? (
                    <Card className="p-12">
                        <div className="flex flex-col items-center justify-center text-center">
                            <Bell className="h-12 w-12 text-red-600 mb-4" />
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    </Card>
                ) : notifications.length === 0 ? (
                    <Card className="p-12">
                        <div className="flex flex-col items-center justify-center text-center">
                            <Bell className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No notifications yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                You're all caught up! Check back later for updates.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((notification) => {
                            const isExpanded = expandedNotifications.has(notification.id);
                            const messagePreview = notification.message.length > 100
                                ? notification.message.substring(0, 100) + '...'
                                : notification.message;

                            return (
                                <Card
                                    key={notification.id}
                                    className={cn(
                                        'p-4 cursor-pointer transition-all hover:shadow-md',
                                        !notification.read
                                            ? 'bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-300 dark:border-blue-700'
                                            : 'bg-white dark:bg-gray-800',
                                        isExpanded && 'shadow-lg'
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 text-2xl">
                                            {notificationTypeIcons[notification.type]}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className={cn(
                                                    "font-semibold break-words",
                                                    !notification.read
                                                        ? "text-gray-900 dark:text-white"
                                                        : "text-gray-700 dark:text-gray-300"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Badge
                                                        className={notificationTypeColors[notification.type]}
                                                    >
                                                        {notification.type}
                                                    </Badge>
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Message with proper wrapping */}
                                            <p className={cn(
                                                "text-sm mb-2 break-words whitespace-pre-wrap",
                                                !notification.read
                                                    ? "text-gray-800 dark:text-gray-200 font-medium"
                                                    : "text-gray-600 dark:text-gray-400",
                                                !isExpanded && "line-clamp-2"
                                            )}>
                                                {isExpanded ? notification.message : messagePreview}
                                            </p>

                                            {/* Expanded content */}
                                            {isExpanded && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                                    {notification.actionUrl && (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={(e) => handleNavigateToAction(notification, e)}
                                                            className="w-full sm:w-auto"
                                                        >
                                                            View Details
                                                        </Button>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 text-xs mt-2">
                                                <span className={cn(
                                                    !notification.read
                                                        ? "text-gray-700 dark:text-gray-300 font-medium"
                                                        : "text-gray-500 dark:text-gray-500"
                                                )}>
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                    })}
                                                </span>
                                                {!notification.read && (
                                                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                                                        Unread
                                                    </span>
                                                )}
                                                {isExpanded && (
                                                    <span className="text-gray-400">
                                                        Click to collapse
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                            {!notification.read && !isExpanded && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => handleDelete(notification.id, e)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(filters.page - 1)}
                                disabled={!pagination.hasPrevPage}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(filters.page + 1)}
                                disabled={!pagination.hasNextPage}
                            >
                                Next
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant || 'warning'}
                confirmText={confirmDialog.confirmText || 'Confirm'}
                cancelText="Cancel"
            />
        </div>
    );
};

export default NotificationsPage;

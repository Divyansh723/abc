import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface NotificationBellProps {
  className?: string;
  onClick?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  className,
  onClick 
}) => {
  const { unreadCount, refreshUnreadCount } = useNotifications();
  const navigate = useNavigate();

  // Refresh unread count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/notifications');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative p-2 rounded-lg transition-colors',
        'hover:bg-gray-100 dark:hover:bg-gray-700',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      
      {/* Unread count badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

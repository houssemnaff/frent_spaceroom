import React from "react";
import { Bell, ClipboardList, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const NotificationsDropdown = ({ notificationData, isDark, isMobile = false }) => {
  const { 
    notifications = [], 
    unreadCount = 0, 
    markAsRead, 
    markAllAsRead, 
    fetchNotifications
  } = notificationData || {};

  // Handle notification click - mark as read
  const handleNotificationClick = (notificationId) => {
    markAsRead && markAsRead([notificationId]);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <ClipboardList className="h-4 w-4 text-amber-500" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'resource':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format timestamp to relative time - defined locally to avoid dependency issues
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <DropdownMenu onOpenChange={() => fetchNotifications && fetchNotifications()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isDark ? "ghost" : "outline"}
          size="icon"
          className={`relative ${
            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
          } ${unreadCount > 0 ? "animate-pulse" : ""}`}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className={`h-5 w-5 ${unreadCount > 0 ? "text-blue-500" : ""}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-800">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={`${isMobile ? 'w-72' : 'w-80'} ${isDark ? 'bg-gray-800 text-white border-gray-700' : ''}`}
      >
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className={isDark ? 'text-white' : ''}>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsRead && markAllAsRead()}
              className={`text-xs ${isDark ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className={isDark ? 'bg-gray-700' : ''} />
        
        <div className={`${isMobile ? 'max-h-80' : 'max-h-96'} overflow-y-auto`}>
          {notifications.length === 0 ? (
            <div className={`py-4 px-2 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No notifications
            </div>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem 
                key={notification._id || notification.id}
                className={`cursor-pointer py-2 ${
                  !notification.read 
                    ? isDark ? 'bg-blue-900/30' : 'bg-blue-50' 
                    : isDark ? '' : ''
                }`}
                onClick={() => handleNotificationClick(notification._id || notification.id)}
              >
                <div className="flex flex-col space-y-1 w-full">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    <span className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                      {notification.title}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {!isMobile && (
          <>
            <DropdownMenuSeparator className={isDark ? 'bg-gray-700' : ''} />
            <div className="p-2 text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`w-full text-sm ${isDark ? 'hover:bg-gray-700' : ''}`}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
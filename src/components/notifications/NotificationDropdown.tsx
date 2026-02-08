import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";

const NotificationDropdown = () => {
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "shortlisted":
        return "🎯";
      case "rejected":
        return "❌";
      case "hired":
        return "🎉";
      case "application_received":
        return "📩";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "shortlisted":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
      case "hired":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
      case "application_received":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-background border border-border">
        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <span className="font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem
                key={notification.$id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer",
                  !notification.is_read && "bg-primary/5"
                )}
                onClick={() => {
                  if (!notification.is_read) {
                    markRead.mutate(notification.$id);
                  }
                }}
              >
                <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !notification.is_read && "font-medium")}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.$createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link to="/notifications" className="block">
                <Button variant="outline" className="w-full" size="sm">
                  View All Notifications
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;

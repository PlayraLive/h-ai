"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Filter,
  Check,
  Trash2,
  Eye,
  MoreVertical,
  Briefcase,
  CreditCard,
  MessageCircle,
  Star,
  Settings,
  Search,
  CheckCircle,
  X,
  RefreshCw,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  databases,
  DATABASE_ID,
  COLLECTIONS,
  Query,
} from "@/lib/appwrite/database";

interface Notification {
  $id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  relatedId?: string;
  relatedType?: string;
  $createdAt: string;
  $updatedAt: string;
}

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );

  // Load notifications from database
  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        [
          Query.equal("userId", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(50),
        ],
      );

      setNotifications(response.documents as Notification[]);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications when component mounts
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter = filter === "all" || notification.type === filter;
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        id,
        {
          isRead: true,
          readAt: new Date().toISOString(),
        },
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.$id === id
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      // Update all unread notifications in database
      const updatePromises = unreadNotifications.map((notification) =>
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.NOTIFICATIONS,
          notification.$id,
          {
            isRead: true,
            readAt: new Date().toISOString(),
          },
        ),
      );

      await Promise.all(updatePromises);

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        id,
      );

      setNotifications((prev) => prev.filter((n) => n.$id !== id));
      setSelectedNotifications((prev) => prev.filter((nId) => nId !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id],
    );
  };

  const deleteSelected = async () => {
    try {
      const deletePromises = selectedNotifications.map((id) =>
        databases.deleteDocument(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, id),
      );

      await Promise.all(deletePromises);

      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifications.includes(n.$id)),
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Error deleting selected notifications:", error);
    }
  };

  const markSelectedAsRead = async () => {
    try {
      const updatePromises = selectedNotifications.map((id) =>
        databases.updateDocument(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, id, {
          isRead: true,
          readAt: new Date().toISOString(),
        }),
      );

      await Promise.all(updatePromises);

      setNotifications((prev) =>
        prev.map((n) =>
          selectedNotifications.includes(n.$id)
            ? {
                ...n,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : n,
        ),
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Error marking selected notifications as read:", error);
    }
  };

  // Format relative time
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "project":
        return <Briefcase className="w-5 h-5" />;
      case "payment":
        return <CreditCard className="w-5 h-5" />;
      case "message":
        return <MessageCircle className="w-5 h-5" />;
      case "review":
        return <Star className="w-5 h-5" />;
      case "system":
        return <Settings className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "project":
        return "bg-blue-500";
      case "payment":
        return "bg-green-500";
      case "message":
        return "bg-purple-500";
      case "review":
        return "bg-yellow-500";
      case "system":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const filterOptions = [
    { value: "all", label: "All", count: notifications.length },
    {
      value: "project",
      label: "Projects",
      count: notifications.filter((n) => n.type === "project").length,
    },
    {
      value: "payment",
      label: "Payments",
      count: notifications.filter((n) => n.type === "payment").length,
    },
    {
      value: "message",
      label: "Messages",
      count: notifications.filter((n) => n.type === "message").length,
    },
    {
      value: "review",
      label: "Reviews",
      count: notifications.filter((n) => n.type === "review").length,
    },
    {
      value: "system",
      label: "System",
      count: notifications.filter((n) => n.type === "system").length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar />

      <div className="flex-1 lg:ml-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white lg:ml-0 ml-12">
                    Notifications
                  </h1>
                  <p className="text-gray-400 mt-2">
                    {unreadCount > 0
                      ? `${unreadCount} unread notifications`
                      : "All caught up!"}
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="btn-secondary">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="glass-card p-6 rounded-2xl mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search notifications..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                {/* Filter Tags */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1",
                          filter === option.value
                            ? "bg-purple-500 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600",
                        )}
                      >
                        <span>{option.label}</span>
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-full text-xs",
                            filter === option.value
                              ? "bg-white/20 text-white"
                              : "bg-gray-600 text-gray-400",
                          )}
                        >
                          {option.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedNotifications.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <span className="text-sm text-gray-400">
                    {selectedNotifications.length} selected
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={markSelectedAsRead}
                      className="btn-secondary text-sm"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Mark read
                    </button>
                    <button
                      onClick={deleteSelected}
                      className="btn-secondary text-sm text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="glass-card p-12 rounded-2xl text-center">
                  <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No notifications found
                  </h3>
                  <p className="text-gray-400">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "You're all caught up!"}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "glass-card p-6 rounded-2xl transition-all duration-200 hover:bg-white/5 group",
                      !notification.read &&
                        "ring-1 ring-purple-500/30 bg-purple-500/5",
                    )}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(
                            notification.id,
                          )}
                          onChange={() =>
                            toggleSelectNotification(notification.id)
                          }
                          className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                        />
                      </div>

                      {/* Avatar/Icon */}
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <UserAvatar
                            src={notification.avatar}
                            alt=""
                            size="md"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center text-white",
                              getNotificationColor(notification.type),
                            )}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3
                              className={cn(
                                "text-lg font-semibold",
                                notification.read
                                  ? "text-gray-300"
                                  : "text-white",
                              )}
                            >
                              {notification.title}
                            </h3>
                            <p className="text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              {notification.time}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Action Button */}
                        {notification.actionUrl && (
                          <div className="mt-4">
                            <a
                              href={notification.actionUrl}
                              className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View details
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

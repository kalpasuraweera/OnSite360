import React, { useState, useMemo } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import {
  useUserNotifications,
  useMarkNotificationRead,
  type Notification,
} from "../hooks/useUsers";

const Notifications: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const userId = currentUser?.id || "";

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useUserNotifications(userId);

  const markRead = useMarkNotificationRead();

  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead),
    [notifications]
  );
  const readNotifications = useMemo(
    () => notifications.filter((n) => !!n.isRead),
    [notifications]
  );

  const notificationsToShow =
    activeTab === "unread" ? unreadNotifications : readNotifications;

  const handleMarkRead = async (notification: Notification) => {
    if (!userId) return;
    try {
      await markRead.mutateAsync({
        userId,
        notificationId: notification.id,
      });
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { hour12: true });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Notifications</h1>
      <p className="text-gray-500 mb-6">Unread and read notifications</p>

      {!userId ? (
        <div className="text-gray-500">Please sign in to view notifications.</div>
      ) : isLoading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="tabs mb-4">
            <button
              className={`tab ${activeTab === "unread" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("unread")}
            >
              Unread ({unreadNotifications.length})
            </button>
            <button
              className={`tab ${activeTab === "read" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("read")}
            >
              Read ({readNotifications.length})
            </button>
          </div>

          <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
            <div className="space-y-4">
              {notificationsToShow.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl text-base-content/20 mb-4">🔔</div>
                  <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                    {isError
                      ? "Failed to load notifications"
                      : activeTab === "unread"
                      ? "No unread notifications"
                      : "No read notifications"}
                  </h3>
                  <p className="text-base-content/50">
                    {isError
                      ? "There was a problem fetching your notifications. Try again later."
                      : "You're all caught up."}
                  </p>
                </div>
              ) : (
                notificationsToShow.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex flex-col md:flex-row md:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                  >
                    <div>
                      <div className="font-semibold">{notif.title}</div>
                      {notif.description && (
                        <div className="text-gray-500 text-sm">
                          {notif.description}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-3 md:mt-0">
                      <div className="text-xs text-gray-400">
                        {formatTime(
                          notif.time ||
                            notif.createdAt ||
                            notif.updatedAt ||
                            new Date().toISOString()
                        )}
                      </div>

                      {!notif.isRead && activeTab === "unread" && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleMarkRead(notif)}
                          disabled={markRead.loading}
                        >
                          {markRead.loading ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            "Mark read"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;

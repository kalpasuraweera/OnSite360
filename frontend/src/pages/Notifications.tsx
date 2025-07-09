import React, { useState } from "react";

const sampleNotifications = [
  {
    id: 1,
    title: "New Message",
    description: "You have a new message from John Doe.",
    time: "2 minutes ago",
    type: "info",
  },
  {
    id: 2,
    title: "Report Approved",
    description: "Your report has been approved.",
    time: "1 hour ago",
    type: "success",
  },
  {
    id: 3,
    title: "System Maintenance",
    description: "System maintenance scheduled for tomorrow at 2:00 PM.",
    time: "Yesterday",
    type: "warning",
  },
];

const recentNotifications = sampleNotifications.filter(
  (n) => n.time === "2 minutes ago" || n.time === "1 hour ago"
);

const oldNotifications = [
  {
    id: 4,
    title: "Password Changed",
    description: "Your password was changed successfully.",
    time: "2 days ago",
    type: "info",
  },
  {
    id: 5,
    title: "Welcome!",
    description: "Welcome to OnSite360.",
    time: "1 week ago",
    type: "success",
  },
];

const allNotifications = [...sampleNotifications, ...oldNotifications];

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"recent" | "all">("recent");

  const notificationsToShow =
    activeTab === "recent" ? recentNotifications : allNotifications;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Notifications</h1>
      <p className="text-gray-500 mb-6">
        View recent alerts and system notifications
      </p>

      {/* Tab navigation */}

      <div className="tabs tabs-border">
        <input
          type="radio"
          name="user_tab_group"
          className="tab"
          aria-label="Recent"
          checked={activeTab === "recent"}
          onChange={() => setActiveTab("recent")}
        />
        {activeTab === "recent" && (
          <div className="tab-content bg-base-200 border border-base-300 p-6 rounded-2xl">
            <div className="space-y-4">
              {notificationsToShow.length > 0 ? (
                notificationsToShow.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex flex-col md:flex-row md:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                  >
                    <div>
                      <div className="font-semibold">{notif.title}</div>
                      <div className="text-gray-500 text-sm">
                        {notif.description}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 md:mt-0">
                      {notif.time}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No notifications at this time.
                </div>
              )}
            </div>
          </div>
        )}
        <input
          type="radio"
          name="user_tab_group"
          className="tab"
          aria-label="All"
          checked={activeTab === "all"}
          onChange={() => setActiveTab("all")}
        />
        {activeTab === "all" && (
          <div className="tab-content bg-base-200 border border-base-300 p-6 rounded-2xl">
            <div className="space-y-4">
              {notificationsToShow.length > 0 ? (
                notificationsToShow.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex flex-col md:flex-row md:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                  >
                    <div>
                      <div className="font-semibold">{notif.title}</div>
                      <div className="text-gray-500 text-sm">
                        {notif.description}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 md:mt-0">
                      {notif.time}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No notifications at this time.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

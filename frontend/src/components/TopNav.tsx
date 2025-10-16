import {
  HiOutlineBell,
  HiOutlineUserCircle,
  HiOutlineLogout,
} from "react-icons/hi";
import { FiSidebar } from "react-icons/fi";
import { useAuthStore } from "../stores/useAuthStore";
import { useSystemStore } from "../stores/useSystemStore";
import { useUserNotifications } from "../hooks/useUsers";

const TopNav = ({
  onLogout,
  onNavigate,
}: {
  onLogout: () => void;
  onNavigate: (path: string) => void;
}) => {
  const user = useAuthStore((state) => state.user);
  const toggleSidebar = useSystemStore((state) => state.toggleSidebar);
  const theme = useSystemStore((state) => state.theme);
  const setTheme = useSystemStore((state) => state.setTheme);

  // Toggle between bumblebee and halloween themes
  const handleThemeToggle = () => {
    setTheme(theme === "bumblebee" ? "halloween" : "bumblebee");
  };

  // Replace static notifications with real unread notifications
  const userId = user?.id || "";
  const { data: notifications = [] } = useUserNotifications(userId);
  const unreadNotifications = (notifications || []).filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;
  const visibleNotifications = unreadNotifications.slice(0, 3);

  const formatTime = (iso?: string) =>
    iso ? new Date(iso).toLocaleString(undefined, { hour12: true }) : "";

  return (
    <div className="navbar flex justify-between items-center gap-2 sm:gap-4 bg-base-100 py-2 px-3 sm:px-5">
      <button className="btn btn-ghost btn-circle" onClick={toggleSidebar}>
        <FiSidebar className="w-6 h-6" />
      </button>
      
      <div className="flex items-center gap-1 sm:gap-3 p-1">
        {/* Theme toggle - hidden on mobile, shown on sm+ */}
        <div className="hidden sm:flex flex-none bg-base-200 rounded-full p-1">
          <label className="swap swap-rotate">
            {/* this hidden checkbox controls the state */}
            <input
              type="checkbox"
              className="theme-controller"
              checked={theme === "halloween"}
              onChange={handleThemeToggle}
            />

            {/* sun icon */}
            <svg
              className="swap-off h-8 w-8 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>

            {/* moon icon */}
            <svg
              className="swap-on h-8 w-8 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>
        </div>
        {/* Notification count */}
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="btn btn-circle relative">
            <HiOutlineBell className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="badge badge-success badge-xs absolute -top-1 -right-1">
              {unreadCount}
            </span>
          </button>

          {/* Notifications drop down */}
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 shadow-lg shadow-neutral/10 bg-base-200 rounded-box w-80 sm:w-90 max-w-[calc(100vw-2rem)]"
          >
            {userId === "" ? (
              <li>
                <div className="p-3 text-sm text-gray-500">Sign in to see notifications</div>
              </li>
            ) : visibleNotifications.length === 0 ? (
              <li>
                <div className="p-3 text-center text-sm text-gray-500">
                  No unread notifications
                </div>
              </li>
            ) : (
              visibleNotifications.map((notif, idx) => (
                <li key={notif.id} className="w-full" onClick={() => onNavigate("/notifications")}>
                  <div className="flex flex-col items-start text-base-content p-3 min-w-0 w-full">
                    <p className="font-bold text-sm sm:text-base truncate w-full">
                      {notif.title}
                    </p>
                    {notif.description && (
                      <p className="text-xs sm:text-sm text-gray-600 truncate w-full">
                        {notif.description}
                      </p>
                    )}
                    <p className="text-secondary-content/70 text-xs mt-1">
                      {formatTime(notif.time || notif.createdAt)}
                    </p>
                  </div>
                  {/* separator */}
                  {idx < visibleNotifications.length - 1 && (
                    <hr className="text-neutral/20 my-2" />
                  )}
                </li>
              ))
            )}

            {/* Link to full notifications screen */}
            <li>
              <div
                className="p-3 text-center text-sm text-primary hover:bg-base-300 cursor-pointer"
                onClick={() => onNavigate("/notifications")}
              >
                View all notifications
              </div>
            </li>
          </ul>
        </div>

        {/* User info - hidden on mobile, shown on md+ */}
        <div className="hidden md:flex flex-col justify-center items-end">
          <h1 className="font-bold text-base-content text-sm">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-secondary-content/70 text-xs">{user?.email}</p>
        </div>

        {/* User Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <div className="flex items-center gap-2">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle avatar bg-base-200 rounded-full p-1"
            >
              <div className="flex items-center justify-center">
                <HiOutlineUserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              </div>
            </label>
          </div>

          {/* User drop down */}
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-4 shadow bg-base-200 rounded-box w-60 sm:w-64 max-w-[calc(100vw-2rem)]"
          >
            <div className="mb-4">
              <h1 className="font-bold text-base-content text-sm">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-secondary-content/70 text-xs">{user?.email}</p>
              <p className="badge badge-soft mt-1 text-xs">{user?.role?.name}</p>
            </div>

            <hr className="text-neutral/20" />

            {/* Theme toggle for mobile */}
            <li className="text-base-content mt-2 sm:hidden">
              <button 
                onClick={handleThemeToggle}
                className="flex gap-2 items-center"
              >
                {theme === "halloween" ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,1,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                  </svg>
                )}
                {theme === "halloween" ? "Light Mode" : "Dark Mode"}
              </button>
            </li>

            <li className="text-base-content mt-2">
              <button onClick={onLogout} className="flex gap-2 items-center">
                <HiOutlineLogout className="w-5 h-5 ml-2" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TopNav;

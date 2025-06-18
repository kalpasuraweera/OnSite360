import StatCard from "../components/StatCard";
import { useProjects, type Project } from "../hooks/useProjects";
import { useAuthStore } from "../stores/useAuthStore";
import { useState } from "react";
import {
  HiOutlineMenu,
  HiOutlineBell,
  HiOutlineChatAlt2,
  HiOutlineUserCircle,
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineChat,
  HiOutlineChartBar,
  HiOutlineLogout,
} from "react-icons/hi";

const dummyUsers = [
  {
    name: "John Smith",
    email: "john@construction.com",
    role: "Project Manager",
    status: "Active",
  },
  {
    name: "Sarah Johnson",
    email: "sarah@construction.com",
    role: "Site Supervisor",
    status: "Active",
  },
];

const Dashboard = () => {
  const { data, isLoading } = useProjects();
  const user = useAuthStore((s) => s.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-base-content border border-base-300 transition-all duration-200 flex flex-col`}
      >
        <div className="flex flex-col gap-2 px-4 py-4">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <HiOutlineMenu className="w-6 h-6 text-base-200" />
          </button>
          {sidebarOpen && (
            <div className="flex flex-col text-base-200 bg-neutral w-full p-2 rounded-2xl">
              <span className="font-bold text-lg">
                {user?.firstName || "User"}
              </span>
              <p className="text-sm">user@gmail.com</p>
            </div>
          )}
        </div>
        <nav className="flex-1">
          <ul className="menu p-2 w-full mt-5">
            <li>
              <a className="flex text-base-200 items-center gap-3 px-4 py-2 hover:bg-neutral w-full">
                <HiOutlineHome className="w-5 h-5 text-base-200" />
                {sidebarOpen && "Dashboard"}
              </a>
            </li>
            <li>
              <a className="flex text-base-200 items-center gap-3 px-4 py-2 hover:bg-neutral w-full">
                <HiOutlineClipboardList className="w-5 h-5 text-base-200" />
                {sidebarOpen && "Projects"}
              </a>
            </li>
            <li>
              <a className="flex text-base-200 items-center gap-3 px-4 py-2 hover:bg-neutral w-full">
                <HiOutlineUsers className="w-5 h-5 text-base-200" />
                {sidebarOpen && "Teams"}
              </a>
            </li>
            <li>
              <a className="flex text-base-200 items-center gap-3 px-4 py-2 hover:bg-neutral w-full">
                <HiOutlineCalendar className="w-5 h-5 text-base-200" />
                {sidebarOpen && "Schedule"}
              </a>
            </li>
            <li>
              <a className="flex text-base-200 items-center gap-3 px-4 py-2 hover:bg-neutral w-full">
                <HiOutlineChat className="w-5 h-5 text-base-200" />
                {sidebarOpen && "Communications"}
              </a>
            </li>
            <li>
              <a className="flex text-base-200 items-center gap-3 px-4 py-2 hover:bg-neutral w-full">
                <HiOutlineChartBar className="w-5 h-5 text-base-200" />
                {sidebarOpen && "Reports"}
              </a>
            </li>
          </ul>
        </nav>
        <div className="px-4 py-4 border-t">
          <div className="flex items-center gap-2">
            <HiOutlineUserCircle className="w-6 h-6" />
            {sidebarOpen && (
              <span className="text-sm">System Administrator</span>
            )}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="navbar flex justify-between items-center gap-4 bg-base-200 border border-base-300 rounded-2xl">
          <img src="/logo.png" alt="" className="w-44 flex justify-center" />
          <div className="flex items-center gap-4 p-1">
            {/* Notification count */}
            <button className="btn btn-ghost btn-circle relative">
              <HiOutlineBell className="w-6 h-6" />
              <span className="badge badge-error badge-xs absolute top-0 right-0">
                3
              </span>
            </button>

            {/* Conversation count */}
            <button className="btn btn-ghost btn-circle relative">
              <HiOutlineChatAlt2 className="w-6 h-6" />
              <span className="badge badge-primary badge-xs absolute top-0 right-0">
                7
              </span>
            </button>
            {/* User Profile Dropdown */}
            <div className="dropdown dropdown-end">
              <div className="flex items-center gap-2">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="flex items-center justify-center">
                    <HiOutlineUserCircle className="w-6 h-6 text-gray-500" />
                  </div>
                </label>
                <span className="badge badge-base-300">{user?.firstName}</span>
              </div>

              <ul
                tabIndex={0}
                className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-200 rounded-box w-52"
              >
                <li>
                  <a>Profile</a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li className="text-error">
                  <button
                    onClick={() => useAuthStore.getState().logout()}
                    className=" flex justify-between"
                  >
                    Logout
                    <HiOutlineLogout className="w-5 h-5 mr-2" />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Page Content */}
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-1">System Administration</h1>
          <p className="text-gray-500 mb-6">
            Manage users, security, and system configurations
          </p>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={
                <HiOutlineUsers className="inline w-7 h-7 text-secondary" />
              }
              value={247}
              label="Total Users"
            />
            <StatCard
              icon={
                <HiOutlineUserCircle className="inline w-7 h-7 text-secondary" />
              }
              value={89}
              label="Active Sessions"
            />
            <StatCard
              icon={
                <HiOutlineChartBar className="inline w-7 h-7 text-secondary" />
              }
              value="98%"
              label="System Health"
            />
            <StatCard
              icon={
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block text-secondary"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M12 9v4m0 4h.01M21 19H3l9-16 9 16Z"
                  />
                </svg>
              }
              value={3}
              label="Alerts"
            />
          </div>
          {/* Tabs */}
          <div className="mb-6">
            <div className="tabs tabs-lift">
              <input
                type="radio"
                name="dashboard_tabs"
                className="tab [--tab-bg:white] [--tab-border-color:white]"
                aria-label="User Management"
                defaultChecked
              />
              <div className="tab-content bg-base-200 border-base-300 p-6">
                {/* User Management Section */}
                <h2 className="text-2xl font-bold mb-2">User Management</h2>
                <p className="text-neutral-500 mb-4">
                  Manage user accounts and access
                </p>
                <div className="flex gap-2 mb-6">
                  <button className="btn btn-primary">Add User</button>
                  <button className="btn btn-accent">Import Users</button>
                  <button className="btn btn-accent">Export Users</button>
                </div>
                <div className="space-y-4">
                  {dummyUsers.map((u) => (
                    <div
                      key={u.email}
                      className="flex flex-col md:flex-row md:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-gray-500 text-sm">{u.email}</div>
                        <span className="badge badge-neutral mt-2">
                          {u.role}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <span className="badge badge-success badge-lg text-xs px-3 py-1">
                          {u.status}
                        </span>
                        <button className="btn btn-soft btn-accent btn-sm">
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline btn-error">
                          Deactivate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <input
                type="radio"
                name="dashboard_tabs"
                className="tab"
                aria-label="Roles & Permissions"
              />
              <div className="tab-content bg-base-200 border-base-300 p-6">
                <h2 className="text-2xl font-bold">Roles & Permissions</h2>
                <p className="text-neutral-500">
                  Manage roles and permissions here.
                </p>
              </div>

              <input
                type="radio"
                name="dashboard_tabs"
                className="tab"
                aria-label="Security"
              />
              <div className="tab-content bg-base-200 border-base-300 p-6">
                <h2 className="text-2xl font-bold">Security</h2>
                <p className="text-neutral-500">
                  Configure security settings here.
                </p>
              </div>

              <input
                type="radio"
                name="dashboard_tabs"
                className="tab"
                aria-label="Integrations"
              />
              <div className="tab-content bg-base-200 border-base-300 p-6">
                <h2 className="text-2xl font-bold">Integrations</h2>
                <p className="text-neutral-500">
                  Manage system integrations here.
                </p>
              </div>

              <input
                type="radio"
                name="dashboard_tabs"
                className="tab"
                aria-label="System Logs"
              />
              <div className="tab-content bg-base-200 border-base-300 p-6">
                <h2 className="text-2xl font-bold">System Logs</h2>
                <p className="text-neutral-500">View system logs here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

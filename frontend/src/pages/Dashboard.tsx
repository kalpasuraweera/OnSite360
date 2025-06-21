import {
  HiOutlineChartBar,
  HiOutlineUserCircle,
  HiOutlineUsers,
} from "react-icons/hi";
import StatCard from "../components/StatCard";

const Dashboard = () => {
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
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">System Administration</h1>
      <p className="text-gray-500 mb-6">
        Manage users, security, and system configurations
      </p>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<HiOutlineUsers className="inline w-7 h-7 text-secondary" />}
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
          icon={<HiOutlineChartBar className="inline w-7 h-7 text-secondary" />}
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
              <button className="btn btn-neutral">Import Users</button>
              <button className="btn btn-neutral">Export Users</button>
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
                    <span className="badge badge-neutral mt-2">{u.role}</span>
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
            <p className="text-neutral-500">Manage system integrations here.</p>
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
  );
};

export default Dashboard;

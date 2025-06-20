import {
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineChartBar,
} from "react-icons/hi";
import StatCard from "../components/StatCard";

const UserManagement = () => {
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
      <h1 className="text-3xl font-bold mb-1">User Management</h1>
      <p className="text-gray-500 mb-6">Manage user accounts and access</p>
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
      {/* User Management Section */}
      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-2">User Management</h2>
        <p className="text-neutral-500 mb-4">Manage user accounts and access</p>
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
                <button className="btn btn-soft btn-accent btn-sm">Edit</button>
                <button className="btn btn-sm btn-outline btn-error">
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

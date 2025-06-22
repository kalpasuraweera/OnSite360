import { useState } from "react";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("users");
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

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="user_tab_group"
          className="tab"
          aria-label="Users"
          checked={activeTab === "users"}
          onChange={() => setActiveTab("users")}
        />
        {activeTab === "users" && (
          <div className="tab-content p-5">
            {/* Users List Section */}
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold">Users</h2>
              <p className="text-neutral-500 mb-4">
                Manage user accounts and access
              </p>

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
          </div>
        )}
        <input
          type="radio"
          name="user_tab_group"
          className="tab"
          aria-label="Add User"
          checked={activeTab === "add_user"}
          onChange={() => setActiveTab("add_user")}
        />
        {activeTab === "add_user" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl w-full">
              <h2 className="text-2xl font-bold mb-1">Add New User</h2>
              <p className="text-neutral-500 mb-6">
                Create a new user account and assign permissions.
              </p>
              <form className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">First Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Last Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Phone Number
                      </span>
                    </label>
                    <input type="tel" className="input input-bordered w-full" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Role</span>
                    </label>
                    <select className="select select-bordered w-full">
                      <option>System Administrator</option>
                      <option>Project Manager</option>
                      <option>Site Supervisor</option>
                      <option>Engineer</option>
                      <option>Subcontractor</option>
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Department</span>
                    </label>
                    <select className="select select-bordered w-full">
                      <option>Engineering</option>
                      <option>Operations</option>
                      <option>Finance</option>
                      <option>HR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Notes (Optional)
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    placeholder="Additional notes about the user…"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <input
          type="radio"
          name="user_tab_group"
          className="tab"
          aria-label="Import Users"
          checked={activeTab === "import_users"}
          onChange={() => setActiveTab("import_users")}
        />
        {activeTab === "import_users" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2">Import Users</h2>
              <p className="text-neutral-500 mb-4">
                Upload a CSV file to import multiple users at once.
              </p>
              <div className="border-dashed border-2 border-base-300 rounded-lg p-6 flex flex-col items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="text-blue-500 cursor-pointer">
                  Choose a CSV file
                </p>
                <p className="text-gray-500 text-sm">or drag and drop</p>
              </div>
              <div className="bg-base-100 border border-base-300 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold mb-2">
                  CSV Format Requirements:
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-500">
                  <li>First Name, Last Name, Email, Phone, Role, Department</li>
                  <li>Email addresses must be unique</li>
                  <li>Role must match existing system roles</li>
                  <li>Maximum 1000 users per import</li>
                </ul>
              </div>
              <div className="flex justify-end gap-2">
                <button className="btn btn-outline">Cancel</button>
                <button className="btn btn-primary">Import Users</button>
              </div>
            </div>
          </div>
        )}
        <input
          type="radio"
          name="user_tab_group"
          className="tab"
          aria-label="Export Users"
          checked={activeTab === "export_users"}
          onChange={() => setActiveTab("export_users")}
        />
        {activeTab === "export_users" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2">Export Users</h2>
              <p className="text-neutral-500 mb-4">
                Download a CSV or Excel file of all users.
              </p>
              <button className="btn btn-primary">Export</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

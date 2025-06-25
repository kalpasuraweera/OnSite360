import { useState } from "react";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  type User,
  type UpdateUserDto,
} from "../hooks/useUsers";
import { useRoles } from "../hooks/useRoles";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setActiveTab("edit_user");
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser.mutate(id, {
        onSuccess: () => {
          console.log(`User with ID ${id} deleted successfully.`);
        },
        onError: (error) => {
          console.error("Failed to delete user:", error);
        },
      });
    }
  };

  const handleCreateUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newUser = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      roleId: formData.get("roleId") as string,
    };

    createUser.mutate(newUser, {
      onSuccess: () => {
        console.log("User created successfully!");
        setActiveTab("users");
        (event.target as HTMLFormElement).reset();
      },
      onError: (error) => {
        console.error("Failed to create user:", error);
      },
    });
  };

  const handleUpdateUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(event.currentTarget);
    const updatedUser: UpdateUserDto = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      roleId: formData.get("roleId") as string,
    };

    // Only include password if it's provided
    const password = formData.get("password") as string;
    if (password) {
      updatedUser.password = password;
    }

    updateUser.mutate(
      { id: editingUser.id, user: updatedUser },
      {
        onSuccess: () => {
          console.log("User updated successfully!");
          setActiveTab("users");
          setEditingUser(null);
        },
        onError: (error) => {
          console.error("Failed to update user:", error);
        },
      }
    );
  };

  const getRoleName = (roleId: string) => {
    const role = roles?.find((r) => r.id === roleId);
    return role?.name || "Unknown Role";
  };
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
                {usersLoading ? (
                  <div className="flex justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : users && users.length > 0 ? (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col md:flex-row md:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      <div>
                        <div className="font-semibold">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-gray-500 text-sm">{user.email}</div>
                        <span className="badge badge-neutral mt-2">
                          {getRoleName(user.roleId)}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <span className="badge badge-success badge-lg text-xs px-3 py-1">
                          Active
                        </span>
                        <button 
                          className="btn btn-soft btn-accent btn-sm"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline btn-error"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deleteUser.isPending}
                        >
                          {deleteUser.isPending ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No users found. Create your first user to get started.
                  </div>
                )}
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
              <form 
                className="flex flex-col gap-4"
                onSubmit={handleCreateUser}
              >
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">First Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      name="firstName"
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Last Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      name="lastName"
                      required
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
                      name="email"
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Password
                      </span>
                    </label>
                    <input 
                      type="password" 
                      className="input input-bordered w-full" 
                      name="password"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Role</span>
                    </label>
                    <select 
                      className="select select-bordered w-full"
                      name="roleId"
                      required
                    >
                      <option value="">Select a role</option>
                      {roles?.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
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
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setActiveTab("users")}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={createUser.isPending}
                  >
                    {createUser.isPending ? "Creating..." : "Create User"}
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
          aria-label="Edit User"
          checked={activeTab === "edit_user"}
          onChange={() => setActiveTab("edit_user")}
        />
        {activeTab === "edit_user" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl w-full">
              <h2 className="text-2xl font-bold mb-1">Edit User</h2>
              <p className="text-neutral-500 mb-6">
                Modify user account information and permissions.
              </p>
              {editingUser ? (
                <form 
                  className="flex flex-col gap-4"
                  onSubmit={handleUpdateUser}
                >
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="label">
                        <span className="label-text font-medium">First Name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        name="firstName"
                        defaultValue={editingUser.firstName}
                        required
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="label">
                        <span className="label-text font-medium">Last Name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        name="lastName"
                        defaultValue={editingUser.lastName}
                        required
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
                        name="email"
                        defaultValue={editingUser.email}
                        required
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="label">
                        <span className="label-text font-medium">
                          New Password (Optional)
                        </span>
                      </label>
                      <input 
                        type="password" 
                        className="input input-bordered w-full" 
                        name="password"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="label">
                        <span className="label-text font-medium">Role</span>
                      </label>
                      <select 
                        className="select select-bordered w-full"
                        name="roleId"
                        defaultValue={editingUser.roleId}
                        required
                      >
                        <option value="">Select a role</option>
                        {roles?.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
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

                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => {
                        setActiveTab("users");
                        setEditingUser(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={updateUser.isPending}
                    >
                      {updateUser.isPending ? "Updating..." : "Update User"}
                    </button>
                  </div>
                </form>
              ) : (
                <p>No user selected for editing.</p>
              )}
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

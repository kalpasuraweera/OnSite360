import { useState } from "react";
import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  type Permission,
  type CreatePermissionDto,
} from "../hooks/usePermissions";
import React from "react";

// Demo: Add dummy audit log feature
const dummyAuditLogs = [
  {
    id: 1,
    action: "Created permission for Dashboard",
    user: "John Smith",
    date: "2025-07-21 10:15",
  },
  {
    id: 2,
    action: "Deleted permission for User Management",
    user: "Sarah Connor",
    date: "2025-07-20 14:22",
  },
  {
    id: 3,
    action: "Updated permission for Projects",
    user: "Mike Wilson",
    date: "2025-07-19 09:05",
  },
];

// Demo: Add dummy users and roles for more UI content
const dummyUsers = [
  { id: "U001", name: "John Smith", role: "Admin", email: "john@site360.com" },
  { id: "U002", name: "Sarah Connor", role: "Manager", email: "sarah@site360.com" },
  { id: "U003", name: "Mike Wilson", role: "Supervisor", email: "mike@site360.com" },
];

const dummyRoles = [
  { id: "R001", name: "Admin", permissions: ["All"] },
  { id: "R002", name: "Manager", permissions: ["Dashboard", "Projects"] },
  { id: "R003", name: "Supervisor", permissions: ["Dashboard"] },
];

const dummyComponents = [
  "Dashboard",
  "Projects",
  "Tasks",
  "Reports",
  "Settings",
  "Crew Management",
  "Safety",
  "QA",
  "Issues",
];

const PermissionManagement = () => {
  const [activeTab, setActiveTab] = useState("permissions");
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [formData, setFormData] = useState<{
    pageId: string;
    pageName: string;
    components: string[];
  }>({
    pageId: "",
    pageName: "",
    components: [],
  });
  const [newComponent, setNewComponent] = useState("");
  const [editComponent, setEditComponent] = useState("");

  const { data: permissions, isLoading: permissionsLoading } = usePermissions();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      pageId: permission.pageId,
      pageName: permission.pageName,
      components: permission.components,
    });
    setActiveTab("edit_permission");
  };

  const handleDeletePermission = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this permission? This action cannot be undone."
      )
    ) {
      deletePermission.mutate(id, {
        onSuccess: () => {
          console.log(`Permission with ID ${id} deleted successfully.`);
        },
        onError: (error) => {
          console.error("Failed to delete permission:", error);
          alert("Failed to delete permission. Please try again.");
        },
      });
    }
  };

  const handleCreatePermission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate required fields
    if (!formData.pageId.trim() || !formData.pageName.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const newPermission: CreatePermissionDto = {
      pageId: formData.pageId.trim(),
      pageName: formData.pageName.trim(),
      components: formData.components,
    };

    createPermission.mutate(newPermission, {
      onSuccess: () => {
        console.log("Permission created successfully!");
        setActiveTab("permissions");
        setFormData({ pageId: "", pageName: "", components: [] });
        setNewComponent("");
      },
      onError: (error) => {
        console.error("Failed to create permission:", error);
        alert("Failed to create permission. Please try again.");
      },
    });
  };

  const handleUpdatePermission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPermission) return;

    // Validate required fields
    if (!formData.pageId.trim() || !formData.pageName.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const updatedPermission = {
      pageId: formData.pageId.trim(),
      pageName: formData.pageName.trim(),
      components: formData.components,
    };

    updatePermission.mutate(
      { id: editingPermission.id, permission: updatedPermission },
      {
        onSuccess: () => {
          console.log("Permission updated successfully!");
          setActiveTab("permissions");
          setEditingPermission(null);
          setFormData({ pageId: "", pageName: "", components: [] });
          setEditComponent("");
        },
        onError: (error) => {
          console.error("Failed to update permission:", error);
          alert("Failed to update permission. Please try again.");
        },
      }
    );
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setActiveTab("permissions");
    setEditingPermission(null);
    setFormData({ pageId: "", pageName: "", components: [] });
    setNewComponent("");
    setEditComponent("");
  };

  // Add a helper to reset form when switching tabs
  const switchToTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === "add_permission") {
      setFormData({
        pageId: "",
        pageName: "",
        components: [],
      });
      setNewComponent("");
    }
  };

  const addComponent = (componentInput: string, isEditing: boolean = false) => {
    const trimmedComponent = componentInput.trim();
    if (!trimmedComponent) return;

    // Check for duplicates
    if (formData.components.includes(trimmedComponent)) {
      alert("This component already exists.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      components: [...prev.components, trimmedComponent],
    }));

    // Clear the input
    if (isEditing) {
      setEditComponent("");
    } else {
      setNewComponent("");
    }
  };

  const removeComponent = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }));
  };

  const handleComponentKeyPress = (e: React.KeyboardEvent, isEditing: boolean = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addComponent(isEditing ? editComponent : newComponent, isEditing);
    }
  };

  // Add more demo states
  const [showUserList, setShowUserList] = useState(false);
  const [showRoleList, setShowRoleList] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Permission Management</h1>
      <p className="text-gray-500 mb-6">
        Manage page permissions and access controls
      </p>

      {/* Extra Demo Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          className="btn btn-outline"
          onClick={() => setShowUserList((v) => !v)}
        >
          {showUserList ? "Hide Users" : "Show Users"}
        </button>
        <button
          className="btn btn-outline"
          onClick={() => setShowRoleList((v) => !v)}
        >
          {showRoleList ? "Hide Roles" : "Show Roles"}
        </button>
      </div>

      {/* Dummy User List */}
      {showUserList && (
        <div className="mb-6 bg-base-100 rounded-xl p-6 border border-base-300 shadow">
          <h3 className="text-lg font-bold mb-2">Users</h3>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dummyUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      className="btn btn-xs btn-primary"
                      onClick={() => setSelectedUser(user.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedUser && (
            <div className="mt-4 p-4 bg-white rounded shadow border border-base-300">
              <h4 className="font-bold mb-2">User Details</h4>
              {(() => {
                const user = dummyUsers.find((u) => u.id === selectedUser);
                if (!user) return null;
                return (
                  <>
                    <div><strong>ID:</strong> {user.id}</div>
                    <div><strong>Name:</strong> {user.name}</div>
                    <div><strong>Role:</strong> {user.role}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                  </>
                );
              })()}
              <button
                className="btn btn-outline btn-xs mt-2"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dummy Role List */}
      {showRoleList && (
        <div className="mb-6 bg-base-100 rounded-xl p-6 border border-base-300 shadow">
          <h3 className="text-lg font-bold mb-2">Roles</h3>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Role</th>
                <th>Permissions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dummyRoles.map((role) => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td>{role.permissions.join(", ")}</td>
                  <td>
                    <button
                      className="btn btn-xs btn-primary"
                      onClick={() => setSelectedRole(role.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedRole && (
            <div className="mt-4 p-4 bg-white rounded shadow border border-base-300">
              <h4 className="font-bold mb-2">Role Details</h4>
              {(() => {
                const role = dummyRoles.find((r) => r.id === selectedRole);
                if (!role) return null;
                return (
                  <>
                    <div><strong>ID:</strong> {role.id}</div>
                    <div><strong>Name:</strong> {role.name}</div>
                    <div><strong>Permissions:</strong> {role.permissions.join(", ")}</div>
                  </>
                );
              })()}
              <button
                className="btn btn-outline btn-xs mt-2"
                onClick={() => setSelectedRole(null)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dummy Components List */}
      <div className="mb-6 bg-base-100 rounded-xl p-6 border border-base-300 shadow">
        <h3 className="text-lg font-bold mb-2">System Components</h3>
        <div className="flex flex-wrap gap-2">
          {dummyComponents.map((comp, idx) => (
            <span key={idx} className="badge badge-outline badge-lg">
              {comp}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="permission_tab_group"
          className="tab"
          aria-label="Permissions"
          checked={activeTab === "permissions"}
          onChange={() => switchToTab("permissions")}
        />
        {activeTab === "permissions" && (
          <div className="tab-content p-5">
            {/* Permissions List Section */}
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold">Permissions</h2>
              <p className="text-neutral-500 mb-4">
                Manage page permissions and component access
              </p>

              <div className="space-y-4">
                {permissionsLoading ? (
                  <div className="flex justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : permissions && permissions.length > 0 ? (
                  permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="bg-base-100 border border-base-300 p-4 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-primary">
                            {permission.pageName}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            Page ID:{" "}
                            <span className="font-mono">{permission.pageId}</span>
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleEditPermission(permission)}
                            disabled={updatePermission.isPending}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => handleDeletePermission(permission.id)}
                            disabled={deletePermission.isPending}
                          >
                            {deletePermission.isPending ? (
                              <>
                                <span className="loading loading-spinner loading-xs"></span>
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Components:
                        </p>
                        {permission.components && permission.components.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {permission.components.map((component, index) => (
                              <span
                                key={index}
                                className="badge badge-outline badge-sm"
                              >
                                {component}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No components assigned
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No permissions found. Create your first permission to get
                    started.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <input
          type="radio"
          name="permission_tab_group"
          className="tab"
          aria-label="Add Permission"
          checked={activeTab === "add_permission"}
          onChange={() => switchToTab("add_permission")}
        />
        {activeTab === "add_permission" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl w-full">
              <h2 className="text-2xl font-bold mb-1">Add New Permission</h2>
              <p className="text-neutral-500 mb-6">
                Create a new permission for page access and components.
              </p>
              <form
                className="flex flex-col gap-4"
                onSubmit={handleCreatePermission}
              >
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Page ID</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="e.g., dashboard, projects"
                      value={formData.pageId}
                      onChange={(e) =>
                        handleFormChange("pageId", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Page Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="e.g., Dashboard, Projects"
                      value={formData.pageName}
                      onChange={(e) =>
                        handleFormChange("pageName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Components</span>
                    <span className="label-text-alt">
                      Add components that will be accessible
                    </span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="input input-bordered flex-1"
                      placeholder="Add a component (e.g., projects, tasks)"
                      value={newComponent}
                      onChange={(e) => setNewComponent(e.target.value)}
                      onKeyPress={(e) => handleComponentKeyPress(e, false)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => addComponent(newComponent, false)}
                      disabled={!newComponent.trim()}
                    >
                      Add
                    </button>
                  </div>

                  <div className="bg-base-100 p-2 rounded-lg border border-base-300 min-h-16">
                    {formData.components.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.components.map((component, index) => (
                          <div key={index} className="badge badge-lg gap-1 p-3">
                            {component}
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => removeComponent(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-center py-3">
                        No components added yet
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Components represent features or sections users can access
                    within this page
                  </p>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      createPermission.isPending ||
                      !formData.pageId.trim() ||
                      !formData.pageName.trim()
                    }
                  >
                    {createPermission.isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Creating...
                      </>
                    ) : (
                      "Create Permission"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <input
          type="radio"
          name="permission_tab_group"
          className="tab"
          aria-label="Edit Permission"
          checked={activeTab === "edit_permission"}
          onChange={() => setActiveTab("edit_permission")}
        />
        {activeTab === "edit_permission" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl w-full">
              <h2 className="text-2xl font-bold mb-1">Edit Permission</h2>
              <p className="text-neutral-500 mb-6">
                Modify existing permission settings.
              </p>
              {editingPermission ? (
                <form
                  className="flex flex-col gap-4"
                  onSubmit={handleUpdatePermission}
                >
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="label">
                        <span className="label-text font-medium">Page ID</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.pageId}
                        onChange={(e) =>
                          handleFormChange("pageId", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="label">
                        <span className="label-text font-medium">
                          Page Name
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.pageName}
                        onChange={(e) =>
                          handleFormChange("pageName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Components</span>
                      <span className="label-text-alt">
                        Add components that will be accessible
                      </span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1"
                        placeholder="Add a component (e.g., projects, tasks)"
                        value={editComponent}
                        onChange={(e) => setEditComponent(e.target.value)}
                        onKeyPress={(e) => handleComponentKeyPress(e, true)}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => addComponent(editComponent, true)}
                        disabled={!editComponent.trim()}
                      >
                        Add
                      </button>
                    </div>

                    <div className="bg-base-100 p-2 rounded-lg border border-base-300 min-h-16">
                      {formData.components.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.components.map((component, index) => (
                            <div
                              key={index}
                              className="badge badge-lg gap-1 p-3"
                            >
                              {component}
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs btn-circle"
                                onClick={() => removeComponent(index)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center py-3">
                          No components added yet
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Components represent features or sections users can access
                      within this page
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        updatePermission.isPending ||
                        !formData.pageId.trim() ||
                        !formData.pageName.trim()
                      }
                    >
                      {updatePermission.isPending ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Updating...
                        </>
                      ) : (
                        "Update Permission"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <p>No permission selected for editing.</p>
              )}
            </div>
          </div>
        )}
        <input
          type="radio"
          name="permission_tab_group"
          className="tab"
          aria-label="Audit Log"
          checked={activeTab === "audit_log"}
          onChange={() => setActiveTab("audit_log")}
        />
        {activeTab === "audit_log" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl w-full">
              <h2 className="text-2xl font-bold mb-1">Audit Log</h2>
              <p className="text-neutral-500 mb-6">
                Track changes and actions performed on permissions.
              </p>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Date</th>
                      <th className="text-left">Action</th>
                      <th className="text-left">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dummyAuditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.date}</td>
                        <td>{log.action}</td>
                        <td>{log.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Demo: Add a quick summary card */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-base-100 rounded-xl p-6 border border-base-300 shadow">
          <h3 className="text-lg font-bold mb-2">Quick Stats</h3>
          <ul className="list-disc pl-5 text-gray-700">
            <li>
              <span className="font-semibold">{dummyAuditLogs.length}</span> recent audit log entries
            </li>
            <li>
              <span className="font-semibold">{usePermissions().data?.length ?? 0}</span> permissions in system
            </li>
            <li>
              <span className="font-semibold">3</span> users with admin access
            </li>
          </ul>
        </div>
        <div className="bg-base-100 rounded-xl p-6 border border-base-300 shadow">
          <h3 className="text-lg font-bold mb-2">Tips</h3>
          <ul className="list-disc pl-5 text-gray-700">
            <li>Use the Audit Log tab to monitor changes.</li>
            <li>Assign components to restrict access by feature.</li>
            <li>Review permissions regularly for security.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagement;

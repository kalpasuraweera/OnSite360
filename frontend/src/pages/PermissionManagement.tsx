import { useState } from "react";

const PermissionManagement = () => {
  const [activeTab, setActiveTab] = useState("permissions");
  const [editingPermission, setEditingPermission] = useState(null);

  const dummyPermissions = [
    {
      id: "1",
      pageId: "dashboard",
      pageName: "Dashboard",
      components: JSON.stringify({
        view: true,
        edit: true,
        delete: false
      })
    },
    {
      id: "2",
      pageId: "projects",
      pageName: "Projects",
      components: JSON.stringify({
        view: true,
        edit: false,
        delete: false
      })
    },
  ];

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
    setActiveTab("edit_permission");
  };

  const handleDeletePermission = (id) => {
    // In a real application, you would call an API to delete the permission
    console.log(`Delete permission with ID: ${id}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Permission Management</h1>
      <p className="text-gray-500 mb-6">Manage page permissions and access controls</p>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="permission_tab_group"
          className="tab"
          aria-label="Permissions"
          checked={activeTab === "permissions"}
          onChange={() => setActiveTab("permissions")}
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
                {dummyPermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-lg font-semibold">{permission.pageName}</h3>
                      <p className="text-sm text-gray-500">Page ID: {permission.pageId}</p>
                      <pre className="text-xs font-mono mt-2">
                        {JSON.stringify(JSON.parse(permission.components), null, 2)}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleEditPermission(permission)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleDeletePermission(permission.id)}
                      >
                        Delete
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
          name="permission_tab_group"
          className="tab"
          aria-label="Add Permission"
          checked={activeTab === "add_permission"}
          onChange={() => setActiveTab("add_permission")}
        />
        {activeTab === "add_permission" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl w-full">
              <h2 className="text-2xl font-bold mb-1">Add New Permission</h2>
              <p className="text-neutral-500 mb-6">
                Create a new permission for page access and components.
              </p>
              <form className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Page ID</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="e.g., dashboard, projects"
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
                    />
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Components (JSON)</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full font-mono"
                    rows={6}
                    placeholder='{"view": true, "edit": false, "delete": false}'
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter component permissions as a valid JSON object
                  </p>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Permission
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
                <form className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="label">
                        <span className="label-text font-medium">Page ID</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        defaultValue={editingPermission.pageId}
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="label">
                        <span className="label-text font-medium">Page Name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        defaultValue={editingPermission.pageName}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Components (JSON)</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered w-full font-mono"
                      rows={6}
                      defaultValue={editingPermission.components}
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => setActiveTab("permissions")}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Update Permission
                    </button>
                  </div>
                </form>
              ) : (
                <p>No permission selected for editing.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionManagement;

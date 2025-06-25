import { useState } from "react";
import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  type Permission,
  type CreatePermissionDto,
} from "../hooks/usePermissions";

const PermissionManagement = () => {
  const [activeTab, setActiveTab] = useState("permissions");
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [formData, setFormData] = useState({
    pageId: "",
    pageName: "",
    components: "",
  });

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
    if (window.confirm("Are you sure you want to delete this permission? This action cannot be undone.")) {
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
    
    // Validate JSON format
    if (!isValidJSON(formData.components)) {
      alert("Please enter valid JSON format for components");
      return;
    }

    const newPermission: CreatePermissionDto = {
      pageId: formData.pageId,
      pageName: formData.pageName,
      components: formData.components,
    };

    createPermission.mutate(newPermission, {
      onSuccess: () => {
        console.log("Permission created successfully!");
        setActiveTab("permissions");
        setFormData({ pageId: "", pageName: "", components: "" });
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

    // Validate JSON format
    if (!isValidJSON(formData.components)) {
      alert("Please enter valid JSON format for components");
      return;
    }

    const updatedPermission = {
      pageId: formData.pageId,
      pageName: formData.pageName,
      components: formData.components,
    };

    updatePermission.mutate(
      { id: editingPermission.id, permission: updatedPermission },
      {
        onSuccess: () => {
          console.log("Permission updated successfully!");
          setActiveTab("permissions");
          setEditingPermission(null);
          setFormData({ pageId: "", pageName: "", components: "" });
        },
        onError: (error) => {
          console.error("Failed to update permission:", error);
          alert("Failed to update permission. Please try again.");
        },
      }
    );
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    setActiveTab("permissions");
    setEditingPermission(null);
    setFormData({ pageId: "", pageName: "", components: "" });
  };

  // Helper function to validate JSON
  const isValidJSON = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  // Helper function to safely parse and display JSON
  const displayComponents = (components: string) => {
    try {
      return JSON.stringify(JSON.parse(components), null, 2);
    } catch {
      return components || "Invalid JSON";
    }
  };

  // Helper to format JSON
  const formatJSON = () => {
    if (isValidJSON(formData.components)) {
      try {
        const formatted = JSON.stringify(JSON.parse(formData.components), null, 2);
        handleFormChange("components", formatted);
      } catch {
        // If parsing fails, do nothing
      }
    }
  };

  // Add a helper to reset form when switching tabs
  const switchToTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === "add_permission") {
      setFormData({ pageId: "", pageName: "", components: '["projects", "tasks", "reports"]' });
    }
  };

  console.log("Permissions:", permissions);
  console.log("Form data:", formData);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Permission Management</h1>
      <p className="text-gray-500 mb-6">
        Manage page permissions and access controls
      </p>

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
                      className="bg-base-100 border border-base-300 p-4 rounded-lg shadow-sm flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-primary">
                          {permission.pageName}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          Page ID: <span className="font-mono">{permission.pageId}</span>
                        </p>
                        <div className="bg-gray-50 border border-gray-200 rounded p-2">
                          <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">
                            {displayComponents(permission.components)}
                          </pre>
                        </div>
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
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No permissions found. Create your first permission to get started.
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
                      onChange={(e) => handleFormChange("pageId", e.target.value)}
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
                      onChange={(e) => handleFormChange("pageName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Components (JSON)
                      </span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={formatJSON}
                      disabled={!formData.components || !isValidJSON(formData.components)}
                    >
                      Format JSON
                    </button>
                  </div>
                  <textarea
                    className={`textarea textarea-bordered w-full font-mono ${
                      formData.components && !isValidJSON(formData.components) 
                        ? "textarea-error" 
                        : ""
                    }`}
                    rows={6}
                    placeholder='{"view": true, "edit": false, "delete": false}'
                    value={formData.components}
                    onChange={(e) => handleFormChange("components", e.target.value)}
                    required
                  ></textarea>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Enter component permissions as a valid JSON object
                    </p>
                    {formData.components && !isValidJSON(formData.components) && (
                      <p className="text-xs text-error">Invalid JSON format</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        createPermission.isPending || 
                        !formData.pageId.trim() || 
                        !formData.pageName.trim() || 
                        !formData.components.trim() ||
                        !isValidJSON(formData.components)
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
                        onChange={(e) => handleFormChange("pageId", e.target.value)}
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
                        onChange={(e) => handleFormChange("pageName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="label">
                        <span className="label-text font-medium">
                          Components (JSON)
                        </span>
                      </label>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={formatJSON}
                        disabled={!formData.components || !isValidJSON(formData.components)}
                      >
                        Format JSON
                      </button>
                    </div>
                    <textarea
                      className={`textarea textarea-bordered w-full font-mono ${
                        formData.components && !isValidJSON(formData.components) 
                          ? "textarea-error" 
                          : ""
                      }`}
                      rows={6}
                      value={formData.components}
                      onChange={(e) => handleFormChange("components", e.target.value)}
                      required
                    ></textarea>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        Enter component permissions as a valid JSON object
                      </p>
                      {formData.components && !isValidJSON(formData.components) && (
                        <p className="text-xs text-error">Invalid JSON format</p>
                      )}
                    </div>
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
                        !formData.pageName.trim() || 
                        !formData.components.trim() ||
                        !isValidJSON(formData.components)
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
      </div>
    </div>
  );
};

export default PermissionManagement;

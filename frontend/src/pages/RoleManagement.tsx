import { useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  type Role,
  type CreateRoleDto,
} from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";

const RolesAndPermissions = () => {
  const [activeTab, setActiveTab] = useState("current_user_roles");
  const [currentStep, setCurrentStep] = useState(1);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<
    { permissionId: string; level: number; availableComponents?: string }[]
  >([]);
  const [roleName, setRoleName] = useState("");

  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: permissions } = usePermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    // Convert rolePermissions to selectedPermissions format
    const permissions = role.rolePermissions.map((rp) => ({
      permissionId: rp.permissionId,
      level: rp.level,
      availableComponents: rp.availableComponents || "",
    }));
    setSelectedPermissions(permissions);
    setActiveTab("edit_role");
  };

  const handleDeleteRole = (id: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      deleteRole.mutate(id, {
        onSuccess: () => {
          console.log(`Role with ID ${id} deleted successfully.`);
        },
        onError: (error) => {
          console.error("Failed to delete role:", error);
        },
      });
    }
  };

  const handleCreateRole = () => {
    if (!roleName.trim()) {
      alert("Please enter a role name");
      return;
    }

    const newRole: CreateRoleDto = {
      name: roleName,
      permissions: selectedPermissions,
    };

    createRole.mutate(newRole, {
      onSuccess: () => {
        console.log("Role created successfully!");
        setActiveTab("current_user_roles");
        setRoleName("");
        setSelectedPermissions([]);
        setCurrentStep(1);
      },
      onError: (error) => {
        console.error("Failed to create role:", error);
      },
    });
  };

  const handleUpdateRole = () => {
    if (!editingRole || !roleName.trim()) {
      alert("Please enter a role name");
      return;
    }

    updateRole.mutate(
      {
        id: editingRole.id,
        role: {
          name: roleName,
          permissions: selectedPermissions,
        },
      },
      {
        onSuccess: () => {
          console.log("Role updated successfully!");
          setActiveTab("current_user_roles");
          setEditingRole(null);
          setRoleName("");
          setSelectedPermissions([]);
        },
        onError: (error) => {
          console.error("Failed to update role:", error);
        },
      }
    );
  };

  const handlePermissionToggle = (permissionId: string, level: number) => {
    console.log("Toggling permission:", permissionId, "level:", level);
    
    // Find the permission to check if it's a dashboard permission
    const permission = permissions?.find(p => p.id === permissionId);
    const isDashboard = permission?.pageId === "dashboard";
    
    setSelectedPermissions((prev) => {
      const existing = prev.find((p) => p.permissionId === permissionId);
      if (existing) {
        if (existing.level === level) {
          // Remove permission if same level clicked
          const updated = prev.filter((p) => p.permissionId !== permissionId);
          console.log("Removing permission, new array:", updated);
          return updated;
        } else {
          // Update level
          const updated = prev.map((p) =>
            p.permissionId === permissionId ? { ...p, level } : p
          );
          console.log("Updating permission level, new array:", updated);
          return updated;
        }
      } else {
        // Add new permission with appropriate default components
        const defaultComponents = isDashboard 
          ? '["users", "projects", "communications", "reports"]' 
          : "[]";
        
        const updated = [
          ...prev,
          { permissionId, level, availableComponents: defaultComponents },
        ];
        console.log("Adding new permission, new array:", updated);
        return updated;
      }
    });
  };

  const handleComponentsChange = (permissionId: string, components: string) => {
    console.log("Updating components for permission:", permissionId, "components:", components);
    
    // Validate JSON format
    let isValidJson = true;
    try {
      JSON.parse(components);
    } catch {
      isValidJson = false;
    }
    
    setSelectedPermissions((prev) => {
      const updated = prev.map((p) =>
        p.permissionId === permissionId ? { ...p, availableComponents: components } : p
      );
      console.log("Updated components, new array:", updated);
      return updated;
    });
    
    // Show validation message (you can enhance this with a toast or state)
    if (!isValidJson && components.trim() !== "") {
      console.warn("Invalid JSON format for components:", components);
    }
  };
  console.log("Roles:", roles);
  console.log("Permissions:", permissions);
  console.log("Selected permissions:", selectedPermissions);

  return (
    <div className="p-8">
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-1">User Roles Management</h1>
      <p className="text-gray-500 mb-6">
        Configure user roles and module permissions
      </p>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="roles_tab_group"
          className="tab"
          aria-label="Current User Roles"
          checked={activeTab === "current_user_roles"}
          onChange={() => setActiveTab("current_user_roles")}
        />
        {activeTab === "current_user_roles" && (
          <div className="tab-content p-5">
            {/* Tab content 1 */}
            {/* Roles & Permissions Section */}
            <div className="">
              {rolesLoading ? (
                <div className="flex justify-center">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roles && roles.length > 0 ? (
                    roles.map((role) => (
                      <div
                        key={role.id}
                        className="bg-base-200 border border-base-300 rounded-2xl p-2  flex flex-col gap-3 relative"
                      >
                        <div className="flex flex-col gap-1 bg-base-100 rounded-2xl p-3">
                          <div className="absolute top-4 right-4 bg-warning text-warning-content text-xs rounded-full px-3 py-1 font-semibold">
                            {role.rolePermissions.length} permissions
                          </div>
                          <div className="text-lg font-semibold">
                            {role.name}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {role.rolePermissions.length > 0 ? (
                              role.rolePermissions.map((rolePermission) => (
                                <span
                                  key={rolePermission.id}
                                  className="badge badge-neutral text-sm"
                                  title={`Permission: ${
                                    rolePermission.permission?.pageName ||
                                    "Unknown"
                                  }`}
                                >
                                  {rolePermission.permission?.pageName ||
                                    rolePermission.permissionId.slice(0, 8)}
                                  <span className="ml-1 text-xs">
                                    (L{rolePermission.level})
                                  </span>
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500 italic">
                                No permissions assigned
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <div className="btn-group">
                            <button
                              className="btn bg-black btn-sm w-max text-white"
                              onClick={() => handleEditRole(role)}
                            >
                              <MdEdit />
                            </button>
                            <button
                              className="btn bg-black btn-sm w-max text-white"
                              onClick={() => handleDeleteRole(role.id)}
                              disabled={deleteRole.isPending}
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-gray-500 py-8">
                      No roles found. Create your first role to get started.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create user role */}
        <input
          type="radio"
          name="roles_tab_group"
          className="tab"
          aria-label="Create User Role"
          checked={activeTab === "create_user_role"}
          onChange={() => setActiveTab("create_user_role")}
        />
        {activeTab === "create_user_role" && (
          <div className="tab-content flex gap-2 p-5 w-full">
            <div className="flex gap-2">
              {/* Steps */}
              <div className="flex flex-col w-1/3 gap-2 bg-base-200 rounded-2xl border border-base-300 p-2">
                {/* Step 01 */}
                <div
                  className={`w-full rounded-2xl p-5 cursor-pointer ${
                    currentStep === 1
                      ? "bg-primary text-primary-content"
                      : "bg-base-100"
                  }`}
                  onClick={() => setCurrentStep(1)}
                >
                  <p className="text-xs">Step 01</p>
                  <h1 className="font-semibold">Specify Role Details</h1>
                </div>
                {/* Step 02 */}
                <div
                  className={`w-full rounded-2xl p-5 cursor-pointer ${
                    currentStep === 2
                      ? "bg-primary text-primary-content"
                      : "bg-base-100"
                  }`}
                  onClick={() => setCurrentStep(2)}
                >
                  <p className="text-xs">Step 02</p>
                  <h1 className="font-semibold">Set Permissions</h1>
                </div>
                {/* Step 03 */}
                <div
                  className={`w-full rounded-2xl p-5 cursor-pointer ${
                    currentStep === 3
                      ? "bg-primary text-primary-content"
                      : "bg-base-100"
                  }`}
                  onClick={() => setCurrentStep(3)}
                >
                  <p className="text-xs">Step 03</p>
                  <h1 className="font-semibold">Review and Create</h1>
                </div>
              </div>

              {/* User roles Details Form */}
              {currentStep === 1 && (
                <div className="w-full bg-base-200 rounded-2xl p-6 border border-base-300">
                  <h2 className="text-xl font-semibold mb-4">Role Details</h2>
                  <form className="flex flex-col gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">
                          Role Name
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Enter role name"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        maxLength={64}
                      />
                      <span className="text-xs text-gray-500 mt-1 block">
                        The role name can have up to 64 characters. Use
                        descriptive names like "Project Manager" or "Site
                        Supervisor"
                      </span>
                    </div>

                    <div className="bg-base-100 border border-info rounded-lg p-3 flex items-start gap-2">
                      <span className="text-info">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="inline w-5 h-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                          />
                        </svg>
                      </span>
                      <span className="text-xs text-gray-700">
                        After creating the role, you'll be able to assign it to
                        users in the User Management section. Roles define what
                        permissions users have across different parts of the
                        system.
                      </span>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setCurrentStep(2)}
                        disabled={!roleName.trim()}
                      >
                        Next: Set Permissions
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Assign Permissions */}
              {currentStep === 2 && (
                <div className="w-full bg-base-200 rounded-2xl p-6 border border-base-300">
                  <h2 className="text-xl font-semibold mb-4">
                    Set Permissions
                  </h2>
                  <div className="flex flex-col gap-4">
                    <div className="bg-base-100 border border-info rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        Select permissions for this role. Each permission can
                        have different access levels (1-5). Higher levels
                        typically grant more access. For dashboard permissions,
                        you can also specify which components are available.
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>Permission</th>
                            <th>Page</th>
                            <th>Access Level / Components</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {permissions && permissions.length > 0 ? (
                            permissions.map((permission) => {
                              const selectedPermission =
                                selectedPermissions.find(
                                  (sp) => sp.permissionId === permission.id
                                );
                              return (
                                <tr key={permission.id}>
                                  <td className="font-medium">
                                    {permission.pageName}
                                  </td>
                                  <td className="text-sm text-gray-500">
                                    {permission.pageId}
                                  </td>
                                  <td>
                                    {permission.pageId === "dashboard" ? (
                                      <div className="flex flex-col gap-2">
                                        <select
                                          className="select select-bordered select-sm w-full max-w-xs"
                                          value={selectedPermission?.level || ""}
                                          onChange={(e) => {
                                            const level = parseInt(e.target.value);
                                            if (level) {
                                              handlePermissionToggle(
                                                permission.id,
                                                level
                                              );
                                            }
                                          }}
                                        >
                                          <option value="0">No Access</option>
                                          <option value="1">
                                            Level 1 (Read Only)
                                          </option>
                                          <option value="2">
                                            Level 2 (Read/Write)
                                          </option>
                                          <option value="3">
                                            Level 3 (Admin Access)
                                          </option>
                                        </select>
                                        {selectedPermission && (
                                          <div>
                                            <textarea
                                              className="textarea textarea-bordered textarea-sm w-full max-w-xs"
                                              value={
                                                selectedPermission?.availableComponents ||
                                                "[]"
                                              }
                                              onChange={(e) => {
                                                handleComponentsChange(
                                                  permission.id,
                                                  e.target.value
                                                );
                                              }}
                                              placeholder='["users", "projects", "communications", "reports"]'
                                              rows={2}
                                            />
                                            <div className="text-xs text-gray-500 mt-1">
                                              JSON array of dashboard components
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <select
                                        className="select select-bordered select-sm w-full max-w-xs"
                                        value={selectedPermission?.level || ""}
                                        onChange={(e) => {
                                          const level = parseInt(e.target.value);
                                          if (level) {
                                            handlePermissionToggle(
                                              permission.id,
                                              level
                                            );
                                          }
                                        }}
                                      >
                                        <option value="0">No Access</option>
                                        <option value="1">
                                          Level 1 (Read Only)
                                        </option>
                                        <option value="2">
                                          Level 2 (Read/Write)
                                        </option>
                                        <option value="3">
                                          Level 3 (Admin Access)
                                        </option>
                                      </select>
                                    )}
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className={`btn btn-sm ${
                                        selectedPermission
                                          ? "btn-error"
                                          : "btn-success"
                                      }`}
                                      onClick={() => {
                                        if (selectedPermission) {
                                          setSelectedPermissions((prev) =>
                                            prev.filter(
                                              (p) =>
                                                p.permissionId !== permission.id
                                            )
                                          );
                                        } else {
                                          handlePermissionToggle(
                                            permission.id,
                                            1
                                          );
                                        }
                                      }}
                                    >
                                      {selectedPermission ? "Remove" : "Add"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="text-center text-gray-500"
                              >
                                No permissions available. Create permissions
                                first.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between">
                      <button
                        className="btn btn-neutral"
                        onClick={() => setCurrentStep(1)}
                      >
                        Previous
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => setCurrentStep(3)}
                        disabled={selectedPermissions.length === 0}
                      >
                        Next: Review
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Review choices */}
              {currentStep === 3 && (
                <div className="w-full bg-base-200 rounded-2xl p-6 border border-base-300">
                  <h2 className="text-xl font-semibold">
                    Review and Create Role
                  </h2>
                  <p className="text-base-content text-xs mb-6">
                    Review the role details and permissions before creating the
                    role.
                  </p>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Role Details</h3>
                    <div className="overflow-x-auto">
                      <table className="table w-full bg-base-100">
                        <thead>
                          <tr>
                            <th>Role Name</th>
                            <th>Number of Permissions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="font-semibold">{roleName}</td>
                            <td>
                              <span className="badge badge-primary">
                                {selectedPermissions.length} permissions
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Permissions Summary
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="table w-full bg-base-100">
                        <thead>
                          <tr>
                            <th>Permission</th>
                            <th>Page</th>
                            <th>Access Level</th>
                            <th>Components</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPermissions.length > 0 ? (
                            selectedPermissions.map((sp) => {
                              const permission = permissions?.find(
                                (p) => p.id === sp.permissionId
                              );
                              return (
                                <tr key={sp.permissionId}>
                                  <td className="font-medium">
                                    {permission?.pageName ||
                                      "Unknown Permission"}
                                  </td>
                                  <td className="text-sm text-gray-500">
                                    {permission?.pageId || "Unknown Page"}
                                  </td>
                                  <td>
                                    <span className="badge badge-success">
                                      Level {sp.level}
                                    </span>
                                  </td>
                                  <td>
                                    {permission?.pageId === "dashboard" ? (
                                      <div className="text-xs bg-base-200 p-2 rounded max-w-xs overflow-hidden">
                                        {sp.availableComponents || "[]"}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-xs">N/A</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="text-center text-gray-500"
                              >
                                No permissions selected
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      className="btn btn-neutral"
                      onClick={() => setCurrentStep(2)}
                    >
                      Back to Permissions
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleCreateRole}
                      disabled={
                        createRole.isPending ||
                        !roleName.trim() ||
                        selectedPermissions.length === 0
                      }
                    >
                      {createRole.isPending ? "Creating..." : "Create Role"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Role */}
        <input
          type="radio"
          name="roles_tab_group"
          className="tab"
          aria-label="Edit Role"
          checked={activeTab === "edit_role"}
          onChange={() => setActiveTab("edit_role")}
        />
        {activeTab === "edit_role" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl w-full">
              <h2 className="text-2xl font-bold mb-1">Edit Role</h2>
              <p className="text-neutral-500 mb-6">
                Modify role details and permissions.
              </p>
              {editingRole ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Role Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="Enter role name"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Permissions</h3>
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>Permission</th>
                            <th>Page</th>
                            <th>Access Level / Components</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {permissions && permissions.length > 0 ? (
                            permissions.map((permission) => {
                              const selectedPermission =
                                selectedPermissions.find(
                                  (sp) => sp.permissionId === permission.id
                                );
                              return (
                                <tr key={permission.id}>
                                  <td className="font-medium">
                                    {permission.pageName}
                                  </td>
                                  <td className="text-sm text-gray-500">
                                    {permission.pageId}
                                  </td>
                                  <td>
                                    {permission.pageId === "dashboard" ? (
                                      <div className="flex flex-col gap-2">
                                        <select
                                          className="select select-bordered select-sm w-full max-w-xs"
                                          value={selectedPermission?.level || ""}
                                          onChange={(e) => {
                                            const level = parseInt(
                                              e.target.value
                                            );
                                            if (level) {
                                              handlePermissionToggle(
                                                permission.id,
                                                level
                                              );
                                            }
                                          }}
                                        >
                                          <option value="0">No Access</option>
                                          <option value="1">
                                            Level 1 (Read Only)
                                          </option>
                                          <option value="2">
                                            Level 2 (Read/Write)
                                          </option>
                                          <option value="3">
                                            Level 3 (Admin Access)
                                          </option>
                                        </select>
                                        {selectedPermission && (
                                          <div>
                                            <textarea
                                              className="textarea textarea-bordered textarea-sm w-full max-w-xs"
                                              value={
                                                selectedPermission?.availableComponents ||
                                                "[]"
                                              }
                                              onChange={(e) => {
                                                handleComponentsChange(
                                                  permission.id,
                                                  e.target.value
                                                );
                                              }}
                                              placeholder='["users", "projects", "communications", "reports"]'
                                              rows={3}
                                            />
                                            <div className="text-xs text-gray-500 mt-1">
                                              JSON array of dashboard components
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <select
                                        className="select select-bordered select-sm w-full max-w-xs"
                                        value={selectedPermission?.level || ""}
                                        onChange={(e) => {
                                          const level = parseInt(
                                            e.target.value
                                          );
                                          if (level) {
                                            handlePermissionToggle(
                                              permission.id,
                                              level
                                            );
                                          }
                                        }}
                                      >
                                        <option value="0">No Access</option>
                                        <option value="1">
                                          Level 1 (Read Only)
                                        </option>
                                        <option value="2">
                                          Level 2 (Read/Write)
                                        </option>
                                        <option value="3">
                                          Level 3 (Admin Access)
                                        </option>
                                      </select>
                                    )}
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className={`btn btn-sm ${
                                        selectedPermission
                                          ? "btn-error"
                                          : "btn-success"
                                      }`}
                                      onClick={() => {
                                        if (selectedPermission) {
                                          setSelectedPermissions((prev) =>
                                            prev.filter(
                                              (p) =>
                                                p.permissionId !== permission.id
                                            )
                                          );
                                        } else {
                                          handlePermissionToggle(
                                            permission.id,
                                            1
                                          );
                                        }
                                      }}
                                    >
                                      {selectedPermission ? "Remove" : "Add"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="text-center text-gray-500"
                              >
                                No permissions available. Create permissions
                                first.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setActiveTab("current_user_roles");
                        setEditingRole(null);
                        setRoleName("");
                        setSelectedPermissions([]);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleUpdateRole}
                      disabled={
                        updateRole.isPending ||
                        !roleName.trim() ||
                        selectedPermissions.length === 0
                      }
                    >
                      {updateRole.isPending ? "Updating..." : "Update Role"}
                    </button>
                  </div>
                </div>
              ) : (
                <p>No role selected for editing.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesAndPermissions;

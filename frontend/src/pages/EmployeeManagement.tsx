import { useState } from "react";
import { useRoles } from "../hooks/useRoles";
import { useUsers, type User } from "../hooks/useUsers";

const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("All");
  
  // Fetch roles and users using the hooks
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: users, isLoading: usersLoading } = useUsers();

  const handleViewEmployee = (employee: User) => {
    setSelectedEmployee(employee);
    setActiveTab("employee_details");
  };

  // Create role options from API data only
  const roleOptions = ["All"];
  if (roles && roles.length > 0) {
    const apiRoleNames = roles.map(role => role.name);
    roleOptions.push(...apiRoleNames);
  }
  
  // Use actual users data or empty array if loading
  const employees = users || [];
  
  const filteredEmployees = selectedRole === "All" 
    ? employees 
    : employees.filter(emp => emp.role?.name === selectedRole);

  // Calculate basic statistics from available user data
  const totalEmployees = employees.length;
  const isLoading = usersLoading || rolesLoading;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Employee Management Dashboard</h1>
      <p className="text-gray-500 mb-6">Manage users, roles, and team organization</p>

      {/* Performance Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">Total Employees</div>
          <div className="stat-value text-primary">{totalEmployees}</div>
          <div className="stat-desc">{totalEmployees} users registered</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">Active Roles</div>
          <div className="stat-value text-success">{roles?.length || 0}</div>
          <div className="stat-desc">Available positions</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">Filtered View</div>
          <div className="stat-value text-warning">{filteredEmployees.length}</div>
          <div className="stat-desc">Currently showing</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">System Status</div>
          <div className={`stat-value ${isLoading ? 'text-warning' : 'text-success'}`}>
            {isLoading ? 'Loading...' : 'Ready'}
          </div>
          <div className="stat-desc">Data availability</div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="employee_tab_group"
          className="tab"
          aria-label="Dashboard"
          checked={activeTab === "dashboard"}
          onChange={() => setActiveTab("dashboard")}
        />
        {activeTab === "dashboard" && (
          <div className="tab-content p-5">
            {/* Role Filter */}
            <div className="mb-4">
              <select 
                className="select select-bordered w-64" 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={rolesLoading}
              >
                {rolesLoading ? (
                  <option>Loading roles...</option>
                ) : (
                  roleOptions.map(role => (
                    <option key={role} value={role}>
                      {role === "All" ? "All Roles" : role}
                    </option>
                  ))
                )}
              </select>
              {rolesLoading && <span className="loading loading-spinner loading-sm ml-2"></span>}
            </div>

            {/* Employee Performance Grid */}
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2">Team Overview</h2>
              <p className="text-neutral-500 mb-4">
                Employee directory and role assignments
              </p>

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                  <span className="ml-2">Loading employees...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-semibold text-lg">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <span className="badge badge-primary badge-sm">
                            Active
                          </span>
                        </div>
                        
                        <div className="text-gray-500 text-sm mb-2">
                          {employee.role?.name || 'No role assigned'} • {employee.email}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Role:</span>
                            <div className="font-bold text-primary">
                              {employee.role?.name || 'Unassigned'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Email:</span>
                            <div className="font-bold text-info">
                              {employee.email}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">User ID:</span>
                            <div className="font-bold text-neutral">
                              {employee.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="badge badge-ghost badge-sm">
                            Role ID: {employee.roleId.slice(0, 8)}...
                          </span>
                          {employee.createdAt && (
                            <span className="badge badge-ghost badge-sm">
                              Joined: {new Date(employee.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 lg:mt-0">
                        <button 
                          className="btn btn-soft btn-accent btn-sm"
                          onClick={() => handleViewEmployee(employee)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {!isLoading && filteredEmployees.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No employees found matching the selected criteria.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="radio"
          name="employee_tab_group"
          className="tab"
          aria-label="Employee Details"
          checked={activeTab === "employee_details"}
          onChange={() => setActiveTab("employee_details")}
        />
        {activeTab === "employee_details" && selectedEmployee && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <p className="text-neutral-500">{selectedEmployee.role?.name || 'No role assigned'} • {selectedEmployee.email}</p>
                </div>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveTab("dashboard")}
                >
                  ← Back to Dashboard
                </button>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">User ID</div>
                  <div className="stat-value text-primary text-sm">
                    {selectedEmployee.id.slice(0, 12)}...
                  </div>
                  <div className="stat-desc">Unique identifier</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Role</div>
                  <div className="stat-value text-success text-lg">{selectedEmployee.role?.name || 'Unassigned'}</div>
                  <div className="stat-desc">Current position</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Role ID</div>
                  <div className="stat-value text-info text-sm">{selectedEmployee.roleId.slice(0, 12)}...</div>
                  <div className="stat-desc">Role identifier</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Member Since</div>
                  <div className="stat-value text-warning text-lg">
                    {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="stat-desc">Join date</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* User Details */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">User Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-medium">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>First Name:</span>
                      <span className="font-medium">{selectedEmployee.firstName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Name:</span>
                      <span className="font-medium">{selectedEmployee.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Role:</span>
                      <span className="font-medium">{selectedEmployee.role?.name || 'No role assigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">
                        {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span className="font-medium">
                        {selectedEmployee.updatedAt ? new Date(selectedEmployee.updatedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Permissions */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Role Permissions</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedEmployee.role?.rolePermissions && selectedEmployee.role.rolePermissions.length > 0 ? (
                      selectedEmployee.role.rolePermissions.map((rolePermission, index) => (
                        <div key={index} className="border border-base-300 rounded-lg p-3">
                          <div className="font-medium">
                            {rolePermission.permission?.pageName || `Permission ${rolePermission.permissionId}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            Level: {rolePermission.level}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No permissions assigned to this role.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* User Projects */}
              <div className="bg-base-100 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4">User Projects</h3>
                <p className="text-gray-500 text-sm">
                  To view this user's project assignments, use the user projects endpoint with their ID: <code className="bg-gray-100 px-2 py-1 rounded">{selectedEmployee.id}</code>
                </p>
              </div>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="employee_tab_group"
          className="tab"
          aria-label="Analytics"
          checked={activeTab === "analytics"}
          onChange={() => setActiveTab("analytics")}
        />
        {activeTab === "analytics" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2">Team Analytics</h2>
              <p className="text-neutral-500 mb-6">
                Comprehensive workforce analytics and insights
              </p>
              
              {/* Role Distribution */}
              <div className="bg-base-100 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
                <div className="space-y-4">
                  {roleOptions.filter(role => role !== "All").map(role => {
                    const roleEmployees = employees.filter(emp => emp.role?.name === role);
                    if (roleEmployees.length === 0) return null;
                    
                    return (
                      <div key={role} className="border border-base-300 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{role}</span>
                          <span className="text-sm text-gray-500">{roleEmployees.length} employees</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Assigned Users:</span>
                          <div className="mt-1">
                            {roleEmployees.slice(0, 3).map(emp => emp.firstName + ' ' + emp.lastName).join(', ')}
                            {roleEmployees.length > 3 && ` and ${roleEmployees.length - 3} more`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* System Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Users:</span>
                      <span className="font-bold text-primary">{employees.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Users with Roles:</span>
                      <span className="font-bold text-success">
                        {employees.filter(emp => emp.role).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unassigned Users:</span>
                      <span className="font-bold text-warning">
                        {employees.filter(emp => !emp.role).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Roles:</span>
                      <span className="font-bold text-info">{roles?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Most Recent User:</span>
                      <div className="font-medium">
                        {employees.length > 0 
                          ? `${employees[employees.length - 1]?.firstName} ${employees[employees.length - 1]?.lastName}`
                          : 'No users found'
                        }
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">System Status:</span>
                      <div className="font-medium text-success">
                        {isLoading ? 'Loading data...' : 'All systems operational'}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Data Source:</span>
                      <div className="font-medium text-info">
                        Live API data
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;

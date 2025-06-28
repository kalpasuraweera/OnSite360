import { useState } from "react";

// Dummy data for employees
const dummyEmployees = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@onsite360.com",
    position: "Project Manager",
    department: "Construction",
    status: "Active",
    hireDate: "2023-01-15",
    projects: [
      { id: "1", name: "Downtown Office Complex", role: "Manager", status: "In Progress" },
      { id: "3", name: "Shopping Mall Renovation", role: "Manager", status: "Completed" }
    ],
    stats: {
      projectsCompleted: 8,
      projectsActive: 2,
      averageRating: 4.8,
      yearsExperience: 12
    }
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@onsite360.com",
    position: "Senior Engineer",
    department: "Engineering",
    status: "Active",
    hireDate: "2022-08-20",
    projects: [
      { id: "2", name: "Residential Tower A", role: "Lead Engineer", status: "Planning" }
    ],
    stats: {
      projectsCompleted: 5,
      projectsActive: 1,
      averageRating: 4.6,
      yearsExperience: 8
    }
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Davis",
    email: "mike.davis@onsite360.com",
    position: "Site Supervisor",
    department: "Operations",
    status: "Active",
    hireDate: "2021-03-10",
    projects: [
      { id: "1", name: "Downtown Office Complex", role: "Supervisor", status: "In Progress" }
    ],
    stats: {
      projectsCompleted: 12,
      projectsActive: 1,
      averageRating: 4.9,
      yearsExperience: 15
    }
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Brown",
    email: "emily.brown@onsite360.com",
    position: "Safety Inspector",
    department: "Safety",
    status: "On Leave",
    hireDate: "2023-06-01",
    projects: [
      { id: "1", name: "Downtown Office Complex", role: "Safety Officer", status: "In Progress" },
      { id: "2", name: "Residential Tower A", role: "Safety Officer", status: "Planning" }
    ],
    stats: {
      projectsCompleted: 3,
      projectsActive: 2,
      averageRating: 4.7,
      yearsExperience: 6
    }
  }
];

const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState("employees");
  const [selectedEmployee, setSelectedEmployee] = useState<typeof dummyEmployees[0] | null>(null);

  const handleViewEmployee = (employee: typeof dummyEmployees[0]) => {
    setSelectedEmployee(employee);
    setActiveTab("employee_details");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "badge-success";
      case "On Leave":
        return "badge-warning";
      case "Inactive":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return "badge-warning";
      case "Completed":
        return "badge-success";
      case "Planning":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  const handleCreateEmployee = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    console.log("Creating employee:", {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      position: formData.get("position"),
      department: formData.get("department"),
      hireDate: formData.get("hireDate"),
      salary: formData.get("salary")
    });
    
    (event.target as HTMLFormElement).reset();
    setActiveTab("employees");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Employee Management</h1>
      <p className="text-gray-500 mb-6">Manage workforce and track employee performance</p>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="employee_tab_group"
          className="tab"
          aria-label="Employees"
          checked={activeTab === "employees"}
          onChange={() => setActiveTab("employees")}
        />
        {activeTab === "employees" && (
          <div className="tab-content p-5">
            {/* Employees List Section */}
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold">Employees</h2>
              <p className="text-neutral-500 mb-4">
                Overview of all company employees
              </p>

              <div className="space-y-4">
                {dummyEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-gray-500 text-sm">{employee.email}</div>
                      <div className="flex flex-wrap gap-2 mt-2 mb-2">
                        <span className={`badge ${getStatusBadge(employee.status)} badge-lg`}>
                          {employee.status}
                        </span>
                        <span className="badge badge-neutral">
                          {employee.position}
                        </span>
                        <span className="badge badge-ghost">
                          {employee.department}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Active Projects: {employee.stats.projectsActive} | 
                        Completed: {employee.stats.projectsCompleted} | 
                        Experience: {employee.stats.yearsExperience} years | 
                        Rating: {employee.stats.averageRating}/5.0
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 lg:mt-0">
                      <button 
                        className="btn btn-soft btn-accent btn-sm"
                        onClick={() => handleViewEmployee(employee)}
                      >
                        View Details
                      </button>
                      <button className="btn btn-sm btn-outline btn-primary">
                        Edit
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
                  <p className="text-neutral-500">{selectedEmployee.position} - {selectedEmployee.department}</p>
                </div>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveTab("employees")}
                >
                  ← Back to Employees
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Projects Completed</div>
                  <div className="stat-value text-primary">{selectedEmployee.stats.projectsCompleted}</div>
                  <div className="stat-desc">Total finished</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Active Projects</div>
                  <div className="stat-value text-warning">{selectedEmployee.stats.projectsActive}</div>
                  <div className="stat-desc">Currently working</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Performance Rating</div>
                  <div className="stat-value text-success">{selectedEmployee.stats.averageRating}/5.0</div>
                  <div className="stat-desc">Average score</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Experience</div>
                  <div className="stat-value text-info">{selectedEmployee.stats.yearsExperience}</div>
                  <div className="stat-desc">Years in field</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Employee Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-medium">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Department:</span>
                      <span className="font-medium">{selectedEmployee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hire Date:</span>
                      <span className="font-medium">{new Date(selectedEmployee.hireDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`badge ${getStatusBadge(selectedEmployee.status)}`}>
                        {selectedEmployee.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Project Assignments</h3>
                  <div className="space-y-3">
                    {selectedEmployee.projects.map((project) => (
                      <div key={project.id} className="border border-base-300 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-gray-500">{project.role}</div>
                          </div>
                          <span className={`badge ${getProjectStatusBadge(project.status)} badge-sm`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="employee_tab_group"
          className="tab"
          aria-label="Add Employee"
          checked={activeTab === "add_employee"}
          onChange={() => setActiveTab("add_employee")}
        />
        {activeTab === "add_employee" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl w-full">
              <h2 className="text-2xl font-bold mb-1">Add New Employee</h2>
              <p className="text-neutral-500 mb-6">
                Add a new employee to the company roster.
              </p>
              <form 
                className="flex flex-col gap-4"
                onSubmit={handleCreateEmployee}
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
                      <span className="label-text font-medium">Email</span>
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
                      <span className="label-text font-medium">Position</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      name="position"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Department</span>
                    </label>
                    <select className="select select-bordered w-full" name="department" required>
                      <option value="">Select a department</option>
                      <option>Construction</option>
                      <option>Engineering</option>
                      <option>Operations</option>
                      <option>Safety</option>
                      <option>Finance</option>
                      <option>HR</option>
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Hire Date</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      name="hireDate"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Salary</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      name="salary"
                      placeholder="Annual salary"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Years Experience</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      name="experience"
                      placeholder="Years in field"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Notes (Optional)</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    name="notes"
                    placeholder="Additional notes about the employee..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setActiveTab("employees")}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    Add Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="employee_tab_group"
          className="tab"
          aria-label="Performance"
          checked={activeTab === "performance"}
          onChange={() => setActiveTab("performance")}
        />
        {activeTab === "performance" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2">Performance Overview</h2>
              <p className="text-neutral-500 mb-4">
                Track employee performance metrics and analytics
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Average Rating</div>
                  <div className="stat-value text-primary">4.7</div>
                  <div className="stat-desc">Across all employees</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Top Performers</div>
                  <div className="stat-value text-success">12</div>
                  <div className="stat-desc">Rating 4.5+</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Active Employees</div>
                  <div className="stat-value text-info">{dummyEmployees.filter(e => e.status === "Active").length}</div>
                  <div className="stat-desc">Currently working</div>
                </div>
              </div>

              <div className="bg-base-100 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
                <div className="space-y-3">
                  {["Construction", "Engineering", "Operations", "Safety"].map(dept => (
                    <div key={dept} className="flex justify-between items-center">
                      <span>{dept}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">4.{Math.floor(Math.random() * 9)}/5.0</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${85 + Math.random() * 15}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
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

import { useState } from "react";
import { useRoles } from "../hooks/useRoles";

// Enhanced dummy data for employee performance tracking
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
      { 
        id: "1", 
        name: "Downtown Office Complex", 
        role: "Project Manager", 
        status: "In Progress",
        progress: 75,
        budget: 2500000,
        startDate: "2024-11-01",
        endDate: "2025-03-15"
      },
      { 
        id: "3", 
        name: "Shopping Mall Renovation", 
        role: "Project Manager", 
        status: "Completed",
        progress: 100,
        budget: 1800000,
        startDate: "2024-06-01",
        endDate: "2024-10-30"
      }
    ],
    performance: {
      overallRating: 4.8,
      projectsCompleted: 8,
      projectsActive: 2,
      onTimeCompletion: 92,
      budgetAdherence: 96,
      teamSatisfaction: 4.7,
      clientSatisfaction: 4.9,
      yearsExperience: 12,
      lastReviewDate: "2024-12-15",
      nextReviewDate: "2025-06-15"
    },
    recentAchievements: [
      "Completed Shopping Mall project 2 weeks ahead of schedule",
      "Maintained budget compliance across all projects",
      "Led team of 15 contractors successfully"
    ],
    certifications: ["PMP", "OSHA 30", "LEED AP"],
    workload: 85
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
      { 
        id: "2", 
        name: "Residential Tower A", 
        role: "Lead Engineer", 
        status: "Planning",
        progress: 25,
        budget: 3200000,
        startDate: "2025-01-15",
        endDate: "2025-12-01"
      },
      { 
        id: "4", 
        name: "Bridge Infrastructure", 
        role: "Structural Engineer", 
        status: "In Progress",
        progress: 60,
        budget: 4500000,
        startDate: "2024-09-01",
        endDate: "2025-08-15"
      }
    ],
    performance: {
      overallRating: 4.6,
      projectsCompleted: 5,
      projectsActive: 2,
      onTimeCompletion: 88,
      budgetAdherence: 94,
      teamSatisfaction: 4.5,
      clientSatisfaction: 4.7,
      yearsExperience: 8,
      lastReviewDate: "2024-11-20",
      nextReviewDate: "2025-05-20"
    },
    recentAchievements: [
      "Designed innovative structural solution saving 15% on materials",
      "Mentored 3 junior engineers",
      "Completed advanced structural analysis certification"
    ],
    certifications: ["PE", "SE", "AISC Certified"],
    workload: 78
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
      { 
        id: "1", 
        name: "Downtown Office Complex", 
        role: "Site Supervisor", 
        status: "In Progress",
        progress: 75,
        budget: 2500000,
        startDate: "2024-11-01",
        endDate: "2025-03-15"
      },
      { 
        id: "5", 
        name: "Warehouse Expansion", 
        role: "Operations Lead", 
        status: "Completed",
        progress: 100,
        budget: 850000,
        startDate: "2024-08-01",
        endDate: "2024-12-15"
      }
    ],
    performance: {
      overallRating: 4.9,
      projectsCompleted: 12,
      projectsActive: 1,
      onTimeCompletion: 96,
      budgetAdherence: 98,
      teamSatisfaction: 4.8,
      clientSatisfaction: 4.9,
      yearsExperience: 15,
      lastReviewDate: "2024-10-10",
      nextReviewDate: "2025-04-10"
    },
    recentAchievements: [
      "Zero safety incidents across all supervised projects",
      "Improved team productivity by 20%",
      "Completed warehouse project under budget"
    ],
    certifications: ["OSHA 30", "First Aid/CPR", "Crane Operator"],
    workload: 65
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
      { 
        id: "1", 
        name: "Downtown Office Complex", 
        role: "Safety Officer", 
        status: "In Progress",
        progress: 75,
        budget: 2500000,
        startDate: "2024-11-01",
        endDate: "2025-03-15"
      },
      { 
        id: "2", 
        name: "Residential Tower A", 
        role: "Safety Officer", 
        status: "Planning",
        progress: 25,
        budget: 3200000,
        startDate: "2025-01-15",
        endDate: "2025-12-01"
      }
    ],
    performance: {
      overallRating: 4.7,
      projectsCompleted: 3,
      projectsActive: 2,
      onTimeCompletion: 94,
      budgetAdherence: 91,
      teamSatisfaction: 4.6,
      clientSatisfaction: 4.8,
      yearsExperience: 6,
      lastReviewDate: "2024-09-30",
      nextReviewDate: "2025-03-30"
    },
    recentAchievements: [
      "Implemented new safety protocols reducing incidents by 30%",
      "Conducted comprehensive safety training for 50+ workers",
      "Achieved perfect safety audit score"
    ],
    certifications: ["CSP", "OSHA 30", "CHST"],
    workload: 45
  },
  {
    id: "5",
    firstName: "David",
    lastName: "Wilson",
    email: "david.wilson@onsite360.com",
    position: "Quality Control Manager",
    department: "Quality Assurance",
    status: "Active",
    hireDate: "2020-11-12",
    projects: [
      { 
        id: "4", 
        name: "Bridge Infrastructure", 
        role: "QC Manager", 
        status: "In Progress",
        progress: 60,
        budget: 4500000,
        startDate: "2024-09-01",
        endDate: "2025-08-15"
      }
    ],
    performance: {
      overallRating: 4.5,
      projectsCompleted: 9,
      projectsActive: 1,
      onTimeCompletion: 89,
      budgetAdherence: 93,
      teamSatisfaction: 4.4,
      clientSatisfaction: 4.6,
      yearsExperience: 10,
      lastReviewDate: "2024-12-01",
      nextReviewDate: "2025-06-01"
    },
    recentAchievements: [
      "Maintained 99.5% quality standards across all inspections",
      "Developed new quality assurance protocols",
      "Reduced rework by 25% through early detection"
    ],
    certifications: ["CQM", "ISO 9001", "Six Sigma Black Belt"],
    workload: 72
  },
  {
    id: "6",
    firstName: "Lisa",
    lastName: "Rodriguez",
    email: "lisa.rodriguez@onsite360.com",
    position: "Environmental Specialist",
    department: "Environmental",
    status: "Active",
    hireDate: "2022-02-28",
    projects: [
      { 
        id: "2", 
        name: "Residential Tower A", 
        role: "Environmental Consultant", 
        status: "Planning",
        progress: 25,
        budget: 3200000,
        startDate: "2025-01-15",
        endDate: "2025-12-01"
      },
      { 
        id: "6", 
        name: "Solar Farm Development", 
        role: "Lead Environmental", 
        status: "In Progress",
        progress: 40,
        budget: 5200000,
        startDate: "2024-10-01",
        endDate: "2025-09-30"
      }
    ],
    performance: {
      overallRating: 4.4,
      projectsCompleted: 4,
      projectsActive: 2,
      onTimeCompletion: 85,
      budgetAdherence: 90,
      teamSatisfaction: 4.3,
      clientSatisfaction: 4.5,
      yearsExperience: 7,
      lastReviewDate: "2024-11-15",
      nextReviewDate: "2025-05-15"
    },
    recentAchievements: [
      "Secured environmental permits 20% faster than average",
      "Implemented sustainable practices saving $200K annually",
      "Zero environmental violations across all projects"
    ],
    certifications: ["CEP", "LEED AP", "NEPA Certified"],
    workload: 68
  }
];

const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedEmployee, setSelectedEmployee] = useState<typeof dummyEmployees[0] | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("All");
  
  // Fetch roles using the useRoles hook
  const { data: roles, isLoading: rolesLoading } = useRoles();

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

  const getWorkloadColor = (workload: number) => {
    if (workload >= 80) return "text-error";
    if (workload >= 60) return "text-warning";
    return "text-success";
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return "text-success";
    if (rating >= 4.0) return "text-warning";
    return "text-error";
  };

  // Create role options from API data and employee positions
  const roleOptions = ["All"];
  if (roles && roles.length > 0) {
    // Add roles from API
    const apiRoleNames = roles.map(role => role.name);
    roleOptions.push(...apiRoleNames);
  }
  // Also add unique employee positions as fallback roles
  const employeePositions = Array.from(new Set(dummyEmployees.map(emp => emp.position)));
  employeePositions.forEach(position => {
    if (!roleOptions.includes(position)) {
      roleOptions.push(position);
    }
  });
  
  const filteredEmployees = selectedRole === "All" 
    ? dummyEmployees 
    : dummyEmployees.filter(emp => emp.position === selectedRole);

  const activeEmployees = dummyEmployees.filter(emp => emp.status === "Active");
  const avgPerformance = activeEmployees.reduce((acc, emp) => acc + emp.performance.overallRating, 0) / activeEmployees.length;
  const totalActiveProjects = activeEmployees.reduce((acc, emp) => acc + emp.performance.projectsActive, 0);
  const avgWorkload = activeEmployees.reduce((acc, emp) => acc + emp.workload, 0) / activeEmployees.length;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Employee Performance Dashboard</h1>
      <p className="text-gray-500 mb-6">Monitor workforce performance, project assignments, and team analytics</p>

      {/* Performance Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">Total Employees</div>
          <div className="stat-value text-primary">{dummyEmployees.length}</div>
          <div className="stat-desc">{activeEmployees.length} active, {dummyEmployees.length - activeEmployees.length} on leave</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">Average Performance</div>
          <div className="stat-value text-success">{avgPerformance.toFixed(1)}/5.0</div>
          <div className="stat-desc">Team overall rating</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">Active Projects</div>
          <div className="stat-value text-warning">{totalActiveProjects}</div>
          <div className="stat-desc">Currently in progress</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">Average Workload</div>
          <div className={`stat-value ${getWorkloadColor(avgWorkload)}`}>{avgWorkload.toFixed(0)}%</div>
          <div className="stat-desc">Team capacity utilization</div>
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
                {roleOptions.map(role => (
                  <option key={role} value={role}>
                    {role === "All" ? "All Roles" : role}
                  </option>
                ))}
              </select>
              {rolesLoading && <span className="loading loading-spinner loading-sm ml-2"></span>}
            </div>

            {/* Employee Performance Grid */}
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2">Team Performance Overview</h2>
              <p className="text-neutral-500 mb-4">
                Employee performance metrics and current assignments
              </p>

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
                        <span className={`badge ${getStatusBadge(employee.status)} badge-sm`}>
                          {employee.status}
                        </span>
                      </div>
                      
                      <div className="text-gray-500 text-sm mb-2">{employee.position} • {employee.department}</div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Performance:</span>
                          <div className={`font-bold ${getPerformanceColor(employee.performance.overallRating)}`}>
                            {employee.performance.overallRating}/5.0
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Workload:</span>
                          <div className={`font-bold ${getWorkloadColor(employee.workload)}`}>
                            {employee.workload}%
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Active Projects:</span>
                          <div className="font-bold text-warning">
                            {employee.performance.projectsActive}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Completed:</span>
                          <div className="font-bold text-success">
                            {employee.performance.projectsCompleted}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {employee.certifications.slice(0, 3).map((cert, index) => (
                          <span key={index} className="badge badge-ghost badge-sm">
                            {cert}
                          </span>
                        ))}
                        {employee.certifications.length > 3 && (
                          <span className="badge badge-ghost badge-sm">
                            +{employee.certifications.length - 3} more
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
                  <p className="text-neutral-500">{selectedEmployee.position} • {selectedEmployee.department}</p>
                </div>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveTab("dashboard")}
                >
                  ← Back to Dashboard
                </button>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Overall Performance</div>
                  <div className={`stat-value ${getPerformanceColor(selectedEmployee.performance.overallRating)}`}>
                    {selectedEmployee.performance.overallRating}/5.0
                  </div>
                  <div className="stat-desc">Current rating</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Projects Completed</div>
                  <div className="stat-value text-success">{selectedEmployee.performance.projectsCompleted}</div>
                  <div className="stat-desc">Total finished</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">On-Time Completion</div>
                  <div className="stat-value text-info">{selectedEmployee.performance.onTimeCompletion}%</div>
                  <div className="stat-desc">Delivery rate</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Current Workload</div>
                  <div className={`stat-value ${getWorkloadColor(selectedEmployee.workload)}`}>
                    {selectedEmployee.workload}%
                  </div>
                  <div className="stat-desc">Capacity utilization</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Performance Details */}
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Budget Adherence:</span>
                      <span className="font-medium">{selectedEmployee.performance.budgetAdherence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Team Satisfaction:</span>
                      <span className="font-medium">{selectedEmployee.performance.teamSatisfaction}/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Client Satisfaction:</span>
                      <span className="font-medium">{selectedEmployee.performance.clientSatisfaction}/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Years Experience:</span>
                      <span className="font-medium">{selectedEmployee.performance.yearsExperience} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Review:</span>
                      <span className="font-medium">{new Date(selectedEmployee.performance.lastReviewDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Employee Information */}
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
                    <div className="flex justify-between">
                      <span>Next Review:</span>
                      <span className="font-medium">{new Date(selectedEmployee.performance.nextReviewDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Assignments & Achievements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Current Project Assignments</h3>
                  <div className="space-y-3">
                    {selectedEmployee.projects.map((project) => (
                      <div key={project.id} className="border border-base-300 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-gray-500">{project.role}</div>
                          </div>
                          <span className={`badge ${getProjectStatusBadge(project.status)} badge-sm`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Progress: {project.progress}% | Budget: ${project.budget.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Recent Achievements & Certifications</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recent Achievements:</h4>
                      <ul className="text-sm space-y-1">
                        {selectedEmployee.recentAchievements.map((achievement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-success">•</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Certifications:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmployee.certifications.map((cert, index) => (
                          <span key={index} className="badge badge-ghost badge-sm">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
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
              
              {/* Role Performance */}
              <div className="bg-base-100 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Role Performance Breakdown</h3>
                <div className="space-y-4">
                  {roleOptions.filter(role => role !== "All").map(role => {
                    const roleEmployees = dummyEmployees.filter(emp => emp.position === role);
                    if (roleEmployees.length === 0) return null;
                    
                    const roleAvgRating = roleEmployees.reduce((acc, emp) => acc + emp.performance.overallRating, 0) / roleEmployees.length;
                    const roleAvgWorkload = roleEmployees.reduce((acc, emp) => acc + emp.workload, 0) / roleEmployees.length;
                    const roleActiveProjects = roleEmployees.reduce((acc, emp) => acc + emp.performance.projectsActive, 0);
                    
                    return (
                      <div key={role} className="border border-base-300 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{role}</span>
                          <span className="text-sm text-gray-500">{roleEmployees.length} employees</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Avg Performance:</span>
                            <div className={`font-bold ${getPerformanceColor(roleAvgRating)}`}>
                              {roleAvgRating.toFixed(1)}/5.0
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Avg Workload:</span>
                            <div className={`font-bold ${getWorkloadColor(roleAvgWorkload)}`}>
                              {roleAvgWorkload.toFixed(0)}%
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Active Projects:</span>
                            <div className="font-bold text-warning">{roleActiveProjects}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Performance Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { range: "4.5+ (Excellent)", count: dummyEmployees.filter(emp => emp.performance.overallRating >= 4.5).length, color: "success" },
                      { range: "4.0-4.4 (Good)", count: dummyEmployees.filter(emp => emp.performance.overallRating >= 4.0 && emp.performance.overallRating < 4.5).length, color: "warning" },
                      { range: "3.5-3.9 (Average)", count: dummyEmployees.filter(emp => emp.performance.overallRating >= 3.5 && emp.performance.overallRating < 4.0).length, color: "info" },
                      { range: "< 3.5 (Needs Improvement)", count: dummyEmployees.filter(emp => emp.performance.overallRating < 3.5).length, color: "error" }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{item.range}</span>
                        <div className="flex items-center gap-2">
                          <span className={`badge badge-${item.color} badge-sm`}>{item.count}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`bg-${item.color === 'success' ? 'green' : item.color === 'warning' ? 'yellow' : item.color === 'info' ? 'blue' : 'red'}-600 h-2 rounded-full`}
                              style={{ width: `${(item.count / dummyEmployees.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>High Performers (4.5+):</span>
                      <span className="font-medium text-success">
                        {dummyEmployees.filter(emp => emp.performance.overallRating >= 4.5).length} employees
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overloaded (80%+ workload):</span>
                      <span className="font-medium text-error">
                        {dummyEmployees.filter(emp => emp.workload >= 80).length} employees
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Active Projects:</span>
                      <span className="font-medium">{totalActiveProjects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Upcoming Reviews:</span>
                      <span className="font-medium">
                        {dummyEmployees.filter(emp => new Date(emp.performance.nextReviewDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length} in 30 days
                      </span>
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

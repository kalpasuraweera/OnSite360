import { useState } from "react";

// Dummy data for projects
const dummyProjects = [
  {
    id: "1",
    name: "Downtown Office Complex",
    status: "In Progress",
    progress: 75,
    budget: 5500000,
    spent: 4125000,
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    manager: "John Smith",
    location: "Downtown District",
    description: "Construction of a 20-story office complex with underground parking"
  },
  {
    id: "2", 
    name: "Residential Tower A",
    status: "Planning",
    progress: 25,
    budget: 8200000,
    spent: 2050000,
    startDate: "2024-03-01",
    endDate: "2025-08-15",
    manager: "Sarah Johnson",
    location: "Westside",
    description: "35-story residential tower with retail space on ground floor"
  },
  {
    id: "3",
    name: "Shopping Mall Renovation",
    status: "Completed",
    progress: 100,
    budget: 3200000,
    spent: 3150000,
    startDate: "2023-09-01",
    endDate: "2024-02-28",
    manager: "Mike Davis",
    location: "City Center",
    description: "Complete renovation of existing shopping mall including new storefronts"
  }
];

const ProjectOversight = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const [selectedProject, setSelectedProject] = useState<typeof dummyProjects[0] | null>(null);

  const handleViewProject = (project: typeof dummyProjects[0]) => {
    setSelectedProject(project);
    setActiveTab("project_details");
  };

  const getStatusBadge = (status: string) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleCreateProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Here you would normally send the data to your API
    console.log("Creating project:", {
      name: formData.get("projectName"),
      budget: formData.get("budget"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      manager: formData.get("manager"),
      location: formData.get("location"),
      description: formData.get("description")
    });
    
    // Reset form and go back to projects tab
    (event.target as HTMLFormElement).reset();
    setActiveTab("projects");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Project Oversight</h1>
      <p className="text-gray-500 mb-6">Monitor and manage construction projects</p>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="project_tab_group"
          className="tab"
          aria-label="Projects"
          checked={activeTab === "projects"}
          onChange={() => setActiveTab("projects")}
        />
        {activeTab === "projects" && (
          <div className="tab-content p-5">
            {/* Projects List Section */}
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold">Projects</h2>
              <p className="text-neutral-500 mb-4">
                Overview of all construction projects
              </p>

              <div className="space-y-4">
                {dummyProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{project.name}</div>
                      <div className="text-gray-500 text-sm mb-2">{project.description}</div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`badge ${getStatusBadge(project.status)} badge-lg`}>
                          {project.status}
                        </span>
                        <span className="badge badge-neutral">
                          {project.manager}
                        </span>
                        <span className="badge badge-ghost">
                          {project.location}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Budget: {formatCurrency(project.budget)} | 
                        Spent: {formatCurrency(project.spent)} | 
                        Progress: {project.progress}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 lg:mt-0">
                      <button 
                        className="btn btn-soft btn-accent btn-sm"
                        onClick={() => handleViewProject(project)}
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
          name="project_tab_group"
          className="tab"
          aria-label="Project Details"
          checked={activeTab === "project_details"}
          onChange={() => setActiveTab("project_details")}
        />
        {activeTab === "project_details" && selectedProject && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                  <p className="text-neutral-500">{selectedProject.description}</p>
                </div>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveTab("projects")}
                >
                  ← Back to Projects
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Progress</div>
                  <div className="stat-value text-primary">{selectedProject.progress}%</div>
                  <div className="stat-desc">Project completion</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Budget</div>
                  <div className="stat-value text-sm">{formatCurrency(selectedProject.budget)}</div>
                  <div className="stat-desc">Total allocated</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Spent</div>
                  <div className="stat-value text-sm">{formatCurrency(selectedProject.spent)}</div>
                  <div className="stat-desc">{((selectedProject.spent / selectedProject.budget) * 100).toFixed(1)}% of budget</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Status</div>
                  <div className={`stat-value badge ${getStatusBadge(selectedProject.status)} badge-lg`}>
                    {selectedProject.status}
                  </div>
                  <div className="stat-desc">Current state</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span className="font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End Date:</span>
                      <span className="font-medium">{new Date(selectedProject.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {Math.ceil((new Date(selectedProject.endDate).getTime() - new Date(selectedProject.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Manager:</span>
                      <span className="font-medium">{selectedProject.manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">{selectedProject.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Budget:</span>
                      <span className="font-medium">{formatCurrency(selectedProject.budget - selectedProject.spent)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="project_tab_group"
          className="tab"
          aria-label="Create Project"
          checked={activeTab === "create_project"}
          onChange={() => setActiveTab("create_project")}
        />
        {activeTab === "create_project" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl w-full">
              <h2 className="text-2xl font-bold mb-1">Create New Project</h2>
              <p className="text-neutral-500 mb-6">
                Add a new construction project to the system.
              </p>
              <form 
                className="flex flex-col gap-4"
                onSubmit={handleCreateProject}
              >
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Project Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      name="projectName"
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Budget</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      name="budget"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Start Date</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      name="startDate"
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">End Date</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      name="endDate"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Project Manager</span>
                    </label>
                    <select className="select select-bordered w-full" name="manager" required>
                      <option value="">Select a manager</option>
                      <option>John Smith</option>
                      <option>Sarah Johnson</option>
                      <option>Mike Davis</option>
                      <option>Emily Brown</option>
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Location</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      name="location"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Project Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={4}
                    name="description"
                    placeholder="Detailed description of the project..."
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setActiveTab("projects")}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectOversight;

import { useState, useRef } from "react";
import { useCreateProject } from "../hooks/useProjects";

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
    description:
      "Construction of a 20-story office complex with underground parking",
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
    description: "35-story residential tower with retail space on ground floor",
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
    description:
      "Complete renovation of existing shopping mall including new storefronts",
  },
];

const ProjectOversight = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const [selectedProject, setSelectedProject] = useState<
    (typeof dummyProjects)[0] | null
  >(null);

  // Add state for logo and photo previews
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Refs for file inputs to support drag-and-drop
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleViewProject = (project: (typeof dummyProjects)[0]) => {
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const createProject = useCreateProject();

  const handleCreateProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newProject = {
      name: formData.get("projectName") as string,
      budget: Number(formData.get("budget")),
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      manager: formData.get("manager") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      squareFeet: Number(formData.get("squareFeet")),
      logo: formData.get("logo"),
      photo: formData.get("photo"),
      cityCountry: formData.get("cityCountry") as string,
      address: formData.get("address") as string,
    };

    createProject.mutate(newProject, {
      onSuccess: () => {
        console.log("Project created successfully!");
        setActiveTab("projects");
        (event.target as HTMLFormElement).reset();
      },
      onError: (error) => {
        console.error("Failed to create project:", error);
      },
    });

    // Reset form and go back to projects tab
    (event.target as HTMLFormElement).reset();
    setActiveTab("projects");
    // Reset previews after submit
    setLogoPreview(null);
    setPhotoPreview(null);
  };

  // Handle file input change for logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(null);
    }
  };

  // Handle file input change for photo
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  };

  // Drag and drop handlers for logo
  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && logoInputRef.current) {
      logoInputRef.current.files = e.dataTransfer.files;
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Drag and drop handlers for photo
  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && photoInputRef.current) {
      photoInputRef.current.files = e.dataTransfer.files;
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Prevent default drag behavior
  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Project Oversight</h1>
      <p className="text-gray-500 mb-6">
        Monitor and manage construction projects
      </p>

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
                      <div className="font-semibold text-lg">
                        {project.name}
                      </div>
                      <div className="text-gray-500 text-sm mb-2">
                        {project.description}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span
                          className={`badge ${getStatusBadge(
                            project.status
                          )} badge-lg`}
                        >
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
                        Budget: {formatCurrency(project.budget)} | Spent:{" "}
                        {formatCurrency(project.spent)} | Progress:{" "}
                        {project.progress}%
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
                  <p className="text-neutral-500">
                    {selectedProject.description}
                  </p>
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
                  <div className="stat-value text-primary">
                    {selectedProject.progress}%
                  </div>
                  <div className="stat-desc">Project completion</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Budget</div>
                  <div className="stat-value text-sm">
                    {formatCurrency(selectedProject.budget)}
                  </div>
                  <div className="stat-desc">Total allocated</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Spent</div>
                  <div className="stat-value text-sm">
                    {formatCurrency(selectedProject.spent)}
                  </div>
                  <div className="stat-desc">
                    {(
                      (selectedProject.spent / selectedProject.budget) *
                      100
                    ).toFixed(1)}
                    % of budget
                  </div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Status</div>
                  <div
                    className={`stat-value badge ${getStatusBadge(
                      selectedProject.status
                    )} badge-lg`}
                  >
                    {selectedProject.status}
                  </div>
                  <div className="stat-desc">Current state</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Project Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span className="font-medium">
                        {new Date(
                          selectedProject.startDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>End Date:</span>
                      <span className="font-medium">
                        {new Date(selectedProject.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {Math.ceil(
                          (new Date(selectedProject.endDate).getTime() -
                            new Date(selectedProject.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Project Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Manager:</span>
                      <span className="font-medium">
                        {selectedProject.manager}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">
                        {selectedProject.location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Budget:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          selectedProject.budget - selectedProject.spent
                        )}
                      </span>
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
                encType="multipart/form-data"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Project Name
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      name="projectName"
                      required
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Type</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      name="type"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Residential">Residential</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Mixed Use">Mixed Use</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
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
                  <div className="w-full md:w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Square Feet
                      </span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      name="squareFeet"
                      min={0}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
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
                  <div className="w-full md:w-1/2">
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

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Project Manager
                      </span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      name="manager"
                      required
                    >
                      <option value="">Select a manager</option>
                      <option>John Smith</option>
                      <option>Sarah Johnson</option>
                      <option>Mike Davis</option>
                      <option>Emily Brown</option>
                    </select>
                  </div>
                  <div className="w-full md:w-1/2">
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

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">
                        City/Country
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      name="cityCountry"
                      required
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Address</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      name="address"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  {/* Logo upload with preview and drag-and-drop */}
                  <div className="w-full md:w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Logo</span>
                    </label>
                    <div
                      className="border border-dashed border-base-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer bg-base-100"
                      onDrop={handleLogoDrop}
                      onDragOver={preventDefault}
                      onDragEnter={preventDefault}
                      onClick={() => logoInputRef.current?.click()}
                      style={{ minHeight: 120 }}
                    >
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="max-h-24 object-contain mb-2"
                        />
                      ) : (
                        <span className="text-gray-400">
                          Drag & drop logo here, or click to select
                        </span>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        name="logo"
                        accept="image/*"
                        ref={logoInputRef}
                        onChange={handleLogoChange}
                      />
                    </div>
                  </div>
                  {/* Photo upload with preview and drag-and-drop */}
                  <div className="w-full md:w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">Photo</span>
                    </label>
                    <div
                      className="border border-dashed border-base-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer bg-base-100"
                      onDrop={handlePhotoDrop}
                      onDragOver={preventDefault}
                      onDragEnter={preventDefault}
                      onClick={() => photoInputRef.current?.click()}
                      style={{ minHeight: 120 }}
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Photo Preview"
                          className="max-h-24 object-contain mb-2"
                        />
                      ) : (
                        <span className="text-gray-400">
                          Drag & drop photo here, or click to select
                        </span>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        name="photo"
                        accept="image/*"
                        ref={photoInputRef}
                        onChange={handlePhotoChange}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Project Description
                    </span>
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
                  <button type="submit" className="btn btn-primary">
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

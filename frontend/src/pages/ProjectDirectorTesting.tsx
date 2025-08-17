import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  type Project,
} from "../hooks/useProjects";
import { useUsers, type User } from "../hooks/useUsers";

// Fix default marker icon for leaflet in React
// You can use CDN links (as shown) or local assets if you prefer.
// This is only for the marker icon images, not the Marker component itself.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ProjectOversight = () => {
  // Fetch projects data
  const { data: projectsResponse, isLoading, error, refetch } = useProjects();
  const projects = projectsResponse?.data || [];

  // Fetch users data
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const [activeTab, setActiveTab] = useState("projects");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Single image preview for project (replaces logo + featured photo)
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // New: state for location coordinates
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationText, setLocationText] = useState<string>(""); // For address/description
  // New: modal state for map picker
  const [showMapModal, setShowMapModal] = useState(false);

  // New: state for project users management
  const [selectedUsers, setSelectedUsers] = useState<
    {
      userId: string;
      projectRole: string;
      accessLevel: number;
      userName?: string;
    }[]
  >([]);
  const [showUserModal, setShowUserModal] = useState(false);

  // Access level options for user permissions
  const accessLevelOptions = [
    { value: 1, label: "Level 1 (Read Only)" },
    { value: 2, label: "Level 2 (Read/Write)" },
    { value: 3, label: "Level 3 (Admin Access)" },
  ];

  // Refs for file inputs to support drag-and-drop
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setActiveTab("project_details");
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setActiveTab("edit_project");
    // Reset preview when editing a project
    setImagePreview(null);
    setLocationText(project.location || "");
    setLocationCoords(project.coordinates || null);
    // Set selected users if available
    if (project.userProjects) {
      setSelectedUsers(
        project.userProjects.map((up) => ({
          userId: up.userId,
          projectRole: up.projectRole,
          accessLevel: up.accessLevel,
          userName: `${up.user.firstName} ${up.user.lastName}`,
        }))
      );
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
  const updateProject = useUpdateProject();

  const handleCreateProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const formDataRaw = new FormData(formEl);

    // Build FormData for multipart upload
    const payload = new FormData();
    // scalar fields from the form
    const name = formDataRaw.get("projectName") as string;
    if (name) payload.append("name", name);

    const description = formDataRaw.get("description") as string;
    if (description) payload.append("description", description);

    const type = formDataRaw.get("type") as string;
    if (type) payload.append("type", type);

    const budget = formDataRaw.get("budget");
    if (budget) payload.append("budget", String(budget));

    const squareFeet = formDataRaw.get("squareFeet");
    if (squareFeet) payload.append("squareFeet", String(squareFeet));

    if (locationText) payload.append("location", locationText);
    if (locationCoords) payload.append("coordinates", JSON.stringify(locationCoords));

    const startDate = formDataRaw.get("startDate") as string;
    if (startDate) payload.append("startDate", startDate);

    const endDate = formDataRaw.get("endDate") as string;
    if (endDate) payload.append("endDate", endDate);

    // users (send as JSON string)
    if (selectedUsers.length > 0) {
      payload.append("users", JSON.stringify(selectedUsers.map((u) => ({
        userId: u.userId,
        projectRole: u.projectRole,
        accessLevel: u.accessLevel,
      }))));
    }

    // image file from input ref
    const file = imageInputRef.current?.files?.[0] ?? null;
    if (file) payload.append("image", file);

    createProject.mutate(payload, {
      onSuccess: () => {
        console.log("Project created successfully!");
        setActiveTab("projects");
        formEl.reset();
        resetForm();
      },
      onError: (error) => {
        console.error("Failed to create project:", error);
      },
    });
  };

  const handleUpdateProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProject) return;

    const formEl = event.currentTarget;
    const formDataRaw = new FormData(formEl);

    const payload = new FormData();
    const name = formDataRaw.get("projectName") as string;
    if (name) payload.append("name", name);

    const description = formDataRaw.get("description") as string;
    if (description) payload.append("description", description);

    const type = formDataRaw.get("type") as string;
    if (type) payload.append("type", type);

    const budget = formDataRaw.get("budget");
    if (budget) payload.append("budget", String(budget));

    const squareFeet = formDataRaw.get("squareFeet");
    if (squareFeet) payload.append("squareFeet", String(squareFeet));

    if (locationText) payload.append("location", locationText);
    if (locationCoords) payload.append("coordinates", JSON.stringify(locationCoords));

    const startDate = formDataRaw.get("startDate") as string;
    if (startDate) payload.append("startDate", startDate);

    const endDate = formDataRaw.get("endDate") as string;
    if (endDate) payload.append("endDate", endDate);

    // users (send as JSON string)
    if (selectedUsers.length > 0) {
      payload.append("users", JSON.stringify(selectedUsers.map((u) => ({
        userId: u.userId,
        projectRole: u.projectRole,
        accessLevel: u.accessLevel,
      }))));
    }

    // If user selected a new image
    const file = imageInputRef.current?.files?.[0] ?? null;
    if (file) payload.append("image", file);

    updateProject.mutate(
      { id: selectedProject.id, formData: payload },
      {
        onSuccess: () => {
          console.log("Project updated successfully!");
          setActiveTab("project_details");
        },
        onError: (error) => {
          console.error("Failed to update project:", error);
        },
      }
    );
  };

  const resetForm = () => {
    setImagePreview(null);
    setLocationCoords(null);
    setLocationText("");
    setSelectedUsers([]);
  };

  // Single image handlers (replace logo/photo handlers)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && imageInputRef.current) {
      imageInputRef.current.files = e.dataTransfer.files;
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Prevent default drag behavior
  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Map click handler component
  function LocationMarker({
    onSelect,
  }: {
    onSelect: (coords: { lat: number; lng: number }) => void;
  }) {
    useMapEvents({
      click(e) {
        onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    // This is the correct way to show a marker at the selected position:
    return locationCoords ? <Marker position={locationCoords} /> : null;
  }

  // Open map modal
  const handlePickLocation = () => {
    setShowMapModal(true);
  };

  // Confirm location selection
  const handleConfirmLocation = () => {
    setShowMapModal(false);
  };

  // Cancel location selection
  const handleCancelLocation = () => {
    setShowMapModal(false);
  };

  // User management functions
  const handleAddUser = (userId: string, accessLevel: number) => {
    const user = users.find((u: User) => u.id === userId);
    if (user && !selectedUsers.find((su) => su.userId === userId)) {
      setSelectedUsers((prev) => [
        ...prev,
        {
          userId,
          projectRole: user.role?.name || "No Role",
          accessLevel,
          userName: `${user.firstName} ${user.lastName}`,
        },
      ]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.userId !== userId));
  };

  const handleUpdateUserRole = (userId: string, accessLevel: number) => {
    setSelectedUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, accessLevel } : u))
    );
  };

  // User Modal Component
  const UserSelectionModal = () => {
    const [tempUserId, setTempUserId] = useState("");
    const [tempAccessLevel, setTempAccessLevel] = useState(1);

    const handleAddTempUser = () => {
      if (tempUserId) {
        handleAddUser(tempUserId, tempAccessLevel);
        setTempUserId("");
        setTempAccessLevel(1);
        setShowUserModal(false);
      }
    };

    return (
      // Add team member modal
      <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Add User to Project</h3>

          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Select User</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={tempUserId}
                onChange={(e) => setTempUserId(e.target.value)}
                disabled={usersLoading}
              >
                <option value="">
                  {usersLoading ? "Loading users..." : "Choose a user"}
                </option>
                {!usersLoading &&
                  users
                    .filter(
                      (user: User) =>
                        !selectedUsers.find((su) => su.userId === user.id)
                    )
                    .map((user: User) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email}) -{" "}
                        {user.role?.name || "No Role"}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Access Level</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={tempAccessLevel}
                onChange={(e) => setTempAccessLevel(Number(e.target.value))}
              >
                {accessLevelOptions.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowUserModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddTempUser}
              disabled={!tempUserId}
            >
              Add User
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add helpers to build document URL and resolve project image fields
  const buildDocumentUrl = (path?: string) => {
    // return `${import.meta.env.VITE_DOCUMENTS_URL || 'http://localhost:3000'}$`
    // Use environment var fallback and append the path if provided
    if (!path) return undefined;
    return `${import.meta.env.VITE_DOCUMENTS_URL || "http://localhost:3000"}${path}`;
  };

  const getProjectImageUrl = (project: Project) => {
    const p = project as any;
    // common property names that backend might use for uploaded image
    const candidates = [
      p.imageUrl,
      p.image?.url,
      p.image,
      p.featuredImage,
      p.featuredPhoto,
      p.photoUrl,
      p.photo,
      p.logoUrl,
      p.logo,
    ];
    const found = candidates.find((c) => !!c);
    if (!found) return undefined;
    // found may be a string or an object with url/path
    if (typeof found === "string") {
      return buildDocumentUrl(found);
    }
    return buildDocumentUrl(found.url || found.path);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-1">Project Oversight</h1>
      <p className="text-gray-500 mb-6">
        Monitor and manage construction projects
      </p>

      {/* User Selection Modal */}
      {showUserModal && <UserSelectionModal />}

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-xl relative">
            <h3 className="text-lg font-semibold mb-2">
              Pick Project Location
            </h3>
            <div style={{ height: 350, width: "100%" }}>
              <MapContainer
                center={locationCoords || { lat: 40.7128, lng: -74.006 }}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker
                  onSelect={(coords) => setLocationCoords(coords)}
                />
              </MapContainer>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="btn btn-outline btn-sm"
                onClick={handleCancelLocation}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleConfirmLocation}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className="tab-content lg:p-5">
            {/* Projects List Section */}
            <div className="bg-base-200 border border-base-300 p-3 sm:p-4 lg:p-6 rounded-2xl">
              <h2 className="text-2xl font-bold">Projects</h2>
              <p className="text-neutral-500 mb-4">
                Overview of all construction projects
              </p>

              <div className="space-y-2 lg:space-y-4 sm:space-y-3 ">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : error ? (
                  <div className="alert alert-error">
                    <span>Failed to load projects. Please try again.</span>
                    <button className="btn btn-sm" onClick={() => refetch()}>
                      Retry
                    </button>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No projects found.</p>
                    <button
                      className="btn btn-primary mt-4"
                      onClick={() => setActiveTab("create_project")}
                    >
                      Create Your First Project
                    </button>
                  </div>
                ) : (
                  projects.map((project: Project) => (
                    <div
                      key={project.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      {/* NEW: thumbnail area */}
                      <div className="flex items-start gap-4 mb-4 lg:mb-0">
                        {(() => {
                          const img = getProjectImageUrl(project);
                          if (img) {
                            return (
                              <img
                                src={img}
                                alt={`${project.name} image`}
                                className="w-28 h-20 object-cover rounded-lg shadow-sm flex-shrink-0"
                              />
                            );
                          }
                          return (
                            <div className="w-28 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-400 flex-shrink-0">
                              No Image
                            </div>
                          );
                        })()}

                        <div className="flex-1">
                          {/* Project Name with Edit Button */}
                          <div className="flex justify-between sm:flex-row gap-2 items-center">
                            <div className="font-semibold text-xl">{project.name}</div>
                            <button
                              className="btn btn-sm btn-soft"
                              onClick={() => handleEditProject(project)}
                            >
                              Edit
                            </button>
                          </div>

                          {/* Project ID */}
                          <div className="badge badge-neutral my-2">
                            {project.id}
                          </div>

                          {/* Project Description */}
                          <div className="text-gray-500 text-sm my-4">
                            {project.description
                              ? project.description.length > 100
                                ? `${project.description.substring(0, 300)}...`
                                : project.description
                              : "No description provided"}
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="badge badge-neutral">
                              {project.type || "Unknown Type"}
                            </span>
                            <span className="badge badge-ghost">
                              {project.location || "No location"}
                            </span>
                            {project.coordinates && (
                              <span className="badge badge-success text-base-200">
                                📍 Located
                              </span>
                            )}
                          </div>

                          {/* Project Size, Start and End Date */}
                          <div className="flex gap-4 text-sm text-gray-600 mb-3">
                            {project.squareFeet && (
                              <span>
                                Size: {project.squareFeet.toLocaleString()} sq ft
                              </span>
                            )}
                            {project.startDate && (
                              <span>
                                Start:{" "}
                                {new Date(project.startDate).toLocaleDateString()}
                              </span>
                            )}
                            {project.endDate && (
                              <span>
                                End:{" "}
                                {new Date(project.endDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {/* Small Cards */}
                          {project._count && (
                            <div className="flex gap-2 font-medium">
                              <span className="badge bg-info/10 p-6">
                                📋 {project._count.tasks}
                              </span>
                              <span className="badge bg-secondary/10 p-6">
                                📄 {project._count.documents}
                              </span>
                              <span className="badge bg-success/10 p-6">
                                💬 {project._count.threads}
                              </span>
                              <span className="badge bg-error/10 p-6">
                                ⚠️ {project._count.issue}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 lg:mt-0">
                        <button
                          className="btn btn-primary btn-md hidden lg:block"
                          onClick={() => handleViewProject(project)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
        {activeTab === "project_details" &&
          (selectedProject ? (
            <div className="tab-content p-5">
              <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
                {/* Updated header to show featured image if available */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start gap-4">
                    {(() => {
                      const img = getProjectImageUrl(selectedProject);
                      if (img) {
                        return (
                          <img
                            src={img}
                            alt={`${selectedProject.name} featured`}
                            className="w-32 h-24 object-cover rounded-md shadow-sm"
                          />
                        );
                      }
                      return (
                        <div className="w-32 h-24 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-400">
                          No Image
                        </div>
                      );
                    })()}
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedProject.name}
                      </h2>
                      <p className="text-neutral-500">
                        {selectedProject.description}
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab("projects")}
                  >
                    ← Back to Projects
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {selectedProject.budget && (
                    <div className="stat bg-base-100 rounded-xl shadow">
                      <div className="stat-title">Budget</div>
                      <div className="stat-value ">
                        {formatCurrency(selectedProject.budget)}
                      </div>
                      <div className="stat-desc">Total allocated</div>
                    </div>
                  )}

                  {selectedProject.squareFeet && (
                    <div className="stat bg-base-100 rounded-xl shadow">
                      <div className="stat-title">Size</div>
                      <div className="stat-value ">
                        {selectedProject.squareFeet.toLocaleString()}
                      </div>
                      <div className="stat-desc">Square feet</div>
                    </div>
                  )}

                  {selectedProject.type && (
                    <div className="stat bg-base-100 rounded-xl shadow">
                      <div className="stat-title">Type</div>
                      <div className="stat-value ">{selectedProject.type}</div>
                      <div className="stat-desc">Project category</div>
                    </div>
                  )}

                  {selectedProject._count && (
                    <>
                      <div className="stat bg-base-100 rounded-xl shadow">
                        <div className="stat-title">Tasks</div>
                        <div className="stat-value text-primary">
                          {selectedProject._count.tasks}
                        </div>
                        <div className="stat-desc">Total tasks</div>
                      </div>
                      <div className="stat bg-base-100 rounded-xl shadow">
                        <div className="stat-title">Documents</div>
                        <div className="stat-value text-secondary">
                          {selectedProject._count.documents}
                        </div>
                        <div className="stat-desc">Files uploaded</div>
                      </div>
                      <div className="stat bg-base-100 rounded-xl shadow">
                        <div className="stat-title">Issues</div>
                        <div className="stat-value text-warning">
                          {selectedProject._count.issue}
                        </div>
                        <div className="stat-desc">Open issues</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-base-100 rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Project Timeline
                    </h3>
                    <div className="space-y-3">
                      {selectedProject.startDate && (
                        <div className="flex justify-between">
                          <span>Start Date:</span>
                          <span className="font-medium">
                            {new Date(
                              selectedProject.startDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {selectedProject.endDate && (
                        <div className="flex justify-between">
                          <span>End Date:</span>
                          <span className="font-medium">
                            {new Date(
                              selectedProject.endDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {selectedProject.startDate && selectedProject.endDate && (
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
                      )}
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">
                          {new Date(
                            selectedProject.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="font-medium">
                          {new Date(
                            selectedProject.updatedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-base-100 rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Project Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between bg-base-200 p-2 rounded-xl">
                        <span>Location:</span>
                        <span className="font-medium">
                          {selectedProject.location || "Not specified"}
                          {selectedProject.coordinates &&
                            ` (${selectedProject.coordinates.lat.toFixed(
                              5
                            )}, ${selectedProject.coordinates.lng.toFixed(5)})`}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2 bg-base-200 p-2 rounded-xl">
                        <span>Description:</span>
                        <span className="font-medium">
                          {selectedProject.description ||
                            "No description provided"}
                        </span>
                      </div>
                      {selectedProject.userProjects &&
                        selectedProject.userProjects.length > 0 && (
                          <div>
                            <span>Team Members:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedProject.userProjects.map(
                                (userProject) => (
                                  <div
                                    key={userProject.id}
                                    className="badge bg-primary/50 p-2"
                                  >
                                    {userProject.user.firstName}{" "}
                                    {userProject.user.lastName} (
                                    {userProject.projectRole})
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="tab-content p-5">
              <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
                <h2 className="text-xl font-semibold text-base-content text-center">
                  Please select a project to view its details.
                </h2>
              </div>
            </div>
          ))}

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
                className="space-y-6"
                onSubmit={handleCreateProject}
                encType="multipart/form-data"
              >
                {/* Basic Information Section */}
                <div className="bg-base-100 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">
                          Project Name
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        name="projectName"
                        placeholder="Enter project name"
                        required
                      />
                    </div>
                    <div>
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
                </div>

                {/* Project Details Section */}
                <div className="bg-base-100 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">
                    Project Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">Budget</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        name="budget"
                        placeholder="Enter budget amount"
                        required
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">
                          Square Feet
                        </span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        name="squareFeet"
                        placeholder="Enter total square feet"
                        min={0}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="bg-base-100 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">
                          Start Date
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        name="startDate"
                        required
                      />
                    </div>
                    <div>
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
                </div>

                {/* Team Members Section */}
                <div className="bg-base-100 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Team Members</h3>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowUserModal(true)}
                    >
                      Add Team Member
                    </button>
                  </div>

                  {selectedUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Access Level</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUsers.map((user) => (
                            <tr key={user.userId}>
                              <td className="font-medium">{user.userName}</td>
                              <td>
                                <span className="badge badge-outline">
                                  {user.projectRole}
                                </span>
                              </td>
                              <td>
                                <select
                                  className="select select-bordered select-sm w-full"
                                  value={user.accessLevel}
                                  onChange={(e) =>
                                    handleUpdateUserRole(
                                      user.userId,
                                      Number(e.target.value)
                                    )
                                  }
                                >
                                  {accessLevelOptions.map((level) => (
                                    <option
                                      key={level.value}
                                      value={level.value}
                                    >
                                      {level.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-error btn-xs"
                                  onClick={() => handleRemoveUser(user.userId)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No team members added yet. Click "Add Team Member" to get
                      started.
                    </div>
                  )}
                </div>

                {/* Location Section */}
                <div className="bg-base-100 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">
                          Coordinates
                        </span>
                      </label>
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm flex-1"
                          onClick={handlePickLocation}
                        >
                          Pick Location on Map
                        </button>
                        {locationCoords && (
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {locationCoords.lat.toFixed(5)},{" "}
                            {locationCoords.lng.toFixed(5)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">
                          Address/Description
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        name="locationText"
                        placeholder="Enter address or description"
                        value={locationText}
                        onChange={(e) => setLocationText(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Media Upload Section */}
                <div className="bg-base-100 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">Project Image</span>
                      </label>
                      <div
                        className="border border-dashed border-base-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-base-50 hover:bg-base-100 transition-colors"
                        onDrop={handleImageDrop}
                        onDragOver={preventDefault}
                        onDragEnter={preventDefault}
                        onClick={() => imageInputRef.current?.click()}
                        style={{ minHeight: 120 }}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Image Preview"
                            className="max-h-24 object-contain mb-2"
                          />
                        ) : (
                          <div className="text-center">
                            <svg
                              className="w-8 h-8 mx-auto mb-2 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <span className="text-gray-400 text-sm">
                              Drag & drop an image here, or click to select
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          name="image"
                          accept="image/*"
                          ref={imageInputRef}
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="bg-base-100 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={4}
                    name="description"
                    placeholder="Detailed description of the project..."
                    required
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
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
                    disabled={createProject.isPending}
                  >
                    {createProject.isPending ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="project_tab_group"
          className="tab"
          aria-label="Edit Project"
          checked={activeTab === "edit_project"}
          onChange={() => setActiveTab("edit_project")}
        />
        {activeTab === "edit_project" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              {selectedProject ? (
                <form
                  className="space-y-6"
                  onSubmit={handleUpdateProject}
                  encType="multipart/form-data"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Edit Project</h2>
                      <p className="text-neutral-500">
                        Modify project details and settings.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setActiveTab("projects")}
                    >
                      ← Back to Projects
                    </button>
                  </div>

                  {/* Basic Information Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Project Name
                          </span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          name="projectName"
                          defaultValue={selectedProject.name}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Type</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          name="type"
                          defaultValue={selectedProject.type || ""}
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
                    <div className="mt-4">
                      <label className="label">
                        <span className="label-text font-medium">
                          Description
                        </span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered w-full"
                        name="description"
                        defaultValue={selectedProject.description || ""}
                        rows={3}
                        placeholder="Enter project description..."
                      />
                    </div>
                  </div>

                  {/* Project Details Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">
                      Project Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Budget</span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered w-full"
                          name="budget"
                          defaultValue={selectedProject.budget}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Square Feet
                          </span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered w-full"
                          name="squareFeet"
                          defaultValue={selectedProject.squareFeet || 0}
                          min={0}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Start Date
                          </span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered w-full"
                          name="startDate"
                          defaultValue={
                            selectedProject.startDate
                              ? new Date(selectedProject.startDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            End Date
                          </span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered w-full"
                          name="endDate"
                          defaultValue={
                            selectedProject.endDate
                              ? new Date(selectedProject.endDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Team Members Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Team Members</h3>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowUserModal(true)}
                      >
                        Add Team Member
                      </button>
                    </div>

                    {selectedUsers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="table w-full">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Role</th>
                              <th>Access Level</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUsers.map((user) => (
                              <tr key={user.userId}>
                                <td className="font-medium">{user.userName}</td>
                                <td>
                                  <span className="badge badge-outline">
                                    {user.projectRole}
                                  </span>
                                </td>
                                <td>
                                  <select
                                    className="select select-bordered select-sm w-full"
                                    value={user.accessLevel}
                                    onChange={(e) =>
                                      handleUpdateUserRole(
                                        user.userId,
                                        Number(e.target.value)
                                      )
                                    }
                                  >
                                    {accessLevelOptions.map((level) => (
                                      <option
                                        key={level.value}
                                        value={level.value}
                                      >
                                        {level.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-error btn-xs"
                                    onClick={() =>
                                      handleRemoveUser(user.userId)
                                    }
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No team members assigned yet. Click "Add Team Member" to
                        get started.
                      </div>
                    )}
                  </div>

                  {/* Location Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Coordinates
                          </span>
                        </label>
                        <div className="flex gap-2 items-center">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm flex-1"
                            onClick={handlePickLocation}
                          >
                            Pick Location on Map
                          </button>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {locationCoords
                              ? `${locationCoords.lat.toFixed(
                                  5
                                )}, ${locationCoords.lng.toFixed(5)}`
                              : selectedProject.coordinates
                              ? `${selectedProject.coordinates.lat.toFixed(
                                  5
                                )}, ${selectedProject.coordinates.lng.toFixed(
                                  5
                                )}`
                              : "No coordinates"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Address/Description
                          </span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          name="locationText"
                          placeholder="Enter address or description"
                          value={locationText}
                          onChange={(e) => setLocationText(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Media Upload Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Project Image</span>
                        </label>
                        <div
                          className="border border-dashed border-base-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-base-50 hover:bg-base-100 transition-colors"
                          onDrop={handleImageDrop}
                          onDragOver={preventDefault}
                          onDragEnter={preventDefault}
                          onClick={() => imageInputRef.current?.click()}
                          style={{ minHeight: 120 }}
                        >
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Image Preview"
                              className="max-h-24 object-contain mb-2"
                            />
                          ) : (
                            <div className="text-center">
                              <svg
                                className="w-8 h-8 mx-auto mb-2 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <span className="text-gray-400 text-sm">
                                Drag & drop an image here, or click to select
                              </span>
                            </div>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            name="image"
                            accept="image/*"
                            ref={imageInputRef}
                            onChange={handleImageChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Description</h3>
                    <textarea
                      className="textarea textarea-bordered w-full"
                      rows={4}
                      name="description"
                      defaultValue={selectedProject.description}
                      required
                    ></textarea>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setActiveTab("projects")}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <h2 className="text-xl font-semibold text-base-content text-center">
                  Select a project to edit
                </h2>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectOversight;

{activeTab === "edit_project" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              {selectedProject ? (
                <form
                  className="space-y-6"
                  onSubmit={handleUpdateProject}
                  encType="multipart/form-data"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Edit Project</h2>
                      <p className="text-neutral-500">
                        Modify project details and settings.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setActiveTab("projects")}
                    >
                      ← Back to Projects
                    </button>
                  </div>

                  {/* Basic Information Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Project Name
                          </span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          name="projectName"
                          defaultValue={selectedProject.name}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Type</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          name="type"
                          defaultValue={selectedProject.type || ""}
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
                    <div className="mt-4">
                      <label className="label">
                        <span className="label-text font-medium">
                          Description
                        </span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered w-full"
                        name="description"
                        defaultValue={selectedProject.description || ""}
                        rows={3}
                        placeholder="Enter project description..."
                      />
                    </div>
                  </div>

                  {/* Project Details Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">
                      Project Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Budget</span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered w-full"
                          name="budget"
                          defaultValue={selectedProject.budget}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Square Feet
                          </span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered w-full"
                          name="squareFeet"
                          defaultValue={selectedProject.squareFeet || 0}
                          min={0}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Start Date
                          </span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered w-full"
                          name="startDate"
                          defaultValue={
                            selectedProject.startDate
                              ? new Date(selectedProject.startDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            End Date
                          </span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered w-full"
                          name="endDate"
                          defaultValue={
                            selectedProject.endDate
                              ? new Date(selectedProject.endDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Team Members Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Team Members</h3>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowUserModal(true)}
                      >
                        Add Team Member
                      </button>
                    </div>

                    {selectedUsers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="table w-full">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Role</th>
                              <th>Access Level</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUsers.map((user) => (
                              <tr key={user.userId}>
                                <td className="font-medium">{user.userName}</td>
                                <td>
                                  <span className="badge badge-outline">
                                    {user.projectRole}
                                  </span>
                                </td>
                                <td>
                                  <select
                                    className="select select-bordered select-sm w-full"
                                    value={user.accessLevel}
                                    onChange={(e) =>
                                      handleUpdateUserRole(
                                        user.userId,
                                        Number(e.target.value)
                                      )
                                    }
                                  >
                                    {accessLevelOptions.map((level) => (
                                      <option
                                        key={level.value}
                                        value={level.value}
                                      >
                                        {level.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-error btn-xs"
                                    onClick={() =>
                                      handleRemoveUser(user.userId)
                                    }
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No team members assigned yet. Click "Add Team Member" to
                        get started.
                      </div>
                    )}
                  </div>

                  {/* Location Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Coordinates
                          </span>
                        </label>
                        <div className="flex gap-2 items-center">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm flex-1"
                            onClick={handlePickLocation}
                          >
                            Pick Location on Map
                          </button>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {locationCoords
                              ? `${locationCoords.lat.toFixed(
                                  5
                                )}, ${locationCoords.lng.toFixed(5)}`
                              : selectedProject.coordinates
                              ? `${selectedProject.coordinates.lat.toFixed(
                                  5
                                )}, ${selectedProject.coordinates.lng.toFixed(
                                  5
                                )}`
                              : "No coordinates"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">
                            Address/Description
                          </span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          name="locationText"
                          placeholder="Enter address or description"
                          value={locationText}
                          onChange={(e) => setLocationText(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Media Upload Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Project Image</span>
                        </label>
                        <div
                          className="border border-dashed border-base-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-base-50 hover:bg-base-100 transition-colors"
                          onDrop={handleImageDrop}
                          onDragOver={preventDefault}
                          onDragEnter={preventDefault}
                          onClick={() => imageInputRef.current?.click()}
                          style={{ minHeight: 120 }}
                        >
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Image Preview"
                              className="max-h-24 object-contain mb-2"
                            />
                          ) : (
                            <div className="text-center">
                              <svg
                                className="w-8 h-8 mx-auto mb-2 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <span className="text-gray-400 text-sm">
                                Drag & drop an image here, or click to select
                              </span>
                            </div>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            name="image"
                            accept="image/*"
                            ref={imageInputRef}
                            onChange={handleImageChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Description</h3>
                    <textarea
                      className="textarea textarea-bordered w-full"
                      rows={4}
                      name="description"
                      defaultValue={selectedProject.description}
                      required
                    ></textarea>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setActiveTab("projects")}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <h2 className="text-xl font-semibold text-base-content text-center">
                  Select a project to edit
                </h2>
              )}
            </div>
          </div>
        )}




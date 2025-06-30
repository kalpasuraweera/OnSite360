import { useState, useRef } from "react";
import { useCreateProject } from "../hooks/useProjects";
// Add these imports for React Leaflet
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
    coordinates: { lat: 40.7128, lng: -74.006 },
    logoUrl: "",
    featuredImageUrl: "",
    description:
      "Construction of a 20-story office complex with underground parking",
    type: "Commercial",
    squareFeet: 100000,
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
    coordinates: { lat: 34.0522, lng: -118.2437 },
    logoUrl: "",
    featuredImageUrl: "",
    description: "35-story residential tower with retail space on ground floor",
    type: "Residential",
    squareFeet: 150000,
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
    coordinates: { lat: 37.7749, lng: -122.4194 },
    logoUrl: "",
    featuredImageUrl: "",
    description:
      "Complete renovation of existing shopping mall including new storefronts",
    type: "Commercial",
    squareFeet: 80000,
  },
];

// Fix default marker icon for leaflet in React
// You can use CDN links (as shown) or local assets if you prefer.
// This is only for the marker icon images, not the Marker component itself.
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
  const [activeTab, setActiveTab] = useState("projects");
  const [selectedProject, setSelectedProject] = useState<
    (typeof dummyProjects)[0] | null
  >(null);

  // Add state for logo and photo previews
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // New: state for location coordinates
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationText, setLocationText] = useState<string>(""); // For address/description
  // New: modal state for map picker
  const [showMapModal, setShowMapModal] = useState(false);

  // Refs for file inputs to support drag-and-drop
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleViewProject = (project: (typeof dummyProjects)[0]) => {
    setSelectedProject(project);
    setActiveTab("project_details");
  };

  const handleEditProject = (project: (typeof dummyProjects)[0]) => {
    setSelectedProject(project);
    setActiveTab("edit_project");
    // Reset previews when editing a project
    setLogoPreview(null);
    setPhotoPreview(null);
    setLocationText(project.location || "");
    setLocationCoords(project.coordinates || null);
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
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      budget: Number(formData.get("budget")),
      squareFeet: Number(formData.get("squareFeet")),
      location: locationText,
      coordinates: locationCoords
        ? { lat: locationCoords.lat, lng: locationCoords.lng }
        : null,
      logo: formData.get("logo"),
      photo: formData.get("photo"),
      logoUrl: "", // Set after upload if needed
      featuredImageUrl: "", // Set after upload if needed
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      manager: formData.get("manager") as string,
    };

    createProject.mutate(newProject, {
      onSuccess: () => {
        console.log("Project created successfully!");
        setActiveTab("projects");
        (event.target as HTMLFormElement).reset();
        setLocationCoords(null);
        setLocationText("");
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
    setLocationCoords(null);
    setLocationText("");
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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Project Oversight</h1>
      <p className="text-gray-500 mb-6">
        Monitor and manage construction projects
      </p>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
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
                        {project.coordinates && (
                          <span className="badge badge-info">
                            {project.coordinates.lat.toFixed(3)},{" "}
                            {project.coordinates.lng.toFixed(3)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Budget: {formatCurrency(project.budget)} | Spent:{" "}
                        {formatCurrency(project.spent)} | Progress:{" "}
                        {project.progress}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-success h-2 rounded-full"
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
                      <button
                        className="btn btn-sm btn-outline btn-primary"
                        onClick={() => handleEditProject(project)}
                      >
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
        {activeTab === "project_details" &&
          (selectedProject ? (
            <div className="tab-content p-5">
              <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedProject.name}
                    </h2>
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
                          {new Date(
                            selectedProject.endDate
                          ).toLocaleDateString()}
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
                          {selectedProject.coordinates &&
                            ` (${selectedProject.coordinates.lat.toFixed(
                              5
                            )}, ${selectedProject.coordinates.lng.toFixed(5)})`}
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
                  {/* Location picker replaces location/cityCountry/address */}
                  <div className="w-full md:w-1/2">
                    <label className="label">
                      <span className="label-text font-medium">
                        Location (Coordinates)
                      </span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handlePickLocation}
                      >
                        Pick Location on Map
                      </button>
                      {locationCoords && (
                        <span className="text-xs text-gray-600">
                          {locationCoords.lat.toFixed(5)},{" "}
                          {locationCoords.lng.toFixed(5)}
                        </span>
                      )}
                    </div>
                    {/* Location text input */}
                    <label className="label mt-2">
                      <span className="label-text font-medium">
                        Location (Text/Address)
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
                  className="flex flex-col gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    // You would update the project here, using locationCoords if changed
                    console.log("Edited project data submitted");
                  }}
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
                        defaultValue={selectedProject.name}
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

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/2">
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
                        defaultValue={selectedProject.squareFeet || 0}
                        min={0}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/2">
                      <label className="label">
                        <span className="label-text font-medium">
                          Start Date
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        name="startDate"
                        defaultValue={selectedProject.startDate}
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
                        defaultValue={selectedProject.endDate}
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
                        defaultValue={selectedProject.manager}
                        required
                      >
                        <option value="">Select a manager</option>
                        <option>John Smith</option>
                        <option>Sarah Johnson</option>
                        <option>Mike Davis</option>
                        <option>Emily Brown</option>
                      </select>
                    </div>
                    {/* Location picker for edit */}
                    <div className="w-full md:w-1/2">
                      <label className="label">
                        <span className="label-text font-medium">
                          Location (Coordinates)
                        </span>
                      </label>
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={handlePickLocation}
                        >
                          Pick Location on Map
                        </button>
                        <span className="text-xs text-gray-600">
                          {locationCoords
                            ? `${locationCoords.lat.toFixed(
                                5
                              )}, ${locationCoords.lng.toFixed(5)}`
                            : selectedProject.location}
                        </span>
                      </div>
                      {/* Location text input for edit */}
                      <label className="label mt-2">
                        <span className="label-text font-medium">
                          Location (Text/Address)
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

                  <div className="flex flex-col md:flex-row gap-4">
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
                      defaultValue={selectedProject.description}
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

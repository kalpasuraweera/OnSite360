import { useState, useMemo } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { IoClose, IoAttach, IoTrash, IoEye, IoPencil } from "react-icons/io5";

// Dummy data types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  projectId: string;
  project?: Project;
  reporterId: string;
  reporter?: User;
  assignedToIds: string[];
  assignees?: User[];
  taggedUserIds: string[];
  taggedUsers?: User[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  resolution?: string;
  resolvedAt?: string;
}

// Dummy data
const dummyUsers: User[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@example.com",
  },
  {
    id: "4",
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@example.com",
  },
  {
    id: "5",
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@example.com",
  },
];

const dummyProjects: Project[] = [
  {
    id: "1",
    name: "Downtown Office Complex",
    description: "Modern office building project",
  },
  {
    id: "2",
    name: "Residential Tower A",
    description: "High-rise residential building",
  },
  {
    id: "3",
    name: "Shopping Mall Renovation",
    description: "Mall renovation and expansion",
  },
  {
    id: "4",
    name: "Industrial Warehouse",
    description: "Large scale warehouse facility",
  },
];

const dummyIssues: Issue[] = [
  {
    id: "ISS-001",
    title: "Electrical wiring not up to code",
    description:
      "The electrical wiring in section B does not meet current building codes. Immediate attention required.",
    type: "Safety",
    priority: "Critical",
    status: "Open",
    projectId: "1",
    project: dummyProjects[0],
    reporterId: "1",
    reporter: dummyUsers[0],
    assignedToIds: ["2", "3"],
    assignees: [dummyUsers[1], dummyUsers[2]],
    taggedUserIds: ["4"],
    taggedUsers: [dummyUsers[3]],
    attachments: ["electrical_diagram.pdf", "safety_report.jpg"],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    dueDate: "2024-01-20T00:00:00Z",
  },
  {
    id: "ISS-002",
    title: "Water damage in basement level",
    description:
      "Significant water damage found in basement level. Source unknown, requires investigation.",
    type: "Structural",
    priority: "High",
    status: "In Progress",
    projectId: "1",
    project: dummyProjects[0],
    reporterId: "2",
    reporter: dummyUsers[1],
    assignedToIds: ["1"],
    assignees: [dummyUsers[0]],
    taggedUserIds: ["3", "4"],
    taggedUsers: [dummyUsers[2], dummyUsers[3]],
    attachments: ["water_damage_photo1.jpg", "water_damage_photo2.jpg"],
    createdAt: "2024-01-14T14:15:00Z",
    updatedAt: "2024-01-15T09:45:00Z",
    dueDate: "2024-01-25T00:00:00Z",
  },
  {
    id: "ISS-003",
    title: "HVAC system not functioning properly",
    description:
      "The HVAC system on floors 3-5 is not maintaining proper temperature. Efficiency issues reported.",
    type: "Mechanical",
    priority: "Medium",
    status: "Resolved",
    projectId: "2",
    project: dummyProjects[1],
    reporterId: "3",
    reporter: dummyUsers[2],
    assignedToIds: ["4"],
    assignees: [dummyUsers[3]],
    taggedUserIds: ["1", "2"],
    taggedUsers: [dummyUsers[0], dummyUsers[1]],
    attachments: ["hvac_inspection.pdf"],
    createdAt: "2024-01-10T11:20:00Z",
    updatedAt: "2024-01-14T16:30:00Z",
    resolvedAt: "2024-01-14T16:30:00Z",
    resolution:
      "Replaced faulty thermostat and cleaned air filters. System now functioning normally.",
  },
  {
    id: "ISS-004",
    title: "Missing safety equipment on site",
    description:
      "Several safety equipment items are missing from the construction site including helmets and safety harnesses.",
    type: "Safety",
    priority: "High",
    status: "Open",
    projectId: "3",
    project: dummyProjects[2],
    reporterId: "4",
    reporter: dummyUsers[3],
    assignedToIds: ["5"],
    assignees: [dummyUsers[4]],
    taggedUserIds: ["1"],
    taggedUsers: [dummyUsers[0]],
    attachments: [],
    createdAt: "2024-01-16T08:45:00Z",
    updatedAt: "2024-01-16T08:45:00Z",
    dueDate: "2024-01-18T00:00:00Z",
  },
];

const IssueReporting = () => {
  // Auth store
  const { user: currentUser } = useAuthStore();

  // State
  const [activeTab, setActiveTab] = useState("issues");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [issues, setIssues] = useState<Issue[]>(dummyIssues);

  // Create issue modal state
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
  const [selectedTaggedUsers, setSelectedTaggedUsers] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Edit issue modal state
  const [showEditIssueModal, setShowEditIssueModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [editSelectedTaggedUsers, setEditSelectedTaggedUsers] = useState<
    string[]
  >([]);
  const [editUploadedFiles, setEditUploadedFiles] = useState<string[]>([]);

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingIssue, setDeletingIssue] = useState<Issue | null>(null);

  // View issue modal state
  const [showViewIssueModal, setShowViewIssueModal] = useState(false);
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null);

  // Filter issues based on selected project
  const filteredIssues = useMemo(() => {
    if (!selectedProject) return issues;
    return issues.filter((issue) => issue.projectId === selectedProject);
  }, [issues, selectedProject]);

  // Analytics data
  const analyticsData = useMemo(() => {
    const issuesByStatus = filteredIssues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issuesByPriority = filteredIssues.reduce((acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issuesByType = filteredIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { issuesByStatus, issuesByPriority, issuesByType };
  }, [filteredIssues]);

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return "badge-error";
      case "In Progress":
        return "badge-warning";
      case "Resolved":
        return "badge-success";
      case "Closed":
        return "badge-neutral";
      default:
        return "badge-neutral";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "badge-error";
      case "High":
        return "badge-warning";
      case "Medium":
        return "badge-info";
      case "Low":
        return "badge-neutral";
      default:
        return "badge-neutral";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Safety":
        return "badge-error";
      case "Structural":
        return "badge-warning";
      case "Mechanical":
        return "badge-info";
      case "Electrical":
        return "badge-primary";
      case "Other":
        return "badge-neutral";
      default:
        return "badge-neutral";
    }
  };

  // Create issue handlers
  const handleCreateIssue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const newIssue: Issue = {
      id: `ISS-${String(issues.length + 1).padStart(3, "0")}`,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      priority: formData.get("priority") as string,
      status: "Open",
      projectId: formData.get("projectId") as string,
      project: dummyProjects.find(
        (p) => p.id === (formData.get("projectId") as string)
      ),
      reporterId: currentUser?.id || "1",
      reporter: currentUser || dummyUsers[0],
      assignedToIds: [],
      assignees: [],
      taggedUserIds: selectedTaggedUsers,
      taggedUsers: dummyUsers.filter((u) => selectedTaggedUsers.includes(u.id)),
      attachments: uploadedFiles,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: (formData.get("dueDate") as string) || undefined,
    };

    setIssues((prev) => [...prev, newIssue]);
    setShowCreateIssueModal(false);
    (event.target as HTMLFormElement).reset();
    setSelectedTaggedUsers([]);
    setUploadedFiles([]);
  };

  const handleAddTaggedUser = (userId: string) => {
    if (!selectedTaggedUsers.includes(userId)) {
      setSelectedTaggedUsers((prev) => [...prev, userId]);
    }
  };

  const handleRemoveTaggedUser = (userId: string) => {
    setSelectedTaggedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map((file) => file.name);
      setUploadedFiles((prev) => [...prev, ...fileNames]);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((name) => name !== fileName));
  };

  // Edit issue handlers
  const handleEditIssue = (issue: Issue) => {
    setEditingIssue(issue);
    setEditSelectedTaggedUsers(issue.taggedUserIds);
    setEditUploadedFiles(issue.attachments);
    setShowEditIssueModal(true);
  };

  const handleUpdateIssue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingIssue) return;

    const formData = new FormData(event.currentTarget);
    const updatedIssue: Issue = {
      ...editingIssue,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      priority: formData.get("priority") as string,
      status: formData.get("status") as string,
      assignedToIds: editingIssue.assignedToIds,
      assignees: editingIssue.assignees,
      taggedUserIds: editSelectedTaggedUsers,
      taggedUsers: dummyUsers.filter((u) =>
        editSelectedTaggedUsers.includes(u.id)
      ),
      attachments: editUploadedFiles,
      updatedAt: new Date().toISOString(),
      dueDate: (formData.get("dueDate") as string) || undefined,
      resolution: (formData.get("resolution") as string) || undefined,
      resolvedAt:
        formData.get("status") === "Resolved"
          ? new Date().toISOString()
          : undefined,
    };

    setIssues((prev) =>
      prev.map((issue) => (issue.id === editingIssue.id ? updatedIssue : issue))
    );
    setShowEditIssueModal(false);
    setEditingIssue(null);
    setEditSelectedTaggedUsers([]);
    setEditUploadedFiles([]);
  };

  // Delete issue handlers
  const handleDeleteIssue = (issue: Issue) => {
    setDeletingIssue(issue);
    setShowDeleteModal(true);
  };

  const confirmDeleteIssue = () => {
    if (!deletingIssue) return;
    setIssues((prev) => prev.filter((issue) => issue.id !== deletingIssue.id));
    setShowDeleteModal(false);
    setDeletingIssue(null);
  };

  // View issue handler
  const handleViewIssue = (issue: Issue) => {
    setViewingIssue(issue);
    setShowViewIssueModal(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Issue Reporting</h1>
          <p className="text-gray-500 mt-1">
            Track and manage project issues, bugs, and concerns
          </p>
        </div>

        {/* Project selection in header */}
        <div className="flex items-center justify-end mb-1">
          <div className="flex gap-4 items-center">
            <select
              className="select select-bordered"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">All Projects</option>
              {dummyProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
        <div className="stat bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
          <div className="stat-figure">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="stat-title text-blue-100">Total Issues</div>
          <div className="stat-value">{filteredIssues.length}</div>
          <div className="stat-desc text-blue-200">All reported issues</div>
        </div>

        <div className="stat bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg">
          <div className="stat-figure">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="stat-title text-red-100">Open Issues</div>
          <div className="stat-value">{analyticsData.issuesByStatus.Open || 0}</div>
          <div className="stat-desc text-red-200">Require attention</div>
        </div>

        <div className="stat bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-lg">
          <div className="stat-figure">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="stat-title text-amber-100">In Progress</div>
          <div className="stat-value">{analyticsData.issuesByStatus["In Progress"] || 0}</div>
          <div className="stat-desc text-amber-200">Being worked on</div>
        </div>

        <div className="stat bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg">
          <div className="stat-figure">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="stat-title text-green-100">Resolved</div>
          <div className="stat-value">{analyticsData.issuesByStatus.Resolved || 0}</div>
          <div className="stat-desc text-green-200">Successfully fixed</div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <button
          className={`tab text-base ${
            activeTab === "issues" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setActiveTab("issues")}
        >
          Issues Overview
        </button>
        <button
          className={`tab text-base ${
            activeTab === "analytics" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        {/* Tab Content */}
        <div className="mt-4">
          {/* Issues Overview */}
          {activeTab === "issues" && (
            <div className="my-1">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Issues Overview</h2>
                  <p className="text-neutral-500">
                    View and manage all reported issues
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateIssueModal(true)}
                >
                  + Report Issue
                </button>
              </div>

              {filteredIssues.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl text-base-content/20 mb-4">🐛</div>
                  <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                    {selectedProject
                      ? "No issues found for the selected project."
                      : "No issues found. Report your first issue to get started."}
                  </h3>
                  <p className="text-base-content/50 mb-6">
                    Create your first issue report to track problems and
                    improvements
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateIssueModal(true)}
                  >
                    Report First Issue
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex flex-col lg:flex-row lg:items-start justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-neutral font-mono">
                            {issue.id}
                          </span>
                          <span className={`badge ${getTypeBadge(issue.type)}`}>
                            {issue.type}
                          </span>
                          <span
                            className={`badge ${getPriorityBadge(
                              issue.priority
                            )}`}
                          >
                            {issue.priority}
                          </span>
                          <span className={`badge ${getStatusBadge(issue.status)}`}>
                            {issue.status}
                          </span>
                        </div>

                        <div className="font-semibold text-lg mb-1">
                          {issue.title}
                        </div>

                        <div className="text-gray-500 text-sm mb-2 line-clamp-2">
                          {issue.description}
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Project:</span>{" "}
                          {issue.project?.name} |
                          <span className="font-medium"> Reporter:</span>{" "}
                          {issue.reporter?.firstName}{" "}
                          {issue.reporter?.lastName}
                        </div>

                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Created:</span>{" "}
                          {new Date(issue.createdAt).toLocaleDateString()} |
                          <span className="font-medium"> Updated:</span>{" "}
                          {new Date(issue.updatedAt).toLocaleDateString()}
                          {issue.dueDate && (
                            <>
                              | <span className="font-medium"> Due:</span>{" "}
                              {new Date(issue.dueDate).toLocaleDateString()}
                            </>
                          )}
                        </div>

                        {issue.attachments.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm font-medium text-gray-600">
                              Attachments: {issue.attachments.length} file(s)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4 lg:mt-0">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => handleViewIssue(issue)}
                        >
                          <IoEye size={16} />
                          View
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEditIssue(issue)}
                        >
                          <IoPencil size={16} />
                          Edit
                        </button>
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() => handleDeleteIssue(issue)}
                        >
                          <IoTrash size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics */}
          {activeTab === "analytics" && (
            <div className="my-1">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Issue Analytics</h2>
                  <p className="text-neutral-500">
                    Insights into issue patterns and resolution metrics
                  </p>
                </div>
                <div className="badge badge-info badge-lg">
                  {selectedProject
                    ? dummyProjects.find((p) => p.id === selectedProject)?.name
                    : "All Projects"}
                </div>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Breakdown */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">By Status</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.issuesByStatus).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex justify-between items-center"
                        >
                          <span className={`badge ${getStatusBadge(status)}`}>
                            {status}
                          </span>
                          <span className="font-bold">{count}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Priority Breakdown */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">By Priority</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.issuesByPriority).map(
                      ([priority, count]) => (
                        <div
                          key={priority}
                          className="flex justify-between items-center"
                        >
                          <span
                            className={`badge ${getPriorityBadge(priority)}`}
                          >
                            {priority}
                          </span>
                          <span className="font-bold">{count}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Type Breakdown */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">By Type</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.issuesByType).map(
                      ([type, count]) => (
                        <div
                          key={type}
                          className="flex justify-between items-center"
                        >
                          <span className={`badge ${getTypeBadge(type)}`}>
                            {type}
                          </span>
                          <span className="font-bold">{count}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Issue Modal */}
      {showCreateIssueModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Report New Issue</h3>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Issue Title *</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="input input-bordered"
                    placeholder="Brief description of the issue..."
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Project *</span>
                  </label>
                  <select name="projectId" className="select select-bordered" required>
                    <option value="">Select a project</option>
                    {dummyProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description *</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered h-24"
                  placeholder="Detailed description of the issue..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Issue Type *</span>
                  </label>
                  <select name="type" className="select select-bordered" required>
                    <option value="">Select type</option>
                    <option value="Safety">Safety</option>
                    <option value="Structural">Structural</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Quality">Quality</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Priority *</span>
                  </label>
                  <select name="priority" className="select select-bordered" required>
                    <option value="">Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Due Date</span>
                  </label>
                  <input type="date" name="dueDate" className="input input-bordered" />
                </div>
              </div>

              {/* Tag Users */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Tag Users (for notifications)</span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  <div className="space-y-2">
                    {dummyUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <span className="text-sm">
                          {user.firstName} {user.lastName} ({user.email})
                        </span>
                        {selectedTaggedUsers.includes(user.id) ? (
                          <button
                            type="button"
                            className="btn btn-error btn-xs"
                            onClick={() => handleRemoveTaggedUser(user.id)}
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-info btn-xs"
                            onClick={() => handleAddTaggedUser(user.id)}
                          >
                            Tag
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {selectedTaggedUsers.length > 0 && (
                  <div className="label">
                    <span className="label-text-alt text-info">
                      Tagged: {selectedTaggedUsers.length} user(s)
                    </span>
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Attachments</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadedFiles.map((fileName, index) => (
                      <div key={index} className="flex items-center justify-between bg-base-200 p-2 rounded">
                        <span className="text-sm">{fileName}</span>
                        <button
                          type="button"
                          className="btn btn-error btn-xs"
                          onClick={() => handleRemoveFile(fileName)}
                        >
                          <IoTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowCreateIssueModal(false);
                    setSelectedTaggedUsers([]);
                    setUploadedFiles([]);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Report Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Issue Modal */}
      {showEditIssueModal && editingIssue && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.2)" }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Issue</h3>

            <form onSubmit={handleUpdateIssue} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Issue Title *
                    </span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="input input-bordered w-full"
                    defaultValue={editingIssue.title}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Status *</span>
                  </label>
                  <select
                    name="status"
                    className="select select-bordered w-full"
                    defaultValue={editingIssue.status}
                    required
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Description *</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  defaultValue={editingIssue.description}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Issue Type *</span>
                  </label>
                  <select
                    name="type"
                    className="select select-bordered w-full"
                    defaultValue={editingIssue.type}
                    required
                  >
                    <option value="Safety">Safety</option>
                    <option value="Structural">Structural</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Quality">Quality</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Priority *</span>
                  </label>
                  <select
                    name="priority"
                    className="select select-bordered w-full"
                    defaultValue={editingIssue.priority}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Due Date</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    className="input input-bordered w-full"
                    defaultValue={
                      editingIssue.dueDate
                        ? new Date(editingIssue.dueDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                  />
                </div>
              </div>

              {/* Resolution field (if status is resolved) */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Resolution</span>
                </label>
                <textarea
                  name="resolution"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Describe how this issue was resolved..."
                  defaultValue={editingIssue.resolution || ""}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditIssueModal(false);
                    setEditingIssue(null);
                    setEditSelectedTaggedUsers([]);
                    setEditUploadedFiles([]);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Issue Modal */}
      {showViewIssueModal && viewingIssue && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.2)" }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Issue Details</h3>
              <button
                className="btn btn-circle btn-sm"
                onClick={() => setShowViewIssueModal(false)}
              >
                <IoClose size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="badge badge-neutral font-mono text-lg">
                  {viewingIssue.id}
                </span>
                <span className={`badge ${getTypeBadge(viewingIssue.type)}`}>
                  {viewingIssue.type}
                </span>
                <span
                  className={`badge ${getPriorityBadge(viewingIssue.priority)}`}
                >
                  {viewingIssue.priority}
                </span>
                <span
                  className={`badge ${getStatusBadge(viewingIssue.status)}`}
                >
                  {viewingIssue.status}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-xl mb-2">
                  {viewingIssue.title}
                </h4>
                <p className="text-gray-700 mb-4">{viewingIssue.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Project:</span>{" "}
                  {viewingIssue.project?.name}
                </div>
                <div>
                  <span className="font-medium">Reporter:</span>{" "}
                  {viewingIssue.reporter?.firstName}{" "}
                  {viewingIssue.reporter?.lastName}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(viewingIssue.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{" "}
                  {new Date(viewingIssue.updatedAt).toLocaleString()}
                </div>
                {viewingIssue.dueDate && (
                  <div>
                    <span className="font-medium">Due Date:</span>{" "}
                    {new Date(viewingIssue.dueDate).toLocaleDateString()}
                  </div>
                )}
                {viewingIssue.resolvedAt && (
                  <div>
                    <span className="font-medium">Resolved:</span>{" "}
                    {new Date(viewingIssue.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>

              {viewingIssue.taggedUsers &&
                viewingIssue.taggedUsers.length > 0 && (
                  <div>
                    <span className="font-medium">Tagged users:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {viewingIssue.taggedUsers.map((user) => (
                        <span key={user.id} className="badge badge-outline">
                          {user.firstName} {user.lastName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {viewingIssue.attachments.length > 0 && (
                <div>
                  <span className="font-medium">Attachments:</span>
                  <div className="space-y-1 mt-1">
                    {viewingIssue.attachments.map((attachment, index) => (
                      <div key={index} className="badge badge-neutral">
                        <IoAttach size={14} className="mr-1" />
                        {attachment}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingIssue.resolution && (
                <div className="bg-base-200 p-4 rounded-lg">
                  <span className="font-medium">Resolution:</span>
                  <p className="mt-1">{viewingIssue.resolution}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowViewIssueModal(false);
                  handleEditIssue(viewingIssue);
                }}
              >
                Edit Issue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingIssue && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.2)" }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this issue? This action cannot be
              undone.
            </p>
            <div className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Issue:</span> {deletingIssue.title}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingIssue(null);
                }}
              >
                Cancel
              </button>
              <button className="btn btn-error" onClick={confirmDeleteIssue}>
                Delete Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueReporting;

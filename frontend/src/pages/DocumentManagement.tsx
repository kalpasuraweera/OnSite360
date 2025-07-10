import { useState, useEffect } from "react";
import {
  MdDownload,
  MdDelete,
  MdFolder,
  MdClose,
  MdUploadFile,
} from "react-icons/md";
import { useRoles } from "../hooks/useRoles";
import { useAuthStore } from "../stores/useAuthStore";
import { useUserProjects } from "../hooks/useUsers";

// Mock projects
const mockProjects = [
  { id: "p1", name: "Downtown Tower" },
  { id: "p2", name: "Greenfield Mall" },
  { id: "p3", name: "Harbor Bridge" },
];

type DocumentType = "drawings" | "reports" | "contracts" | "permits" | "photos";

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  projectId: string;
  uploader: {
    id: string;
    name: string;
    roleId: string;
  };
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  drawings: "Drawings & Plannings",
  reports: "Reports",
  contracts: "Contracts",
  permits: "Permits",
  photos: "Photos",
};

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Site Plan.pdf",
    type: "drawings",
    uploadedBy: "Alice",
    uploadedAt: "2024-06-01",
    url: "#",
    projectId: "p1",
    uploader: {
      id: "u1",
      name: "Alice",
      roleId: "b40e4d32-df97-4d49-9a21-21b81bc741f9",
    },
  },
  {
    id: "2",
    name: "Inspection Report.docx",
    type: "reports",
    uploadedBy: "Bob",
    uploadedAt: "2024-06-02",
    url: "#",
    projectId: "p1",
    uploader: {
      id: "u2",
      name: "Bob",
      roleId: "b6d501d4-799d-432a-b484-64d5bfffa16f",
    },
  },
  {
    id: "3",
    name: "Contract_Agreement.pdf",
    type: "contracts",
    uploadedBy: "Charlie",
    uploadedAt: "2024-06-03",
    url: "#",
    projectId: "p2",
    uploader: {
      id: "u3",
      name: "Charlie",
      roleId: "b40e4d32-df97-4d49-9a21-21b81bc741f9",
    },
  },
  {
    id: "4",
    name: "Permit_123.pdf",
    type: "permits",
    uploadedBy: "Diana",
    uploadedAt: "2024-06-04",
    url: "#",
    projectId: "p3",
    uploader: {
      id: "u4",
      name: "Diana",
      roleId: "b6d501d4-799d-432a-b484-64d5bfffa16f",
    },
  },
  {
    id: "5",
    name: "Progress_Photo.jpg",
    type: "photos",
    uploadedBy: "Eve",
    uploadedAt: "2024-06-05",
    url: "/bg2.jpg", // Placeholder image
    projectId: "p1",
    uploader: {
      id: "u5",
      name: "Eve",
      roleId: "b40e4d32-df97-4d49-9a21-21b81bc741f9",
    },
  },
];

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState<DocumentType>("drawings");
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(
    user?.id || ""
  );
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [photoModal, setPhotoModal] = useState<null | Document>(null);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const { data: roles, isLoading: rolesLoading } = useRoles();

  // Set default project when projects load
  useEffect(() => {
    if (
      Array.isArray(projects) &&
      projects.length > 0 &&
      !selectedProject &&
      !projectsLoading
    ) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject, projectsLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setTimeout(() => {
      // For demo: assign uploader as "You" with the first available role
      const firstRole = roles?.[0];
      const newDocs: Document[] = Array.from(files).map((file, idx) => ({
        id: `${Date.now()}-${idx}`,
        name: file.name,
        type: activeTab,
        uploadedBy: "You",
        uploadedAt: new Date().toISOString().slice(0, 10),
        url: "#",
        projectId: selectedProject,
        uploader: {
          id: "you",
          name: "You",
          roleId: firstRole?.id || "",
        },
      }));
      setDocuments((prev) => [...prev, ...newDocs]);
      setUploading(false);
    }, 1000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    }
  };

  // Filter documents by selected project and active tab
  const filteredDocuments = documents.filter(
    (doc) => doc.type === activeTab && doc.projectId === selectedProject
  );

  // Prepare dynamic folders from roles
  const folderedDocuments: Record<string, Document[]> = {};
  const roleList = roles || [];

  if (activeTab !== "photos") {
    roleList.forEach((role) => {
      folderedDocuments[role.id] = [];
    });
    filteredDocuments.forEach((doc) => {
      const folderKey = doc.uploader?.roleId || "";
      if (folderedDocuments[folderKey]) {
        folderedDocuments[folderKey].push(doc);
      }
    });
  }

  return (
    <div className="p-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-gray-500 mt-1">
            Manage and organize all your project documents. Upload, view, and
            export files for each document type.
          </p>
        </div>
        {/* Task view selection */}
        <div className="flex items-center justify-end mb-1">
          <div className="flex gap-4 items-center">
            <select
              className="select select-bordered"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={projectsLoading}
            >
              {projectsLoading ? (
                <option>Loading projects...</option>
              ) : Array.isArray(projects) && projects.length > 0 ? (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              ) : (
                <option>No projects available</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs for document types */}
      <div className="tabs tabs-border mt-6">
        {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
          <button
            key={type}
            className={`tab text-base ${
              activeTab === type ? "tab-active font-bold" : ""
            }`}
            onClick={() => setActiveTab(type)}
          >
            {DOCUMENT_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div
        id="tab-navigation"
        className="bg-base-200 border border-base-300 p-6 rounded-2xl min-h-[400px]"
      >
        {/* Upload & Export Controls */}
        <div className="flex items-center gap-4 mb-6">
          <label className="btn btn-primary flex items-center gap-2 cursor-pointer">
            <MdUploadFile />
            {uploading ? "Uploading..." : "Upload Document"}
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Folders & Files for non-photo tabs */}
        {activeTab !== "photos" ? (
          <div className="w-full">
            {rolesLoading ? (
              <div className="text-center text-gray-500 py-8">
                Loading folders...
              </div>
            ) : openFolder === null ? (
              // Folder list view
              <div className="flex gap-4 w-full flex-wrap">
                {roleList.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    className={`flex items-center w-[350px] justify-between gap-2 mb-8 text-left rounded-2xl bg-base-100 p-5 transition border border-base-300 hover:shadow-xl hover:shadow-neutral/10`}
                    onClick={() => setOpenFolder(role.id)}
                  >
                    <div className="flex items-center gap-2">
                      <MdFolder className="text-4xl text-primary" />
                      <span className="text-lg font-bold">{role.name}</span>
                    </div>
                    <span className="badge badge-neutral">
                      {folderedDocuments[role.id]?.length || 0} files
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              // Inside a folder view
              <div>
                <button
                  className="btn btn-md btn-soft mb-4 flex items-center gap-2"
                  onClick={() => setOpenFolder(null)}
                >
                  {/* Unicode left arrow */}
                  <span className="text-xl">&#8592;</span>
                  Back to Folders
                </button>
                <div className="flex items-center justify-between my-7">
                  <div className="flex gap-2">
                    <MdFolder className="text-2xl text-primary" />
                    <span className="text-lg font-bold">
                      {roleList.find((r) => r.id === openFolder)?.name}
                    </span>
                  </div>

                  <span className="badge badge-neutral">
                    {folderedDocuments[openFolder]?.length || 0} files
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="table w-full bg-base-100 rounded-2xl">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Uploaded By</th>
                        <th>Uploaded At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {folderedDocuments[openFolder] &&
                      folderedDocuments[openFolder].length > 0 ? (
                        folderedDocuments[openFolder].map((doc) => (
                          <tr key={doc.id} className="hover:bg-base-200">
                            <td className="font-medium">{doc.name}</td>
                            <td>{doc.uploadedBy}</td>
                            <td>{doc.uploadedAt}</td>
                            <td>
                              <div className="flex gap-2">
                                <a
                                  href={doc.url}
                                  download={doc.name}
                                  className="btn btn-sm btn-success flex items-center gap-1"
                                  title="Download"
                                >
                                  <MdDownload />
                                  Download
                                </a>
                                <button
                                  className="btn btn-sm btn-error flex items-center gap-1"
                                  onClick={() => handleDelete(doc.id)}
                                  title="Delete"
                                >
                                  <MdDelete />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center text-gray-500 py-8"
                          >
                            No documents in this folder.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Photos tab: show images grid with preview
          <div>
            {filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-base-100 rounded-xl border border-base-300 p-2 flex flex-col items-center cursor-pointer hover:shadow-xl hover:shadow-neutral/10 transition"
                    onClick={() => setPhotoModal(doc)}
                  >
                    <img
                      src={doc.url !== "#" ? doc.url : "/bg2.jpg"}
                      alt={doc.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <div className="text-sm font-medium text-center">
                      {doc.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No photos found for {DOCUMENT_TYPE_LABELS[activeTab]} in this
                project.
              </div>
            )}
            {/* Photo details modal */}
            {photoModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{
                  backdropFilter: "blur(4px)",
                  background: "rgba(0,0,0,0.2)",
                }}
              >
                <div className="bg-base-100 p-6 rounded-2xl shadow-2xl max-w-md w-full relative">
                  <button
                    className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost"
                    onClick={() => setPhotoModal(null)}
                  >
                    <MdClose />
                  </button>
                  <img
                    src={photoModal.url !== "#" ? photoModal.url : "/bg2.jpg"}
                    alt={photoModal.name}
                    className="w-full h-56 object-cover rounded mb-4"
                  />
                  <div className="mb-2">
                    <span className="font-bold">Name:</span> {photoModal.name}
                  </div>
                  <div className="mb-2">
                    <span className="font-bold">Uploaded By:</span>{" "}
                    {photoModal.uploadedBy}
                  </div>
                  <div className="mb-2">
                    <span className="font-bold">Uploaded At:</span>{" "}
                    {photoModal.uploadedAt}
                  </div>
                  <div className="mb-2">
                    <span className="font-bold">Related To:</span> Project{" "}
                    {
                      mockProjects.find((p) => p.id === photoModal.projectId)
                        ?.name
                    }
                  </div>
                  <div className="flex gap-2 mt-4">
                    <a
                      href={photoModal.url}
                      download={photoModal.name}
                      className="btn btn-success flex items-center gap-1"
                    >
                      <MdDownload />
                      Download
                    </a>
                    <button
                      className="btn btn-error flex items-center gap-1"
                      onClick={() => {
                        handleDelete(photoModal.id);
                        setPhotoModal(null);
                      }}
                    >
                      <MdDelete />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManagement;

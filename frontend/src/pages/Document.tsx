import { useState, useEffect, useRef } from "react";
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
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  type DocumentType,
  type Document,
} from "../hooks/useDocuments";
import TagsInput from "../components/TagsInput";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  drawings: "Drawings",
  specifications: "Specifications",
  contracts: "Contracts",
  permits: "Permits",
  reports: "Reports",
  submittals: "Submittals",
  invoices: "Invoices",
  photos: "Photos",
};

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState<DocumentType>("drawings");
  const [photoModal, setPhotoModal] = useState<null | Document>(null);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(
    user?.id || ""
  );
  const [selectedProject, setSelectedProject] = useState<string>("");
  const { data: roles, isLoading: rolesLoading } = useRoles();

  // Document API hooks
  const {
    data: documents = [],
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useDocuments({ projectId: selectedProject });
  console.log(documents);
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: activeTab,
    category: "",
    version: "1.0",
    description: "",
    tags: [] as string[],
    file: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Delete handler
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      await deleteMutation.mutateAsync(id);
      refetchDocuments();
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

  // Upload modal form handlers
  const handleUploadFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setUploadForm((prev) => ({
      ...prev,
      [name]:
        type === "file"
          ? (e.target as HTMLInputElement).files?.[0] || null
          : name === "tags"
          ? prev.tags // TagsInput handles tags as array, do not process here
          : value,
    }));
  };

  const handleUploadModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !uploadForm.file) return;
    setUploading(true);
    const dto = {
      projectId: selectedProject,
      name: uploadForm.name,
      type: uploadForm.type,
      category: uploadForm.category || undefined,
      version: uploadForm.version || undefined,
      description: uploadForm.description || undefined,
      tags: uploadForm.tags.length > 0 ? uploadForm.tags : undefined,
    };
    try {
      await uploadMutation.mutateAsync({ dto, file: uploadForm.file });
      refetchDocuments();
      setShowUploadModal(false);
      setUploadForm({
        name: "",
        type: activeTab,
        category: "",
        version: "1.0",
        description: "",
        tags: [],
        file: null,
      });
    } catch (error) {
      console.error("Failed to upload document:", error);
      // Optionally add user-facing error notification here
    }
    setUploading(false);
  };

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
        {documentsLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* Upload & Export Controls */}
            <div className="flex items-center gap-4 mb-6">
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setShowUploadModal(true)}
                disabled={uploading}
              >
                <MdUploadFile />
                Upload Document
              </button>
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
                                <td>{doc.uploader?.name || "-"}</td>
                                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                <td>
                                  <div className="flex gap-2">
                                    <a
                                      href={`${import.meta.env.VITE_DOCUMENTS_URL}${doc.url}`}
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
                          src={
                            doc.url !== "#"
                              ? `${import.meta.env.VITE_DOCUMENTS_URL}${doc.url}`
                              : "/bg2.jpg"
                          }
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
                        src={
                          photoModal.url !== "#"
                            ? `${import.meta.env.VITE_DOCUMENTS_URL}${photoModal.url}`
                            : "/bg2.jpg"
                        }
                        alt={photoModal.name}
                        className="w-full h-56 object-cover rounded mb-4"
                      />
                      <div className="mb-2">
                        <span className="font-bold">Name:</span> {photoModal.name}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Uploaded By:</span>{" "}
                        {photoModal.uploader?.name || "-"}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Uploaded At:</span>{" "}
                        {new Date(photoModal.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Related To:</span> Project{" "}
                        {photoModal.projectId}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <a
                          href={`${import.meta.env.VITE_DOCUMENTS_URL}${photoModal.url}`}
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
          </>
        )}
      </div>

      {showUploadModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg mb-4">Upload Document</h2>
            <form onSubmit={handleUploadModalSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  name="name"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.name}
                  onChange={handleUploadFieldChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  name="type"
                  className="select select-bordered"
                  value={uploadForm.type}
                  onChange={handleUploadFieldChange}
                  required
                >
                  {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
                    <option key={type} value={type}>{DOCUMENT_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <input
                  name="category"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.category}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Version</span>
                </label>
                <input
                  name="version"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.version}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered"
                  value={uploadForm.description}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>
                <TagsInput
                  value={uploadForm.tags}
                  onChange={tags => setUploadForm(prev => ({ ...prev, tags }))}
                  placeholder="Type and press Enter to add tags"
                  disabled={uploading}
                  maxTags={10}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">File</span>
                </label>
                <input
                  name="file"
                  type="file"
                  className="file-input file-input-bordered"
                  ref={fileInputRef}
                  onChange={handleUploadFieldChange}
                  required
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
import { useState, useEffect, useRef } from "react";
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
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  type DocumentType,
  type Document,
} from "../hooks/useDocuments";
import TagsInput from "../components/TagsInput";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  drawings: "Drawings",
  specifications: "Specifications",
  contracts: "Contracts",
  permits: "Permits",
  reports: "Reports",
  submittals: "Submittals",
  invoices: "Invoices",
  photos: "Photos",
};

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState<DocumentType>("drawings");
  const [photoModal, setPhotoModal] = useState<null | Document>(null);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(
    user?.id || ""
  );
  const [selectedProject, setSelectedProject] = useState<string>("");
  const { data: roles, isLoading: rolesLoading } = useRoles();

  // Document API hooks
  const {
    data: documents = [],
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useDocuments({ projectId: selectedProject });
  console.log(documents);
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: activeTab,
    category: "",
    version: "1.0",
    description: "",
    tags: [] as string[],
    file: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Delete handler
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      await deleteMutation.mutateAsync(id);
      refetchDocuments();
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

  // Upload modal form handlers
  const handleUploadFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setUploadForm((prev) => ({
      ...prev,
      [name]:
        type === "file"
          ? (e.target as HTMLInputElement).files?.[0] || null
          : name === "tags"
          ? prev.tags // TagsInput handles tags as array, do not process here
          : value,
    }));
  };

  const handleUploadModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !uploadForm.file) return;
    setUploading(true);
    const dto = {
      projectId: selectedProject,
      name: uploadForm.name,
      type: uploadForm.type,
      category: uploadForm.category || undefined,
      version: uploadForm.version || undefined,
      description: uploadForm.description || undefined,
      tags: uploadForm.tags.length > 0 ? uploadForm.tags : undefined,
    };
    try {
      await uploadMutation.mutateAsync({ dto, file: uploadForm.file });
      refetchDocuments();
      setShowUploadModal(false);
      setUploadForm({
        name: "",
        type: activeTab,
        category: "",
        version: "1.0",
        description: "",
        tags: [],
        file: null,
      });
    } catch (error) {
      console.error("Failed to upload document:", error);
      // Optionally add user-facing error notification here
    }
    setUploading(false);
  };

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
        {documentsLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* Upload & Export Controls */}
            <div className="flex items-center gap-4 mb-6">
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setShowUploadModal(true)}
                disabled={uploading}
              >
                <MdUploadFile />
                Upload Document
              </button>
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
                                <td>{doc.uploader?.name || "-"}</td>
                                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                <td>
                                  <div className="flex gap-2">
                                    <a
                                      href={`${import.meta.env.VITE_DOCUMENTS_URL}${doc.url}`}
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
                          src={
                            doc.url !== "#"
                              ? `${import.meta.env.VITE_DOCUMENTS_URL}${doc.url}`
                              : "/bg2.jpg"
                          }
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
                        src={
                          photoModal.url !== "#"
                            ? `${import.meta.env.VITE_DOCUMENTS_URL}${photoModal.url}`
                            : "/bg2.jpg"
                        }
                        alt={photoModal.name}
                        className="w-full h-56 object-cover rounded mb-4"
                      />
                      <div className="mb-2">
                        <span className="font-bold">Name:</span> {photoModal.name}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Uploaded By:</span>{" "}
                        {photoModal.uploader?.name || "-"}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Uploaded At:</span>{" "}
                        {new Date(photoModal.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Related To:</span> Project{" "}
                        {photoModal.projectId}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <a
                          href={`${import.meta.env.VITE_DOCUMENTS_URL}${photoModal.url}`}
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
          </>
        )}
      </div>

      {showUploadModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg mb-4">Upload Document</h2>
            <form onSubmit={handleUploadModalSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  name="name"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.name}
                  onChange={handleUploadFieldChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  name="type"
                  className="select select-bordered"
                  value={uploadForm.type}
                  onChange={handleUploadFieldChange}
                  required
                >
                  {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
                    <option key={type} value={type}>{DOCUMENT_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <input
                  name="category"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.category}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Version</span>
                </label>
                <input
                  name="version"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.version}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered"
                  value={uploadForm.description}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>
                <TagsInput
                  value={uploadForm.tags}
                  onChange={tags => setUploadForm(prev => ({ ...prev, tags }))}
                  placeholder="Type and press Enter to add tags"
                  disabled={uploading}
                  maxTags={10}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">File</span>
                </label>
                <input
                  name="file"
                  type="file"
                  className="file-input file-input-bordered"
                  ref={fileInputRef}
                  onChange={handleUploadFieldChange}
                  required
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
import { useState, useEffect, useRef } from "react";
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
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  type DocumentType,
  type Document,
} from "../hooks/useDocuments";
import TagsInput from "../components/TagsInput";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  drawings: "Drawings",
  specifications: "Specifications",
  contracts: "Contracts",
  permits: "Permits",
  reports: "Reports",
  submittals: "Submittals",
  invoices: "Invoices",
  photos: "Photos",
};

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState<DocumentType>("drawings");
  const [photoModal, setPhotoModal] = useState<null | Document>(null);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(
    user?.id || ""
  );
  const [selectedProject, setSelectedProject] = useState<string>("");
  const { data: roles, isLoading: rolesLoading } = useRoles();

  // Document API hooks
  const {
    data: documents = [],
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useDocuments({ projectId: selectedProject });
  console.log(documents);
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: activeTab,
    category: "",
    version: "1.0",
    description: "",
    tags: [] as string[],
    file: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Delete handler
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      await deleteMutation.mutateAsync(id);
      refetchDocuments();
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

  // Upload modal form handlers
  const handleUploadFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setUploadForm((prev) => ({
      ...prev,
      [name]:
        type === "file"
          ? (e.target as HTMLInputElement).files?.[0] || null
          : name === "tags"
          ? prev.tags // TagsInput handles tags as array, do not process here
          : value,
    }));
  };

  const handleUploadModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !uploadForm.file) return;
    setUploading(true);
    const dto = {
      projectId: selectedProject,
      name: uploadForm.name,
      type: uploadForm.type,
      category: uploadForm.category || undefined,
      version: uploadForm.version || undefined,
      description: uploadForm.description || undefined,
      tags: uploadForm.tags.length > 0 ? uploadForm.tags : undefined,
    };
    try {
      await uploadMutation.mutateAsync({ dto, file: uploadForm.file });
      refetchDocuments();
      setShowUploadModal(false);
      setUploadForm({
        name: "",
        type: activeTab,
        category: "",
        version: "1.0",
        description: "",
        tags: [],
        file: null,
      });
    } catch (error) {
      console.error("Failed to upload document:", error);
      // Optionally add user-facing error notification here
    }
    setUploading(false);
  };

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
        {documentsLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* Upload & Export Controls */}
            <div className="flex items-center gap-4 mb-6">
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setShowUploadModal(true)}
                disabled={uploading}
              >
                <MdUploadFile />
                Upload Document
              </button>
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
                                <td>{doc.uploader?.name || "-"}</td>
                                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                <td>
                                  <div className="flex gap-2">
                                    <a
                                      href={`${import.meta.env.VITE_DOCUMENTS_URL}${doc.url}`}
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
                          src={
                            doc.url !== "#"
                              ? `${import.meta.env.VITE_DOCUMENTS_URL}${doc.url}`
                              : "/bg2.jpg"
                          }
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
                        src={
                          photoModal.url !== "#"
                            ? `${import.meta.env.VITE_DOCUMENTS_URL}${photoModal.url}`
                            : "/bg2.jpg"
                        }
                        alt={photoModal.name}
                        className="w-full h-56 object-cover rounded mb-4"
                      />
                      <div className="mb-2">
                        <span className="font-bold">Name:</span> {photoModal.name}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Uploaded By:</span>{" "}
                        {photoModal.uploader?.name || "-"}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Uploaded At:</span>{" "}
                        {new Date(photoModal.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Related To:</span> Project{" "}
                        {photoModal.projectId}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <a
                          href={`${import.meta.env.VITE_DOCUMENTS_URL}${photoModal.url}`}
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
          </>
        )}
      </div>

      {showUploadModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg mb-4">Upload Document</h2>
            <form onSubmit={handleUploadModalSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  name="name"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.name}
                  onChange={handleUploadFieldChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  name="type"
                  className="select select-bordered"
                  value={uploadForm.type}
                  onChange={handleUploadFieldChange}
                  required
                >
                  {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
                    <option key={type} value={type}>{DOCUMENT_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <input
                  name="category"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.category}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Version</span>
                </label>
                <input
                  name="version"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.version}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered"
                  value={uploadForm.description}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>
                <TagsInput
                  value={uploadForm.tags}
                  onChange={tags => setUploadForm(prev => ({ ...prev, tags }))}
                  placeholder="Type and press Enter to add tags"
                  disabled={uploading}
                  maxTags={10}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">File</span>
                </label>
                <input
                  name="file"
                  type="file"
                  className="file-input file-input-bordered"
                  ref={fileInputRef}
                  onChange={handleUploadFieldChange}
                  required
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;

import { useState, useEffect, useRef } from "react";
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
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  type DocumentType,
  type Document,
} from "../hooks/useDocuments";
import TagsInput from "../components/TagsInput";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  drawings: "Drawings",
  specifications: "Specifications",
  contracts: "Contracts",
  permits: "Permits",
  reports: "Reports",
  submittals: "Submittals",
  invoices: "Invoices",
  photos: "Photos",
};

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState<DocumentType>("drawings");
  const [photoModal, setPhotoModal] = useState<null | Document>(null);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(
    user?.id || ""
  );
  const [selectedProject, setSelectedProject] = useState<string>("");
  const { data: roles, isLoading: rolesLoading } = useRoles();

  // Document API hooks
  const {
    data: documents = [],
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useDocuments({ projectId: selectedProject });
  console.log(documents);
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: activeTab,
    category: "",
    version: "1.0",
    description: "",
    tags: [] as string[],
    file: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Delete handler
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      await deleteMutation.mutateAsync(id);
      refetchDocuments();
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

  // Upload modal form handlers
  const handleUploadFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setUploadForm((prev) => ({
      ...prev,
      [name]:
        type === "file"
          ? (e.target as HTMLInputElement).files?.[0] || null
          : name === "tags"
          ? prev.tags // TagsInput handles tags as array, do not process here
          : value,
    }));
  };

  const handleUploadModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !uploadForm.file) return;
    setUploading(true);
    const dto = {
      projectId: selectedProject,
      name: uploadForm.name,
      type: uploadForm.type,
      category: uploadForm.category || undefined,
      version: uploadForm.version || undefined,
      description: uploadForm.description || undefined,
      tags: uploadForm.tags.length > 0 ? uploadForm.tags : undefined,
    };
    try {
      await uploadMutation.mutateAsync({ dto, file: uploadForm.file });
      refetchDocuments();
      setShowUploadModal(false);
      setUploadForm({
        name: "",
        type: activeTab,
        category: "",
        version: "1.0",
        description: "",
        tags: [],
        file: null,
      });
    } catch (error) {
      console.error("Failed to upload document:", error);
      // Optionally add user-facing error notification here
    }
    setUploading(false);
  };

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
        {documentsLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* Upload & Export Controls */}
            <div className="flex items-center gap-4 mb-6">
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setShowUploadModal(true)}
                disabled={uploading}
              >
                <MdUploadFile />
                Upload Document
              </button>
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
                                <td>{doc.uploader?.name || "-"}</td>
                                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                <td>
                                  <div className="flex gap-2">
                                    <a
                                      href={`${import.meta.env.VITE_DOCUMENTS_URL}${doc.url}`}
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
                          src={
                            doc.url !== "#"
                              ? `${import.meta.env.VITE_DOCUMENTS_URL}${doc.url}`
                              : "/bg2.jpg"
                          }
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
                        src={
                          photoModal.url !== "#"
                            ? `${import.meta.env.VITE_DOCUMENTS_URL}${photoModal.url}`
                            : "/bg2.jpg"
                        }
                        alt={photoModal.name}
                        className="w-full h-56 object-cover rounded mb-4"
                      />
                      <div className="mb-2">
                        <span className="font-bold">Name:</span> {photoModal.name}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Uploaded By:</span>{" "}
                        {photoModal.uploader?.name || "-"}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Uploaded At:</span>{" "}
                        {new Date(photoModal.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Related To:</span> Project{" "}
                        {photoModal.projectId}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <a
                          href={`${import.meta.env.VITE_DOCUMENTS_URL}${photoModal.url}`}
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
          </>
        )}
      </div>

      {showUploadModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg mb-4">Upload Document</h2>
            <form onSubmit={handleUploadModalSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  name="name"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.name}
                  onChange={handleUploadFieldChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  name="type"
                  className="select select-bordered"
                  value={uploadForm.type}
                  onChange={handleUploadFieldChange}
                  required
                >
                  {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
                    <option key={type} value={type}>{DOCUMENT_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <input
                  name="category"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.category}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Version</span>
                </label>
                <input
                  name="version"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.version}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered"
                  value={uploadForm.description}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>
                <TagsInput
                  value={uploadForm.tags}
                  onChange={tags => setUploadForm(prev => ({ ...prev, tags }))}
                  placeholder="Type and press Enter to add tags"
                  disabled={uploading}
                  maxTags={10}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">File</span>
                </label>
                <input
                  name="file"
                  type="file"
                  className="file-input file-input-bordered"
                  ref={fileInputRef}
                  onChange={handleUploadFieldChange}
                  required
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;


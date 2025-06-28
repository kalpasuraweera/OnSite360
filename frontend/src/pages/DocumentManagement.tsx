import { useState } from "react";
import {
  MdUploadFile,
  MdDownload,
  MdDelete,
  MdFileDownload,
} from "react-icons/md";

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
  },
  {
    id: "2",
    name: "Inspection Report.docx",
    type: "reports",
    uploadedBy: "Bob",
    uploadedAt: "2024-06-02",
    url: "#",
    projectId: "p1",
  },
  {
    id: "3",
    name: "Contract_Agreement.pdf",
    type: "contracts",
    uploadedBy: "Charlie",
    uploadedAt: "2024-06-03",
    url: "#",
    projectId: "p2",
  },
  {
    id: "4",
    name: "Permit_123.pdf",
    type: "permits",
    uploadedBy: "Diana",
    uploadedAt: "2024-06-04",
    url: "#",
    projectId: "p3",
  },
  {
    id: "5",
    name: "Progress_Photo.jpg",
    type: "photos",
    uploadedBy: "Eve",
    uploadedAt: "2024-06-05",
    url: "#",
    projectId: "p1",
  },
  // ...add more mock documents as needed
];

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState<DocumentType>("drawings");
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [uploading, setUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>(
    mockProjects[0].id
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      const newDocs: Document[] = Array.from(files).map((file, idx) => ({
        id: `${Date.now()}-${idx}`,
        name: file.name,
        type: activeTab,
        uploadedBy: "You",
        uploadedAt: new Date().toISOString().slice(0, 10),
        url: "#",
        projectId: selectedProject,
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

  const handleExport = () => {
    // Simulate export (CSV)
    const docs = documents.filter(
      (doc) => doc.type === activeTab && doc.projectId === selectedProject
    );
    const csv =
      "Name,Uploaded By,Uploaded At\n" +
      docs.map((d) => `${d.name},${d.uploadedBy},${d.uploadedAt}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${DOCUMENT_TYPE_LABELS[activeTab]}_${
      mockProjects.find((p) => p.id === selectedProject)?.name || "Project"
    }_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter documents by selected project and active tab
  const filteredDocuments = documents.filter(
    (doc) => doc.type === activeTab && doc.projectId === selectedProject
  );

  return (
    <div className="p-8">
      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        {/* Heading with project selector */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-3xl font-bold">Document Management</h1>
            <p className="text-gray-500 mt-1">
              Manage and organize all your project documents. Upload, view, and
              export files for each document type.
            </p>
          </div>
          <div>
            <select
              className="select select-bordered"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {mockProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs for document types */}
        <div className="tabs tabs-border mb-4 mt-6">
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

        {/* Upload & Export Controls */}
        <div className="flex items-center gap-4 mb-4">
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
          <button
            className="btn btn-outline flex items-center gap-2"
            onClick={handleExport}
          >
            <MdFileDownload />
            Export List (CSV)
          </button>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-100 border border-base-300 rounded-2xl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Uploaded By</th>
                <th>Uploaded At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
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
                  <td colSpan={4} className="text-center text-gray-500 py-8">
                    No documents found for {DOCUMENT_TYPE_LABELS[activeTab]} in
                    this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;

import { useState } from "react";
import { MdPersonAdd, MdEdit, MdDelete, MdFileDownload } from "react-icons/md";

// Mock projects
const mockProjects = [
  { id: "p1", name: "Downtown Tower" },
  { id: "p2", name: "Greenfield Mall" },
  { id: "p3", name: "Harbor Bridge" },
];

type WorkforceTab = "all" | "assignments" | "attendance" | "skills" | "safety";

const WORKFORCE_TAB_LABELS: Record<WorkforceTab, string> = {
  all: "All Staff",
  assignments: "Assignments",
  attendance: "Attendance",
  skills: "Skills Matrix",
  safety: "Safety Records",
};

interface Worker {
  id: string;
  name: string;
  role: string;
  assignedTask: string;
  attendance: string;
  skills: string[];
  safetyStatus: string;
  projectId: string;
}

const mockWorkers: Worker[] = [
  {
    id: "1",
    name: "Alice Johnson",
    role: "Site Engineer",
    assignedTask: "Foundation Inspection",
    attendance: "Present",
    skills: ["Inspection", "Surveying"],
    safetyStatus: "Cleared",
    projectId: "p1",
  },
  {
    id: "2",
    name: "Bob Smith",
    role: "Foreman",
    assignedTask: "Material Delivery",
    attendance: "Absent",
    skills: ["Logistics", "Team Lead"],
    safetyStatus: "Pending",
    projectId: "p1",
  },
  {
    id: "3",
    name: "Charlie Lee",
    role: "Electrician",
    assignedTask: "Wiring",
    attendance: "Present",
    skills: ["Wiring", "Safety"],
    safetyStatus: "Cleared",
    projectId: "p2",
  },
  {
    id: "4",
    name: "Diana Green",
    role: "Safety Officer",
    assignedTask: "Safety Audit",
    attendance: "Present",
    skills: ["Safety", "First Aid"],
    safetyStatus: "Cleared",
    projectId: "p3",
  },
];

const WorkforceManagement = () => {
  const [activeTab, setActiveTab] = useState<WorkforceTab>("all");
  const [selectedProject, setSelectedProject] = useState<string>(
    mockProjects[0].id
  );

  // Filter workers by project
  const filteredWorkers = mockWorkers.filter(
    (w) => w.projectId === selectedProject || activeTab === "all"
  );

  const handleExport = () => {
    const workers = filteredWorkers;
    const csv =
      "Name,Role,Assigned Task,Attendance,Skills,Safety Status\n" +
      workers
        .map(
          (w) =>
            `${w.name},${w.role},${w.assignedTask},${
              w.attendance
            },"${w.skills.join("|")}",${w.safetyStatus}`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Workforce_${
      mockProjects.find((p) => p.id === selectedProject)?.name || "Project"
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        {/* Heading with project selector */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-3xl font-bold">Workforce Management</h1>
            <p className="text-gray-500 mt-1">
              Manage staff assignments, attendance, skills, and safety for your
              projects.
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

        {/* Tabs for workforce management */}
        <div className="tabs tabs-border mb-4 mt-6">
          {(Object.keys(WORKFORCE_TAB_LABELS) as WorkforceTab[]).map((tab) => (
            <button
              key={tab}
              className={`tab text-base ${
                activeTab === tab ? "tab-active font-bold" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {WORKFORCE_TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-4">
          <button className="btn btn-primary flex items-center gap-2">
            <MdPersonAdd />
            Add Worker
          </button>
          <button
            className="btn btn-outline flex items-center gap-2"
            onClick={handleExport}
          >
            <MdFileDownload />
            Export Workforce (CSV)
          </button>
        </div>

        {/* Workforce Table */}
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-100 border border-base-300 rounded-2xl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                {activeTab === "assignments" && <th>Assigned Task</th>}
                {activeTab === "attendance" && <th>Attendance</th>}
                {activeTab === "skills" && <th>Skills</th>}
                {activeTab === "safety" && <th>Safety Status</th>}
                {activeTab === "all" && (
                  <>
                    <th>Assigned Task</th>
                    <th>Attendance</th>
                    <th>Skills</th>
                    <th>Safety Status</th>
                  </>
                )}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length > 0 ? (
                filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-base-200">
                    <td className="font-medium">{worker.name}</td>
                    <td>{worker.role}</td>
                    {activeTab === "assignments" && (
                      <td>{worker.assignedTask}</td>
                    )}
                    {activeTab === "attendance" && (
                      <td>
                        <span
                          className={`badge ${
                            worker.attendance === "Present"
                              ? "badge-success"
                              : "badge-error"
                          }`}
                        >
                          {worker.attendance}
                        </span>
                      </td>
                    )}
                    {activeTab === "skills" && (
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {worker.skills.map((skill) => (
                            <span key={skill} className="badge badge-neutral">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}
                    {activeTab === "safety" && (
                      <td>
                        <span
                          className={`badge ${
                            worker.safetyStatus === "Cleared"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {worker.safetyStatus}
                        </span>
                      </td>
                    )}
                    {activeTab === "all" && (
                      <>
                        <td>{worker.assignedTask}</td>
                        <td>
                          <span
                            className={`badge ${
                              worker.attendance === "Present"
                                ? "badge-success"
                                : "badge-error"
                            }`}
                          >
                            {worker.attendance}
                          </span>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {worker.skills.map((skill) => (
                              <span key={skill} className="badge badge-neutral">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              worker.safetyStatus === "Cleared"
                                ? "badge-success"
                                : "badge-warning"
                            }`}
                          >
                            {worker.safetyStatus}
                          </span>
                        </td>
                      </>
                    )}
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          title="Edit Worker"
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          title="Delete Worker"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      activeTab === "all"
                        ? 8
                        : activeTab === "assignments" ||
                          activeTab === "attendance" ||
                          activeTab === "skills" ||
                          activeTab === "safety"
                        ? 4
                        : 3
                    }
                    className="text-center text-gray-500 py-8"
                  >
                    No workforce data found for this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-title">Total Staff</div>
            <div className="stat-value text-primary">
              {
                mockWorkers.filter((w) => w.projectId === selectedProject)
                  .length
              }
            </div>
            <div className="stat-desc">All roles</div>
          </div>
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-title">Present</div>
            <div className="stat-value text-success">
              {
                mockWorkers.filter(
                  (w) =>
                    w.projectId === selectedProject &&
                    w.attendance === "Present"
                ).length
              }
            </div>
            <div className="stat-desc">On site</div>
          </div>
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-title">Cleared Safety</div>
            <div className="stat-value text-success">
              {
                mockWorkers.filter(
                  (w) =>
                    w.projectId === selectedProject &&
                    w.safetyStatus === "Cleared"
                ).length
              }
            </div>
            <div className="stat-desc">Safety checks</div>
          </div>
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-title">Unique Skills</div>
            <div className="stat-value text-info">
              {
                Array.from(
                  new Set(
                    mockWorkers
                      .filter((w) => w.projectId === selectedProject)
                      .flatMap((w) => w.skills)
                  )
                ).length
              }
            </div>
            <div className="stat-desc">Skill diversity</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkforceManagement;

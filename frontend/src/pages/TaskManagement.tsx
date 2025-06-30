import { useState } from "react";
import {
  MdAddTask,
  MdEdit,
  MdDelete,
  MdDownload,
  MdFileDownload,
} from "react-icons/md";

// Mock projects
const mockProjects = [
  { id: "p1", name: "Downtown Tower" },
  { id: "p2", name: "Greenfield Mall" },
  { id: "p3", name: "Harbor Bridge" },
];

type TaskType =
  | "all"
  | "site"
  | "procurement"
  | "inspection"
  | "handover"
  | "custom";

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  all: "All Tasks",
  site: "Site Tasks",
  procurement: "Procurement",
  inspection: "Inspections",
  handover: "Handover",
  custom: "Custom Tasks",
};

interface Task {
  id: string;
  name: string;
  type: TaskType;
  assignedTo: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Delayed";
  projectId: string;
  description?: string;
}

const mockTasks: Task[] = [
  {
    id: "1",
    name: "Excavation",
    type: "site",
    assignedTo: "Alice",
    dueDate: "2024-07-05",
    status: "Completed",
    projectId: "p1",
    description: "Complete site excavation for foundation.",
  },
  {
    id: "2",
    name: "Order Concrete",
    type: "procurement",
    assignedTo: "Bob",
    dueDate: "2024-07-03",
    status: "Completed",
    projectId: "p1",
    description: "Order concrete for foundation pour.",
  },
  {
    id: "3",
    name: "Foundation Inspection",
    type: "inspection",
    assignedTo: "Diana",
    dueDate: "2024-07-10",
    status: "Pending",
    projectId: "p1",
    description: "Schedule and complete foundation inspection.",
  },
  {
    id: "4",
    name: "Material Delivery",
    type: "procurement",
    assignedTo: "Eve",
    dueDate: "2024-07-08",
    status: "In Progress",
    projectId: "p2",
    description: "Receive and check steel beams delivery.",
  },
  {
    id: "5",
    name: "Final Handover",
    type: "handover",
    assignedTo: "Charlie",
    dueDate: "2024-08-15",
    status: "Pending",
    projectId: "p3",
    description: "Prepare documents and site for final handover.",
  },
  {
    id: "6",
    name: "Custom Task Example",
    type: "custom",
    assignedTo: "Mike",
    dueDate: "2024-07-20",
    status: "Delayed",
    projectId: "p1",
    description: "Any custom task for project needs.",
  },
];

const TaskManagement = () => {
  const [activeTab, setActiveTab] = useState<TaskType>("all");
  const [selectedProject, setSelectedProject] = useState<string>(
    mockProjects[0].id
  );

  // Filter tasks by project and type
  const filteredTasks = mockTasks.filter(
    (task) =>
      task.projectId === selectedProject &&
      (activeTab === "all" ? true : task.type === activeTab)
  );

  const handleExport = () => {
    const tasks = filteredTasks;
    const csv =
      "Name,Type,Assigned To,Due Date,Status,Description\n" +
      tasks
        .map(
          (t) =>
            `${t.name},${TASK_TYPE_LABELS[t.type]},${t.assignedTo},${
              t.dueDate
            },${t.status},${t.description || ""}`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Tasks_${
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
            <h1 className="text-3xl font-bold">Task Management</h1>
            <p className="text-gray-500 mt-1">
              Manage all project tasks: site work, procurement, inspections,
              handover, and custom tasks.
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

        {/* Tabs for task types */}
        <div className="tabs tabs-border mb-4 mt-6">
          {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((type) => (
            <button
              key={type}
              className={`tab text-base ${
                activeTab === type ? "tab-active font-bold" : ""
              }`}
              onClick={() => setActiveTab(type)}
            >
              {TASK_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-4">
          <button className="btn btn-primary flex items-center gap-2">
            <MdAddTask />
            Add Task
          </button>
          <button
            className="btn btn-outline flex items-center gap-2"
            onClick={handleExport}
          >
            <MdFileDownload />
            Export Tasks (CSV)
          </button>
        </div>

        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-100 border border-base-300 rounded-2xl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-base-200">
                    <td className="font-medium">{task.name}</td>
                    <td>{TASK_TYPE_LABELS[task.type]}</td>
                    <td>{task.assignedTo}</td>
                    <td>{task.dueDate}</td>
                    <td>
                      <span
                        className={`badge ${
                          task.status === "Completed"
                            ? "badge-success"
                            : task.status === "In Progress"
                            ? "badge-warning"
                            : task.status === "Delayed"
                            ? "badge-error"
                            : "badge-neutral"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="max-w-xs truncate">{task.description}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-success"
                          title="Download Task"
                        >
                          <MdDownload />
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          title="Edit Task"
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          title="Delete Task"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-8">
                    No tasks found for {TASK_TYPE_LABELS[activeTab]} in this
                    project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-title">Total Tasks</div>
            <div className="stat-value text-primary">
              {mockTasks.filter((t) => t.projectId === selectedProject).length}
            </div>
            <div className="stat-desc">All types</div>
          </div>
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-title">Completed</div>
            <div className="stat-value text-success">
              {
                mockTasks.filter(
                  (t) =>
                    t.projectId === selectedProject && t.status === "Completed"
                ).length
              }
            </div>
            <div className="stat-desc">Done</div>
          </div>
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-title">In Progress</div>
            <div className="stat-value text-warning">
              {
                mockTasks.filter(
                  (t) =>
                    t.projectId === selectedProject &&
                    t.status === "In Progress"
                ).length
              }
            </div>
            <div className="stat-desc">Ongoing</div>
          </div>
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-title">Delayed</div>
            <div className="stat-value text-error">
              {
                mockTasks.filter(
                  (t) =>
                    t.projectId === selectedProject && t.status === "Delayed"
                ).length
              }
            </div>
            <div className="stat-desc">Attention needed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;

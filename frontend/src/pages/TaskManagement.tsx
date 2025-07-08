import { useState, useEffect, useCallback } from "react";
import {
  MdAddTask,
  MdEdit,
  MdDelete,
  MdDownload,
  MdFileDownload,
  MdViewColumn,
  MdViewList,
} from "react-icons/md";
import { ControlledBoard, moveCard } from "@caldwell619/react-kanban";
import type {
  KanbanBoard,
  OnDragEndNotification,
  Card,
  Column,
} from "@caldwell619/react-kanban";
import "../styles/kanban.css";

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

interface Task extends Card {
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
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Create kanban board structure
  const createKanbanBoard = useCallback((): KanbanBoard<Task> => {
    const filteredTasks = mockTasks.filter(
      (task) =>
        task.projectId === selectedProject &&
        (activeTab === "all" ? true : task.type === activeTab)
    );

    const columns: Column<Task>[] = [
      {
        id: "pending",
        title: "Pending",
        cards: filteredTasks.filter((task) => task.status === "Pending"),
      },
      {
        id: "in-progress",
        title: "In Progress",
        cards: filteredTasks.filter((task) => task.status === "In Progress"),
      },
      {
        id: "completed",
        title: "Completed",
        cards: filteredTasks.filter((task) => task.status === "Completed"),
      },
      {
        id: "delayed",
        title: "Delayed",
        cards: filteredTasks.filter((task) => task.status === "Delayed"),
      },
    ];

    return { columns };
  }, [selectedProject, activeTab]);

  const [board, setBoard] = useState<KanbanBoard<Task>>(() =>
    createKanbanBoard()
  );

  // Update board when project or tab changes
  useEffect(() => {
    setBoard(createKanbanBoard());
  }, [createKanbanBoard]);

  const handleCardMove: OnDragEndNotification<Task> = (
    _card,
    source,
    destination
  ) => {
    setBoard((currentBoard) => {
      return moveCard(currentBoard, source, destination);
    });
  };

  // Filter tasks by project and type for table view
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

  const renderCard = (card: Task) => {
    const getDueDateStatus = (dueDate: string) => {
      const today = new Date();
      const due = new Date(dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { color: "text-error", text: "Overdue" };
      if (diffDays <= 3) return { color: "text-warning", text: "Due soon" };
      return { color: "text-success", text: "On track" };
    };

    const dueDateStatus = getDueDateStatus(card.dueDate);

    return (
      <div className="bg-base-200 min-w-[260px] shadow-xl shadow-base-300 mb-2 border border-base-300 rounded-xl p-1 transition-all duration-200 hover:shadow-2xl shadow-base-300">
        <div className="flex bg-base-300 p-2 w-full rounded-t-xl justify-between items-start mb-3">
          <h3 className="font-semibold text-sm text-base-content line-clamp-2 flex-1">
            {card.name}
          </h3>
          <div className="flex gap-1 ml-2">
            <button
              className="btn btn-xs btn-ghost opacity-50 hover:opacity-100 hover:btn-success"
              title="Download Task"
            >
              <MdDownload className="text-xs" />
            </button>
            <button
              className="btn btn-xs btn-ghost opacity-50 hover:opacity-100 hover:btn-primary"
              title="Edit Task"
            >
              <MdEdit className="text-xs" />
            </button>
            <button
              className="btn btn-xs btn-ghost opacity-50 hover:opacity-100 hover:btn-error"
              title="Delete Task"
            >
              <MdDelete className="text-xs" />
            </button>
          </div>
        </div>
        {/* Card Content */}
        <div className="space-y-2 p-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-base-content/60">Type:</span>
            <span className="badge badge-sm badge-outline">
              {TASK_TYPE_LABELS[card.type]}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-base-content/60">Assigned:</span>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {card.assignedTo.charAt(0)}
                </span>
              </div>
              <span className="text-xs font-medium">{card.assignedTo}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-base-content/60">Due:</span>
            <div className="flex items-center gap-1">
              <span className="text-xs">{card.dueDate}</span>
              <span className={`text-xs font-medium ${dueDateStatus.color}`}>
                ({dueDateStatus.text})
              </span>
            </div>
          </div>

          {card.description && (
            <div className="mt-3 pt-2 border-t border-base-300">
              <p className="text-xs text-base-content/70 line-clamp-2">
                {card.description}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-gray-500 mt-1">
            Manage all project tasks: site work, procurement, inspections,
            handover, and custom tasks.
          </p>
        </div>
        {/* Task view selection */}
        <div className="flex items-center justify-end mb-1">
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <button
                className={`btn btn-sm ${
                  viewMode === "kanban" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setViewMode("kanban")}
              >
                <MdViewColumn />
                Kanban
              </button>
              <button
                className={`btn btn-sm ${
                  viewMode === "table" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setViewMode("table")}
              >
                <MdViewList />
                Table
              </button>
            </div>
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
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="p-5 bg-base-200 rounded-xl border border-base-300">
          <div className="font-semibold">Total Tasks</div>
          <div className="stat-value text-primary">
            {mockTasks.filter((t) => t.projectId === selectedProject).length}
          </div>
          <div className="stat-desc">All types</div>
        </div>
        <div className="p-5 bg-base-200 rounded-xl border border-base-300">
          <div className="font-semibold">Completed</div>
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
        <div className="p-5 bg-base-200 rounded-xl border border-base-300">
          <div className="font-semibold">In Progress</div>
          <div className="stat-value text-warning">
            {
              mockTasks.filter(
                (t) =>
                  t.projectId === selectedProject && t.status === "In Progress"
              ).length
            }
          </div>
          <div className="stat-desc">Ongoing</div>
        </div>
        <div className="p-5 bg-base-200 rounded-xl border border-base-300">
          <div className="font-semibold">Delayed</div>
          <div className="stat-value text-error">
            {
              mockTasks.filter(
                (t) => t.projectId === selectedProject && t.status === "Delayed"
              ).length
            }
          </div>
          <div className="stat-desc">Attention needed</div>
        </div>
      </div>

      {/* Tabs for task types */}
      <div className="tabs tabs-border mt-6">
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
      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
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

        {/* Kanban Board or Table View */}
        {viewMode === "kanban" ? (
          <div className="kanban-container">
            <ControlledBoard<Task>
              onCardDragEnd={handleCardMove}
              renderCard={renderCard}
              renderColumnHeader={({ title, cards }) => (
                <div
                  className={`flex justify-between items-center mb-4 p-3 rounded-xl ${
                    title === "Pending"
                      ? "bg-info "
                      : title === "In Progress"
                      ? "bg-warning "
                      : title === "Completed"
                      ? "bg-success "
                      : title === "Delayed"
                      ? "bg-error "
                      : ""
                  }`}
                >
                  <h3 className="font-bold text-lg text-white">{title}</h3>
                  <span className="badge badge-neutral">{cards.length}</span>
                </div>
              )}
            >
              {board}
            </ControlledBoard>
          </div>
        ) : (
          /* Tasks Table */
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
        )}
      </div>
    </div>
  );
};

export default TaskManagement;

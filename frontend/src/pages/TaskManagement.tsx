import { useState, useEffect, useCallback } from "react";
import {
  MdAddTask,
  MdEdit,
  MdDelete,
  MdDownload,
  MdFileDownload,
  MdViewColumn,
  MdViewList,
  MdFilterList,
  MdClose,
  MdSend,
  MdAttachFile,
  MdCalendarToday,
  MdBarChart,
  MdTrendingUp,
  MdAssignment,
  MdSchedule,
} from "react-icons/md";
import { ControlledBoard, moveCard } from "@caldwell619/react-kanban";
import type {
  KanbanBoard,
  OnDragEndNotification,
  Card,
  Column,
} from "@caldwell619/react-kanban";
import "../styles/kanban.css";
import { useCreateTask, type CreateTaskDto, type TaskStatus, type TaskPriority } from "../hooks/useTasks";
import { useUserProjects } from "../hooks/useUsers";
import { useAuthStore } from "../stores/useAuthStore";

// Remove or keep mockProjects for fallback
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

interface Task extends Card {
  name: string;
  type: TaskType;
  assignedTo: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Delayed";
  projectId: string;
  description?: string;
  priority?: "Low" | "Medium" | "High";
  tags?: string[];
  documents?: string[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  avatar?: string;
}

interface TaskFilters {
  types: TaskType[];
  statuses: Task["status"][];
  assignees: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

type MainTab = "all-tasks" | "task-details" | "analytics";

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
    priority: "High",
    tags: ["foundation", "excavation"],
    documents: ["excavation_plan.pdf", "safety_guidelines.pdf"],
    comments: [
      {
        id: "c1",
        author: "Alice",
        message: "Excavation completed successfully. Foundation is ready for concrete pour.",
        timestamp: "2024-07-05T10:30:00Z",
      },
    ],
    createdAt: "2024-07-01T08:00:00Z",
    updatedAt: "2024-07-05T10:30:00Z",
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
    priority: "Medium",
    tags: ["concrete", "materials"],
    documents: ["concrete_order.pdf"],
    comments: [],
    createdAt: "2024-06-28T09:00:00Z",
    updatedAt: "2024-07-03T14:00:00Z",
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
    priority: "High",
    tags: ["inspection", "foundation"],
    documents: ["inspection_checklist.pdf"],
    comments: [],
    createdAt: "2024-07-04T11:00:00Z",
    updatedAt: "2024-07-04T11:00:00Z",
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
    priority: "Medium",
    tags: ["steel", "delivery"],
    documents: ["delivery_manifest.pdf"],
    comments: [
      {
        id: "c2",
        author: "Eve",
        message: "Steel beams are on the way. Expected delivery tomorrow morning.",
        timestamp: "2024-07-07T16:00:00Z",
      },
    ],
    createdAt: "2024-07-02T10:00:00Z",
    updatedAt: "2024-07-07T16:00:00Z",
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
    priority: "Low",
    tags: ["handover", "documentation"],
    documents: ["handover_checklist.pdf"],
    comments: [],
    createdAt: "2024-07-01T12:00:00Z",
    updatedAt: "2024-07-01T12:00:00Z",
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
    priority: "Medium",
    tags: ["custom"],
    documents: [],
    comments: [
      {
        id: "c3",
        author: "Mike",
        message: "Delayed due to equipment issues. Will resume next week.",
        timestamp: "2024-07-19T09:00:00Z",
      },
    ],
    createdAt: "2024-07-15T13:00:00Z",
    updatedAt: "2024-07-19T09:00:00Z",
  },
];

// Add Task Modal Component (moved outside to prevent re-creation)
const AddTaskModal = ({ 
  showAddModal, 
  setShowAddModal, 
  selectedProject
}: {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  selectedProject: string;
}) => {
  const createTaskMutation = useCreateTask();
  
  const [newTask, setNewTask] = useState<CreateTaskDto>({
    title: "",
    description: "",
    projectId: selectedProject,
    assigneeId: "",
    status: "Pending",
    priority: "Medium",
    progress: 0,
    estimatedHours: undefined,
    dueDate: "",
    tags: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (showAddModal) {
      setNewTask({
        title: "",
        description: "",
        projectId: selectedProject, // Use the selected project ID
        assigneeId: "",
        status: "Pending",
        priority: "Medium",
        progress: 0,
        estimatedHours: undefined,
        dueDate: "",
        tags: [],
      });
    }
  }, [showAddModal, selectedProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ensure we're using the current selected project ID
      const taskData: CreateTaskDto = {
        ...newTask,
        projectId: selectedProject, // Always use the current selected project
        // Convert empty strings to undefined for optional fields
        description: newTask.description?.trim() || undefined,
        assigneeId: newTask.assigneeId?.trim() || undefined,
        dueDate: newTask.dueDate || undefined,
        estimatedHours: newTask.estimatedHours || undefined,
      };

      await createTaskMutation.mutateAsync(taskData);
      
      // Close modal and reset form
      setShowAddModal(false);
      
      // Show success message (you can replace this with your notification system)
      console.log("Task created successfully!");
      
    } catch (error) {
      console.error("Failed to create task:", error);
      // Handle error (you can replace this with your error notification system)
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showAddModal) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Add New Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Task Title <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              required
              value={newTask.title}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, title: e.target.value }))
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Priority</span>
              </label>
              <select
                className="select select-bordered"
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask((t) => ({
                    ...t,
                    priority: e.target.value as TaskPriority,
                  }))
                }
                disabled={isSubmitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                className="select select-bordered"
                value={newTask.status}
                onChange={(e) =>
                  setNewTask((t) => ({
                    ...t,
                    status: e.target.value as TaskStatus,
                  }))
                }
                disabled={isSubmitting}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Assignee ID</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={newTask.assigneeId || ""}
                onChange={(e) =>
                  setNewTask((t) => ({ ...t, assigneeId: e.target.value }))
                }
                placeholder="Enter assignee ID (optional)"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Due Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={newTask.dueDate || ""}
                onChange={(e) =>
                  setNewTask((t) => ({ ...t, dueDate: e.target.value }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Estimated Hours</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                min="0"
                step="0.5"
                value={newTask.estimatedHours || ""}
                onChange={(e) =>
                  setNewTask((t) => ({ 
                    ...t, 
                    estimatedHours: e.target.value ? Number(e.target.value) : undefined 
                  }))
                }
                placeholder="Enter estimated hours"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Progress (%)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                min="0"
                max="100"
                value={newTask.progress}
                onChange={(e) =>
                  setNewTask((t) => ({ 
                    ...t, 
                    progress: Math.min(100, Math.max(0, Number(e.target.value) || 0))
                  }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              rows={3}
              value={newTask.description}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, description: e.target.value }))
              }
              placeholder="Enter task description (optional)"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Tags</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={newTask.tags?.join(", ") || ""}
              onChange={(e) =>
                setNewTask((t) => ({ 
                  ...t, 
                  tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
                }))
              }
              placeholder="Enter tags separated by commas (optional)"
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => setShowAddModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskManagement = () => {
  const [mainTab, setMainTab] = useState<MainTab>("all-tasks");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    types: [],
    statuses: [],
    assignees: [],
    dateRange: { start: "", end: "" },
  });
  const [showFilters, setShowFilters] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Get auth user
  const { user } = useAuthStore();

  // Fetch user projects
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(user?.id || "");

  // Set default project when projects load
  useEffect(() => {
    if (Array.isArray(projects) && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  // Check if projects is available and is an array
  const hasProjects = Array.isArray(projects) && projects.length > 0;

  // Filter tasks based on current filters
  const getFilteredTasks = useCallback(() => {
    let filtered = tasks.filter((task) => task.projectId === selectedProject);

    // Apply filters
    if (filters.types.length > 0) {
      filtered = filtered.filter((task) => filters.types.includes(task.type));
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter((task) => filters.statuses.includes(task.status));
    }

    if (filters.assignees.length > 0) {
      filtered = filtered.filter((task) => filters.assignees.includes(task.assignedTo));
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter((task) => task.dueDate >= filters.dateRange.start);
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter((task) => task.dueDate <= filters.dateRange.end);
    }

    return filtered;
  }, [tasks, selectedProject, filters]);

  // Create kanban board structure
  const createKanbanBoard = useCallback((): KanbanBoard<Task> => {
    const filteredTasks = getFilteredTasks();

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
  }, [getFilteredTasks]);

  const [board, setBoard] = useState<KanbanBoard<Task>>(() =>
    createKanbanBoard()
  );

  // Update board when project or tab changes
  useEffect(() => {
    setBoard(createKanbanBoard());
  }, [createKanbanBoard, tasks]);

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
  const filteredTasks = getFilteredTasks();

  const handleExport = () => {
    const tasks = filteredTasks;
    const csv =
      "Name,Type,Assigned To,Due Date,Status,Description\n" +
      tasks
        .map(
          (t) =>
            `${t.name},${t.type},${t.assignedTo},${
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
      <div 
        className="bg-base-200 min-w-[260px] shadow-xl mb-2 border border-base-300 rounded-xl p-1 transition-all duration-200 hover:shadow-2xl cursor-pointer hover:scale-105"
        onClick={() => {
          setSelectedTask(card);
          setMainTab("task-details");
        }}
      >
        <div className="flex bg-base-300 p-2 w-full rounded-t-xl justify-between items-start mb-3">
          <h3 className="font-semibold text-sm text-base-content line-clamp-2 flex-1">
            {card.name}
          </h3>
          <div className="flex items-center gap-1">
            <span className={`badge badge-xs ${
              card.priority === "High" ? "badge-error" : 
              card.priority === "Medium" ? "badge-warning" : 
              "badge-success"
            }`}>
              {card.priority}
            </span>
          </div>
        </div>
        {/* Card Content */}
        <div className="space-y-2 p-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-base-content/60">Type:</span>
            <span className="badge badge-sm badge-outline">
              {card.type}
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

          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {card.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="badge badge-xs badge-secondary">
                  {tag}
                </span>
              ))}
              {card.tags.length > 3 && (
                <span className="badge badge-xs badge-ghost">+{card.tags.length - 3}</span>
              )}
            </div>
          )}

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

  // Filter Panel Component
  const FilterPanel = () => {
    const uniqueAssignees = [...new Set(tasks.map(task => task.assignedTo))];
    
    return (
      <div className="bg-base-200 p-4 rounded-xl border border-base-300 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MdFilterList />
            Filters
          </h3>
          <button
            className="btn btn-xs btn-outline"
            onClick={() => setFilters({
              types: [],
              statuses: [],
              assignees: [],
              dateRange: { start: "", end: "" },
            })}
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Task Types */}
          <div>
            <label className="block text-sm font-medium mb-2">Task Type</label>
            <select
              className="select select-sm select-bordered w-full"
              value={filters.types.length > 0 ? filters.types[0] : ""}
              onChange={(e) => {
                if (e.target.value) {
                  setFilters(prev => ({ ...prev, types: [e.target.value as TaskType] }));
                } else {
                  setFilters(prev => ({ ...prev, types: [] }));
                }
              }}
            >
              <option value="">All Types</option>
              <option value="site">Site Tasks</option>
              <option value="procurement">Procurement</option>
              <option value="inspection">Inspections</option>
              <option value="handover">Handover</option>
              <option value="custom">Custom Tasks</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              className="select select-sm select-bordered w-full"
              value={filters.statuses.length > 0 ? filters.statuses[0] : ""}
              onChange={(e) => {
                if (e.target.value) {
                  setFilters(prev => ({ ...prev, statuses: [e.target.value as Task["status"]] }));
                } else {
                  setFilters(prev => ({ ...prev, statuses: [] }));
                }
              }}
            >
              <option value="">All Statuses</option>
              {(["Pending", "In Progress", "Completed", "Delayed"] as Task["status"][]).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Assignees Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Assignee</label>
            <select
              className="select select-sm select-bordered w-full"
              value={filters.assignees.length > 0 ? filters.assignees[0] : ""}
              onChange={(e) => {
                if (e.target.value) {
                  setFilters(prev => ({ ...prev, assignees: [e.target.value] }));
                } else {
                  setFilters(prev => ({ ...prev, assignees: [] }));
                }
              }}
            >
              <option value="">All Assignees</option>
              {uniqueAssignees.map(assignee => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Date Range</label>
            <div className="space-y-2">
              <input
                type="date"
                className="input input-sm input-bordered w-full"
                placeholder="Start date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
              />
              <input
                type="date"
                className="input input-sm input-bordered w-full"
                placeholder="End date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Task Details Component
  const TaskDetails = () => {
    if (!selectedTask) return null;

    const handleAddComment = () => {
      if (newComment.trim()) {
        const comment: Comment = {
          id: Date.now().toString(),
          author: "Current User", // Replace with actual user
          message: newComment,
          timestamp: new Date().toISOString(),
        };
        
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === selectedTask.id 
              ? { ...task, comments: [...(task.comments || []), comment] }
              : task
          )
        );
        
        setSelectedTask(prev => prev ? { ...prev, comments: [...(prev.comments || []), comment] } : null);
        setNewComment("");
      }
    };

    const handleDeleteTask = () => {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));
      setMainTab("all-tasks");
      setSelectedTask(null);
    };

    const handleDownloadTask = () => {
      const taskData = {
        name: selectedTask.name,
        type: selectedTask.type,
        assignedTo: selectedTask.assignedTo,
        dueDate: selectedTask.dueDate,
        status: selectedTask.status,
        priority: selectedTask.priority,
        description: selectedTask.description,
        tags: selectedTask.tags?.join(", ") || "",
        documents: selectedTask.documents?.join(", ") || "",
        comments: selectedTask.comments?.map(c => `${c.author}: ${c.message}`).join("\n") || "",
      };

      const content = Object.entries(taskData)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Task_${selectedTask.name}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setMainTab("all-tasks")}
            >
              <MdClose />
              Back to All Tasks
            </button>
            <h1 className="text-2xl font-bold">{selectedTask.name}</h1>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-success btn-sm"
              onClick={handleDownloadTask}
            >
              <MdDownload />
              Download
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                // Edit functionality can be added here
              }}
            >
              <MdEdit />
              Edit
            </button>
            <button
              className="btn btn-error btn-sm"
              onClick={handleDeleteTask}
            >
              <MdDelete />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-base-100 p-4 rounded-xl">
              <h3 className="font-semibold mb-4">Task Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <span className="badge badge-outline">{selectedTask.type}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <span className={`badge ${
                    selectedTask.priority === "High" ? "badge-error" :
                    selectedTask.priority === "Medium" ? "badge-warning" :
                    "badge-success"
                  }`}>
                    {selectedTask.priority}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <span className={`badge ${
                    selectedTask.status === "Completed" ? "badge-success" :
                    selectedTask.status === "In Progress" ? "badge-warning" :
                    selectedTask.status === "Delayed" ? "badge-error" :
                    "badge-neutral"
                  }`}>
                    {selectedTask.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <span className="text-sm">{selectedTask.dueDate}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assigned To</label>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {selectedTask.assignedTo.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm">{selectedTask.assignedTo}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-base-100 p-4 rounded-xl">
              <h3 className="font-semibold mb-4">Description</h3>
              <p className="text-sm text-base-content/70">
                {selectedTask.description || "No description provided"}
              </p>
            </div>

            {selectedTask.tags && selectedTask.tags.length > 0 && (
              <div className="bg-base-100 p-4 rounded-xl">
                <h3 className="font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.tags.map((tag, index) => (
                    <span key={index} className="badge badge-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedTask.documents && selectedTask.documents.length > 0 && (
              <div className="bg-base-100 p-4 rounded-xl">
                <h3 className="font-semibold mb-4">Documents</h3>
                <div className="space-y-2">
                  {selectedTask.documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <MdAttachFile className="text-primary" />
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-base-100 p-4 rounded-xl">
            <h3 className="font-semibold mb-4">Comments</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
              {selectedTask.comments && selectedTask.comments.length > 0 ? (
                selectedTask.comments.map((comment) => (
                  <div key={comment.id} className="bg-base-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {comment.author.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{comment.author}</span>
                      <span className="text-xs text-base-content/60">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/80">{comment.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-base-content/60">No comments yet</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                className="input input-sm input-bordered flex-1"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddComment();
                  }
                }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddComment}
              >
                <MdSend />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Analytics Component
  const Analytics = () => {
    const projectTasks = tasks.filter(task => task.projectId === selectedProject);
    
    const statusCounts = {
      pending: projectTasks.filter(t => t.status === "Pending").length,
      inProgress: projectTasks.filter(t => t.status === "In Progress").length,
      completed: projectTasks.filter(t => t.status === "Completed").length,
      delayed: projectTasks.filter(t => t.status === "Delayed").length,
    };

    const typeCounts = {
      site: projectTasks.filter(t => t.type === "site").length,
      procurement: projectTasks.filter(t => t.type === "procurement").length,
      inspection: projectTasks.filter(t => t.type === "inspection").length,
      handover: projectTasks.filter(t => t.type === "handover").length,
      custom: projectTasks.filter(t => t.type === "custom").length,
    };

    const totalTasks = projectTasks.length;
    const completionRate = totalTasks > 0 ? (statusCounts.completed / totalTasks) * 100 : 0;

    return (
      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MdBarChart />
            Task Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <MdAssignment className="text-2xl" />
              </div>
              <div className="stat-title">Total Tasks</div>
              <div className="stat-value text-primary">{totalTasks}</div>
            </div>
          </div>
          
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-success">
                <MdTrendingUp className="text-2xl" />
              </div>
              <div className="stat-title">Completion Rate</div>
              <div className="stat-value text-success">{completionRate.toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-warning">
                <MdSchedule className="text-2xl" />
              </div>
              <div className="stat-title">In Progress</div>
              <div className="stat-value text-warning">{statusCounts.inProgress}</div>
            </div>
          </div>
          
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-error">
                <MdCalendarToday className="text-2xl" />
              </div>
              <div className="stat-title">Delayed</div>
              <div className="stat-value text-error">{statusCounts.delayed}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="bg-base-100 p-4 rounded-xl">
            <h3 className="font-semibold mb-4">Status Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-base-300 rounded-full h-2">
                    <div 
                      className="bg-neutral h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (statusCounts.pending / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-8 text-right">{statusCounts.pending}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">In Progress</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-base-300 rounded-full h-2">
                    <div 
                      className="bg-warning h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (statusCounts.inProgress / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-8 text-right">{statusCounts.inProgress}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-base-300 rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (statusCounts.completed / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-8 text-right">{statusCounts.completed}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Delayed</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-base-300 rounded-full h-2">
                    <div 
                      className="bg-error h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (statusCounts.delayed / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-8 text-right">{statusCounts.delayed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Task Type Distribution */}
          <div className="bg-base-100 p-4 rounded-xl">
            <h3 className="font-semibold mb-4">Task Type Distribution</h3>
            <div className="space-y-3">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-base-300 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${totalTasks > 0 ? (count / totalTasks) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If no projects available, show a message
  if (!projectsLoading && !hasProjects) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No Projects Available
            </h2>
            <p className="text-gray-500">
              You don't have access to any projects or no projects have been
              created yet.
            </p>
            <p className="text-gray-500 mt-2">
              Please contact your administrator or create a new project to get
              started with task management.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 relative">
      <AddTaskModal 
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        selectedProject={selectedProject}
      />
      
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-gray-500 mt-1">
            Manage all project tasks: site work, procurement, inspections,
            handover, and custom tasks.
          </p>
        </div>
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
              ) : hasProjects ? (
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

      {/* Main Tabs */}
      <div className="tabs tabs-border mt-6">
        <button
          className={`tab text-base ${
            mainTab === "all-tasks" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setMainTab("all-tasks")}
        >
          All Tasks
        </button>
        <button
          className={`tab text-base ${
            mainTab === "task-details" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setMainTab("task-details")}
          disabled={!selectedTask}
        >
          Task Details
        </button>
        <button
          className={`tab text-base ${
            mainTab === "analytics" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setMainTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {mainTab === "all-tasks" && (
          <>
            {/* Filter Toggle */}
            <div className="flex items-center gap-4 mb-4">
              <button
                className={`btn btn-sm ${showFilters ? "btn-primary" : "btn-outline"}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <MdFilterList />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            {/* Filters */}
            {showFilters && <FilterPanel />}

            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              {/* Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => setShowAddModal(true)}
                  >
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
                        <th>Priority</th>
                        <th>Assigned To</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                          <tr key={task.id} className="hover:bg-base-200">
                            <td className="font-medium">{task.name}</td>
                            <td>{task.type}</td>
                            <td>
                              <span className={`badge badge-sm ${
                                task.priority === "High" ? "badge-error" :
                                task.priority === "Medium" ? "badge-warning" :
                                "badge-success"
                              }`}>
                                {task.priority}
                              </span>
                            </td>
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
                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setMainTab("task-details");
                                }}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center text-gray-500 py-8">
                            No tasks found in this project.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {mainTab === "task-details" && <TaskDetails />}
        {mainTab === "analytics" && <Analytics />}
      </div>
    </div>
  );
};

export default TaskManagement;

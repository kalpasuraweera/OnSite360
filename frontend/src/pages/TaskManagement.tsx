import { useState, useEffect, useCallback, useMemo } from "react";
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
import { ControlledBoard } from "@caldwell619/react-kanban";
import type {
  KanbanBoard,
  OnDragEndNotification,
  Card,
  Column,
} from "@caldwell619/react-kanban";
import "../styles/kanban.css";
import { 
  useCreateTask, 
  useTasks,
  useDeleteTask,
  useUpdateTask,
  type CreateTaskDto, 
  type TaskStatus, 
  type TaskPriority,
  type Task as ApiTask,
} from "../hooks/useTasks";
import { useUserProjects } from "../hooks/useUsers";
import { useProject, type Project } from "../hooks/useProjects";
import { useAuthStore } from "../stores/useAuthStore";
import TagsInput from "../components/TagsInput";

// Convert ApiTask to Card interface for Kanban board
interface TaskCard extends Card {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };
  dueDate?: string;
  description?: string;
  tags: string[];
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
  comments?: Array<{
    id: string;
    content: string;
    user: {
      id: string;
      firstName: string;
      lastName?: string;
    };
    createdAt: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

interface TaskFilters {
  statuses: TaskStatus[];
  assignees: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

type MainTab = "all-tasks" | "task-details" | "analytics";

// Add Task Modal Component (moved outside to prevent re-creation)
const AddTaskModal = ({ 
  showAddModal, 
  setShowAddModal, 
  selectedProject,
  projectUsers
}: {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  selectedProject: string;
  projectUsers: Array<{
    id: string;
    userId: string;
    projectRole: string;
    accessLevel: number;
    isActive: boolean;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
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

  // Transform tags array to simple string array for react-tag-input-component
  const [tags, setTags] = useState<string[]>([]);

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
      setTags([]); // Reset tags
    }
  }, [showAddModal, selectedProject]);

  // Update tags in newTask when tags state changes
  useEffect(() => {
    setNewTask(prev => ({ ...prev, tags }));
  }, [tags]);

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
        tags: tags, // Use tags directly from react-tag-input-component
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
                <span className="label-text">Assignee</span>
              </label>
              <select
                className="select select-bordered"
                value={newTask.assigneeId || ""}
                onChange={(e) =>
                  setNewTask((t) => ({ ...t, assigneeId: e.target.value }))
                }
                disabled={isSubmitting}
              >
                <option value="">Select assignee (optional)</option>
                {projectUsers.map((userProject) => (
                  <option key={userProject.user.id} value={userProject.user.id}>
                    {userProject.user.firstName} {userProject.user.lastName} ({userProject.projectRole})
                  </option>
                ))}
              </select>
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
            <TagsInput
              value={tags}
              onChange={setTags}
              placeholder="Enter tags"
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
  const [selectedTask, setSelectedTask] = useState<TaskCard | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    statuses: [],
    assignees: [],
    dateRange: { start: "", end: "" },
  });
  const [appliedFilters, setAppliedFilters] = useState<TaskFilters>({
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

  // Fetch selected project details including users
  const { data: selectedProjectResponse, isLoading: projectDataLoading } = useProject(selectedProject);
  const selectedProjectData = selectedProjectResponse?.data as Project | undefined;

  // Fetch tasks for the selected project
  const { data: apiTasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useTasks(
    selectedProject ? { projectId: selectedProject } : undefined
  );

  // Task mutations
  const deleteTaskMutation = useDeleteTask();
  const updateTaskMutation = useUpdateTask();

  // Transform API tasks to TaskCard format
  const transformApiTaskToCard = useCallback((task: ApiTask): TaskCard => {
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      assignee: task.assignee,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : undefined,
      description: task.description,
      tags: task.tags || [],
      progress: task.progress,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      comments: task.comments?.map(comment => ({
        id: comment.id,
        content: comment.content,
        user: comment.user,
        createdAt: comment.createdAt,
      })),
      attachments: task.attachments,
    };
  }, []);

  // Transform API tasks to cards
  const tasks = apiTasks.map(transformApiTaskToCard);

  // Set default project when projects load
  useEffect(() => {
    if (Array.isArray(projects) && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  // Check if projects is available and is an array
  const hasProjects = Array.isArray(projects) && projects.length > 0;

  // Apply filters using useMemo for better performance
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply filters only when appliedFilters change
    if (appliedFilters.statuses.length > 0) {
      filtered = filtered.filter((task) => appliedFilters.statuses.includes(task.status));
    }

    if (appliedFilters.assignees.length > 0) {
      filtered = filtered.filter((task) => 
        task.assigneeId && appliedFilters.assignees.includes(task.assigneeId)
      );
    }

    if (appliedFilters.dateRange.start) {
      filtered = filtered.filter((task) => 
        task.dueDate && task.dueDate >= appliedFilters.dateRange.start
      );
    }

    if (appliedFilters.dateRange.end) {
      filtered = filtered.filter((task) => 
        task.dueDate && task.dueDate <= appliedFilters.dateRange.end
      );
    }

    return filtered;
  }, [tasks, appliedFilters]);

  // Create kanban board structure using useMemo
  const board = useMemo((): KanbanBoard<TaskCard> => {
    const columns: Column<TaskCard>[] = [
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
        id: "cancelled",
        title: "Cancelled",
        cards: filteredTasks.filter((task) => task.status === "Cancelled"),
      },
    ];

    return { columns };
  }, [filteredTasks]);

  // Function to apply filters manually
  const applyFilters = () => {
    setAppliedFilters(filters);
  };

  // Check if filters are applied
  const hasActiveFilters = useMemo(() => {
    return appliedFilters.statuses.length > 0 || 
           appliedFilters.assignees.length > 0 || 
           appliedFilters.dateRange.start !== "" || 
           appliedFilters.dateRange.end !== "";
  }, [appliedFilters]);

  // Function to clear all filters
  const clearFilters = () => {
    setFilters({
      statuses: [],
      assignees: [],
      dateRange: { start: "", end: "" },
    });
    setAppliedFilters({
      statuses: [],
      assignees: [],
      dateRange: { start: "", end: "" },
    });
  };

  const handleCardMove: OnDragEndNotification<TaskCard> = async (
    card,
    _source,
    destination
  ) => {
    // Check if destination exists
    if (!destination) return;

    // Determine new status based on destination column
    let newStatus: TaskStatus;
    switch (destination.toColumnId) {
      case "pending":
        newStatus = "Pending";
        break;
      case "in-progress":
        newStatus = "In Progress";
        break;
      case "completed":
        newStatus = "Completed";
        break;
      case "cancelled":
        newStatus = "Cancelled";
        break;
      default:
        return;
    }

    // Update task status in the API
    try {
      await updateTaskMutation.mutateAsync({
        id: card.id,
        task: { status: newStatus }
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleExport = () => {
    const exportTasks = filteredTasks;
    const csv =
      "Title,Status,Priority,Assigned To,Due Date,Progress,Description\n" +
      exportTasks
        .map(
          (t) =>
            `${t.title},${t.status},${t.priority},${
              t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName || ''}` : 'Unassigned'
            },${t.dueDate || ''},${t.progress}%,${t.description || ""}`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Tasks_${
      projects.find((p: Project) => p.id === selectedProject)?.name || "Project"
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCard = (card: TaskCard) => {
    const getDueDateStatus = (dueDate?: string) => {
      if (!dueDate) return { color: "text-base-content", text: "No due date" };
      
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
            {card.title}
          </h3>
          <div className="flex items-center gap-1">
            <span className={`badge badge-xs ${
              card.priority === "Critical" ? "badge-error" :
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
            <span className="text-xs text-base-content/60">Progress:</span>
            <span className="text-xs font-medium">
              {card.progress}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-base-content/60">Assigned:</span>
            <div className="flex items-center gap-1">
              {card.assignee ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {card.assignee.firstName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-xs font-medium">
                    {card.assignee.firstName} {card.assignee.lastName || ''}
                  </span>
                </>
              ) : (
                <span className="text-xs text-base-content/50">Unassigned</span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-base-content/60">Due:</span>
            <div className="flex items-center gap-1">
              <span className="text-xs">{card.dueDate || 'No due date'}</span>
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

          {/* Progress Bar */}
          <div className="w-full bg-base-300 rounded-full h-1 mt-2">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${card.progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  // Filter Panel Component
  const FilterPanel = () => {
    // Get unique assignees from project users
    const projectAssignees = selectedProjectData?.userProjects
      ?.filter(userProject => userProject.isActive)
      ?.map(userProject => ({
        id: userProject.user.id,
        name: `${userProject.user.firstName} ${userProject.user.lastName}`,
        role: userProject.projectRole
      })) || [];
    
    return (
      <div className="bg-base-200 p-4 rounded-xl border border-base-300 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MdFilterList />
            Filters
          </h3>
          <div className="flex gap-2">
            <button
              className="btn btn-xs btn-primary"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
            <button
              className="btn btn-xs btn-outline"
              onClick={clearFilters}
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              className="select select-sm select-bordered w-full"
              value={filters.statuses.length > 0 ? filters.statuses[0] : ""}
              onChange={(e) => {
                if (e.target.value) {
                  setFilters(prev => ({ ...prev, statuses: [e.target.value as TaskStatus] }));
                } else {
                  setFilters(prev => ({ ...prev, statuses: [] }));
                }
              }}
            >
              <option value="">All Statuses</option>
              {(["Pending", "In Progress", "Completed", "Cancelled"] as TaskStatus[]).map(status => (
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
              {projectAssignees.map(assignee => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name} ({assignee.role})
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
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))
                }
              />
              <input
                type="date"
                className="input input-sm input-bordered w-full"
                placeholder="End date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))
                }
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

    const handleDeleteTask = async () => {
      if (window.confirm("Are you sure you want to delete this task?")) {
        try {
          await deleteTaskMutation.mutateAsync(selectedTask.id);
          setMainTab("all-tasks");
          setSelectedTask(null);
          refetchTasks(); // Refresh the task list
        } catch (error) {
          console.error("Error deleting task:", error);
        }
      }
    };

    const handleDownloadTask = () => {
      const taskData = {
        title: selectedTask.title,
        status: selectedTask.status,
        priority: selectedTask.priority,
        assignedTo: selectedTask.assignee ? 
          `${selectedTask.assignee.firstName} ${selectedTask.assignee.lastName || ''}` : 
          'Unassigned',
        dueDate: selectedTask.dueDate || 'No due date',
        progress: `${selectedTask.progress}%`,
        description: selectedTask.description || 'No description',
        tags: selectedTask.tags?.join(", ") || "",
        estimatedHours: selectedTask.estimatedHours || 'Not specified',
        actualHours: selectedTask.actualHours || 'Not specified',
        comments: selectedTask.comments?.map(c => `${c.user.firstName}: ${c.content}`).join("\n") || "",
      };

      const content = Object.entries(taskData)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Task_${selectedTask.title}.txt`;
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
            <h1 className="text-2xl font-bold">{selectedTask.title}</h1>
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
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <span className={`badge ${
                    selectedTask.status === "Completed" ? "badge-success" :
                    selectedTask.status === "In Progress" ? "badge-warning" :
                    selectedTask.status === "Cancelled" ? "badge-error" :
                    "badge-neutral"
                  }`}>
                    {selectedTask.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <span className={`badge ${
                    selectedTask.priority === "Critical" ? "badge-error" :
                    selectedTask.priority === "High" ? "badge-error" :
                    selectedTask.priority === "Medium" ? "badge-warning" :
                    "badge-success"
                  }`}>
                    {selectedTask.priority}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Progress</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-base-300 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${selectedTask.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{selectedTask.progress}%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <span className="text-sm">{selectedTask.dueDate || 'No due date'}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assigned To</label>
                  <div className="flex items-center gap-2">
                    {selectedTask.assignee ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {selectedTask.assignee.firstName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm">
                          {selectedTask.assignee.firstName} {selectedTask.assignee.lastName || ''}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-base-content/50">Unassigned</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                  <span className="text-sm">{selectedTask.estimatedHours || 'Not specified'}</span>
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

            {selectedTask.attachments && selectedTask.attachments.length > 0 && (
              <div className="bg-base-100 p-4 rounded-xl">
                <h3 className="font-semibold mb-4">Attachments</h3>
                <div className="space-y-2">
                  {selectedTask.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 p-2 bg-base-200 rounded">
                      <MdAttachFile className="text-primary" />
                      <span className="text-sm">{attachment.name}</span>
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
                          {comment.user.firstName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {comment.user.firstName} {comment.user.lastName || ''}
                      </span>
                      <span className="text-xs text-base-content/60">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/80">{comment.content}</p>
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
                    // TODO: Implement comment creation using useCreateComment
                    console.log("Add comment:", newComment);
                    setNewComment("");
                  }
                }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  // TODO: Implement comment creation using useCreateComment
                  console.log("Add comment:", newComment);
                  setNewComment("");
                }}
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
    const statusCounts = {
      pending: tasks.filter(t => t.status === "Pending").length,
      inProgress: tasks.filter(t => t.status === "In Progress").length,
      completed: tasks.filter(t => t.status === "Completed").length,
      cancelled: tasks.filter(t => t.status === "Cancelled").length,
    };

    const priorityCounts = {
      low: tasks.filter(t => t.priority === "Low").length,
      medium: tasks.filter(t => t.priority === "Medium").length,
      high: tasks.filter(t => t.priority === "High").length,
      critical: tasks.filter(t => t.priority === "Critical").length,
    };

    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (statusCounts.completed / totalTasks) * 100 : 0;
    const averageProgress = totalTasks > 0 ? 
      tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks : 0;

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
              <div className="stat-figure text-info">
                <MdCalendarToday className="text-2xl" />
              </div>
              <div className="stat-title">Avg Progress</div>
              <div className="stat-value text-info">{averageProgress.toFixed(1)}%</div>
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
                <span className="text-sm">Cancelled</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-base-300 rounded-full h-2">
                    <div 
                      className="bg-error h-2 rounded-full" 
                      style={{ width: `${totalTasks > 0 ? (statusCounts.cancelled / totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-8 text-right">{statusCounts.cancelled}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-base-100 p-4 rounded-xl">
            <h3 className="font-semibold mb-4">Priority Distribution</h3>
            <div className="space-y-3">
              {Object.entries(priorityCounts).map(([priority, count]) => (
                <div key={priority} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{priority}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-base-300 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          priority === "critical" ? "bg-error" :
                          priority === "high" ? "bg-warning" :
                          priority === "medium" ? "bg-info" :
                          "bg-success"
                        }`}
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
        projectUsers={selectedProjectData?.userProjects?.filter(up => up.isActive) || []}
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
                {hasActiveFilters && (
                  <span className="badge badge-warning badge-xs ml-1">
                    Active
                  </span>
                )}
              </button>
              {hasActiveFilters && (
                <span className="text-sm text-base-content/70">
                  Showing {filteredTasks.length} of {tasks.length} tasks
                </span>
              )}
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
                    disabled={!selectedProject || projectDataLoading}
                  >
                    <MdAddTask />
                    Add Task
                  </button>
                  <button
                    className="btn btn-outline flex items-center gap-2"
                    onClick={handleExport}
                    disabled={filteredTasks.length === 0}
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
              {tasksLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loading loading-spinner loading-lg"></div>
                  <span className="ml-2">Loading tasks...</span>
                </div>
              ) : viewMode === "kanban" ? (
                filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl text-base-content/20 mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                      No tasks found
                    </h3>
                    <p className="text-base-content/50 mb-6">
                      {selectedProject ? 
                        "No tasks have been created for this project yet." :
                        "Select a project to view its tasks."
                      }
                    </p>
                    {selectedProject && (
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                      >
                        <MdAddTask className="mr-2" />
                        Add First Task
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="kanban-container">
                    <ControlledBoard<TaskCard>
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
                              : title === "Cancelled"
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
                )
              ) : (
                /* Tasks Table */
                <div className="overflow-x-auto">
                  <table className="table w-full bg-base-100 border border-base-300 rounded-2xl">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Assigned To</th>
                        <th>Due Date</th>
                        <th>Progress</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                          <tr key={task.id} className="hover:bg-base-200">
                            <td className="font-medium">{task.title}</td>
                            <td>
                              <span
                                className={`badge ${
                                  task.status === "Completed"
                                    ? "badge-success"
                                    : task.status === "In Progress"
                                    ? "badge-warning"
                                    : task.status === "Cancelled"
                                    ? "badge-error"
                                    : "badge-neutral"
                                }`}
                              >
                                {task.status}
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-sm ${
                                task.priority === "Critical" ? "badge-error" :
                                task.priority === "High" ? "badge-error" :
                                task.priority === "Medium" ? "badge-warning" :
                                "badge-success"
                              }`}>
                                {task.priority}
                              </span>
                            </td>
                            <td>
                              {task.assignee ? 
                                `${task.assignee.firstName} ${task.assignee.lastName || ''}` : 
                                'Unassigned'
                              }
                            </td>
                            <td>{task.dueDate || 'No due date'}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-base-300 rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">{task.progress}%</span>
                              </div>
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
                            {tasksLoading ? "Loading tasks..." : "No tasks found in this project."}
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

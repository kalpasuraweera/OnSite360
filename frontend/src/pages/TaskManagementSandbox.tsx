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
  useCreateComment,
  useTaskComments,
  type CreateTaskDto,
  type TaskStatus,
  type TaskPriority,
  type Task as ApiTask,
} from "../hooks/useTasks";
import { useProjectPhases, type ProjectPhase } from "../hooks/useSchedule";
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
  projectPhaseId?: string; // NEW
  projectPhase?: { id: string; name: string } | null; // optional phase details
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
  // NEW: selected project phase id (single-select)
  phaseId?: string;
}

type MainTab = "all-tasks" | "task-details" | "analytics";

// Add Task Modal Component (moved outside to prevent re-creation)
const AddTaskModal = ({
  showAddModal,
  setShowAddModal,
  selectedProject,
  projectUsers,
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

  // Fetch project phases for the selected project
  const { data: projectPhases = [], isLoading: phasesLoading } =
    useProjectPhases(selectedProject);

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
    projectPhaseId: undefined,
  });

  // Transform tags array to simple string array for react-tag-input-component
  const [tags, setTags] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // NEW: phase validation error state
  const [phaseError, setPhaseError] = useState<string>("");

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (showAddModal) {
      setNewTask({
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
        projectPhaseId: undefined,
      });
      setTags([]); // Reset tags
      setSubmitSuccess(false); // Reset success state
      setPhaseError(""); // Clear phase error when opening
    }
  }, [showAddModal, selectedProject]);

  // Update tags in newTask when tags state changes
  useEffect(() => {
    setNewTask((prev) => ({ ...prev, tags }));
  }, [tags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPhaseError("");

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
        projectPhaseId: newTask.projectPhaseId || undefined,
      };

      // Validation: require phase if the project has phases
      if (
        projectPhases &&
        projectPhases.length > 0 &&
        !taskData.projectPhaseId
      ) {
        setPhaseError("Please select a project phase.");
        setIsSubmitting(false);
        return;
      }

      await createTaskMutation.mutateAsync(taskData);

      // Show success feedback
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowAddModal(false);
      }, 1000);

      // Show success message (you can replace this with your notification system)
      console.log("Task created successfully!");
    } catch (error) {
      console.error("Failed to create task:", error);
      // Handle error (you can replace this with your error notification system)
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: If modal not shown, nothing to render
  if (!showAddModal) return null;

  // NEW: If phases finished loading and there are no phases, show explanatory modal
  const hasPhases = Array.isArray(projectPhases) && projectPhases.length > 0;
  if (!phasesLoading && !hasPhases) {
    return (
      <div className="modal modal-open">
        <div className="modal-box w-11/12 max-w-md">
          <h3 className="font-bold text-lg mb-2">Cannot create task</h3>
          <p className="text-sm text-base-content/70 mb-4">
            This project has no defined phases. Tasks must be assigned to a
            project phase. Please create project phases first in the Schedule /
            Phases section before adding tasks.
          </p>
          <div className="modal-action">
            <button className="btn" onClick={() => setShowAddModal(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Add New Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col w-full form-control">
            <label className="label">
              <span className="label-text">
                Task Title <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
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
                    {userProject.user.firstName} {userProject.user.lastName} (
                    {userProject.projectRole})
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
                min={new Date().toISOString().split("T")[0]} // Prevent past dates
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
                    estimatedHours: e.target.value
                      ? Number(e.target.value)
                      : undefined,
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
                    progress: Math.min(
                      100,
                      Math.max(0, Number(e.target.value) || 0)
                    ),
                  }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex flex-col w-full form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
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

          <div className="flex flex-col w-full form-control">
            <label className="label">
              <span className="label-text">
                Phase <span className="text-error">*</span>
              </span>
            </label>
            <select
              className="select select-bordered w-full"
              value={newTask.projectPhaseId || ""}
              onChange={(e) => {
                setNewTask((t) => ({
                  ...t,
                  projectPhaseId: e.target.value || undefined,
                }));
                if (phaseError) setPhaseError("");
              }}
              disabled={isSubmitting || phasesLoading}
              required={projectPhases && projectPhases.length > 0}
            >
              <option value="">No phase</option>
              {phasesLoading ? (
                <option>Loading phases...</option>
              ) : (
                projectPhases.map((phase: ProjectPhase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.parentId ? `└─ ${phase.name}` : phase.name}
                  </option>
                ))
              )}
            </select>
            {phaseError && (
              <span className="text-error text-sm mt-1">{phaseError}</span>
            )}
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
              className={`btn ${submitSuccess ? "btn-success" : "btn-primary"}`}
              disabled={
                isSubmitting ||
                (projectPhases &&
                  projectPhases.length > 0 &&
                  !newTask.projectPhaseId)
              }
            >
              {submitSuccess ? (
                <>
                  <span className="text-success-content">✓</span>
                  Task Created!
                </>
              ) : isSubmitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="modal modal-open">
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Add New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">
                  Task Title <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
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
                    <option
                      key={userProject.user.id}
                      value={userProject.user.id}
                    >
                      {userProject.user.firstName} {userProject.user.lastName} (
                      {userProject.projectRole})
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
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
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
                      estimatedHours: e.target.value
                        ? Number(e.target.value)
                        : undefined,
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
                      progress: Math.min(
                        100,
                        Math.max(0, Number(e.target.value) || 0)
                      ),
                    }))
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
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

            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">
                  Phase <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={newTask.projectPhaseId || ""}
                onChange={(e) => {
                  setNewTask((t) => ({
                    ...t,
                    projectPhaseId: e.target.value || undefined,
                  }));
                  if (phaseError) setPhaseError("");
                }}
                disabled={isSubmitting || phasesLoading}
                required={projectPhases && projectPhases.length > 0}
              >
                <option value="">No phase</option>
                {phasesLoading ? (
                  <option>Loading phases...</option>
                ) : (
                  projectPhases.map((phase: ProjectPhase) => (
                    <option key={phase.id} value={phase.id}>
                      {phase.parentId ? `└─ ${phase.name}` : phase.name}
                    </option>
                  ))
                )}
              </select>
              {phaseError && (
                <span className="text-error text-sm mt-1">{phaseError}</span>
              )}
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
                className={`btn ${
                  submitSuccess ? "btn-success" : "btn-primary"
                }`}
                disabled={
                  isSubmitting ||
                  (projectPhases &&
                    projectPhases.length > 0 &&
                    !newTask.projectPhaseId)
                }
              >
                {submitSuccess ? (
                  <>
                    <span className="text-success-content">✓</span>
                    Task Created!
                  </>
                ) : isSubmitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal modal-open">
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Add New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">
                  Task Title <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
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
                    <option
                      key={userProject.user.id}
                      value={userProject.user.id}
                    >
                      {userProject.user.firstName} {userProject.user.lastName} (
                      {userProject.projectRole})
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
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
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
                      estimatedHours: e.target.value
                        ? Number(e.target.value)
                        : undefined,
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
                      progress: Math.min(
                        100,
                        Math.max(0, Number(e.target.value) || 0)
                      ),
                    }))
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
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

            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">
                  Phase <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={newTask.projectPhaseId || ""}
                onChange={(e) => {
                  setNewTask((t) => ({
                    ...t,
                    projectPhaseId: e.target.value || undefined,
                  }));
                  if (phaseError) setPhaseError("");
                }}
                disabled={isSubmitting || phasesLoading}
                required={projectPhases && projectPhases.length > 0}
              >
                <option value="">No phase</option>
                {phasesLoading ? (
                  <option>Loading phases...</option>
                ) : (
                  projectPhases.map((phase: ProjectPhase) => (
                    <option key={phase.id} value={phase.id}>
                      {phase.parentId ? `└─ ${phase.name}` : phase.name}
                    </option>
                  ))
                )}
              </select>
              {phaseError && (
                <span className="text-error text-sm mt-1">{phaseError}</span>
              )}
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
                className={`btn ${
                  submitSuccess ? "btn-success" : "btn-primary"
                }`}
                disabled={
                  isSubmitting ||
                  (projectPhases &&
                    projectPhases.length > 0 &&
                    !newTask.projectPhaseId)
                }
              >
                {submitSuccess ? (
                  <>
                    <span className="text-success-content">✓</span>
                    Task Created!
                  </>
                ) : isSubmitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal modal-open">
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Add New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">
                  Task Title <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
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
                    <option
                      key={userProject.user.id}
                      value={userProject.user.id}
                    >
                      {userProject.user.firstName} {userProject.user.lastName} (
                      {userProject.projectRole})
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
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
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
                      estimatedHours: e.target.value
                        ? Number(e.target.value)
                        : undefined,
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
                      progress: Math.min(
                        100,
                        Math.max(0, Number(e.target.value) || 0)
                      ),
                    }))
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
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

            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">
                  Phase <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={newTask.projectPhaseId || ""}
                onChange={(e) => {
                  setNewTask((t) => ({
                    ...t,
                    projectPhaseId: e.target.value || undefined,
                  }));
                  if (phaseError) setPhaseError("");
                }}
                disabled={isSubmitting || phasesLoading}
                required={projectPhases && projectPhases.length > 0}
              >
                <option value="">No phase</option>
                {phasesLoading ? (
                  <option>Loading phases...</option>
                ) : (
                  projectPhases.map((phase: ProjectPhase) => (
                    <option key={phase.id} value={phase.id}>
                      {phase.parentId ? `└─ ${phase.name}` : phase.name}
                    </option>
                  ))
                )}
              </select>
              {phaseError && (
                <span className="text-error text-sm mt-1">{phaseError}</span>
              )}
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
                className={`btn ${
                  submitSuccess ? "btn-success" : "btn-primary"
                }`}
                disabled={
                  isSubmitting ||
                  (projectPhases &&
                    projectPhases.length > 0 &&
                    !newTask.projectPhaseId)
                }
              >
                {submitSuccess ? (
                  <>
                    <span className="text-success-content">✓</span>
                    Task Created!
                  </>
                ) : isSubmitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal modal-open">
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Add New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">
                  Task Title <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
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
                    <option
                      key={userProject.user.id}
                      value={userProject.user.id}
                    >
                      {userProject.user.firstName} {userProject.user.lastName} (
                      {userProject.projectRole})
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
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
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
                      estimatedHours: e.target.value
                        ? Number(e.target.value)
                        : undefined,
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
                      progress: Math.min(
                        100,
                        Math.max(0, Number(e.target.value) || 0)
                      ),
                    }))
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
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

            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">
                  Phase <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={newTask.projectPhaseId || ""}
                onChange={(e) => {
                  setNewTask((t) => ({
                    ...t,
                    projectPhaseId: e.target.value || undefined,
                  }));
                  if (phaseError) setPhaseError("");
                }}
                disabled={isSubmitting || phasesLoading}
                required={projectPhases && projectPhases.length > 0}
              >
                <option value="">No phase</option>
                {phasesLoading ? (
                  <option>Loading phases...</option>
                ) : (
                  projectPhases.map((phase: ProjectPhase) => (
                    <option key={phase.id} value={phase.id}>
                      {phase.parentId ? `└─ ${phase.name}` : phase.name}
                    </option>
                  ))
                )}
              </select>
              {phaseError && (
                <span className="text-error text-sm mt-1">{phaseError}</span>
              )}
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
                className={`btn ${
                  submitSuccess ? "btn-success" : "btn-primary"
                }`}
                disabled={
                  isSubmitting ||
                  (projectPhases &&
                    projectPhases.length > 0 &&
                    !newTask.projectPhaseId)
                }
              >
                {submitSuccess ? (
                  <>
                    <span className="text-success-content">✓</span>
                    Task Created!
                  </>
                ) : isSubmitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal modal-open">
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Add New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">
                  Task Title <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
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
                    <option
                      key={userProject.user.id}
                      value={userProject.user.id}
                    >
                      {userProject.user.firstName} {userProject.user.lastName} (
                      {userProject.projectRole})
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
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
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
                      estimatedHours: e.target.value
                        ? Number(e.target.value)
                        : undefined,
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
                      progress: Math.min(
                        100,
                        Math.max(0, Number(e.target.value) || 0)
                      ),
                    }))
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
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

            <div className="flex flex-col w-full form-control">
              <label className="label">
                <span className="label-text">
                  Phase <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={newTask.projectPhaseId || ""}
                onChange={(e) => {
                  setNewTask((t) => ({
                    ...t,
                    projectPhaseId: e.target.value || undefined,
                  }));
                  if (phaseError) setPhaseError("");
                }}
                disabled={isSubmitting || phasesLoading}
                required={projectPhases && projectPhases.length > 0}
              >
                <option value="">No phase</option>
                {phasesLoading ? (
                  <option>Loading phases...</option>
                ) : (
                  projectPhases.map((phase: ProjectPhase) => (
                    <option key={phase.id} value={phase.id}>
                      {phase.parentId ? `└─ ${phase.name}` : phase.name}
                    </option>
                  ))
                )}
              </select>
              {phaseError && (
                <span className="text-error text-sm mt-1">{phaseError}</span>
              )}
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
                className={`btn ${
                  submitSuccess ? "btn-success" : "btn-primary"
                }`}
                disabled={
                  isSubmitting ||
                  (projectPhases &&
                    projectPhases.length > 0 &&
                    !newTask.projectPhaseId)
                }
              >
                {submitSuccess ? (
                  <>
                    <span className="text-success-content">✓</span>
                    Task Created!
                  </>
                ) : isSubmitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Task Modal Component
const EditTaskModal = ({
  showEditModal,
  setShowEditModal,
  selectedTask,
  projectUsers,
}: {
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  selectedTask: TaskCard | null;
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
  const updateTaskMutation = useUpdateTask();

  // Fetch project phases for the task's project
  const { data: projectPhases = [], isLoading: phasesLoading } =
    useProjectPhases(selectedTask?.projectId || "");

  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    assigneeId: "",
    status: "Pending" as TaskStatus,
    priority: "Medium" as TaskPriority,
    progress: 0,
    estimatedHours: undefined as number | undefined,
    actualHours: undefined as number | undefined,
    dueDate: "",
    tags: [] as string[],
    projectPhaseId: undefined as string | undefined, // NEW
  });

  // Transform tags array to simple string array for react-tag-input-component
  const [tags, setTags] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Populate form when modal opens with selected task data
  useEffect(() => {
    if (showEditModal && selectedTask) {
      setEditTask({
        title: selectedTask.title,
        description: selectedTask.description || "",
        assigneeId: selectedTask.assigneeId || "",
        status: selectedTask.status,
        priority: selectedTask.priority,
        progress: selectedTask.progress,
        estimatedHours: selectedTask.estimatedHours,
        actualHours: selectedTask.actualHours,
        dueDate: selectedTask.dueDate || "",
        tags: selectedTask.tags || [],
        projectPhaseId: selectedTask.projectPhaseId || undefined, // populate phase
      });
      setTags(selectedTask.tags || []); // Set tags
      setSubmitSuccess(false); // Reset success state
    }
  }, [showEditModal, selectedTask]);

  // Update tags in editTask when tags state changes
  useEffect(() => {
    setEditTask((prev) => ({ ...prev, tags }));
  }, [tags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setIsSubmitting(true);

    try {
      const taskData = {
        title: editTask.title.trim(),
        description: editTask.description?.trim() || undefined,
        assigneeId: editTask.assigneeId?.trim() || undefined,
        status: editTask.status,
        priority: editTask.priority,
        progress: editTask.progress,
        estimatedHours: editTask.estimatedHours || undefined,
        actualHours: editTask.actualHours || undefined,
        dueDate: editTask.dueDate || undefined,
        tags: tags,
        projectPhaseId: editTask.projectPhaseId || undefined, // NEW
      };

      await updateTaskMutation.mutateAsync({
        id: selectedTask.id,
        task: taskData,
      });

      // Show success feedback
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
      }, 1000);

      // Show success message
      console.log("Task updated successfully!");
    } catch (error) {
      console.error("Failed to update task:", error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showEditModal || !selectedTask) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Edit Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col w-full form-control">
            <label className="label">
              <span className="label-text">
                Task Title <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              required
              value={editTask.title}
              onChange={(e) =>
                setEditTask((t) => ({ ...t, title: e.target.value }))
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
                value={editTask.priority}
                onChange={(e) =>
                  setEditTask((t) => ({
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
                value={editTask.status}
                onChange={(e) =>
                  setEditTask((t) => ({
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
                value={editTask.assigneeId || ""}
                onChange={(e) =>
                  setEditTask((t) => ({ ...t, assigneeId: e.target.value }))
                }
                disabled={isSubmitting}
              >
                <option value="">Select assignee (optional)</option>
                {projectUsers.map((userProject) => (
                  <option key={userProject.user.id} value={userProject.user.id}>
                    {userProject.user.firstName} {userProject.user.lastName} (
                    {userProject.projectRole})
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
                value={editTask.dueDate || ""}
                onChange={(e) =>
                  setEditTask((t) => ({ ...t, dueDate: e.target.value }))
                }
                disabled={isSubmitting}
                min={new Date().toISOString().split("T")[0]} // Prevent past dates
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Estimated Hours</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                min="0"
                step="0.5"
                value={editTask.estimatedHours || ""}
                onChange={(e) =>
                  setEditTask((t) => ({
                    ...t,
                    estimatedHours: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="Enter estimated hours"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Actual Hours</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                min="0"
                step="0.5"
                value={editTask.actualHours || ""}
                onChange={(e) =>
                  setEditTask((t) => ({
                    ...t,
                    actualHours: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="Enter actual hours"
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
                value={editTask.progress}
                onChange={(e) =>
                  setEditTask((t) => ({
                    ...t,
                    progress: Math.min(
                      100,
                      Math.max(0, Number(e.target.value) || 0)
                    ),
                  }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex flex-col w-full form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={editTask.description}
              onChange={(e) =>
                setEditTask((t) => ({ ...t, description: e.target.value }))
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

          <div className="flex flex-col w-full form-control">
            <label className="label">
              <span className="label-text">Phase (optional)</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={editTask.projectPhaseId || ""}
              onChange={(e) =>
                setEditTask((t) => ({
                  ...t,
                  projectPhaseId: e.target.value || undefined,
                }))
              }
              disabled={isSubmitting || phasesLoading}
            >
              <option value="">No phase</option>
              {phasesLoading ? (
                <option>Loading phases...</option>
              ) : (
                projectPhases.map((phase: ProjectPhase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.parentId ? `└─ ${phase.name}` : phase.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => setShowEditModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${submitSuccess ? "btn-success" : "btn-primary"}`}
              disabled={isSubmitting}
            >
              {submitSuccess ? (
                <>
                  <span className="text-success-content">✓</span>
                  Task Updated!
                </>
              ) : isSubmitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Update Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Task Details Component (moved outside to prevent re-rendering)
const TaskDetails = ({
  selectedTask,
  setMainTab,
  setShowEditModal,
  deleteTaskMutation,
  refetchTasks,
  newComment,
  setNewComment,
}: {
  selectedTask: TaskCard | null;
  setMainTab: (tab: MainTab) => void;
  setShowEditModal: (show: boolean) => void;
  deleteTaskMutation: ReturnType<typeof useDeleteTask>;
  refetchTasks: () => void;
  newComment: string;
  setNewComment: (comment: string) => void;
}) => {
  const createCommentMutation = useCreateComment();
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Fetch real-time comments for the selected task
  const { data: taskComments = [], isLoading: commentsLoading } =
    useTaskComments(selectedTask?.id || "");

  if (!selectedTask) return null;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        taskId: selectedTask.id,
        content: newComment.trim(),
      });

      setNewComment("");
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 2000);
      // The mutation will automatically invalidate and refetch the task comments
    } catch (error) {
      console.error("Failed to create comment:", error);
      // Handle error (you can replace this with your error notification system)
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTaskMutation.mutateAsync(selectedTask.id);
        setMainTab("all-tasks");
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
      assignedTo: selectedTask.assignee
        ? `${selectedTask.assignee.firstName} ${
            selectedTask.assignee.lastName || ""
          }`
        : "Unassigned",
      dueDate: selectedTask.dueDate || "No due date",
      progress: `${selectedTask.progress}%`,
      description: selectedTask.description || "No description",
      tags: selectedTask.tags?.join(", ") || "",
      estimatedHours: selectedTask.estimatedHours || "Not specified",
      actualHours: selectedTask.actualHours || "Not specified",
      comments:
        selectedTask.comments
          ?.map((c) => `${c.user.firstName}: ${c.content}`)
          .join("\n") || "",
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
          <h1 className="text-2xl font-bold">{selectedTask.title}</h1>
        </div>
        <div className="flex gap-2">
          {/* download */}
          <button
            className="btn btn-success btn-sm"
            onClick={handleDownloadTask}
          >
            <MdDownload />
            <span className="hidden sm:inline">Download</span>
          </button>
          {/* edit */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setShowEditModal(true);
            }}
          >
            <MdEdit />
            <span className="hidden sm:inline">Edit</span>
          </button>
          {/* delete */}
          <button
            className="btn btn-error btn-sm"
            onClick={handleDeleteTask}
            disabled={deleteTaskMutation.isPending}
          >
            {deleteTaskMutation.isPending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <MdDelete />
            )}
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-base-100 p-4 rounded-xl">
            <h3 className="font-semibold mb-4">Task Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className=" bg-base-200 p-2 rounded-xl">
                <label className="block text-sm font-medium mb-1">Status</label>
                <span
                  className={`badge ${
                    selectedTask.status === "Completed"
                      ? "badge-success"
                      : selectedTask.status === "In Progress"
                      ? "badge-warning"
                      : selectedTask.status === "Cancelled"
                      ? "badge-error"
                      : "badge-neutral"
                  }`}
                >
                  {selectedTask.status}
                </span>
              </div>
              <div className=" bg-base-200 p-2 rounded-xl">
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <span
                  className={`badge ${
                    selectedTask.priority === "Critical"
                      ? "badge-error"
                      : selectedTask.priority === "High"
                      ? "badge-error"
                      : selectedTask.priority === "Medium"
                      ? "badge-warning"
                      : "badge-success"
                  }`}
                >
                  {selectedTask.priority}
                </span>
              </div>
              <div className=" bg-base-200 p-2 rounded-xl">
                <label className="block text-sm font-medium mb-1">
                  Progress
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-base-300 rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full"
                      style={{ width: `${selectedTask.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{selectedTask.progress}%</span>
                </div>
              </div>
              <div className=" bg-base-200 p-2 rounded-xl">
                <label className="block text-sm font-medium mb-1">
                  Due Date
                </label>
                <span className="text-sm">
                  {selectedTask.dueDate || "No due date"}
                </span>
              </div>
              <div className=" bg-base-200 p-2 rounded-xl">
                <label className="block text-sm font-medium mb-1">
                  Assigned To
                </label>
                <div className="flex items-center gap-2">
                  {selectedTask.assignee ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {selectedTask.assignee.firstName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm">
                        {selectedTask.assignee.firstName}{" "}
                        {selectedTask.assignee.lastName || ""}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-base-content/50">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>
              <div className=" bg-base-200 p-2 rounded-xl">
                <label className="block text-sm font-medium mb-1">
                  Estimated Hours
                </label>
                <span className="text-sm">
                  {selectedTask.estimatedHours || "Not specified"}
                </span>
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
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 bg-base-200 rounded"
                  >
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
            {commentsLoading ? (
              <div className="flex justify-center">
                <span className="loading loading-spinner loading-sm"></span>
              </div>
            ) : taskComments && taskComments.length > 0 ? (
              taskComments.map((comment) => (
                <div key={comment.id} className="bg-base-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {comment.user.firstName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {comment.user.firstName} {comment.user.lastName || ""}
                    </span>
                    <span className="text-xs text-base-content/60">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-base-content/80">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-base-content/60">No comments yet</p>
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                className={`input input-sm input-bordered w-full ${
                  commentSuccess ? "input-success" : ""
                }`}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddComment();
                  }
                }}
                disabled={createCommentMutation.isPending}
              />
              {commentSuccess && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <span className="text-success text-xs">✓ Posted!</span>
                </div>
              )}
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddComment}
              disabled={createCommentMutation.isPending || !newComment.trim()}
            >
              {createCommentMutation.isPending ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <MdSend />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskManagement = () => {
  const [mainTab, setMainTab] = useState<MainTab>("all-tasks");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskCard | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    statuses: [],
    assignees: [],
    dateRange: { start: "", end: "" },
    phaseId: "", // NEW
  });
  const [appliedFilters, setAppliedFilters] = useState<TaskFilters>({
    statuses: [],
    assignees: [],
    dateRange: { start: "", end: "" },
    phaseId: "", // NEW
  });
  const [showFilters, setShowFilters] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);

  // Get auth user
  const { user } = useAuthStore();

  // Fetch user projects
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(
    user?.id || ""
  );

  // Fetch selected project details including users
  const { data: selectedProjectResponse, isLoading: projectDataLoading } =
    useProject(selectedProject);
  const selectedProjectData = selectedProjectResponse?.data as
    | Project
    | undefined;

  // Fetch tasks for the selected project
  const {
    data: apiTasks = [],
    isLoading: tasksLoading,
    refetch: refetchTasks,
    isFetching: tasksRefetching,
  } = useTasks(selectedProject ? { projectId: selectedProject } : undefined);

  // Task mutations
  const deleteTaskMutation = useDeleteTask();
  const updateTaskMutation = useUpdateTask();
  const createTaskMutation = useCreateTask();

  // Fetch project phases for the selected project (used by filters and modals)
  const { data: projectPhases = [], isLoading: phasesLoading } =
    useProjectPhases(selectedProject);

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
      projectPhaseId: task.projectPhaseId || undefined, // map phase id
      projectPhase: task.projectPhase
        ? { id: task.projectPhase.id, name: task.projectPhase.name }
        : undefined,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : undefined,
      description: task.description,
      tags: task.tags || [],
      progress: task.progress,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      comments: task.comments?.map((comment) => ({
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

  // Keep selectedTask updated with latest data from the tasks array
  useEffect(() => {
    if (selectedTask && tasks.length > 0) {
      const updatedTask = tasks.find((task) => task.id === selectedTask.id);
      if (
        updatedTask &&
        JSON.stringify(updatedTask) !== JSON.stringify(selectedTask)
      ) {
        setSelectedTask(updatedTask);
      }
    }
  }, [tasks, selectedTask]);

  // Check if projects is available and is an array
  const hasProjects = Array.isArray(projects) && projects.length > 0;

  // Apply filters using useMemo for better performance
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply filters only when appliedFilters change
    if (appliedFilters.statuses.length > 0) {
      filtered = filtered.filter((task) =>
        appliedFilters.statuses.includes(task.status)
      );
    }

    if (appliedFilters.assignees.length > 0) {
      filtered = filtered.filter(
        (task) =>
          task.assigneeId && appliedFilters.assignees.includes(task.assigneeId)
      );
    }

    if (appliedFilters.dateRange.start) {
      filtered = filtered.filter(
        (task) => task.dueDate && task.dueDate >= appliedFilters.dateRange.start
      );
    }

    if (appliedFilters.dateRange.end) {
      filtered = filtered.filter(
        (task) => task.dueDate && task.dueDate <= appliedFilters.dateRange.end
      );
    }

    // NEW: filter by project phase id if provided
    if (appliedFilters.phaseId) {
      filtered = filtered.filter(
        (task) =>
          task.projectPhaseId && task.projectPhaseId === appliedFilters.phaseId
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
    return (
      appliedFilters.statuses.length > 0 ||
      appliedFilters.assignees.length > 0 ||
      appliedFilters.dateRange.start !== "" ||
      appliedFilters.dateRange.end !== "" ||
      !!appliedFilters.phaseId // include phase filter
    );
  }, [appliedFilters]);

  // Function to clear all filters
  const clearFilters = () => {
    setFilters({
      statuses: [],
      assignees: [],
      dateRange: { start: "", end: "" },
      phaseId: "", // reset phase filter
    });
    setAppliedFilters({
      statuses: [],
      assignees: [],
      dateRange: { start: "", end: "" },
      phaseId: "", // reset phase filter
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

    // Set loading state for this specific task
    setMovingTaskId(card.id);

    // Update task status in the API
    try {
      await updateTaskMutation.mutateAsync({
        id: card.id,
        task: { status: newStatus },
      });

      // Update selected task if it's the one being moved
      if (selectedTask?.id === card.id) {
        setSelectedTask((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      // You could show an error toast here
    } finally {
      setMovingTaskId(null);
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
              t.assignee
                ? `${t.assignee.firstName} ${t.assignee.lastName || ""}`
                : "Unassigned"
            },${t.dueDate || ""},${t.progress}%,${t.description || ""}`
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
    const isMoving = movingTaskId === card.id;

    return (
      <div
        className={`bg-base-200 min-w-[260px] shadow-xl mb-2 border border-base-300 rounded-xl p-1 transition-all duration-200 hover:shadow-2xl cursor-pointer hover:scale-105 relative ${
          isMoving ? "opacity-60" : ""
        }`}
        onClick={() => {
          if (!isMoving) {
            setSelectedTask(card);
            setMainTab("task-details");
          }
        }}
      >
        {/* Loading overlay for moving tasks */}
        {isMoving && (
          <div className="absolute inset-0 bg-base-300/50 rounded-xl flex items-center justify-center z-10">
            <div className="flex items-center gap-2 bg-base-100 px-3 py-2 rounded-lg shadow">
              <span className="loading loading-spinner loading-sm"></span>
              <span className="text-sm">Updating status...</span>
            </div>
          </div>
        )}

        <div className="flex bg-base-300 p-2 w-full rounded-t-xl justify-between items-start mb-3">
          <h3 className="font-semibold text-sm text-base-content line-clamp-2 flex-1">
            {card.title}
          </h3>
          <div className="flex items-center gap-1">
            <span
              className={`badge badge-xs ${
                card.priority === "Critical"
                  ? "badge-error"
                  : card.priority === "High"
                  ? "badge-error"
                  : card.priority === "Medium"
                  ? "badge-warning"
                  : "badge-success"
              }`}
            >
              {card.priority}
            </span>
          </div>
        </div>
        {/* Card Content */}
        <div className="space-y-2 p-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-base-content/60">Progress:</span>
            <span className="text-xs font-medium">{card.progress}%</span>
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
                    {card.assignee.firstName} {card.assignee.lastName || ""}
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
              <span className="text-xs">{card.dueDate || "No due date"}</span>
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
                <span className="badge badge-xs badge-ghost">
                  +{card.tags.length - 3}
                </span>
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
    const projectAssignees =
      selectedProjectData?.userProjects
        ?.filter((userProject) => userProject.isActive)
        ?.map((userProject) => ({
          id: userProject.user.id,
          name: `${userProject.user.firstName} ${userProject.user.lastName}`,
          role: userProject.projectRole,
        })) || [];

    return (
      <div className="bg-base-200 p-4 rounded-xl border border-base-300 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MdFilterList />
            Filters
          </h3>
          <div className="flex gap-2">
            <button className="btn btn-xs btn-primary" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="btn btn-xs btn-outline" onClick={clearFilters}>
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
                  setFilters((prev) => ({
                    ...prev,
                    statuses: [e.target.value as TaskStatus],
                  }));
                } else {
                  setFilters((prev) => ({ ...prev, statuses: [] }));
                }
              }}
            >
              <option value="">All Statuses</option>
              {(
                [
                  "Pending",
                  "In Progress",
                  "Completed",
                  "Cancelled",
                ] as TaskStatus[]
              ).map((status) => (
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
                  setFilters((prev) => ({
                    ...prev,
                    assignees: [e.target.value],
                  }));
                } else {
                  setFilters((prev) => ({ ...prev, assignees: [] }));
                }
              }}
            >
              <option value="">All Assignees</option>
              {projectAssignees.map((assignee) => (
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
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value },
                  }))
                }
              />
              <input
                type="date"
                className="input input-sm input-bordered w-full"
                placeholder="End date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          {/* NEW: Project Phase Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Phase</label>
            <select
              className="select select-sm select-bordered w-full"
              value={filters.phaseId || ""}
              onChange={(e) => {
                const val = e.target.value;
                setFilters((prev) => ({ ...prev, phaseId: val || "" }));
              }}
              disabled={phasesLoading}
            >
              <option value="">All Phases</option>
              {phasesLoading ? (
                <option>Loading phases...</option>
              ) : (
                projectPhases.map((phase: ProjectPhase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.parentId ? `└─ ${phase.name}` : phase.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Analytics Component
  const Analytics = () => {
    const statusCounts = {
      pending: tasks.filter((t) => t.status === "Pending").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
      cancelled: tasks.filter((t) => t.status === "Cancelled").length,
    };

    const priorityCounts = {
      low: tasks.filter((t) => t.priority === "Low").length,
      medium: tasks.filter((t) => t.priority === "Medium").length,
      high: tasks.filter((t) => t.priority === "High").length,
      critical: tasks.filter((t) => t.priority === "Critical").length,
    };

    const totalTasks = tasks.length;
    const completionRate =
      totalTasks > 0 ? (statusCounts.completed / totalTasks) * 100 : 0;
    const averageProgress =
      totalTasks > 0
        ? tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks
        : 0;

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stats bg-base-200 shadow-xl shadow-neutral-400/20">
            <div className="stat ">
              <div className="stat-figure text-primary">
                <MdAssignment className="text-2xl" />
              </div>
              <div className="stat-title">Total Tasks</div>
              <div className="stat-value text-primary">{totalTasks}</div>
            </div>
          </div>

          <div className="stats bg-base-200  shadow-xl shadow-neutral-400/20">
            <div className="stat">
              <div className="stat-figure text-success">
                <MdTrendingUp className="text-2xl" />
              </div>
              <div className="stat-title">Completion Rate</div>
              <div className="stat-value text-success">
                {completionRate.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="stats bg-base-200  shadow-xl shadow-neutral-400/20">
            <div className="stat">
              <div className="stat-figure text-warning">
                <MdSchedule className="text-2xl" />
              </div>
              <div className="stat-title">In Progress</div>
              <div className="stat-value text-warning">
                {statusCounts.inProgress}
              </div>
            </div>
          </div>

          <div className="stats bg-base-200  shadow-xl shadow-neutral-400/20">
            <div className="stat">
              <div className="stat-figure text-info">
                <MdCalendarToday className="text-2xl" />
              </div>
              <div className="stat-title">Avg Progress</div>
              <div className="stat-value text-info">
                {averageProgress.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
        <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
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
                        style={{
                          width: `${
                            totalTasks > 0
                              ? (statusCounts.pending / totalTasks) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm w-8 text-right">
                      {statusCounts.pending}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">In Progress</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-base-300 rounded-full h-2">
                      <div
                        className="bg-warning h-2 rounded-full"
                        style={{
                          width: `${
                            totalTasks > 0
                              ? (statusCounts.inProgress / totalTasks) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm w-8 text-right">
                      {statusCounts.inProgress}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-base-300 rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full"
                        style={{
                          width: `${
                            totalTasks > 0
                              ? (statusCounts.completed / totalTasks) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm w-8 text-right">
                      {statusCounts.completed}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cancelled</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-base-300 rounded-full h-2">
                      <div
                        className="bg-error h-2 rounded-full"
                        style={{
                          width: `${
                            totalTasks > 0
                              ? (statusCounts.cancelled / totalTasks) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm w-8 text-right">
                      {statusCounts.cancelled}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-base-100 p-4 rounded-xl">
              <h3 className="font-semibold mb-4">Priority Distribution</h3>
              <div className="space-y-3">
                {Object.entries(priorityCounts).map(([priority, count]) => (
                  <div
                    key={priority}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm capitalize">{priority}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-base-300 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            priority === "critical"
                              ? "bg-error"
                              : priority === "high"
                              ? "bg-warning"
                              : priority === "medium"
                              ? "bg-info"
                              : "bg-success"
                          }`}
                          style={{
                            width: `${
                              totalTasks > 0 ? (count / totalTasks) * 100 : 0
                            }%`,
                          }}
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
    <div className="p-4 sm:p-6 lg:p-8 relative">
      {/* Global loading overlay for mutations */}
      {(updateTaskMutation.isPending ||
        deleteTaskMutation.isPending ||
        createTaskMutation.isPending) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-base-100 p-6 rounded-2xl shadow-2xl flex items-center gap-4">
            <span className="loading loading-spinner loading-lg"></span>
            <span className="text-lg font-medium">
              {createTaskMutation.isPending
                ? "Creating task..."
                : updateTaskMutation.isPending
                ? "Updating task..."
                : "Deleting task..."}
            </span>
          </div>
        </div>
      )}

      <AddTaskModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        selectedProject={selectedProject}
        projectUsers={
          selectedProjectData?.userProjects?.filter((up) => up.isActive) || []
        }
      />

      <EditTaskModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        selectedTask={selectedTask}
        projectUsers={
          selectedProjectData?.userProjects?.filter((up) => up.isActive) || []
        }
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
          className={`tab text-base flex items-center gap-2 ${
            mainTab === "all-tasks" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setMainTab("all-tasks")}
        >
          All Tasks
          {tasksRefetching && (
            <span className="loading loading-spinner loading-xs"></span>
          )}
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
                className={`btn btn-sm ${
                  showFilters ? "btn-soft" : "btn-neutral"
                }`}
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

            <div className="bg-base-200 border border-base-300 p-4 rounded-2xl">
              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between mb-4">
                <div className="flex items-center gap-4 mb-2">
                  <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => setShowAddModal(true)}
                    disabled={
                      !selectedProject ||
                      projectDataLoading ||
                      createTaskMutation.isPending ||
                      phasesLoading || // NEW: disable while phases loading
                      (!phasesLoading && projectPhases.length === 0) // NEW: disable if no phases
                    }
                    title={
                      !phasesLoading && projectPhases.length === 0
                        ? "Create project phases first"
                        : undefined
                    }
                  >
                    {createTaskMutation.isPending ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <MdAddTask />
                    )}
                    Add Task
                  </button>
                  <button
                    className="btn btn-soft flex items-center gap-2"
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
                      viewMode === "kanban" ? "btn-neutral" : "btn-outline"
                    }`}
                    onClick={() => setViewMode("kanban")}
                  >
                    <MdViewColumn />
                    Kanban
                  </button>
                  <button
                    className={`btn btn-sm ${
                      viewMode === "table" ? "btn-neutral" : "btn-outline"
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
                      {selectedProject
                        ? "No tasks have been created for this project yet."
                        : "Select a project to view its tasks."}
                    </p>
                    {selectedProject && (
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                        disabled={
                          phasesLoading ||
                          (!phasesLoading && projectPhases.length === 0)
                        }
                        title={
                          !phasesLoading && projectPhases.length === 0
                            ? "Create project phases first"
                            : undefined
                        }
                      >
                        <MdAddTask className="mr-2" />
                        {!phasesLoading && projectPhases.length === 0
                          ? "Create Phases First"
                          : "Add First Task"}
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
                          <h3 className="font-bold text-lg text-white">
                            {title}
                          </h3>
                          <span className="badge badge-neutral">
                            {cards.length}
                          </span>
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
                              <span
                                className={`badge badge-sm ${
                                  task.priority === "Critical"
                                    ? "badge-error"
                                    : task.priority === "High"
                                    ? "badge-error"
                                    : task.priority === "Medium"
                                    ? "badge-warning"
                                    : "badge-success"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </td>
                            <td>
                              {task.assignee
                                ? `${task.assignee.firstName} ${
                                    task.assignee.lastName || ""
                                  }`
                                : "Unassigned"}
                            </td>
                            <td>{task.dueDate || "No due date"}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-base-300 rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">
                                  {task.progress}%
                                </span>
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
                          <td
                            colSpan={7}
                            className="text-center text-gray-500 py-8"
                          >
                            {tasksLoading
                              ? "Loading tasks..."
                              : "No tasks found in this project."}
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

        {mainTab === "task-details" && (
          <TaskDetails
            selectedTask={selectedTask}
            setMainTab={setMainTab}
            setShowEditModal={setShowEditModal}
            deleteTaskMutation={deleteTaskMutation}
            refetchTasks={refetchTasks}
            newComment={newComment}
            setNewComment={setNewComment}
          />
        )}
        {mainTab === "analytics" && <Analytics />}
      </div>
    </div>
  );
};

export default TaskManagement;

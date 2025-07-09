import { useState, useEffect, useRef } from "react";
import {
  MdCalendarToday,
  MdWbSunny,
  MdGroup,
  MdSchedule,
  MdAdd,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/gantt.css";
import { type Project } from "../hooks/useProjects";
import { useUserProjects } from "../hooks/useUsers";
import { useAuthStore } from "../stores/useAuthStore";
import {
  useProjectPhases,
  useScheduleEvents,
  useDailyLogsByDate,
  useCreateProjectPhase,
  useUpdateProjectPhase,
  useDeleteProjectPhase,
  useDeleteDailyLog,
  useDeleteDailyActivity,
  useCreateScheduleEvent,
  useUpdateScheduleEvent,
  useDeleteScheduleEvent,
  useCreateDailyLog,
  useUpdateDailyLog,
  useCreateDailyActivity,
  useUpdateDailyActivity,
  type ProjectPhase,
  type ScheduleEvent,
  type DailyLog,
  type DailyActivity,
  type CreateProjectPhaseDto,
  type CreateScheduleEventDto,
  type CreateDailyLogDto,
  type UpdateDailyLogDto,
  type CreateDailyActivityDto,
  type UpdateDailyActivityDto,
} from "../hooks/useSchedule";

// Set up the localizer
const localizer = momentLocalizer(moment);

// Custom styles for react-big-calendar
const calendarStyle = {
  height: "100%",
  fontFamily: "inherit",
} as const;

const eventStyleGetter = (event: { resource: string }) => {
  let backgroundColor = "#3174ad";
  let borderColor = "#3174ad";

  // Color code events by resource type
  switch (event.resource) {
    case "delivery":
      backgroundColor = "#10b981"; // green
      borderColor = "#10b981";
      break;
    case "inspection":
      backgroundColor = "#f59e0b"; // yellow
      borderColor = "#f59e0b";
      break;
    case "task":
      backgroundColor = "#ef4444"; // red
      borderColor = "#ef4444";
      break;
    case "milestone":
      backgroundColor = "#8b5cf6"; // purple
      borderColor = "#8b5cf6";
      break;
    case "meeting":
      backgroundColor = "#3b82f6"; // blue
      borderColor = "#3b82f6";
      break;
    case "other":
      backgroundColor = "#6b7280"; // gray
      borderColor = "#6b7280";
      break;
    default:
      backgroundColor = "#3174ad"; // blue
      borderColor = "#3174ad";
  }

  return {
    style: {
      backgroundColor,
      borderColor,
      color: "white",
      border: "1px solid " + borderColor,
      borderRadius: "4px",
    },
  };
};

type ScheduleTab = "gantt" | "timeline" | "calendar" | "logs";

// Define types for frappe-gantt
interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string;
  custom_class?: string;
  parent?: string;
}

interface GanttInstance {
  change_view_mode: (mode: string) => void;
  refresh: (tasks: GanttTask[]) => void;
  [key: string]: unknown;
}

// GanttChart component using frappe-gantt
const GanttChart = ({ tasks }: { tasks: GanttTask[] }) => {
  const ganttRef = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<GanttInstance | null>(null);
  const [viewMode, setViewMode] = useState("Day");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeGantt = async () => {
      if (!ganttRef.current) {
        setIsLoading(false);
        return;
      }

      if (!tasks.length) {
        setIsLoading(false);
        setError("No tasks available to display");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Import frappe-gantt dynamically
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const module = await import("frappe-gantt" as any);

        if (!mounted) return;

        // Handle default export - frappe-gantt exports Gantt as default export
        const GanttClass = module.default;

        if (!GanttClass) {
          throw new Error("Gantt class not found in frappe-gantt module");
        }

        // Destroy existing instance if it exists
        if (ganttInstance.current) {
          ganttInstance.current = null;
        }

        // Clear the container
        if (ganttRef.current) {
          ganttRef.current.innerHTML = "";
        }

        // Create new Gantt instance with div container
        if (ganttRef.current && GanttClass) {
          ganttInstance.current = new GanttClass(ganttRef.current, tasks, {
            header_height: 50,
            column_width: 30,
            step: 24,
            bar_height: 20,
            bar_corner_radius: 3,
            arrow_curve: 5,
            padding: 18,
            view_mode: viewMode,
            date_format: "YYYY-MM-DD",
            language: "en",
            custom_popup_html: null,
          }) as GanttInstance;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load frappe-gantt:", error);
        setError("Failed to load Gantt chart. Please try refreshing the page.");
        setIsLoading(false);
      }
    };

    initializeGantt();

    return () => {
      mounted = false;
      if (ganttInstance.current) {
        ganttInstance.current = null;
      }
    };
  }, [tasks, viewMode]);

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    if (ganttInstance.current && ganttInstance.current.change_view_mode) {
      ganttInstance.current.change_view_mode(mode);
    }
  };

  if (error) {
    return (
      <div className="w-full">
        <div className="flex flex-wrap gap-2 mb-4">
          {["Quarter Day", "Half Day", "Day", "Week", "Month"].map((mode) => (
            <button
              key={mode}
              onClick={() => handleViewModeChange(mode)}
              className={`btn btn-sm ${
                viewMode === mode ? "btn-primary" : "btn-outline"
              }`}
              disabled
            >
              {mode}
            </button>
          ))}
        </div>
        {error === "No tasks available to display" ? (
          <div className="text-center py-12">
            <div className="text-6xl text-base-content/20 mb-4">📊</div>
            <h3 className="text-xl font-semibold text-base-content/70 mb-2">
              No tasks to display
            </h3>
            <p className="text-base-content/50">
              Add some tasks to see them in the Gantt chart
            </p>
          </div>
        ) : (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center w-full justify-between mb-4">
        {/* View Mode Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["Quarter Day", "Half Day", "Day", "Week", "Month"].map((mode) => (
            <button
              key={mode}
              onClick={() => handleViewModeChange(mode)}
              className={`btn btn-sm ${
                viewMode === mode ? "btn-primary" : "btn-outline"
              }`}
              disabled={isLoading}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Milestone</span>
          </div>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div
        className="relative w-[1100px] overflow-x-auto border border-base-300 rounded-lg"
        style={{ minHeight: "400px" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-100 z-10">
            <div className="loading loading-spinner loading-lg"></div>
            <span className="ml-2">Loading Gantt chart...</span>
          </div>
        )}
        <div
          ref={ganttRef}
          className="gantt-target w-full h-full"
          style={{ minHeight: "400px" }}
        />
      </div>
    </div>
  );
};

const ScheduleManagement = () => {
  const [activeTab, setActiveTab] = useState<ScheduleTab>("gantt");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  const [phaseForm, setPhaseForm] = useState<CreateProjectPhaseDto>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    projectId: "",
    color: "#3174ad",
    progress: 0,
    parentId: "",
  });

  // Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [eventForm, setEventForm] = useState<CreateScheduleEventDto>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    projectId: "",
    type: "TASK",
    priority: "MEDIUM",
    location: "",
    color: "#3174ad",
    allDay: false,
    assignedUserId: "",
  });

  // Daily Log modal state
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [showDeleteLogModal, setShowDeleteLogModal] = useState(false);
  const [logToDelete, setLogToDelete] = useState<DailyLog | null>(null);
  const [logForm, setLogForm] = useState({
    date: moment().format("YYYY-MM-DD"),
    projectId: "",
    weather: "",
    notes: "",
    workHours: 0,
    workersPresent: 0,
  });

  // Daily Activity modal state
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<DailyActivity | null>(null);
  const [selectedLogForActivity, setSelectedLogForActivity] = useState<DailyLog | null>(null);
  const [activityForm, setActivityForm] = useState({
    description: "",
    dailyLogId: "",
    startTime: "",
    endTime: "",
    duration: 0,
    workersInvolved: 0,
    progress: 0,
    status: "NOT_STARTED" as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED',
    notes: "",
  });

  // Get auth user
  const { user } = useAuthStore();

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } =
    useUserProjects(user?.id || "");

  // Set default project when projects load
  useEffect(() => {
    if (Array.isArray(projects) && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  // Fetch project phases
  const { data: projectPhases = [], isLoading: phasesLoading } =
    useProjectPhases(selectedProject);

  // Fetch schedule events
  const { data: scheduleEvents = [], isLoading: eventsLoading } =
    useScheduleEvents(selectedProject);

  // Fetch daily logs for selected date
  const { data: dailyLogs = [], isLoading: logsLoading } = useDailyLogsByDate(
    selectedProject,
    selectedDate || ""
  );

  // Mutations
  const createPhaseMutation = useCreateProjectPhase();
  const updatePhaseMutation = useUpdateProjectPhase();
  const deletePhaseMutation = useDeleteProjectPhase();
  const deleteLogMutation = useDeleteDailyLog();
  const deleteActivityMutation = useDeleteDailyActivity();

  // Event mutations
  const createEventMutation = useCreateScheduleEvent();
  const updateEventMutation = useUpdateScheduleEvent();
  const deleteEventMutation = useDeleteScheduleEvent();

  // Log mutations
  const createLogMutation = useCreateDailyLog();
  const updateLogMutation = useUpdateDailyLog();

  // Activity mutations
  const createActivityMutation = useCreateDailyActivity();
  const updateActivityMutation = useUpdateDailyActivity();

  // Transform project phases to Gantt tasks
  const transformPhaseToGanttTask = (phase: ProjectPhase): GanttTask => {
    return {
      id: phase.id,
      name: phase.name,
      start: moment(phase.startDate).format("YYYY-MM-DD"),
      end: moment(phase.endDate).format("YYYY-MM-DD"),
      progress: phase.progress,
      custom_class: phase.progress === 100 ? "bar-milestone" : "bar-progress",
      dependencies: phase.parentId ? phase.parentId : "",
    };
  };

  // Transform schedule events to calendar events
  const transformEventToCalendarEvent = (event: ScheduleEvent) => {
    return {
      id: event.id,
      title: event.title,
      start: new Date(event.startDate),
      end: new Date(event.endDate || event.startDate),
      resource: event.type.toLowerCase(),
      allDay: event.allDay,
    };
  };

  // Handle phase form
  const handlePhaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      // Clean up the form data
      const cleanedForm = {
        ...phaseForm,
        parentId: phaseForm.parentId || undefined,
      };

      if (editingPhase) {
        await updatePhaseMutation.mutateAsync({
          id: editingPhase.id,
          phase: cleanedForm,
        });
      } else {
        await createPhaseMutation.mutateAsync({
          ...cleanedForm,
          projectId: selectedProject,
        });
      }
      setShowPhaseModal(false);
      setEditingPhase(null);
      setPhaseForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        projectId: "",
        color: "#3174ad",
        progress: 0,
        parentId: "",
      });
    } catch (error) {
      console.error("Error saving phase:", error);
    }
  };

  const handleEditPhase = (phase: ProjectPhase) => {
    setEditingPhase(phase);
    setPhaseForm({
      name: phase.name,
      description: phase.description || "",
      startDate: moment(phase.startDate).format("YYYY-MM-DDTHH:mm"),
      endDate: moment(phase.endDate).format("YYYY-MM-DDTHH:mm"),
      projectId: phase.projectId,
      color: phase.color || "#3174ad",
      progress: phase.progress,
      parentId: phase.parentId || "",
    });
    setShowPhaseModal(true);
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (window.confirm("Are you sure you want to delete this phase?")) {
      try {
        await deletePhaseMutation.mutateAsync(phaseId);
      } catch (error) {
        console.error("Error deleting phase:", error);
      }
    }
  };

  const handleDeleteLog = (log: DailyLog) => {
    setLogToDelete(log);
    setShowDeleteLogModal(true);
  };

  const confirmDeleteLog = async () => {
    if (!logToDelete) return;
    
    try {
      await deleteLogMutation.mutateAsync(logToDelete.id);
      setShowDeleteLogModal(false);
      setLogToDelete(null);
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  const handleEditLog = (log: DailyLog) => {
    setEditingLog(log);
    setLogForm({
      date: moment(log.date).format("YYYY-MM-DD"),
      projectId: log.projectId,
      weather: log.weather || "",
      notes: log.notes || "",
      workHours: log.workHours || 0,
      workersPresent: log.workersPresent || 0,
    });
    setShowLogModal(true);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await deleteActivityMutation.mutateAsync(activityId);
      } catch (error) {
        console.error("Error deleting activity:", error);
      }
    }
  };

  // Event handling functions
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      const cleanedForm = {
        ...eventForm,
        assignedUserId: eventForm.assignedUserId || undefined,
      };

      if (editingEvent) {
        await updateEventMutation.mutateAsync({
          id: editingEvent.id,
          event: cleanedForm,
        });
      } else {
        await createEventMutation.mutateAsync({
          ...cleanedForm,
          projectId: selectedProject,
        });
      }
      setShowEventModal(false);
      setEditingEvent(null);
      setEventForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        projectId: "",
        type: "TASK",
        priority: "MEDIUM",
        location: "",
        color: "#3174ad",
        allDay: false,
        assignedUserId: "",
      });
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || "",
      startDate: moment(event.startDate).format("YYYY-MM-DDTHH:mm"),
      endDate: moment(event.endDate || event.startDate).format("YYYY-MM-DDTHH:mm"),
      projectId: event.projectId,
      type: event.type,
      priority: event.priority,
      location: event.location || "",
      color: event.color || "#3174ad",
      allDay: event.allDay,
      assignedUserId: event.assignedUserId || "",
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEventMutation.mutateAsync(eventId);
        setShowEventDetails(false);
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleShowEventDetails = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  // Log handling functions
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      if (editingLog) {
        // Update existing log
        const logData: UpdateDailyLogDto = {
          weather: logForm.weather || undefined,
          notes: logForm.notes || undefined,
          workHours: logForm.workHours || undefined,
          workersPresent: logForm.workersPresent || undefined,
        };
        await updateLogMutation.mutateAsync({
          id: editingLog.id,
          log: logData,
        });
      } else {
        // Create new log
        const logData: CreateDailyLogDto = {
          ...logForm,
          projectId: selectedProject,
          workHours: logForm.workHours || undefined,
          workersPresent: logForm.workersPresent || undefined,
          weather: logForm.weather || undefined,
          notes: logForm.notes || undefined,
        };
        await createLogMutation.mutateAsync(logData);
      }
      
      setShowLogModal(false);
      setEditingLog(null);
      setLogForm({
        date: moment().format("YYYY-MM-DD"),
        projectId: "",
        weather: "",
        notes: "",
        workHours: 0,
        workersPresent: 0,
      });
      
      // Set selected date to today to show the newly created/updated log
      setSelectedDate(moment().format("YYYY-MM-DD"));
    } catch (error) {
      console.error("Error saving log:", error);
    }
  };

  // Activity handling functions
  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLogForActivity) return;

    try {
      if (editingActivity) {
        // Update existing activity
        const activityData: UpdateDailyActivityDto = {
          description: activityForm.description || undefined,
          startTime: activityForm.startTime || undefined,
          endTime: activityForm.endTime || undefined,
          workersInvolved: activityForm.workersInvolved || undefined,
          progress: activityForm.progress || undefined,
          status: activityForm.status,
          notes: activityForm.notes || undefined,
        };
        await updateActivityMutation.mutateAsync({
          id: editingActivity.id,
          activity: activityData,
        });
      } else {
        // Create new activity
        const activityData: CreateDailyActivityDto = {
          description: activityForm.description,
          dailyLogId: selectedLogForActivity.id,
          startTime: activityForm.startTime || undefined,
          endTime: activityForm.endTime || undefined,
          workersInvolved: activityForm.workersInvolved || undefined,
          progress: activityForm.progress || undefined,
          status: activityForm.status,
          notes: activityForm.notes || undefined,
        };
        await createActivityMutation.mutateAsync(activityData);
      }
      
      setShowActivityModal(false);
      setEditingActivity(null);
      setSelectedLogForActivity(null);
      setActivityForm({
        description: "",
        dailyLogId: "",
        startTime: "",
        endTime: "",
        duration: 0,
        workersInvolved: 0,
        progress: 0,
        status: "NOT_STARTED",
        notes: "",
      });
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const handleAddActivity = (log: DailyLog) => {
    setSelectedLogForActivity(log);
    setEditingActivity(null);
    setActivityForm({
      description: "",
      dailyLogId: log.id,
      startTime: "",
      endTime: "",
      duration: 0,
      workersInvolved: 0,
      progress: 0,
      status: "NOT_STARTED",
      notes: "",
    });
    setShowActivityModal(true);
  };

  const handleEditActivity = (activity: DailyActivity) => {
    setEditingActivity(activity);
    setSelectedLogForActivity(activity.dailyLog || null);
    setActivityForm({
      description: activity.description,
      dailyLogId: activity.dailyLogId,
      startTime: activity.startTime || "",
      endTime: activity.endTime || "",
      duration: activity.duration || 0,
      workersInvolved: activity.workersInvolved || 0,
      progress: activity.progress || 0,
      status: activity.status,
      notes: activity.notes || "",
    });
    setShowActivityModal(true);
  };

  // Helper function to organize phases hierarchically
  const organizePhases = (phases: ProjectPhase[]) => {
    // Create a map for quick lookup
    const phaseMap = new Map(phases.map((phase) => [phase.id, phase]));

    // Separate parent and child phases
    const parentPhases = phases.filter((phase) => !phase.parentId);
    const childPhases = phases.filter((phase) => phase.parentId);

    // Sort parent phases by start date
    parentPhases.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // Build organized list
    const organizedPhases: ProjectPhase[] = [];

    parentPhases.forEach((parent) => {
      organizedPhases.push(parent);

      // Add children of this parent
      const children = childPhases
        .filter((child) => child.parentId === parent.id)
        .sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

      organizedPhases.push(...children);
    });

    // Add orphaned phases (phases with parent that doesn't exist)
    const orphanedPhases = childPhases.filter(
      (child) => child.parentId && !phaseMap.has(child.parentId)
    );
    organizedPhases.push(...orphanedPhases);

    return organizedPhases;
  };

  // Get organized phases
  const organizedPhases = organizePhases(projectPhases);

  // Get Gantt tasks from project phases
  const ganttTasks = organizedPhases.map(transformPhaseToGanttTask);

  // Get calendar events from schedule events
  const calendarEvents = scheduleEvents.map(transformEventToCalendarEvent);

  // Check if projects is available and is an array
  const hasProjects = Array.isArray(projects) && projects.length > 0;

  // If no projects available, show a message
  if (!projectsLoading && !hasProjects) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No Projects Available
            </h2>
            <p className="text-gray-500">
              You don't have access to any projects or no projects have been
              created yet.
            </p>
            <p className="text-gray-500 mt-2">
              Please contact your administrator or create a new project to get
              started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule Management</h1>
          <p className="text-gray-500 mt-1">
            Manage project schedules: Gantt charts, timelines, calendars, and
            daily logs.
          </p>
        </div>
        {/* Task view selection */}
        <div className="flex items-center justify-end mb-1">
          <div className="flex gap-4 items-center">
            {" "}
            <select
              className="select select-bordered"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={projectsLoading}
            >
              {projectsLoading ? (
                <option>Loading projects...</option>
              ) : hasProjects ? (
                projects.map((project: Project) => (
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

      {/* Tabs for schedule types */}
      <div className="tabs tabs-border mt-6">
        <button
          className={`tab text-base ${
            activeTab === "gantt" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setActiveTab("gantt")}
        >
          Gantt Chart
        </button>
        <button
          className={`tab text-base ${
            activeTab === "timeline" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setActiveTab("timeline")}
        >
          Timeline
        </button>
        <button
          className={`tab text-base ${
            activeTab === "calendar" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setActiveTab("calendar")}
        >
          Calendar
        </button>
        <button
          className={`tab text-base ${
            activeTab === "logs" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setActiveTab("logs")}
        >
          Daily Logs
        </button>
      </div>
      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        {/* Tab Content */}
        <div className="mt-4">
          {/* Gantt Chart */}
          {activeTab === "gantt" && (
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6">
              {phasesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loading loading-spinner loading-lg"></div>
                </div>
              ) : ganttTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl text-base-content/20 mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                    No project phases to display
                  </h3>
                  <p className="text-base-content/50 mb-6">
                    Create project phases to see them in the Gantt chart
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab("timeline")}
                  >
                    <MdAdd className="mr-2" />
                    Add Project Phase
                  </button>
                </div>
              ) : (
                <GanttChart tasks={ganttTasks} />
              )}
            </div>
          )}

          {/* Timeline */}
          {activeTab === "timeline" && (
            <div className="my-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Project Phases</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingPhase(null);
                    setPhaseForm({
                      name: "",
                      description: "",
                      startDate: "",
                      endDate: "",
                      projectId: selectedProject,
                      color: "#3174ad",
                      progress: 0,
                      parentId: "",
                    });
                    setShowPhaseModal(true);
                  }}
                >
                  <MdAdd className="mr-2" />
                  Add Phase
                </button>
              </div>

              {phasesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loading loading-spinner loading-lg"></div>
                </div>
              ) : projectPhases.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl text-base-content/20 mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                    No project phases yet
                  </h3>
                  <p className="text-base-content/50 mb-6">
                    Create your first project phase to get started with timeline
                    management
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingPhase(null);
                      setPhaseForm({
                        name: "",
                        description: "",
                        startDate: "",
                        endDate: "",
                        projectId: selectedProject,
                        color: "#3174ad",
                        progress: 0,
                        parentId: "",
                      });
                      setShowPhaseModal(true);
                    }}
                  >
                    <MdAdd className="mr-2" />
                    Add First Phase
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {organizedPhases.map((phase) => (
                    <div
                      key={phase.id}
                      className={`flex items-center gap-4 p-4 rounded-xl bg-base-100 border border-base-300 hover:shadow-md transition-shadow ${
                        phase.parentId ? "ml-8 border-l-4 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {phase.parentId && (
                              <span className="text-xs text-base-content/50">
                                └─
                              </span>
                            )}
                            <h3 className="font-semibold text-lg">
                              {phase.name}
                            </h3>
                          </div>
                          <div className="badge badge-outline">
                            {phase.progress}% Complete
                          </div>
                          {phase.parentId && (
                            <div className="badge badge-ghost badge-sm">
                              Sub-phase
                            </div>
                          )}
                        </div>
                        {phase.description && (
                          <p className="text-base-content/70 mb-2">
                            {phase.description}
                          </p>
                        )}
                        {phase.parent && (
                          <div className="text-sm text-base-content/50 mb-2">
                            Parent: {phase.parent.name}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-base-content/60">
                          <span>
                            Start:{" "}
                            {moment(phase.startDate).format("MMM DD, YYYY")}
                          </span>
                          <span>
                            End: {moment(phase.endDate).format("MMM DD, YYYY")}
                          </span>
                          <span>
                            Duration:{" "}
                            {moment(phase.endDate).diff(
                              moment(phase.startDate),
                              "days"
                            )}{" "}
                            days
                          </span>
                        </div>
                        <div className="w-full bg-base-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${phase.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleEditPhase(phase)}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost text-error"
                          onClick={() => handleDeletePhase(phase.id)}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calendar */}
          {activeTab === "calendar" && (
            <div className="bg-base-100 border border-base-300 rounded-2xl p-3">
              {/* Heading */}
              <div className="flex justify-between items-center my-3">
                <div className="text-xs text-gray-500 mt-2">
                  Click on an event to view details or date to view logs for that day.
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingEvent(null);
                    setEventForm({
                      title: "",
                      description: "",
                      startDate: "",
                      endDate: "",
                      projectId: selectedProject,
                      type: "TASK",
                      priority: "MEDIUM",
                      location: "",
                      color: "#3174ad",
                      allDay: false,
                      assignedUserId: "",
                    });
                    setShowEventModal(true);
                  }}
                >
                  <MdAdd className="mr-2" />
                  Add Event
                </button>
              </div>
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Deliveries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Inspections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-sm">Milestones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm">Meetings</span>
                  </div>
                </div>

              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loading loading-spinner loading-lg"></div>
                </div>
              ) : (
                <div
                  className="bg-base-200 rounded-2xl"
                  style={{ height: "600px" }}
                >
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={calendarStyle}
                    eventPropGetter={eventStyleGetter}
                    date={currentDate}
                    onNavigate={(newDate) => setCurrentDate(newDate)}
                    view={currentView}
                    onView={(newView) => setCurrentView(newView)}
                    onSelectEvent={(event) => {
                      // Find the actual event from scheduleEvents
                      const actualEvent = scheduleEvents.find(e => e.id === event.id);
                      if (actualEvent) {
                        handleShowEventDetails(actualEvent);
                      }
                    }}
                    onSelectSlot={(slotInfo) => {
                      // Handle clicking on empty slots
                      const dateString = moment(slotInfo.start).format(
                        "YYYY-MM-DD"
                      );
                      setSelectedDate(dateString);
                      setActiveTab("logs");
                    }}
                    selectable
                    popup
                    views={["month", "week", "day", "agenda"]}
                    step={30}
                    showMultiDayTimes
                    formats={{
                      dateFormat: "D",
                      dayFormat: "ddd D",
                      weekdayFormat: "ddd",
                      monthHeaderFormat: "MMMM YYYY",
                      dayHeaderFormat: "dddd, MMMM D",
                      dayRangeHeaderFormat: ({ start, end }) =>
                        `${moment(start).format("MMMM D")} - ${moment(
                          end
                        ).format("MMMM D, YYYY")}`,
                      agendaDateFormat: "ddd, MMM D",
                      agendaTimeFormat: "h:mm A",
                      agendaTimeRangeFormat: ({ start, end }) =>
                        `${moment(start).format("h:mm A")} - ${moment(
                          end
                        ).format("h:mm A")}`,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Daily Logs */}
          {activeTab === "logs" && (
            <div className="">
              <div className="flex items-center justify-between mb-6">
                <div>
                  {selectedDate && (
                    <p className="text-base-content font-bold text-2xl mt-1">
                      {moment(selectedDate).format("dddd, MMMM D, YYYY")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingLog(null);
                      setLogForm({
                        date: moment().format("YYYY-MM-DD"),
                        projectId: selectedProject,
                        weather: "",
                        notes: "",
                        workHours: 0,
                        workersPresent: 0,
                      });
                      setShowLogModal(true);
                    }}
                  >
                    <MdAdd className="mr-2" />
                    Add Log
                  </button>
                  {selectedDate && (
                    <div className="badge badge-primary badge-lg">
                      {dailyLogs.length} logs
                    </div>
                  )}
                </div>
              </div>

              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loading loading-spinner loading-lg"></div>
                </div>
              ) : selectedDate && dailyLogs.length > 0 ? (
                <div className="space-y-6">
                  {dailyLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-base-300 rounded-xl p-6 bg-base-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">Daily Log</h3>
                            {log.logger && (
                              <span className="text-sm text-base-content/60">
                                by {log.logger.firstName} {log.logger.lastName}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-base-content/60 mb-3">
                            {log.weather && (
                              <span className="flex items-center gap-1">
                                <MdWbSunny />
                                Weather: {log.weather}
                              </span>
                            )}
                            {log.workHours && (
                              <span className="flex items-center gap-1">
                                <MdSchedule />
                                Work Hours: {log.workHours}
                              </span>
                            )}
                            {log.workersPresent && (
                              <span className="flex items-center gap-1">
                                <MdGroup />
                                Workers: {log.workersPresent}
                              </span>
                            )}
                          </div>
                          {log.summary && (
                            <p className="text-base-content/80 mb-3">
                              {log.summary}
                            </p>
                          )}
                          {log.notes && (
                            <p className="text-base-content/70 text-sm mb-3">
                              <strong>Notes:</strong> {log.notes}
                            </p>
                          )}
                        </div>
                        {user && user.id === log.loggedById && moment(log.date).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") && (
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={() => handleEditLog(log)}
                            >
                              <MdEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-ghost text-error"
                              onClick={() => handleDeleteLog(log)}
                            >
                              <MdDelete />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Activities */}
                      <div className="border-t border-base-300 pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold">Activities</h4>
                          {user && user.id === log.loggedById && moment(log.date).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") && (
                            <button
                              className="btn btn-xs btn-primary"
                              onClick={() => handleAddActivity(log)}
                            >
                              <MdAdd className="mr-1" />
                              Add Activity
                            </button>
                          )}
                        </div>
                        {log.activities && log.activities.length > 0 ? (
                          <div className="space-y-3">
                            {log.activities.map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-start justify-between p-3 bg-base-200 rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">
                                      {activity.description}
                                    </span>
                                    {activity.status && (
                                      <span
                                        className={`badge badge-sm ${
                                          activity.status === "COMPLETED"
                                            ? "badge-success"
                                            : activity.status === "IN_PROGRESS"
                                            ? "badge-warning"
                                            : activity.status === "ON_HOLD"
                                            ? "badge-error"
                                            : "badge-ghost"
                                        }`}
                                      >
                                        {activity.status.replace("_", " ")}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-4 text-xs text-base-content/60">
                                    {activity.startTime && activity.endTime && (
                                      <span>
                                        {activity.startTime} -{" "}
                                        {activity.endTime}
                                      </span>
                                    )}
                                    {activity.duration && (
                                      <span>{activity.duration}h duration</span>
                                    )}
                                    {activity.workersInvolved && (
                                      <span>
                                        {activity.workersInvolved} workers
                                      </span>
                                    )}
                                    {activity.progress !== undefined && (
                                      <span>{activity.progress}% complete</span>
                                    )}
                                  </div>
                                  {activity.notes && (
                                    <p className="text-xs text-base-content/70 mt-1">
                                      {activity.notes}
                                    </p>
                                  )}
                                </div>
                                {user && user.id === log.loggedById && moment(log.date).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") && (
                                  <div className="flex gap-1">
                                    <button
                                      className="btn btn-xs btn-ghost"
                                      onClick={() => handleEditActivity(activity)}
                                    >
                                      <MdEdit />
                                    </button>
                                    <button
                                      className="btn btn-xs btn-ghost text-error"
                                      onClick={() =>
                                        handleDeleteActivity(activity.id)
                                      }
                                    >
                                      <MdDelete />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-base-content/60">
                            <p className="text-sm">No activities recorded for this log.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <div className="text-center py-12">
                  <div className="text-6xl text-base-content/20 mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                    No logs found
                  </h3>
                  <p className="text-base-content/50">
                    No construction logs were recorded for{" "}
                    {moment(selectedDate).format("MMMM D, YYYY")}
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl text-base-content/20 mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                    Select a date
                  </h3>
                  <p className="text-base-content/50 mb-6">
                    Choose a date from the calendar to view daily construction
                    logs
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab("calendar")}
                  >
                    <MdCalendarToday className="mr-2" />
                    Go to Calendar
                  </button>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {selectedDate && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelectedDate(null)}
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phase Modal */}
      {showPhaseModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingPhase ? "Edit Phase" : "Add New Phase"}
            </h3>
            <form onSubmit={handlePhaseSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phase Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={phaseForm.name}
                  onChange={(e) =>
                    setPhaseForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={phaseForm.description}
                  onChange={(e) =>
                    setPhaseForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Parent Phase (Optional)</span>
                </label>
                <select
                  className="select select-bordered"
                  value={phaseForm.parentId || ""}
                  onChange={(e) =>
                    setPhaseForm((prev) => ({
                      ...prev,
                      parentId: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">No parent (Top-level phase)</option>
                  {projectPhases
                    .filter((phase) => {
                      // Don't show self as parent
                      if (phase.id === editingPhase?.id) return false;
                      // Don't show child phases of current phase to avoid circular dependency
                      if (editingPhase && phase.parentId === editingPhase.id) return false;
                      return true;
                    })
                    .map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.parentId ? `└─ ${phase.name}` : phase.name}
                      </option>
                    ))}
                </select>
                {phaseForm.parentId && (
                  <div className="text-xs text-base-content/60 mt-1">
                    This phase will be displayed as a sub-phase of the selected parent.
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Start Date</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={phaseForm.startDate}
                    onChange={(e) =>
                      setPhaseForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">End Date</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={phaseForm.endDate}
                    onChange={(e) =>
                      setPhaseForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Progress (%)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={phaseForm.progress}
                    onChange={(e) =>
                      setPhaseForm((prev) => ({
                        ...prev,
                        progress: Number(e.target.value),
                      }))
                    }
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Color</span>
                  </label>
                  <input
                    type="color"
                    className="input input-bordered"
                    value={phaseForm.color}
                    onChange={(e) =>
                      setPhaseForm((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowPhaseModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    createPhaseMutation.isPending ||
                    updatePhaseMutation.isPending
                  }
                >
                  {createPhaseMutation.isPending ||
                  updatePhaseMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : editingPhase ? (
                    "Update Phase"
                  ) : (
                    "Create Phase"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingEvent ? "Edit Event" : "Add New Event"}
            </h3>
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Event Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Event Type</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={eventForm.type}
                    onChange={(e) =>
                      setEventForm((prev) => ({ ...prev, type: e.target.value as typeof eventForm.type }))
                    }
                  >
                    <option value="MEETING">Meeting</option>
                    <option value="TASK">Task</option>
                    <option value="MILESTONE">Milestone</option>
                    <option value="INSPECTION">Inspection</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Priority</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={eventForm.priority}
                    onChange={(e) =>
                      setEventForm((prev) => ({ ...prev, priority: e.target.value as typeof eventForm.priority }))
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Start Date</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={eventForm.startDate}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">End Date</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered"
                    value={eventForm.endDate}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Location</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={eventForm.location}
                  onChange={(e) =>
                    setEventForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Color</span>
                  </label>
                  <input
                    type="color"
                    className="input input-bordered"
                    value={eventForm.color}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">All Day Event</span>
                  </label>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={eventForm.allDay}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        allDay: e.target.checked,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowEventModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    createEventMutation.isPending ||
                    updateEventMutation.isPending
                  }
                >
                  {createEventMutation.isPending ||
                  updateEventMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : editingEvent ? (
                    "Update Event"
                  ) : (
                    "Create Event"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">
                {selectedEvent.type === "MEETING" ? "🤝" : 
                 selectedEvent.type === "TASK" ? "📋" :
                 selectedEvent.type === "MILESTONE" ? "🎯" :
                 selectedEvent.type === "INSPECTION" ? "🔍" :
                 selectedEvent.type === "DELIVERY" ? "📦" : "📅"}
              </span>
              {selectedEvent.title}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-base-content/70">Type</label>
                  <div className="text-base-content">{selectedEvent.type}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-base-content/70">Priority</label>
                  <div className={`badge ${
                    selectedEvent.priority === "CRITICAL" ? "badge-error" :
                    selectedEvent.priority === "HIGH" ? "badge-warning" :
                    selectedEvent.priority === "MEDIUM" ? "badge-info" :
                    "badge-ghost"
                  }`}>
                    {selectedEvent.priority}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-base-content/70">Start Date</label>
                  <div className="text-base-content">
                    {moment(selectedEvent.startDate).format("MMM DD, YYYY h:mm A")}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-base-content/70">End Date</label>
                  <div className="text-base-content">
                    {selectedEvent.endDate ? 
                      moment(selectedEvent.endDate).format("MMM DD, YYYY h:mm A") : 
                      "No end date"
                    }
                  </div>
                </div>
              </div>
              
              {selectedEvent.location && (
                <div>
                  <label className="text-sm font-medium text-base-content/70">Location</label>
                  <div className="text-base-content">{selectedEvent.location}</div>
                </div>
              )}
              
              {selectedEvent.description && (
                <div>
                  <label className="text-sm font-medium text-base-content/70">Description</label>
                  <div className="text-base-content">{selectedEvent.description}</div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-base-content/70">Status</label>
                <div className={`badge ${
                  selectedEvent.status === "Completed" ? "badge-success" :
                  selectedEvent.status === "In Progress" ? "badge-warning" :
                  selectedEvent.status === "Cancelled" ? "badge-error" :
                  "badge-ghost"
                }`}>
                  {selectedEvent.status}
                </div>
              </div>
              
              {selectedEvent.assignees && selectedEvent.assignees.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-base-content/70">Assignees</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedEvent.assignees.map((assignee) => (
                      <div key={assignee.id} className="badge badge-outline">
                        {assignee.firstName} {assignee.lastName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-base-content/70">Created By</label>
                <div className="text-base-content">
                  {selectedEvent.createdBy.firstName} {selectedEvent.createdBy.lastName}
                </div>
              </div>
            </div>
            
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => setShowEventDetails(false)}
              >
                Close
              </button>
              {user && user.id === selectedEvent.createdBy.id && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setShowEventDetails(false);
                      handleEditEvent(selectedEvent);
                    }}
                  >
                    <MdEdit className="mr-2" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-error"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                  >
                    <MdDelete className="mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Daily Log Modal */}
      {showLogModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg mb-4">
              {editingLog ? "Edit Daily Log" : "Add Daily Log"}
            </h3>
            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered bg-base-200"
                  value={logForm.date}
                  readOnly
                />
                <div className="label">
                  <span className="label-text-alt text-info">
                    {editingLog ? "Log date cannot be changed" : "Date is automatically set to today and cannot be changed"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Weather</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={logForm.weather}
                    onChange={(e) =>
                      setLogForm((prev) => ({ ...prev, weather: e.target.value }))
                    }
                    placeholder="e.g., Sunny, Rainy, Cloudy"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Work Hours</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={logForm.workHours}
                    onChange={(e) =>
                      setLogForm((prev) => ({ ...prev, workHours: parseInt(e.target.value) || 0 }))
                    }
                    min="0"
                    max="24"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Workers Present</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={logForm.workersPresent}
                  onChange={(e) =>
                    setLogForm((prev) => ({ ...prev, workersPresent: parseInt(e.target.value) || 0 }))
                  }
                  min="0"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Notes</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={logForm.notes}
                  onChange={(e) =>
                    setLogForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="General notes about the day's work..."
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowLogModal(false);
                    setEditingLog(null);
                    setLogForm({
                      date: moment().format("YYYY-MM-DD"),
                      projectId: "",
                      weather: "",
                      notes: "",
                      workHours: 0,
                      workersPresent: 0,
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createLogMutation.isPending || updateLogMutation.isPending}
                >
                  {createLogMutation.isPending || updateLogMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : editingLog ? (
                    <>
                      <MdEdit className="mr-2" />
                      Update Log
                    </>
                  ) : (
                    <>
                      <MdAdd className="mr-2" />
                      Add Log
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Log Confirmation Modal */}
      {showDeleteLogModal && logToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete this daily log from{" "}
              {moment(logToDelete.date).format("MMMM DD, YYYY")}?
            </p>
            <p className="text-sm text-base-content/70 mb-4">
              This action cannot be undone and will also delete all associated activities.
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setShowDeleteLogModal(false);
                  setLogToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={confirmDeleteLog}
                disabled={deleteLogMutation.isPending}
              >
                {deleteLogMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <MdDelete className="mr-2" />
                    Delete Log
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingActivity ? "Edit Activity" : "Add Activity"}
            </h3>
            <form onSubmit={handleActivitySubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={activityForm.description}
                  onChange={(e) =>
                    setActivityForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe the activity..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Start Time</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered"
                    value={activityForm.startTime}
                    onChange={(e) =>
                      setActivityForm((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">End Time</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered"
                    value={activityForm.endTime}
                    onChange={(e) =>
                      setActivityForm((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Workers Involved</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={activityForm.workersInvolved}
                  onChange={(e) =>
                    setActivityForm((prev) => ({ ...prev, workersInvolved: parseInt(e.target.value) || 0 }))
                  }
                  min="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Progress (%)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={activityForm.progress}
                    onChange={(e) =>
                      setActivityForm((prev) => ({ ...prev, progress: parseInt(e.target.value) || 0 }))
                    }
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={activityForm.status}
                    onChange={(e) =>
                      setActivityForm((prev) => ({ 
                        ...prev, 
                        status: e.target.value as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'
                      }))
                    }
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Notes</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={activityForm.notes}
                  onChange={(e) =>
                    setActivityForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Additional notes about this activity..."
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowActivityModal(false);
                    setEditingActivity(null);
                    setSelectedLogForActivity(null);
                    setActivityForm({
                      description: "",
                      dailyLogId: "",
                      startTime: "",
                      endTime: "",
                      duration: 0,
                      workersInvolved: 0,
                      progress: 0,
                      status: "NOT_STARTED",
                      notes: "",
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createActivityMutation.isPending || updateActivityMutation.isPending}
                >
                  {createActivityMutation.isPending || updateActivityMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : editingActivity ? (
                    <>
                      <MdEdit className="mr-2" />
                      Update Activity
                    </>
                  ) : (
                    <>
                      <MdAdd className="mr-2" />
                      Add Activity
                    </>
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

export default ScheduleManagement;

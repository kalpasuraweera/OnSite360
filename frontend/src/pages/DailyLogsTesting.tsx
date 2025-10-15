import { useState, useEffect, useCallback, useRef } from "react";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdCalendarToday,
  MdVisibility,
  MdWork,
  MdAccessTime,
  MdNotes,
  MdPeople,
  MdWbSunny,
  MdCloud,
  MdOpacity,
  MdAcUnit,
  MdFlashOn,
  MdLocationOn,
  MdAssignment,
  MdFlag,
  MdLayers,
  MdAttachFile,
  MdFilePresent,
  MdDownload,
  MdClose,
  MdCloudUpload,
  MdPhoto,
  MdPictureAsPdf,
} from "react-icons/md";
import moment from "moment";
import { useAuthStore } from "../stores/useAuthStore";
import { useUserProjects } from "../hooks/useUsers";
import {
  useDailyLogs,
  useDailyLogsByDate,
  useCreateDailyLog,
  useUpdateDailyLog,
  useDeleteDailyLog,
  useCreateDailyActivity,
  useUpdateDailyActivity,
  useDeleteDailyActivity,
  type DailyLog,
  type DailyActivity,
  type CreateDailyLogDto,
  type UpdateDailyLogDto,
  type CreateDailyActivityDto,
  type UpdateDailyActivityDto,
} from "../hooks/useSchedule";
import { useTasks, type Task } from "../hooks/useTasks";
import {
  useProjectAttendanceByDate,
  type AttendanceRecord,
} from "../hooks/useProjects";

type DailyLogTab = "view_all" | "view_specific" | "add_log" | "view_details";

export default function DailyLogsManagement() {
  // Tab state
  const [activeTab, setActiveTab] = useState<DailyLogTab>("view_all");

  // Project selection
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Selected log for details view
  const [selectedLogForDetails, setSelectedLogForDetails] =
    useState<DailyLog | null>(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logToDelete, setLogToDelete] = useState<DailyLog | null>(null);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);

  // Activity modal state
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<DailyActivity | null>(
    null
  );
  const [selectedLogForActivity, setSelectedLogForActivity] =
    useState<DailyLog | null>(null);

  // Geolocation state
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  // File upload states
  const [logFiles, setLogFiles] = useState<File[]>([]);
  const [activityFiles, setActivityFiles] = useState<File[]>([]);
  const logFileInputRef = useRef<HTMLInputElement>(null);
  const activityFileInputRef = useRef<HTMLInputElement>(null);

  // Form state for adding/editing logs
  // Note: workHours and workersPresent are removed; attendance counts come from workforce
  const [logForm, setLogForm] = useState<Partial<CreateDailyLogDto>>({
    date: moment().format("YYYY-MM-DD"),
    projectId: "",
    weather: "",
    notes: "",
    coordinates: null, // Add coordinates field
  });

  // Activity form state
  const [activityForm, setActivityForm] = useState({
    activity: "",
    dailyLogId: "",
    startTime: "",
    endTime: "",
    progress: 0,
    status: "NOT_STARTED" as
      | "NOT_STARTED"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "ON_HOLD"
      | "CANCELLED",
    notes: "",
    taskId: "", // NEW: selected related task id
    coordinates: null as { lat: number; lng: number } | null,
    files: [] as File[], // Add files field for storing file links
  });

  // Get auth user
  const { user } = useAuthStore();

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(
    user?.id || ""
  );

  // Set default project when projects load
  useEffect(() => {
    if (Array.isArray(projects) && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
      setLogForm((prev) => ({ ...prev, projectId: projects[0].id }));
    }
  }, [projects, selectedProject]);

  // Fetch all daily logs for selected project
  const { data: allDailyLogs = [], isLoading: allLogsLoading } =
    useDailyLogs(selectedProject);

  // Fetch daily logs for specific date
  const { data: specificDateLogs = [], isLoading: specificLogsLoading } =
    useDailyLogsByDate(selectedProject, selectedDate);

  // Attendance for selected project/date (default to logForm.date or today when adding)
  const attendanceDateForQuery =
    selectedDate || logForm.date || moment().format("YYYY-MM-DD");
  const { data: attendanceResponse, isLoading: attendanceLoading } =
    useProjectAttendanceByDate(
      selectedProject,
      attendanceDateForQuery as string
    );

  // Mutations
  const createLogMutation = useCreateDailyLog();
  const updateLogMutation = useUpdateDailyLog();
  const deleteLogMutation = useDeleteDailyLog();

  // Activity mutations
  const createActivityMutation = useCreateDailyActivity();
  const updateActivityMutation = useUpdateDailyActivity();
  const deleteActivityMutation = useDeleteDailyActivity();

  // Fetch project tasks for optional related task selection in activity modal
  const { data: projectTasks = [], isLoading: projectTasksLoading } = useTasks(
    selectedProject ? { projectId: selectedProject } : undefined
  );

  // Weather options (label used as the weather string)
  const weatherOptions = [
    { key: "Sunny", Icon: MdWbSunny },
    { key: "Cloudy", Icon: MdCloud },
    { key: "Rain", Icon: MdOpacity },
    { key: "Snow", Icon: MdAcUnit },
    { key: "Thunderstorm", Icon: MdFlashOn },
  ];

  // Handle form changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLogForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle project change
  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setLogForm((prev) => ({ ...prev, projectId }));
  };

  // Handle log file selection
  const handleLogFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setLogFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Handle removing log file
  const handleRemoveLogFile = (index: number) => {
    setLogFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle activity file selection
  const handleActivityFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setActivityFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Handle removing activity file
  const handleRemoveActivityFile = (index: number) => {
    setActivityFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Function to get file icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (
      ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(
        extension || ""
      )
    ) {
      return <MdPhoto className="text-blue-500" />;
    } else if (["pdf"].includes(extension || "")) {
      return <MdPictureAsPdf className="text-red-500" />;
    } else {
      return <MdFilePresent className="text-gray-500" />;
    }
  };
  // Function to format file URL for display and download
    const getFileUrl = (fileUrl: string) => {
      return `${import.meta.env.VITE_DOCUMENTS_URL}${fileUrl}`;
    };
  
    // Handle form submit for adding/editing log
    const handleLogSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProject) return;
  
      try {
        if (editingLog) {
          // Update existing log - don't include files
          const updateData: UpdateDailyLogDto = {
            date: logForm.date as string,
            weather: (logForm.weather as string) || undefined,
            notes: (logForm.notes as string) || undefined,
            coordinates: logForm.coordinates || undefined,
          };
          await updateLogMutation.mutateAsync({
            id: editingLog.id,
            log: updateData,
          });
        } else {
          // Create new log - include files
          await createLogMutation.mutateAsync({
            ...logForm as CreateDailyLogDto,
            files: logFiles, // Pass files for upload
          });
        }
  
        // Reset form
        setLogForm({
          date: moment().format("YYYY-MM-DD"),
          projectId: selectedProject,
          weather: "",
          notes: "",
          coordinates: null,
        });
        setLogFiles([]);
        setEditingLog(null);
        setActiveTab("view_all");
      } catch (error) {
        console.error("Error saving log:", error);
      }
    };
  
    // Handle edit log
    const handleEditLog = (log: DailyLog) => {
      setEditingLog(log);
      setLogForm({
        date: moment(log.date).format("YYYY-MM-DD"),
        projectId: log.projectId,
        weather: log.weather || "",
        notes: log.notes || "",
        coordinates: log.coordinates || null,
      });
      setLogFiles([]);
      setActiveTab("add_log");
    };
  
    // Handle delete log
    const handleDeleteLog = (log: DailyLog) => {
      setLogToDelete(log);
      setShowDeleteModal(true);
    };
  
    const confirmDeleteLog = async () => {
      if (!logToDelete) return;
  
      try {
        await deleteLogMutation.mutateAsync(logToDelete.id);
        setShowDeleteModal(false);
        setLogToDelete(null);
      } catch (error) {
        console.error("Error deleting log:", error);
      }
    };
  
    // Activity handling functions
    const handleActivitySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedLogForActivity) return;
  
      try {
        // Helper function to combine date with time
        const combineDateTime = (time: string): string | undefined => {
          if (!time) return undefined;
          const logDate = moment(selectedLogForActivity.date).format(
            "YYYY-MM-DD"
          );
          return `${logDate}T${time}:00`;
        };
  
        if (editingActivity) {
          // Update existing activity - don't include files
          const activityData: UpdateDailyActivityDto = {
            activity: activityForm.activity || undefined,
            startTime: combineDateTime(activityForm.startTime),
            endTime: combineDateTime(activityForm.endTime),
            progress: activityForm.progress || undefined,
            status: activityForm.status,
            notes: activityForm.notes || undefined,
            taskId: activityForm.taskId || undefined,
            coordinates: activityForm.coordinates || undefined,
          };
          await updateActivityMutation.mutateAsync({
            id: editingActivity.id,
            activity: activityData,
          });
        } else {
          // Create new activity - include files
          const activityData: CreateDailyActivityDto = {
            activity: activityForm.activity,
            dailyLogId: selectedLogForActivity.id,
            startTime: combineDateTime(activityForm.startTime),
            endTime: combineDateTime(activityForm.endTime),
            progress: activityForm.progress || undefined,
            status: activityForm.status,
            notes: activityForm.notes || undefined,
            taskId: activityForm.taskId || undefined,
            coordinates: activityForm.coordinates || undefined,
          };
          await createActivityMutation.mutateAsync({
            ...activityData,
            files: activityFiles, // Pass files for upload
          });
        }
  
        setShowActivityModal(false);
        setEditingActivity(null);
        setSelectedLogForActivity(null);
        setActivityFiles([]);
        setActivityForm({
          activity: "",
          dailyLogId: "",
          startTime: "",
          endTime: "",
          progress: 0,
          status: "NOT_STARTED",
          notes: "",
          taskId: "",
          coordinates: null,
          files: [],
        });
      } catch (error) {
        console.error("Error saving activity:", error);
      }
    };
  
    const handleAddActivity = (log: DailyLog) => {
      setSelectedLogForActivity(log);
      setEditingActivity(null);
      setActivityForm({
        activity: "",
        dailyLogId: log.id,
        startTime: "",
        endTime: "",
        progress: 0,
        status: "NOT_STARTED",
        notes: "",
        taskId: "",
        coordinates: coordinates, // Include current coordinates
        files: [],
      });
      setShowActivityModal(true);
    };
  
    const handleEditActivity = (activity: DailyActivity) => {
      setEditingActivity(activity);
      setSelectedLogForActivity(activity.dailyLog || null);
  
      // Helper function to extract time from datetime
      const extractTime = (dateTime: string | null | undefined): string => {
        if (!dateTime) return "";
        return moment(dateTime).format("HH:mm");
      };
  
      setActivityForm({
        activity: activity.activity,
        dailyLogId: activity.dailyLogId,
        startTime: extractTime(activity.startTime),
        endTime: extractTime(activity.endTime),
        progress: activity.progress || 0,
        status: activity.status,
        notes: activity.notes || "",
        taskId: activity.taskId || (activity.task ? activity.task.id : "") || "",
        coordinates: activity.coordinates || coordinates,
        files: [], // Set existing files
      });
      setActivityFiles([]);
      setShowActivityModal(true);
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
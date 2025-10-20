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
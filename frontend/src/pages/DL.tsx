import { useState, useEffect, useCallback, useRef } from "react";
import {
  MdAdd,
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
            ...(logForm as CreateDailyLogDto),
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

    // Handle viewing log details
    const handleViewLogDetails = (log: DailyLog) => {
      setSelectedLogForDetails(log);
      setActiveTab("view_details");
    };

    // Function to get current geolocation - wrapped in useCallback
    const getCurrentLocation = useCallback(() => {
      if (!navigator.geolocation) {
        setGeoError("Geolocation is not supported by your browser");
        return;
      }

      setGeoLoading(true);
      setGeoError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoordinates(coords);
          setGeoLoading(false);

          // Update the forms with the coordinates - convert to expected format
          setLogForm((prev) => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }));
          if (showActivityModal) {
            setActivityForm((prev) => ({ ...prev, coordinates: coords }));
          }
        },
        (error) => {
          console.log(error);
          setGeoError(`Geolocation fetch failed`);
          setGeoLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }, [showActivityModal]); // Add dependencies that the function uses from component scope

    // Add effects to get geolocation when the tab changes or activity modal opens
    useEffect(() => {
      if (activeTab === "add_log") {
        getCurrentLocation();
      }
    }, [activeTab, getCurrentLocation]);

    useEffect(() => {
      if (showActivityModal) {
        getCurrentLocation();
      }
    }, [showActivityModal, getCurrentLocation]);

    // Check if projects is available and is an array
    const hasProjects = Array.isArray(projects) && projects.length > 0;

    // If no projects available, show a message
    if (!projectsLoading && !hasProjects) {
      return (
        <div className="p-8">
          <div className="text-center py-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm inline-block">
              <MdWork className="mx-auto text-6xl text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                No Projects Available
              </h2>
              <p className="text-gray-500">
                You need to be assigned to a project to view daily logs.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Function to format coordinates for display
    const formatCoordinates = (
      coordinates: { lat: number; lng: number } | null
    ) => {
      if (!coordinates) return null;
      return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
    };

    // Function to get a link to Google Maps for coordinates
    const getMapLink = (coordinates: { lat: number; lng: number } | null) => {
      if (!coordinates) return null;
      return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    };

    return (
      <div className="p-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold">Daily Logs Management</h1>
            <p className="text-gray-500 mt-1">
              Track and manage daily project activities and work progress.
            </p>
          </div>
          {/* Project selection */}
          <div className="flex items-center justify-end mb-1">
            <div className="flex gap-4 items-center">
              <select
                className="select select-bordered"
                value={selectedProject}
                onChange={(e) => handleProjectChange(e.target.value)}
                disabled={projectsLoading}
              >
                {projectsLoading ? (
                  <option>Loading projects...</option>
                ) : Array.isArray(projects) && projects.length > 0 ? (
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

        {/* Tabs for log management */}
        <div className="tabs tabs-border mt-6">
          <button
            className={`tab text-base ${
              activeTab === "view_all" ? "tab-active font-bold" : ""
            }`}
            onClick={() => setActiveTab("view_all")}
          >
            All Logs
          </button>
          <button
            className={`tab text-base ${
              activeTab === "view_specific" ? "tab-active font-bold" : ""
            }`}
            onClick={() => setActiveTab("view_specific")}
          >
            By Date
          </button>
          <button
            className={`tab text-base ${
              activeTab === "add_log" ? "tab-active font-bold" : ""
            }`}
            onClick={() => {
              setActiveTab("add_log");
              setEditingLog(null);
              setLogForm({
                date: moment().format("YYYY-MM-DD"),
                projectId: selectedProject,
                weather: "",
                notes: "",
              });
            }}
          >
            Add Log
          </button>
          {selectedLogForDetails && (
            <button
              className={`tab text-base ${
                activeTab === "view_details" ? "tab-active font-bold" : ""
              }`}
              onClick={() => setActiveTab("view_details")}
            >
              Log Details
            </button>
          )}
        </div>

        <div
          id="tab-navigation"
          className="bg-base-200 border border-base-300 p-6 rounded-2xl min-h-[400px]"
        >
          {/* Tab Content */}
          {activeTab === "view_all" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MdVisibility className="text-blue-600" />
                  </div>
                  All Daily Logs
                </h2>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                  {allLogsLoading
                    ? "Loading..."
                    : `${allDailyLogs.length} logs found`}
                </div>
              </div>

              {allLogsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : allDailyLogs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-base-100 p-6 rounded-2xl shadow-sm inline-block">
                    <MdCalendarToday className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Daily Logs Found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start by creating your first daily log entry.
                    </p>
                    <button
                      className="btn btn-primary btn-lg gap-2"
                      onClick={() => setActiveTab("add_log")}
                    >
                      <MdAdd />
                      Add Daily Log
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {allDailyLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-base-100 rounded-xl p-6 border border-base-300 shadow-sm hover:shadow-xl hover:shadow-neutral/10 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="bg-blue-100 p-3 rounded-xl">
                              <MdCalendarToday className="text-blue-600 text-lg" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">
                                {moment(log.date).format("MMMM D, YYYY")}
                              </h3>
                              <span className="badge badge-outline badge-lg">
                                {moment(log.date).format("dddd")}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {log.weather && (
                              <div className="flex items-center gap-2">
                                <MdWbSunny className="text-orange-500" />
                                <span className="text-sm font-medium text-gray-600">
                                  Weather:
                                </span>
                                <span className="text-sm">{log.weather}</span>
                              </div>
                            )}

                            {/* Show coordinates if available */}
                            {log.coordinates && (
                              <div className="flex items-center gap-2">
                                <MdLocationOn className="text-blue-500" />
                                <span className="text-sm font-medium text-gray-600">
                                  Location:
                                </span>
                                <a
                                  href={getMapLink(log.coordinates) || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  View on map
                                </a>
                              </div>
                            )}

                            {/* Show activities count */}
                            <div className="flex items-center gap-2">
                              <MdWork className="text-purple-500" />
                              <span className="text-sm font-medium text-gray-600">
                                Activities:
                              </span>
                              <span className="text-sm">
                                {log._count?.activities ||
                                  log.activities?.length ||
                                  0}
                              </span>
                            </div>

                            {/* Show file attachments count if available */}
                            {log.files && log.files.length > 0 && (
                              <div className="flex items-center gap-2">
                                <MdAttachFile className="text-amber-500" />
                                <span className="text-sm font-medium text-gray-600">
                                  Files:
                                </span>
                                <span className="text-sm">
                                  {log.files.length}
                                </span>
                              </div>
                            )}
                          </div>

                          {log.notes && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <MdNotes className="text-purple-500" />
                                <span className="text-sm font-medium text-gray-600">
                                  Notes:
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                {log.notes}
                              </p>
                            </div>
                          )}

                          <div className="text-xs text-gray-500 mb-4">
                            Logged by {log.logger.firstName} {log.logger.lastName}{" "}
                            •{" "}
                            {moment(log.createdAt).format(
                              "MMM D, YYYY [at] h:mm A"
                            )}
                          </div>

                          {/* Quick Summary */}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {log.activities && log.activities.length > 0 && (
                              <div className="flex items-center gap-1">
                                <MdWork className="text-blue-500" />
                                <span>{log.activities.length} activities</span>
                              </div>
                            )}
                            <button
                              className="btn btn-sm btn-outline btn-primary"
                              onClick={() => handleViewLogDetails(log)}
                            >
                              <MdVisibility className="mr-1" />
                              View Details
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleEditLog(log)}
                            title="Edit Log"
                          >
                            <MdEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-error btn-outline"
                            onClick={() => handleDeleteLog(log)}
                            title="Delete Log"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "view_specific" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MdSearch className="text-green-600" />
                  </div>
                  View Logs for Specific Date
                </h2>
                <div className="flex items-center gap-4 bg-base-300 p-4 rounded-lg">
                  <MdCalendarToday className="text-gray-500 text-xl" />
                  <label className="text-sm font-medium text-gray-700">
                    Select Date:
                  </label>
                  <input
                    type="date"
                    className="input input-bordered input-sm"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              {selectedDate ? (
                <>
                  {specificLogsLoading ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                  ) : specificDateLogs.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-base-100 p-6 rounded-2xl shadow-sm inline-block">
                        <MdCalendarToday className="mx-auto text-6xl text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          No Logs Found
                        </h3>
                        <p className="text-gray-500 mb-6">
                          No daily logs were found for {moment(selectedDate).format("MMMM D, YYYY")}.
                        </p>
                        <button
                          className="btn btn-primary btn-lg gap-2"
                          onClick={() => {
                            setLogForm((prev) => ({
                              ...prev,
                              date: selectedDate,
                            }));
                            setActiveTab("add_log");
                          }}
                        >
                          <MdAdd />
                          Add Log for This Date
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {specificDateLogs.map((log) => (
                        <div
                          key={log.id}
                          className="bg-base-100 rounded-xl p-6 border border-base-300 shadow-sm hover:shadow-xl hover:shadow-neutral/10 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {log.weather && (
                                  <div className="flex items-center gap-2">
                                    <MdWbSunny className="text-orange-500" />
                                    <span className="text-sm font-medium text-gray-600">Weather:</span>
                                    <span className="text-sm">{log.weather}</span>
                                  </div>
                                )}
                                {/* Attendance/Workforce info shown from attendance data (see Add Log tab) */}
                              </div>

                              {log.notes && (
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MdNotes className="text-purple-500" />
                                    <span className="text-sm font-medium text-gray-600">Notes:</span>
                                  </div>
                                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{log.notes}</p>
                                </div>
                              )}

                              <div className="text-xs text-gray-500 mb-4">
                                Logged by {log.logger.firstName} {log.logger.lastName} • {moment(log.createdAt).format("MMM D, YYYY [at] h:mm A")}
                              </div>

                              {/* Quick Summary */}
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                {log.activities && log.activities.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <MdWork className="text-blue-500" />
                                    <span>{log.activities.length} activities</span>
                                  </div>
                                )}
                                <button
                                  className="btn btn-sm btn-outline btn-primary"
                                  onClick={() => handleViewLogDetails(log)}
                                >
                                  <MdVisibility className="mr-1" />
                                  View Details
                                </button>
                              </div>
                            </div>

                            <div className="flex gap-2 ml-4">
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => handleEditLog(log)}
                                title="Edit Log"
                              >
                                <MdEdit />
                              </button>
                              <button
                                className="btn btn-sm btn-error btn-outline"
                                onClick={() => handleDeleteLog(log)}
                                title="Delete Log"
                              >
                                <MdDelete />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-base-100 p-6 rounded-2xl shadow-sm inline-block">
                    <MdCalendarToday className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Date</h3>
                    <p className="text-gray-500">Choose a date to view daily logs for that specific day.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "add_log" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${editingLog ? "bg-orange-100" : "bg-purple-100"}`}
                >
                  {editingLog ? <MdEdit className="text-orange-600" /> : <MdAdd className="text-purple-600" />}
                </div>
                {editingLog ? "Edit Daily Log" : "Add New Daily Log"}
              </h2>

              {/* Display geolocation status */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <MdLocationOn className={geoError ? "text-red-500" : "text-green-500"} />
                  <span className="text-sm font-medium">
                    {geoLoading ? "Fetching location..." : geoError ? geoError : coordinates ? `Location captured: ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}` : "Location not available"}
                  </span>
                  {!geoLoading && (geoError || !coordinates) && (
                    <button type="button" className="btn btn-xs btn-outline" onClick={getCurrentLocation}>Retry</button>
                  )}
                </div>
              </div>

              <form onSubmit={handleLogSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label"><span className="label-text font-medium">Date</span></label>
                    <input type="date" name="date" className="input input-bordered w-full" value={logForm.date} onChange={handleFormChange} required />
                  </div>

                  <div>
                    <label className="label"><span className="label-text font-medium">Weather</span></label>
                    <div className="flex gap-2 items-center">
                      {weatherOptions.map(({ key, Icon }) => (
                        <button type="button" key={key} className={`btn btn-sm btn-ghost rounded-md flex items-center gap-2 ${logForm.weather === key ? "bg-primary/10 border-primary" : ""}`} onClick={() => setLogForm((prev) => ({ ...prev, weather: key }))} title={key}>
                          <Icon className="text-lg" /><span className="hidden sm:inline text-sm">{key}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <label className="label"><span className="label-text font-medium">Workforce</span></label>
                  <div className="p-4 bg-base-100 rounded-lg border border-base-300">
                    {attendanceLoading ? (
                      <div className="text-sm text-gray-500">Loading attendance...</div>
                    ) : attendanceResponse && attendanceResponse.data ? (
                      (() => {
                        const crew: (AttendanceRecord & { crewMemberId: string })[] = attendanceResponse.data.crewAttendance || [];
                        const present = crew.filter((c) => c.status === "Present").length;
                        const absent = crew.filter((c) => c.status !== "Present").length;
                        return (
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2"><MdPeople className="text-blue-500" /><div><div className="text-sm font-medium">Present</div><div className="text-lg font-bold">{present}</div></div></div>
                            <div className="flex items-center gap-2"><MdPeople className="text-gray-400" /><div><div className="text-sm font-medium">Absent</div><div className="text-lg font-bold">{absent}</div></div></div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-sm text-yellow-600">Attendance not marked for this date. Please mark attendance in Workforce Management before creating a log.</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label"><span className="label-text font-medium">Notes</span></label>
                  <textarea name="notes" className="textarea textarea-bordered w-full" rows={4} value={logForm.notes} onChange={handleFormChange} placeholder="Describe work completed, issues encountered, or any other relevant information..." />
                </div>

                {/* File Upload Section - only show when creating a new log */}
                {!editingLog && (
                  <div>
                    <label className="label"><span className="label-text font-medium">Attachments</span></label>
                    <div className="bg-base-100 p-4 rounded-lg border border-dashed border-gray-300">
                      <div className="flex flex-col items-center justify-center gap-2 mb-4">
                        <MdCloudUpload className="text-3xl text-gray-400" />
                        <p className="text-sm text-gray-500">Upload photos, documents, or other files</p>
                        <input type="file" ref={logFileInputRef} onChange={handleLogFileChange} multiple className="hidden" />
                        <button type="button" onClick={() => logFileInputRef.current?.click()} className="btn btn-sm btn-outline gap-2"><MdAttachFile />Select Files</button>
                      </div>
                      {logFiles.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {logFiles.map((file, idx) => (
                              <div key={`${file.name}-${idx}`} className="flex items-center justify-between bg-base-200 p-2 rounded">
                                <div className="flex items-center gap-2">{getFileIcon(file.name)}<span className="text-sm text-ellipsis overflow-hidden">{file.name}</span><span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span></div>
                                <button type="button" onClick={() => handleRemoveLogFile(idx)} className="btn btn-xs btn-ghost btn-circle"><MdClose /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Show existing files for editing in a read-only format */}
                {editingLog && editingLog.files && editingLog.files.length > 0 && (
                  <div>
                    <label className="label"><span className="label-text font-medium">Existing Attachments</span></label>
                    <div className="bg-base-100 p-4 rounded-lg border border-base-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {editingLog.files.map((fileUrl, idx) => {
                          const fileName = fileUrl.split('/').pop() || fileUrl;
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                          const fullUrl = getFileUrl(fileUrl);
                          return (
                            <a key={idx} href={fullUrl} target="_blank" rel="noopener noreferrer" download={fileName} className="bg-white p-3 rounded-lg border border-base-300 flex items-center gap-3 hover:shadow-md transition-shadow">
                              <div className="bg-blue-50 p-2 rounded-lg">{getFileIcon(fileName)}</div>
                              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{fileName}</p><p className="text-xs text-gray-500">{isImage ? "Image" : fileName.split(".").pop()?.toUpperCase()}</p></div>
                              <MdDownload className="text-gray-400" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button type="submit" className="btn btn-primary" disabled={createLogMutation.isPending || updateLogMutation.isPending || !(attendanceResponse && attendanceResponse.data)} title={!(attendanceResponse && attendanceResponse.data) ? "Attendance must be marked for the selected date" : undefined}>
                    {createLogMutation.isPending || updateLogMutation.isPending ? (<><span className="loading loading-spinner loading-sm"></span>{editingLog ? "Updating..." : "Creating..."}</>) : (<>{editingLog ? "Update Log" : "Create Log"}</>)}
                  </button>

                  {editingLog && (<button type="button" className="btn btn-outline" onClick={() => { setEditingLog(null); setLogForm({ date: moment().format("YYYY-MM-DD"), projectId: selectedProject, weather: "", notes: "", }); }}>Cancel Edit</button>)}
                </div>
              </form>
            </div>
          )}

          {activeTab === "view_details" && selectedLogForDetails && (
            <div>
              {/* Header with back button */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button className="btn btn-sm btn-ghost" onClick={() => setActiveTab("view_all")}>← Back to All Logs</button>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3"><div className="bg-indigo-100 p-2 rounded-lg"><MdVisibility className="text-indigo-600" /></div>Log Details - {moment(selectedLogForDetails.date).format("MMMM D, YYYY")}</h2>
                </div>

                {/* Edit/Delete buttons for the log */}
                {user && user.id === selectedLogForDetails.loggedById && (
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-outline" onClick={() => handleEditLog(selectedLogForDetails)}><MdEdit className="mr-1" />Edit Log</button>
                    <button className="btn btn-sm btn-error btn-outline" onClick={() => handleDeleteLog(selectedLogForDetails)}><MdDelete className="mr-1" />Delete Log</button>
                  </div>
                )}
              </div>

              {/* Log Information */}
              <div className="bg-base-100 rounded-xl p-6 mb-6 border border-base-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl"><MdCalendarToday className="text-blue-600 text-lg" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{moment(selectedLogForDetails.date).format("MMMM D, YYYY")}</h3>
                    <span className="badge badge-outline badge-lg">{moment(selectedLogForDetails.date).format("dddd")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {selectedLogForDetails.weather && (<div className="flex items-center gap-2"><MdWbSunny className="text-orange-500" /><span className="text-sm font-medium text-gray-600">Weather:</span><span className="text-sm">{selectedLogForDetails.weather}</span></div>)}

                  {/* Show location coordinates if available */}
                  {selectedLogForDetails.coordinates && (<div className="flex items-center gap-2"><MdLocationOn className="text-blue-500" /><span className="text-sm font-medium text-gray-600">Location:</span><a href={getMapLink(selectedLogForDetails.coordinates) || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{formatCoordinates(selectedLogForDetails.coordinates)}</a></div>)}
                </div>

                {/* Show summary if available */}
                {selectedLogForDetails.summary && (<div className="mb-4"><div className="flex items-center gap-2 mb-2"><MdNotes className="text-green-500" /><span className="text-sm font-medium text-gray-600">Summary:</span></div><p className="text-sm text-gray-700 bg-base-200 p-3 rounded">{selectedLogForDetails.summary}</p></div>)}

                {selectedLogForDetails.notes && (<div className="mb-4"><div className="flex items-center gap-2 mb-2"><MdNotes className="text-purple-500" /><span className="text-sm font-medium text-gray-600">Notes:</span></div><p className="text-sm text-gray-700 bg-base-200 p-3 rounded">{selectedLogForDetails.notes}</p></div>)}

                {/* Show issues if available */}
                {selectedLogForDetails.issues && (<div className="mb-4"><div className="flex items-center gap-2 mb-2"><MdFlag className="text-red-500" /><span className="text-sm font-medium text-gray-600">Issues:</span></div><p className="text-sm text-gray-700 bg-base-200 p-3 rounded">{selectedLogForDetails.issues}</p></div>)}

                {/* File Attachments Section */}
                {selectedLogForDetails.files && selectedLogForDetails.files.length > 0 && (<div className="mb-4"><div className="flex items-center gap-2 mb-2"><MdAttachFile className="text-amber-500" /><span className="text-sm font-medium text-gray-600">Attachments:</span><span className="badge badge-sm">{selectedLogForDetails.files.length}</span></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-base-200 rounded">{selectedLogForDetails.files.map((fileUrl, idx) => { const fileName = fileUrl.split("/").pop() || fileUrl; const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName); const fullUrl = getFileUrl(fileUrl); return (<a key={idx} href={fullUrl} target="_blank" rel="noopener noreferrer" download={fileName} className="bg-white p-3 rounded-lg border border-base-300 flex items-center gap-3 hover:shadow-md transition-shadow"><div className="bg-blue-50 p-2 rounded-lg">{getFileIcon(fileName)}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{fileName}</p><p className="text-xs text-gray-500">{isImage ? "Image" : fileName.split(".").pop()?.toUpperCase()}</p></div><MdDownload className="text-gray-400" /></a>); })}</div></div>)}

                <div className="text-xs text-gray-500">Logged by {selectedLogForDetails.logger.firstName} {selectedLogForDetails.logger.lastName} • {moment(selectedLogForDetails.createdAt).format("MMM D, YYYY [at] h:mm A")}</div>
              </div>

              {/* Activities Section */}
              <div className="bg-base-100 rounded-xl p-6 border border-base-300">... (truncated for brevity)
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

                         >
                            <div className="bg-blue-50 p-2 rounded-lg">
                              {getFileIcon(fileName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{fileName}</p>
                              <p className="text-xs text-gray-500">
                                {isImage ? "Image" : fileName.split(".").pop()?.toUpperCase()}
                              </p>
                            </div>
                            <MdDownload className="text-gray-400" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    createLogMutation.isPending ||
                    updateLogMutation.isPending ||
                    // disable if attendance not present for selected date
                    !(attendanceResponse && attendanceResponse.data)
                  }
                  title={
                    !(attendanceResponse && attendanceResponse.data)
                      ? "Attendance must be marked for the selected date"
                      : undefined
                  }
                >
                  {createLogMutation.isPending ||
                  updateLogMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {editingLog ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editingLog ? "Update Log" : "Create Log"}</>
                  )}
                </button>

                {editingLog && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setEditingLog(null);
                      setLogForm({
                        date: moment().format("YYYY-MM-DD"),
                        projectId: selectedProject,
                        weather: "",
                        notes: "",
                      });
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {activeTab === "view_details" && selectedLogForDetails && (
          <div>
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setActiveTab("view_all")}
                >
                  ← Back to All Logs
                </button>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <MdVisibility className="text-indigo-600" />
                  </div>
                  Log Details -{" "}
                  {moment(selectedLogForDetails.date).format("MMMM D, YYYY")}
                </h2>
              </div>

              {/* Edit/Delete buttons for the log */}
              {user && user.id === selectedLogForDetails.loggedById && (
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEditLog(selectedLogForDetails)}
                  >
                    <MdEdit className="mr-1" />
                    Edit Log
                  </button>
                  <button
                    className="btn btn-sm btn-error btn-outline"
                    onClick={() => handleDeleteLog(selectedLogForDetails)}
                  >
                    <MdDelete className="mr-1" />
                    Delete Log
                  </button>
                </div>
              )}
            </div>

            {/* Log Information */}
            <div className="bg-base-100 rounded-xl p-6 mb-6 border border-base-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <MdCalendarToday className="text-blue-600 text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {moment(selectedLogForDetails.date).format("MMMM D, YYYY")}
                  </h3>
                  <span className="badge badge-outline badge-lg">
                    {moment(selectedLogForDetails.date).format("dddd")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {selectedLogForDetails.weather && (
                  <div className="flex items-center gap-2">
                    <MdWbSunny className="text-orange-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Weather:
                    </span>
                    <span className="text-sm">
                      {selectedLogForDetails.weather}
                    </span>
                  </div>
                )}

                {/* Show location coordinates if available */}
                {selectedLogForDetails.coordinates && (
                  <div className="flex items-center gap-2">
                    <MdLocationOn className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Location:
                    </span>
                    <a
                      href={
                        getMapLink(selectedLogForDetails.coordinates) || "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {formatCoordinates(selectedLogForDetails.coordinates)}
                    </a>
                  </div>
                )}
              </div>

              {/* Show summary if available */}
              {selectedLogForDetails.summary && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MdNotes className="text-green-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Summary:
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 bg-base-200 p-3 rounded">
                    {selectedLogForDetails.summary}
                  </p>
                </div>
              )}

              {selectedLogForDetails.notes && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MdNotes className="text-purple-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Notes:
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 bg-base-200 p-3 rounded">
                    {selectedLogForDetails.notes}
                  </p>
                </div>
              )}

              {/* Show issues if available */}
              {selectedLogForDetails.issues && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MdFlag className="text-red-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Issues:
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 bg-base-200 p-3 rounded">
                    {selectedLogForDetails.issues}
                  </p>
                </div>
              )}

              {/* File Attachments Section */}
              {selectedLogForDetails.files &&
                selectedLogForDetails.files.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MdAttachFile className="text-amber-500" />
                      <span className="text-sm font-medium text-gray-600">
                        Attachments:
                      </span>
                      <span className="badge badge-sm">
                        {selectedLogForDetails.files.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-base-200 rounded">
                      {selectedLogForDetails.files.map((fileUrl, idx) => {
                        const fileName = fileUrl.split("/").pop() || fileUrl;
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(
                          fileName
                        );
                        const fullUrl = getFileUrl(fileUrl);

                        return (
                          <a
                            key={idx}
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={fileName}
                            className="bg-white p-3 rounded-lg border border-base-300 flex items-center gap-3 hover:shadow-md transition-shadow"
                          >
                            <div className="bg-blue-50 p-2 rounded-lg">
                              {getFileIcon(fileName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {isImage
                                  ? "Image"
                                  : fileName.split(".").pop()?.toUpperCase()}
                              </p>
                            </div>
                            <MdDownload className="text-gray-400" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

              <div className="text-xs text-gray-500">
                Logged by {selectedLogForDetails.logger.firstName}{" "}
                {selectedLogForDetails.logger.lastName} •{" "}
                {moment(selectedLogForDetails.createdAt).format(
                  "MMM D, YYYY [at] h:mm A"
                )}
              </div>
            </div>

            {/* Activities Section */}
            <div className="bg-base-100 rounded-xl p-6 border border-base-300">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MdWork className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Activities
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedLogForDetails.activities &&
                      selectedLogForDetails.activities.length > 0
                        ? `${selectedLogForDetails.activities.length} activities recorded`
                        : "No activities recorded yet"}
                    </p>
                  </div>
                </div>
                {user && user.id === selectedLogForDetails.loggedById && (
                  <button
                    className="btn btn-primary gap-2"
                    onClick={() => handleAddActivity(selectedLogForDetails)}
                  >
                    <MdAdd />
                    Add Activity
                  </button>
                )}
              </div>

              {selectedLogForDetails.activities &&
              selectedLogForDetails.activities.length > 0 ? (
                <div className="space-y-4">
                  {selectedLogForDetails.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-base-200 rounded-lg p-6 border border-base-300 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Enhanced task display with more details */}
                          {(activity.task || activity.taskId) && (
                            <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                              <div className="flex items-center gap-2 mb-2">
                                <MdAssignment className="text-blue-600 text-lg" />
                                <span className="text-sm font-bold text-gray-700">
                                  Related Task
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    Title:
                                  </span>
                                  <span className="text-sm font-medium">
                                    {activity.task?.title ||
                                      projectTasks.find(
                                        (t) => t.id === activity.taskId
                                      )?.title ||
                                      `Task (${activity.taskId})`}
                                  </span>
                                </div>

                                {/* Show task status if available */}
                                {activity.task?.status ||
                                  (projectTasks.find(
                                    (t) => t.id === activity.taskId
                                  )?.status && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">
                                        Status:
                                      </span>
                                      <span className="text-sm">
                                        {activity.task?.status ||
                                          projectTasks.find(
                                            (t) => t.id === activity.taskId
                                          )?.status}
                                      </span>
                                    </div>
                                  ))}

                                {/* Show task priority if available */}
                                {activity.task?.priority ||
                                  (projectTasks.find(
                                    (t) => t.id === activity.taskId
                                  )?.priority && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">
                                        Priority:
                                      </span>
                                      <span className="text-sm">
                                        {activity.task?.priority ||
                                          projectTasks.find(
                                            (t) => t.id === activity.taskId
                                          )?.priority}
                                      </span>
                                    </div>
                                  ))}

                                {/* Show due date if available */}
                                {(activity.task?.dueDate ||
                                  projectTasks.find(
                                    (t) => t.id === activity.taskId
                                  )?.dueDate) && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      Due:
                                    </span>
                                    <span className="text-sm">
                                      {moment(
                                        activity.task?.dueDate ||
                                          projectTasks.find(
                                            (t) => t.id === activity.taskId
                                          )?.dueDate
                                      ).format("MMM D, YYYY")}
                                    </span>
                                  </div>
                                )}

                                {/* Show project phase if available */}
                                {(activity.task?.projectPhase?.name ||
                                  projectTasks.find(
                                    (t) => t.id === activity.taskId
                                  )?.projectPhase?.name) && (
                                  <div className="flex items-center gap-2 col-span-2">
                                    <MdLayers className="text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      Phase:
                                    </span>
                                    <span className="text-sm">
                                      {activity.task?.projectPhase?.name ||
                                        projectTasks.find(
                                          (t) => t.id === activity.taskId
                                        )?.projectPhase?.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="text-lg font-semibold text-gray-800">
                              {activity.activity}
                            </h4>
                            {activity.status && (
                              <span
                                className={`badge ${
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {activity.startTime && activity.endTime && (
                              <div className="flex items-center gap-2">
                                <MdAccessTime className="text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {moment(activity.startTime).format("HH:mm")} -{" "}
                                  {moment(activity.endTime).format("HH:mm")}
                                </span>
                              </div>
                            )}
                            {activity.progress !== undefined &&
                              activity.progress !== null && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 font-medium">
                                    Progress: {activity.progress}%
                                  </span>
                                </div>
                              )}
                          </div>

                          {/* Show location if available */}
                          {activity.coordinates && (
                            <div className="flex items-center gap-2 mb-4">
                              <MdLocationOn className="text-blue-500" />
                              <span className="text-sm font-medium text-gray-600">
                                Location:
                              </span>
                              <a
                                href={getMapLink(activity.coordinates) || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {formatCoordinates(activity.coordinates)}
                              </a>
                            </div>
                          )}

                          {activity.progress !== undefined &&
                            activity.progress !== null && (
                              <div className="mb-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                                    <div
                                      className={`h-3 rounded-full transition-all duration-300 ${
                                        activity.status === "COMPLETED"
                                          ? "bg-green-500"
                                          : activity.status === "IN_PROGRESS"
                                          ? "bg-blue-500"
                                          : "bg-gray-400"
                                      }`}
                                      style={{ width: `${activity.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )}

                          {activity.notes && (
                            <div className="bg-base-300 p-3 rounded-lg mb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <MdNotes className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">
                                  Notes:
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
                                {activity.notes}
                              </p>
                            </div>
                          )}

                          {/* Show activity attachments if any */}
                          {activity.files && activity.files.length > 0 && (
                            <div className="mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <MdAttachFile className="text-amber-500" />
                                <span className="text-sm font-medium text-gray-600">
                                  Attachments:
                                </span>
                                <span className="badge badge-sm">
                                  {activity.files.length}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {activity.files.map((fileUrl, idx) => {
                                  const fileName = fileUrl.split("/").pop() || fileUrl;
                                  const fullUrl = getFileUrl(fileUrl);
                                  return (
                                    <a
                                      key={idx}
                                      href={fullUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={fileName}
                                      className="bg-base-100 p-2 rounded flex items-center gap-2 hover:bg-base-300 transition-colors text-sm"
                                    >
                                      {getFileIcon(fileName)}
                                      <span className="truncate flex-1">
                                        {fileName}
                                      </span>
                                      <MdDownload className="text-gray-500" />
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {user &&
                          user.id === selectedLogForDetails.loggedById && (
                            <div className="flex gap-2 ml-4">
                              <button
                                className="btn btn-sm btn-outline hover:btn-info"
                                onClick={() => handleEditActivity(activity)}
                                title="Edit Activity"
                              >
                                <MdEdit />
                              </button>
                              <button
                                className="btn btn-sm btn-outline btn-error hover:btn-error"
                                onClick={() =>
                                  handleDeleteActivity(activity.id)
                                }
                                title="Delete Activity"
                              >
                                <MdDelete />
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-base-200 rounded-lg border border-base-300">
                  <MdWork className="mx-auto text-5xl text-gray-300 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">
                    No Activities Yet
                  </h4>
                  <p className="text-gray-500 mb-6">
                    Start by adding the first activity for this daily log.
                  </p>
                  {user && user.id === selectedLogForDetails.loggedById && (
                    <button
                      className="btn btn-primary gap-2"
                      onClick={() => handleAddActivity(selectedLogForDetails)}
                    >
                      <MdAdd />
                      Add First Activity
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && logToDelete && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the daily log for{" "}
                {moment(logToDelete.date).format("MMMM D, YYYY")}? This action
                cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  className="btn btn-error"
                  onClick={confirmDeleteLog}
                  disabled={deleteLogMutation.isPending}
                >
                  {deleteLogMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setLogToDelete(null);
                  }}
                  disabled={deleteLogMutation.isPending}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Modal */}
        {showActivityModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">
                {editingActivity ? "Edit Activity" : "Add Activity"}
              </h3>

              {/* Display geolocation status for activity */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <MdLocationOn
                    className={geoError ? "text-red-500" : "text-green-500"}
                  />
                  <span className="text-sm font-medium">
                    {geoLoading
                      ? "Fetching location..."
                      : geoError
                      ? geoError
                      : coordinates
                      ? `Location captured: ${coordinates.lat.toFixed(
                          6
                        )}, ${coordinates.lng.toFixed(6)}`
                      : "Location not available"}
                  </span>
                  {!geoLoading && (geoError || !coordinates) && (
                    <button
                      type="button"
                      className="btn btn-xs btn-outline"
                      onClick={getCurrentLocation}
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleActivitySubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Description *
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={activityForm.activity}
                    onChange={(e) =>
                      setActivityForm((prev) => ({
                        ...prev,
                        activity: e.target.value,
                      }))
                    }
                    placeholder="Describe the activity..."
                    required
                  />
                </div>

                {/* Related Task select */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Related Task (optional)
                    </span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={activityForm.taskId || ""}
                    onChange={(e) =>
                      setActivityForm((prev) => ({
                        ...prev,
                        taskId: e.target.value,
                      }))
                    }
                    disabled={!selectedProject || projectTasksLoading}
                  >
                    <option value="">No related task</option>
                    {projectTasks.map((t: Task) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Start Time</span>
                    </label>
                    <input
                      type="time"
                      className="input input-bordered"
                      value={activityForm.startTime}
                      onChange={(e) =>
                        setActivityForm((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">End Time</span>
                    </label>
                    <input
                      type="time"
                      className="input input-bordered"
                      value={activityForm.endTime}
                      onChange={(e) =>
                        setActivityForm((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Progress (%)
                      </span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={activityForm.progress}
                      onChange={(e) =>
                        setActivityForm((prev) => ({
                          ...prev,
                          progress: parseInt(e.target.value) || 0,
                        }))
                      }
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Status</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={activityForm.status}
                      onChange={(e) =>
                        setActivityForm((prev) => ({
                          ...prev,
                          status: e.target.value as
                            | "NOT_STARTED"
                            | "IN_PROGRESS"
                            | "COMPLETED"
                            | "ON_HOLD"
                            | "CANCELLED",
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
                    <span className="label-text font-medium">Notes</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered"
                    value={activityForm.notes}
                    onChange={(e) =>
                      setActivityForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Additional notes about this activity..."
                  />
                </div>

                {/* Only show file upload section when creating new activity */}
                {!editingActivity && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Attachments</span>
                    </label>

                    <div className="bg-base-100 p-4 rounded-lg border border-dashed border-gray-300">
                      <div className="flex flex-col items-center justify-center gap-2 mb-2">
                        <MdCloudUpload className="text-3xl text-gray-400" />
                        <p className="text-sm text-gray-500">
                          Upload photos, documents, or other files
                        </p>
                        <input
                          type="file"
                          ref={activityFileInputRef}
                          onChange={handleActivityFileChange}
                          multiple
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => activityFileInputRef.current?.click()}
                          className="btn btn-sm btn-outline gap-2"
                        >
                          <MdAttachFile />
                          Select Files
                        </button>
                      </div>

                      {/* Show selected files */}
                      {activityFiles.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium mb-2">
                            Selected Files:
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {activityFiles.map((file, idx) => (
                              <div
                                key={`${file.name}-${idx}`}
                                className="flex items-center justify-between bg-base-200 p-2 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  {getFileIcon(file.name)}
                                  <span className="text-sm text-ellipsis overflow-hidden">
                                    {file.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveActivityFile(idx)}
                                  className="btn btn-xs btn-ghost btn-circle"
                                >
                                  <MdClose />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Show existing files when editing */}
                {editingActivity && editingActivity.files && editingActivity.files.length > 0 && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Existing Files</span>
                    </label>
                    <div className="bg-base-100 p-4 rounded-lg border border-base-300">
                      <div className="grid grid-cols-1 gap-2">
                        {editingActivity.files.map((fileUrl, idx) => {
                          const fileName = fileUrl.split("/").pop() || fileUrl;
                          const fullUrl = getFileUrl(fileUrl);
                          return (
                            <a
                              key={`existing-${idx}`}
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={fileName}
                              className="flex items-center justify-between bg-blue-50 p-2 rounded"
                            >
                              <div className="flex items-center gap-2">
                                {getFileIcon(fileName)}
                                <span className="text-sm text-ellipsis overflow-hidden">
                                  {fileName}
                                </span>
                              </div>
                              <div className="btn btn-sm btn-ghost">
                                <MdDownload />
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 justify-end pt-4 border-t">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setShowActivityModal(false);
                      setEditingActivity(null);
                      setSelectedLogForActivity(null);
                      setActivityForm({
                        activity: "",
                        dailyLogId: "",
                        startTime: "",
                        endTime: "",
                        progress: 0,
                        status: "NOT_STARTED",
                        notes: "",
                        taskId: "", // reset selected task
                        coordinates: null,
                        files: [],
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      createActivityMutation.isPending ||
                      updateActivityMutation.isPending
                    }
                  >
                    {createActivityMutation.isPending ||
                    updateActivityMutation.isPending ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        {editingActivity ? "Updating..." : "Adding..."}
                      </>
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
    </div>
  );

  import { useState, useEffect, useRef } from "react";
import {
  MdDownload,
  MdDelete,
  MdFolder,
  MdClose,
  MdUploadFile,
} from "react-icons/md";
import { useRoles } from "../hooks/useRoles";
import { useAuthStore } from "../stores/useAuthStore";
import { useUserProjects } from "../hooks/useUsers";
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  type DocumentType,
  type Document,
} from "../hooks/useDocuments";
import TagsInput from "../components/TagsInput";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  drawings: "Drawings",
  specifications: "Specifications",
  contracts: "Contracts",
  permits: "Permits",
  reports: "Reports",
  submittals: "Submittals",
  invoices: "Invoices",
  photos: "Photos",
};

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState<DocumentType>("drawings");
  const [photoModal, setPhotoModal] = useState<null | Document>(null);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(
    user?.id || ""
  );
  const [selectedProject, setSelectedProject] = useState<string>("");
  const { data: roles, isLoading: rolesLoading } = useRoles();

  // Document API hooks
  const {
    data: documents = [],
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useDocuments({ projectId: selectedProject });
  console.log(documents);
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: activeTab,
    category: "",
    version: "1.0",
    description: "",
    tags: [] as string[],
    file: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default project when projects load
  useEffect(() => {
    if (
      Array.isArray(projects) &&
      projects.length > 0 &&
      !selectedProject &&
      !projectsLoading
    ) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject, projectsLoading]);

  // Delete handler
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      await deleteMutation.mutateAsync(id);
      refetchDocuments();
    }
  };

  // Filter documents by selected project and active tab
  const filteredDocuments = documents.filter(
    (doc) => doc.type === activeTab && doc.projectId === selectedProject
  );

  // Prepare dynamic folders from roles
  const folderedDocuments: Record<string, Document[]> = {};
  const roleList = roles || [];

  if (activeTab !== "photos") {
    roleList.forEach((role) => {
      folderedDocuments[role.id] = [];
    });
    filteredDocuments.forEach((doc) => {
      const folderKey = doc.uploader?.roleId || "";
      if (folderedDocuments[folderKey]) {
        folderedDocuments[folderKey].push(doc);
      }
    });
  }

  // Upload modal form handlers
  const handleUploadFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setUploadForm((prev) => ({
      ...prev,
      [name]:
        type === "file"
          ? (e.target as HTMLInputElement).files?.[0] || null
          : name === "tags"
          ? prev.tags // TagsInput handles tags as array, do not process here
          : value,
    }));
  };

  const handleUploadModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !uploadForm.file) return;
    setUploading(true);
    const dto = {
      projectId: selectedProject,
      name: uploadForm.name,
      type: uploadForm.type,
      category: uploadForm.category || undefined,
      version: uploadForm.version || undefined,
      description: uploadForm.description || undefined,
      tags: uploadForm.tags.length > 0 ? uploadForm.tags : undefined,
    };
    try {
      await uploadMutation.mutateAsync({ dto, file: uploadForm.file });
      refetchDocuments();
      setShowUploadModal(false);
      setUploadForm({
        name: "",
        type: activeTab,
        category: "",
        version: "1.0",
        description: "",
        tags: [],
        file: null,
      });
    } catch (error) {
      console.error("Failed to upload document:", error);
      // Optionally add user-facing error notification here
    }
    setUploading(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-gray-500 mt-1">
            Manage and organize all your project documents. Upload, view, and
            export files for each document type.
          </p>
        </div>
        {/* Task view selection */}
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
              ) : Array.isArray(projects) && projects.length > 0 ? (
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

      {/* Tabs for document types */}
      <div className="tabs tabs-border mt-6">
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

      <div
        id="tab-navigation"
        className="bg-base-200 border border-base-300 p-6 rounded-2xl min-h-[400px]"
      >
        {documentsLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* Upload & Export Controls */}
            <div className="flex items-center gap-4 mb-6">
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setShowUploadModal(true)}
                disabled={uploading}
              >
                <MdUploadFile />
                Upload Document
              </button>
            </div>
            {/* Folders & Files for non-photo tabs */}
            {activeTab !== "photos" ? (
              <div className="w-full">
                {rolesLoading ? (
                  <div className="text-center text-gray-500 py-8">
                    Loading folders...
                  </div>
                ) : openFolder === null ? (
                  // Folder list view
                  <div className="flex gap-4 w-full flex-wrap">
                    {roleList.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        className={`flex items-center w-[350px] justify-between gap-2 mb-8 text-left rounded-2xl bg-base-100 p-5 transition border border-base-300 hover:shadow-xl hover:shadow-neutral/10`}
                        onClick={() => setOpenFolder(role.id)}
                      >
                        <div className="flex items-center gap-2">
                          <MdFolder className="text-4xl text-primary" />
                          <span className="text-lg font-bold">{role.name}</span>
                        </div>
                        <span className="badge badge-neutral">
                          {folderedDocuments[role.id]?.length || 0} files
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  // Inside a folder view
                  <div>
                    <button
                      className="btn btn-md btn-soft mb-4 flex items-center gap-2"
                      onClick={() => setOpenFolder(null)}
                    >
                      {/* Unicode left arrow */}
                      <span className="text-xl">&#8592;</span>
                      Back to Folders
                    </button>
                    <div className="flex items-center justify-between my-7">
                      <div className="flex gap-2">
                        <MdFolder className="text-2xl text-primary" />
                        <span className="text-lg font-bold">
                          {roleList.find((r) => r.id === openFolder)?.name}
                        </span>
                      </div>

                      <span className="badge badge-neutral">
                        {folderedDocuments[openFolder]?.length || 0} files
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="table w-full bg-base-100 rounded-2xl">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Uploaded By</th>
                            <th>Uploaded At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {folderedDocuments[openFolder] &&
                          folderedDocuments[openFolder].length > 0 ? (
                            folderedDocuments[openFolder].map((doc) => (
                              <tr key={doc.id} className="hover:bg-base-200">
                                <td className="font-medium">{doc.name}</td>
                                <td>{doc.uploader?.name || "-"}</td>
                                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                <td>
                                  <div className="flex gap-2">
                                    <a
                                      href={`${import.meta.env.VITE_DOCUMENTS_URL}${doc.url}`}
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
                              <td
                                colSpan={4}
                                className="text-center text-gray-500 py-8"
                              >
                                No documents in this folder.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Photos tab: show images grid with preview
              <div>
                {filteredDocuments.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-base-100 rounded-xl border border-base-300 p-2 flex flex-col items-center cursor-pointer hover:shadow-xl hover:shadow-neutral/10 transition"
                        onClick={() => setPhotoModal(doc)}
                      >
                        <img
                          src={
                            doc.url !== "#"
                              ? `${import.meta.env.VITE_DOCUMENTS_URL}${doc.url}`
                              : "/bg2.jpg"
                          }
                          alt={doc.name}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <div className="text-sm font-medium text-center">
                          {doc.name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No photos found for {DOCUMENT_TYPE_LABELS[activeTab]} in this
                    project.
                  </div>
                )}
                {/* Photo details modal */}
                {photoModal && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{
                      backdropFilter: "blur(4px)",
                      background: "rgba(0,0,0,0.2)",
                    }}
                  >
                    <div className="bg-base-100 p-6 rounded-2xl shadow-2xl max-w-md w-full relative">
                      <button
                        className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost"
                        onClick={() => setPhotoModal(null)}
                      >
                        <MdClose />
                      </button>
                      <img
                        src={
                          photoModal.url !== "#"
                            ? `${import.meta.env.VITE_DOCUMENTS_URL}${photoModal.url}`
                            : "/bg2.jpg"
                        }
                        alt={photoModal.name}
                        className="w-full h-56 object-cover rounded mb-4"
                      />
                      <div className="mb-2">
                        <span className="font-bold">Name:</span> {photoModal.name}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Uploaded By:</span>{" "}
                        {photoModal.uploader?.name || "-"}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Uploaded At:</span>{" "}
                        {new Date(photoModal.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Related To:</span> Project{" "}
                        {photoModal.projectId}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <a
                          href={`${import.meta.env.VITE_DOCUMENTS_URL}${photoModal.url}`}
                          download={photoModal.name}
                          className="btn btn-success flex items-center gap-1"
                        >
                          <MdDownload />
                          Download
                        </a>
                        <button
                          className="btn btn-error flex items-center gap-1"
                          onClick={() => {
                            handleDelete(photoModal.id);
                            setPhotoModal(null);
                          }}
                        >
                          <MdDelete />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showUploadModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg mb-4">Upload Document</h2>
            <form onSubmit={handleUploadModalSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  name="name"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.name}
                  onChange={handleUploadFieldChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  name="type"
                  className="select select-bordered"
                  value={uploadForm.type}
                  onChange={handleUploadFieldChange}
                  required
                >
                  {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
                    <option key={type} value={type}>{DOCUMENT_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <input
                  name="category"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.category}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Version</span>
                </label>
                <input
                  name="version"
                  type="text"
                  className="input input-bordered"
                  value={uploadForm.version}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered"
                  value={uploadForm.description}
                  onChange={handleUploadFieldChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>
                <TagsInput
                  value={uploadForm.tags}
                  onChange={tags => setUploadForm(prev => ({ ...prev, tags }))}
                  placeholder="Type and press Enter to add tags"
                  disabled={uploading}
                  maxTags={10}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">File</span>
                </label>
                <input
                  name="file"
                  type="file"
                  className="file-input file-input-bordered"
                  ref={fileInputRef}
                  onChange={handleUploadFieldChange}
                  required
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Upload"
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

export default DocumentManagement;

import { useState, useMemo } from "react";
import {
  useThreads,
  useCreateThread,
  useUpdateThread,
  useThreadMessages,
  useSendMessage,
  useSendMessageWithAttachments,
  useRFIs,
  useCreateRFI,
  useUpdateRFI,
  useDeleteRFI,
  type Thread,
  type CreateThreadDto,
  type CreateRFIDto,
  type UpdateThreadDto,
  type UpdateRFIDto,
  type RFI,
} from "../hooks/useCommunication";
import { type Project } from "../hooks/useProjects";
import { useUsers, useUserProjects } from "../hooks/useUsers";
import { useAuthStore } from "../stores/useAuthStore";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { IoClose } from "react-icons/io5";
import { IoAttach } from "react-icons/io5";
import { IoCamera } from "react-icons/io5";
import { IoInformationCircle } from "react-icons/io5";
import { IoDocument, IoImage, IoTrash } from "react-icons/io5";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Communication = () => {
  // Auth store
  const { user: currentUser } = useAuthStore();

  // API hooks
  const {
    data: threads = [],
    isLoading: threadsLoading,
    error: threadsError,
  } = useThreads();
  const { data: projects = [] } = useUserProjects(currentUser?.id || "");
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: rfis = [], isLoading: rfisLoading } = useRFIs();

  const createThreadMutation = useCreateThread();
  const updateThreadMutation = useUpdateThread();
  const sendMessageMutation = useSendMessage();
  const sendMessageWithAttachmentsMutation = useSendMessageWithAttachments();
  const createRFIMutation = useCreateRFI();
  const updateRFIMutation = useUpdateRFI();
  const deleteRFIMutation = useDeleteRFI();

  // State
  const [activeTab, setActiveTab] = useState("threads");
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Create thread modal state
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Create RFI modal state
  const [showCreateRFIModal, setShowCreateRFIModal] = useState(false);
  const [selectedRFIThread, setSelectedRFIThread] = useState<string>("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  // Edit/Update RFI modal state
  const [showEditRFIModal, setShowEditRFIModal] = useState(false);
  const [editingRFI, setEditingRFI] = useState<RFI | null>(null);
  const [editRFISelectedAssignees, setEditRFISelectedAssignees] = useState<
    string[]
  >([]);

  // Update thread modal state
  const [showEditThreadModal, setShowEditThreadModal] = useState(false);
  const [editingThread, setEditingThread] = useState<Thread | null>(null);
  const [editThreadSelectedUsers, setEditThreadSelectedUsers] = useState<
    string[]
  >([]);

  // Thread info section state
  const [showThreadInfo, setShowThreadInfo] = useState(false);

  // Delete confirmation state
  const [showDeleteRFIModal, setShowDeleteRFIModal] = useState(false);
  const [deletingRFI, setDeletingRFI] = useState<RFI | null>(null);

  // File attachment state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Get messages for selected thread
  const { data: messages = [] } = useThreadMessages(selectedThread?.id || "");

  // Get RFIs for the selected thread
  const selectedThreadRFIs = rfis.filter(
    (rfi) => rfi.threadId === selectedThread?.id
  );

  // Analytics calculations
  const analyticsData = useMemo(() => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // RFI status breakdown
    const rfisByStatus = rfis.reduce((acc, rfi) => {
      const status = rfi.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // RFI priority breakdown
    const rfisByPriority = rfis.reduce((acc, rfi) => {
      const priority = rfi.priority || "Unknown";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // RFI category breakdown
    const rfisByCategory = rfis.reduce((acc, rfi) => {
      const category = rfi.category || "Other";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 7 days)
    const recentThreads = threads.filter(
      (thread) => new Date(thread.createdAt) > lastWeek
    ).length;

    const recentRFIs = rfis.filter(
      (rfi) => new Date(rfi.createdAt) > lastWeek
    ).length;

    // Thread activity by project
    const threadsByProject = threads.reduce((acc, thread) => {
      const projectName = thread.project?.name || "Unknown";
      acc[projectName] = (acc[projectName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average response time (mock data for now)
    const avgResponseTime =
      rfis.length > 0
        ? Math.round(
            rfis.reduce((acc, rfi) => {
              if (rfi.answeredAt && rfi.createdAt) {
                const responseTime =
                  new Date(rfi.answeredAt).getTime() -
                  new Date(rfi.createdAt).getTime();
                return acc + responseTime / (1000 * 60 * 60 * 24); // Convert to days
              }
              return acc;
            }, 0) / rfis.filter((rfi) => rfi.answeredAt).length
          )
        : 0;

    return {
      rfisByStatus,
      rfisByPriority,
      rfisByCategory,
      threadsByProject,
      recentThreads,
      recentRFIs,
      avgResponseTime: avgResponseTime || 2.5,
      totalMessages: messages.length,
      activeUsers: users.filter((user) =>
        threads.some((thread) => thread.users.some((u) => u.id === user.id))
      ).length,
    };
  }, [rfis, threads, messages, users]);

  // Chart data configurations
  const rfiStatusChartData = {
    labels: Object.keys(analyticsData.rfisByStatus),
    datasets: [
      {
        data: Object.values(analyticsData.rfisByStatus),
        backgroundColor: [
          "#ef4444", // red for Open
          "#f59e0b", // amber for In Review
          "#10b981", // emerald for Resolved
          "#6b7280", // gray for others
        ],
        borderWidth: 0,
      },
    ],
  };

  const rfiPriorityChartData = {
    labels: ["Low", "Medium", "High", "Critical"],
    datasets: [
      {
        label: "RFIs by Priority",
        data: [
          analyticsData.rfisByPriority.Low || 0,
          analyticsData.rfisByPriority.Medium || 0,
          analyticsData.rfisByPriority.High || 0,
          analyticsData.rfisByPriority.Critical || 0,
        ],
        backgroundColor: ["#3b82f6", "#f59e0b", "#ef4444", "#dc2626"],
        borderRadius: 4,
      },
    ],
  };

  const threadActivityChartData = {
    labels: Object.keys(analyticsData.threadsByProject).slice(0, 5), // Top 5 projects
    datasets: [
      {
        label: "Threads",
        data: Object.values(analyticsData.threadsByProject).slice(0, 5),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread);
    setActiveTab("chat");
  };

  // Create thread handlers
  const handleCreateThread = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const newThread: CreateThreadDto = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      projectId: formData.get("projectId") as string,
      participantIds: selectedUsers,
    };

    createThreadMutation.mutate(newThread, {
      onSuccess: () => {
        setShowCreateThreadModal(false);
        (event.target as HTMLFormElement).reset();
        setSelectedUsers([]);
      },
      onError: (error) => {
        console.error("Failed to create thread:", error);
      },
    });
  };

  const handleAddUser = (userId: string) => {
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers((prev) => [...prev, userId]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return "badge-error";
      case "In Review":
      case "In Progress":
        return "badge-warning";
      case "Resolved":
        return "badge-success";
      case "Answered":
        return "badge-success";
      default:
        return "badge-neutral";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
      case "Critical":
        return "badge-error";
      case "Medium":
        return "badge-warning";
      case "Low":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((newMessage.trim() || selectedFiles.length > 0) && selectedThread) {
      if (selectedFiles.length > 0) {
        // Send message with attachments
        sendMessageWithAttachmentsMutation.mutate(
          {
            message: {
              content: newMessage || " ", // Ensure content is not empty
              threadId: selectedThread.id,
            },
            files: selectedFiles,
          },
          {
            onSuccess: () => {
              setNewMessage("");
              setSelectedFiles([]);
            },
            onError: (error) => {
              console.error("Failed to send message with attachments:", error);
            },
          }
        );
      } else {
        // Send regular message
        sendMessageMutation.mutate(
          {
            content: newMessage,
            threadId: selectedThread.id,
          },
          {
            onSuccess: () => {
              setNewMessage("");
            },
            onError: (error) => {
              console.error("Failed to send message:", error);
            },
          }
        );
      }
    }
  };

  // File and Camera handlers
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const fileArray = Array.from(files);
        setSelectedFiles(prev => [...prev, ...fileArray]);
      }
    };
    input.click();
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera by default
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) {
        setSelectedFiles(prev => [...prev, files[0]]);
      }
    };
    input.click();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Helper functions for file handling
  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const getFileIcon = (filename: string) => {
    if (isImageFile(filename)) {
      return <IoImage className="text-blue-500" />;
    }
    return <IoDocument className="text-gray-500" />;
  };

  const getAttachmentUrl = (attachment: string): string => {
    // If attachment starts with http, it's already a full URL
    if (attachment.startsWith('http')) {
      return attachment;
    }
    // Otherwise, construct the URL using the backend base URL
    return `${import.meta.env.VITE_DOCUMENTS_URL || 'http://localhost:3000'}${attachment}`;
  };

  // Create RFI handlers
  const handleCreateRFI = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      let threadId = selectedRFIThread;
      let projectId = formData.get("projectId") as string;

      // If no thread is selected, create a new thread automatically
      if (!selectedRFIThread) {
        const title = formData.get("title") as string;
        const newThreadData: CreateThreadDto = {
          title: `RFI: ${title}`,
          description: formData.get("description") as string,
          projectId: projectId,
          participantIds: selectedAssignees,
        };
        const newThread = await createThreadMutation.mutateAsync(newThreadData);
        threadId = newThread.id;
      } else {
        // If linking to existing thread, use the thread's project ID
        const existingThread = threads.find((t) => t.id === selectedRFIThread);
        if (existingThread) {
          projectId = existingThread.projectId;
        }
      }

      const newRFI: CreateRFIDto = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: (formData.get("category") as string) || undefined,
        priority: (formData.get("priority") as string) || undefined,
        projectId: projectId,
        assignedToIds: selectedAssignees,
        threadId: threadId || undefined,
        dueDate: (formData.get("dueDate") as string) || undefined,
      };

      createRFIMutation.mutate(newRFI, {
        onSuccess: () => {
          setShowCreateRFIModal(false);
          (event.target as HTMLFormElement).reset();
          setSelectedRFIThread("");
          setSelectedAssignees([]);
        },
        onError: (error) => {
          console.error("Failed to create RFI:", error);
        },
      });
    } catch (error) {
      console.error("Failed to create thread for RFI:", error);
    }
  };

  const handleAddAssignee = (userId: string) => {
    if (!selectedAssignees.includes(userId)) {
      setSelectedAssignees((prev) => [...prev, userId]);
    }
  };

  const handleRemoveAssignee = (userId: string) => {
    setSelectedAssignees((prev) => prev.filter((id) => id !== userId));
  };

  // RFI Edit handlers
  const handleEditRFI = (rfi: RFI) => {
    setEditingRFI(rfi);
    // Extract assignee IDs from assignees array
    const assigneeIds = rfi.assignees
      ? rfi.assignees.map((assignee) => assignee.id)
      : [];
    setEditRFISelectedAssignees(assigneeIds);
    setShowEditRFIModal(true);
  };

  const handleAddEditAssignee = (userId: string) => {
    if (!editRFISelectedAssignees.includes(userId)) {
      setEditRFISelectedAssignees((prev) => [...prev, userId]);
    }
  };

  const handleRemoveEditAssignee = (userId: string) => {
    setEditRFISelectedAssignees((prev) => prev.filter((id) => id !== userId));
  };

  // RFI Delete handlers
  const handleDeleteRFI = (rfi: RFI) => {
    setDeletingRFI(rfi);
    setShowDeleteRFIModal(true);
  };

  const confirmDeleteRFI = () => {
    if (!deletingRFI) return;

    deleteRFIMutation.mutate(deletingRFI.id, {
      onSuccess: () => {
        setShowDeleteRFIModal(false);
        setDeletingRFI(null);
      },
      onError: (error) => {
        console.error("Failed to delete RFI:", error);
      },
    });
  };

  // Thread Edit handlers
  const handleEditThread = (thread: Thread) => {
    setEditingThread(thread);
    setEditThreadSelectedUsers(thread.users?.map((u) => u.id) || []);
    setShowEditThreadModal(true);
  };

  const handleAddEditThreadUser = (userId: string) => {
    if (!editThreadSelectedUsers.includes(userId)) {
      setEditThreadSelectedUsers((prev) => [...prev, userId]);
    }
  };

  const handleRemoveEditThreadUser = (userId: string) => {
    setEditThreadSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Communication</h1>
      <p className="text-gray-500 mb-6">
        Team discussions, RFIs, and analytics dashboard
      </p>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label="Threads"
          checked={activeTab === "threads"}
          onChange={() => setActiveTab("threads")}
        />
        {activeTab === "threads" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Discussion Threads</h2>
                  <p className="text-neutral-500">
                    Group conversations and project discussions
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateThreadModal(true)}
                >
                  + New Thread
                </button>
              </div>

              {threadsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : threadsError ? (
                <div className="text-center py-8 text-error">
                  Failed to load threads. Please try again.
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No threads found. Create your first thread to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-lg">
                            {thread.title}
                          </div>
                          {thread.project && (
                            <span className="badge badge-neutral badge-sm">
                              {thread.project.name}
                            </span>
                          )}
                        </div>
                        {thread.description && (
                          <div className="text-gray-500 text-sm mb-2">
                            {thread.description}
                          </div>
                        )}
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-xs text-accent">
                            Created:{" "}
                            {new Date(thread.createdAt).toLocaleString()}
                          </span>
                          <span className="text-xs badge badge-success text-base-200 font-medium">
                            Participants: {thread.users.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 lg:mt-0">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSelectThread(thread)}
                        >
                          Join Chat
                        </button>
                        <button
                          className="btn btn-soft btn-sm"
                          onClick={() => handleEditThread(thread)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label="Chat"
          checked={activeTab === "chat"}
          onChange={() => setActiveTab("chat")}
        />
        {activeTab === "chat" && selectedThread && (
          <div className="tab-content p-5 w-full">
            <div className="flex flex-col lg:flex-row gap-3 w-full h-[calc(100vh-300px)]">
              {/* Thread Information Panel */}
              <div
                id="thread-info"
                className={`bg-base-200 border border-base-300 rounded-2xl p-4 lg:w-1/3 w-full transition-all duration-300 flex flex-col ${
                  showThreadInfo ? "block" : "hidden"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Thread Information</h2>
                  <button
                    className="btn btn-circle"
                    onClick={() => setShowThreadInfo(false)}
                  >
                    <IoClose size={15} />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto flex-1">
                  {/* Thread Details */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="font-bold text-lg mb-2">{selectedThread.title}</h3>
                    {selectedThread.description && (
                      <p className="text-sm text-gray-600 mb-3">{selectedThread.description}</p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Type:</span>
                        <span>General</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <span className="badge badge-sm badge-success">
                          Active
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Privacy:</span>
                        <span>Public</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Messages:</span>
                        <span>{messages.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Created:</span>
                        <span>{new Date(selectedThread.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Info */}
                  {selectedThread.project && (
                    <div className="bg-base-100 p-4 rounded-xl">
                      <h4 className="font-bold mb-2">Project</h4>
                      <p className="text-sm">{selectedThread.project.name}</p>
                    </div>
                  )}

                  {/* Participants */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h4 className="font-bold mb-2">Participants ({selectedThread.users.length})</h4>
                    <div className="space-y-2">
                      {selectedThread.users.map((user) => (
                        <div key={user.id} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {user.firstName.charAt(0)}
                            </span>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-gray-500 text-xs">{user.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Chat Screen */}
              <div className={`bg-base-200 border border-base-300 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
                showThreadInfo ? 'lg:w-2/3 w-full' : 'w-full'
              }`}>
                <div className="bg-primary p-4 border-b border-base-300">
                  <div className="flex flex-col sm:flex-row justify-between text-primary-content items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex-1 sm:flex-initial">
                        <button
                          className="text-lg sm:text-xl font-bold hover:underline cursor-pointer text-left"
                          onClick={() => setShowThreadInfo(!showThreadInfo)}
                          title="Click to view thread information"
                        >
                          {selectedThread.title}
                        </button>
                        <p className="text-xs sm:text-sm">
                          Participants:{" "}
                          <span className="hidden sm:inline">
                            {selectedThread.users
                              .map((u) => `${u.firstName} ${u.lastName}`)
                              .join(", ")}
                          </span>
                          <span className="sm:hidden">
                            {selectedThread.users.length} member{selectedThread.users.length !== 1 ? 's' : ''}
                          </span>
                        </p>
                      </div>
                      <button
                        className="btn btn-ghost btn-circle btn-sm"
                        onClick={() => setShowThreadInfo(!showThreadInfo)}
                        title="Thread Information"
                      >
                        <IoInformationCircle size={20} />
                      </button>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        className="btn btn-active btn-sm sm:btn-md w-full sm:w-auto"
                        onClick={() => setActiveTab("threads")}
                      >
                        <span className="hidden sm:inline">Export Thread</span>
                        <span className="sm:hidden">Export</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Display RFIs associated with this thread */}
                {selectedThreadRFIs.length > 0 && (
                  <div className="bg-base-300 p-4 border-b border-base-300">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">
                      Related RFIs ({selectedThreadRFIs.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedThreadRFIs.map((rfi) => (
                        <div
                          key={rfi.id}
                          className="flex items-center justify-between bg-base-200 p-4 rounded-xl"
                        >
                          <div className="flex-1">
                            <span className="text-lg font-medium">
                              {rfi.title}
                            </span>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="badge badge-sm badge-neutral">
                                {rfi.id}
                              </span>
                              {rfi.status && (
                                <span
                                  className={`badge badge-sm ${getStatusBadge(
                                    rfi.status
                                  )}`}
                                >
                                  {rfi.status}
                                </span>
                              )}
                              {rfi.priority && (
                                <span
                                  className={`badge badge-xs ${getPriorityBadge(
                                    rfi.priority
                                  )}`}
                                >
                                  {rfi.priority}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            className="btn btn-xs btn-outline"
                            onClick={() => setActiveTab("rfis")}
                          >
                            View RFI
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser =
                        currentUser?.id === message.senderId;
                      return (
                        <div
                          key={message.id}
                          className={`chat ${
                            isCurrentUser ? "chat-end" : "chat-start"
                          }`}
                        >
                          <div className="chat-header text-xs sm:text-sm">
                            <span className="hidden sm:inline">
                              {message.sender.firstName} {message.sender.lastName}
                            </span>
                            <span className="sm:hidden">
                              {message.sender.firstName}
                            </span>
                            <time className="text-xs opacity-50 ml-2">
                              {formatTime(message.createdAt)}
                            </time>
                          </div>
                          <div className="chat-bubble bg-neutral text-neutral-content text-sm sm:text-base max-w-xs sm:max-w-md">
                            {message.content}
                            {message.attachment && (
                              <div className="mt-2">
                                {isImageFile(message.attachment) ? (
                                  <img
                                    src={getAttachmentUrl(message.attachment)}
                                    alt="Attachment"
                                    className="max-w-full h-auto rounded-lg cursor-pointer"
                                    onClick={() => window.open(getAttachmentUrl(message.attachment!), '_blank')}
                                  />
                                ) : (
                                  <a
                                    href={getAttachmentUrl(message.attachment)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                                  >
                                    {getFileIcon(message.attachment)}
                                    <span className="text-xs">
                                      {message.attachment.split('/').pop()}
                                    </span>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Attachment Preview */}
                {selectedFiles.length > 0 && (
                  <div className="px-3 sm:px-4 py-2 bg-base-200 border-t border-base-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="btn btn-ghost btn-xs"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-1">
                            {getFileIcon(file.name)}
                            <span className="text-xs max-w-20 truncate">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="btn btn-ghost btn-circle btn-xs text-red-500 hover:bg-red-100"
                          >
                            <IoTrash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-base-300 bg-base-300"
                >
                  <div className="flex gap-2 items-end">
                    {/* File and Camera Actions */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-circle btn-sm sm:btn-md bg-base-200 rounded-full p-1"
                        onClick={handleFileUpload}
                        title="Upload Documents"
                      >
                        <div className="flex items-center justify-center">
                          <IoAttach size={18} />
                        </div>
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-circle btn-sm sm:btn-md bg-base-200 rounded-full p-1"
                        onClick={handleCameraCapture}
                        title="Take Photo"
                      >
                        <div className="flex items-center justify-center">
                          <IoCamera size={18} />
                        </div>
                      </button>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered input-sm sm:input-md flex-1"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendMessageMutation.isPending || sendMessageWithAttachmentsMutation.isPending}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm sm:btn-md"
                      disabled={
                        sendMessageMutation.isPending || 
                        sendMessageWithAttachmentsMutation.isPending || 
                        (!newMessage.trim() && selectedFiles.length === 0)
                      }
                    >
                      {(sendMessageMutation.isPending || sendMessageWithAttachmentsMutation.isPending) ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <span className="hidden sm:inline">Send</span>
                      )}
                      <span className="sm:hidden">📤</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label="RFIs"
          checked={activeTab === "rfis"}
          onChange={() => setActiveTab("rfis")}
        />
        {activeTab === "rfis" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    Request for Information (RFI)
                  </h2>
                  <p className="text-neutral-500">
                    Track information requests and responses
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateRFIModal(true)}
                >
                  + New RFI
                </button>
              </div>

              {rfisLoading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : rfis.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No RFIs found. Create your first RFI to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {rfis.map((rfi) => (
                    <div
                      key={rfi.id}
                      className="border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="badge badge-neutral">
                              {rfi.id}
                            </span>
                            {rfi.priority && (
                              <span
                                className={`badge ${getPriorityBadge(
                                  rfi.priority
                                )}`}
                              >
                                {rfi.priority}
                              </span>
                            )}
                            {rfi.status && (
                              <span
                                className={`badge ${getStatusBadge(
                                  rfi.status
                                )}`}
                              >
                                {rfi.status}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-lg mb-1">
                            {rfi.title}
                          </div>
                          <div className="text-gray-500 text-sm mb-2">
                            {rfi.description}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Thread:</span>{" "}
                            {rfi.thread?.title || "No thread linked"} |
                            <span className="font-medium"> Created by:</span>{" "}
                            {rfi.requester
                              ? `${rfi.requester.firstName} ${rfi.requester.lastName}`
                              : "Unknown"}
                            {rfi.assignees && rfi.assignees.length > 0 && (
                              <>
                                |{" "}
                                <span className="font-medium">
                                  {" "}
                                  Assigned to:
                                </span>{" "}
                                {rfi.assignees
                                  .map((a) => `${a.firstName} ${a.lastName}`)
                                  .join(", ")}
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Created:</span>{" "}
                            {new Date(rfi.createdAt).toLocaleDateString()} |
                            <span className="font-medium"> Updated:</span>{" "}
                            {new Date(rfi.updatedAt).toLocaleDateString()}
                            {rfi.dueDate && (
                              <>
                                | <span className="font-medium"> Due:</span>{" "}
                                {new Date(rfi.dueDate).toLocaleDateString()}
                              </>
                            )}
                          </div>
                          {rfi.answer && (
                            <div className="mt-2 p-2 bg-base-200 rounded text-sm">
                              <span className="font-medium">Answer:</span>{" "}
                              {rfi.answer}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {rfi.threadId && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                const thread = threads.find(
                                  (t) => t.id === rfi.threadId
                                );
                                if (thread) {
                                  handleSelectThread(thread);
                                }
                              }}
                            >
                              Open Chat
                            </button>
                          )}
                          <button
                            className="btn btn-soft btn-sm"
                            onClick={() => handleEditRFI(rfi)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => handleDeleteRFI(rfi)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label="Analytics"
          checked={activeTab === "analytics"}
          onChange={() => setActiveTab("analytics")}
        />
        {activeTab === "analytics" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    Communication Analytics
                  </h2>
                  <p className="text-neutral-500">
                    Comprehensive insights into communication performance and
                    trends
                  </p>
                </div>
                <div className="badge badge-neutral badge-lg">Last 30 Days</div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="stat bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    </svg>
                  </div>
                  <div className="stat-title text-blue-100">Active Threads</div>
                  <div className="stat-value">{threads.length}</div>
                  <div className="stat-desc text-blue-200">
                    +{analyticsData.recentThreads} this week
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2V3a2 2 0 012-2 2 2 0 012 2v8a4 4 0 01-4 4H6a4 4 0 01-4-4V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-amber-100">Open RFIs</div>
                  <div className="stat-value">
                    {analyticsData.rfisByStatus.Open || 0}
                  </div>
                  <div className="stat-desc text-amber-200">
                    {rfis.filter((r) => r.status === "Open").length} pending
                    responses
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-emerald-100">
                    Resolution Rate
                  </div>
                  <div className="stat-value">
                    {rfis.length > 0
                      ? Math.round(
                          ((analyticsData.rfisByStatus.Resolved || 0) /
                            rfis.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="stat-desc text-emerald-200">
                    {analyticsData.rfisByStatus.Resolved || 0} resolved RFIs
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <div className="stat-title text-purple-100">Active Users</div>
                  <div className="stat-value">{analyticsData.activeUsers}</div>
                  <div className="stat-desc text-purple-200">
                    Participating in discussions
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* RFI Status Distribution */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      RFI Status Distribution
                    </h3>
                    <div className="badge badge-neutral badge-sm">
                      {rfis.length} Total
                    </div>
                  </div>
                  <div className="h-64">
                    {Object.keys(analyticsData.rfisByStatus).length > 0 ? (
                      <Doughnut
                        data={rfiStatusChartData}
                        options={chartOptions}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No RFI data available
                      </div>
                    )}
                  </div>
                </div>

                {/* RFI Priority Breakdown */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      RFI Priority Breakdown
                    </h3>
                    <div className="badge badge-neutral badge-sm">
                      By Priority
                    </div>
                  </div>
                  <div className="h-64">
                    {Object.keys(analyticsData.rfisByPriority).length > 0 ? (
                      <Bar data={rfiPriorityChartData} options={chartOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No priority data available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Thread Activity by Project */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Thread Activity by Project
                  </h3>
                  <div className="h-48">
                    {Object.keys(analyticsData.threadsByProject).length > 0 ? (
                      <Line
                        data={threadActivityChartData}
                        options={chartOptions}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No project data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Avg RFI Response Time
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {analyticsData.avgResponseTime}
                        </span>
                        <span className="text-sm text-gray-500">days</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (analyticsData.avgResponseTime / 5) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Thread Engagement
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {(
                            analyticsData.totalMessages / threads.length || 0
                          ).toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          msgs/thread
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((analyticsData.totalMessages / threads.length ||
                              0) /
                              10) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Recent Activity
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {analyticsData.recentRFIs +
                            analyticsData.recentThreads}
                        </span>
                        <span className="text-sm text-gray-500">this week</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((analyticsData.recentRFIs +
                              analyticsData.recentThreads) /
                              20) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* RFI Categories */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">RFI Categories</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.rfisByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 6)
                      .map(([category, count]) => (
                        <div
                          key={category}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm font-medium">
                            {category}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (count /
                                      Math.max(
                                        ...Object.values(
                                          analyticsData.rfisByCategory
                                        )
                                      )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold w-8 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    {Object.keys(analyticsData.rfisByCategory).length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        No category data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Thread Modal */}
      {showCreateThreadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(4px)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Thread</h3>

            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Thread Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  placeholder="Enter thread title..."
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Project *</span>
                </label>
                <select
                  name="projectId"
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project: Project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Add Participants
                  </span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">
                      Loading users...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No users available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                          {selectedUsers.includes(user.id) ? (
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() => handleRemoveUser(user.id)}
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleAddUser(user.id)}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedUsers.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Selected: {selectedUsers.length} participant(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCreateThreadModal(false);
                    setSelectedUsers([]);
                  }}
                  disabled={createThreadMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createThreadMutation.isPending}
                >
                  {createThreadMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating...
                    </>
                  ) : (
                    "Create Thread"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create RFI Modal */}
      {showCreateRFIModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(4px)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New RFI</h3>

            <form onSubmit={handleCreateRFI} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">RFI Title *</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="input input-bordered w-full"
                    placeholder="Enter RFI title..."
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Project *</span>
                  </label>
                  <select
                    name="projectId"
                    className="select select-bordered w-full"
                    required={!selectedRFIThread}
                    disabled={!!selectedRFIThread}
                    value={
                      selectedRFIThread
                        ? threads.find((t) => t.id === selectedRFIThread)
                            ?.projectId || ""
                        : undefined
                    }
                  >
                    <option value="">
                      {selectedRFIThread
                        ? `Project: ${
                            threads.find((t) => t.id === selectedRFIThread)
                              ?.project?.name || "Unknown"
                          }`
                        : "Select a project"}
                    </option>
                    {!selectedRFIThread &&
                      projects.map((project: Project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                  </select>
                  {selectedRFIThread && (
                    <div className="label">
                      <span className="label-text-alt text-info">
                        Project is set by the selected thread
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Description *</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Describe the information you need..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <select
                    name="category"
                    className="select select-bordered w-full"
                  >
                    <option value="">Select category</option>
                    <option value="Design">Design</option>
                    <option value="Construction">Construction</option>
                    <option value="Materials">Materials</option>
                    <option value="Specifications">Specifications</option>
                    <option value="Safety">Safety</option>
                    <option value="Quality">Quality</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Priority</span>
                  </label>
                  <select
                    name="priority"
                    className="select select-bordered w-full"
                  >
                    <option value="">Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Due Date</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Thread Selection */}
              <div className="divider">Thread Association</div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Link to Existing Thread
                  </span>
                </label>
                <select
                  value={selectedRFIThread}
                  onChange={(e) => setSelectedRFIThread(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">Create new thread for this RFI</option>
                  {threads.map((thread) => (
                    <option key={thread.id} value={thread.id}>
                      {thread.title} ({thread.project?.name || "No project"})
                    </option>
                  ))}
                </select>
                <div className="label">
                  <span className="label-text-alt text-gray-500">
                    {selectedRFIThread
                      ? "RFI will be linked to the selected thread"
                      : "A new thread will be created automatically for this RFI"}
                  </span>
                </div>
              </div>

              {/* Assignees Selection */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Assign To</span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">
                      Loading users...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No users available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                          {selectedAssignees.includes(user.id) ? (
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() => handleRemoveAssignee(user.id)}
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleAddAssignee(user.id)}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedAssignees.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Assigned to: {selectedAssignees.length} user(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCreateRFIModal(false);
                    setSelectedRFIThread("");
                    setSelectedAssignees([]);
                  }}
                  disabled={
                    createRFIMutation.isPending ||
                    createThreadMutation.isPending
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    createRFIMutation.isPending ||
                    createThreadMutation.isPending
                  }
                >
                  {createRFIMutation.isPending ||
                  createThreadMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating...
                    </>
                  ) : (
                    "Create RFI"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit RFI Modal */}
      {showEditRFIModal && editingRFI && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit RFI</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingRFI) {
                  const formData = new FormData(e.currentTarget);
                  const updatedRFI: UpdateRFIDto = {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    category: (formData.get("category") as string) || undefined,
                    priority: (formData.get("priority") as string) || undefined,
                    status: (formData.get("status") as string) || undefined,
                    assignedToIds: editRFISelectedAssignees,
                    dueDate: (formData.get("dueDate") as string) || undefined,
                    answer: (formData.get("answer") as string) || undefined,
                  };
                  updateRFIMutation.mutate(
                    { id: editingRFI.id, rfi: updatedRFI },
                    {
                      onSuccess: () => {
                        setShowEditRFIModal(false);
                        setEditingRFI(null);
                        setEditRFISelectedAssignees([]);
                      },
                      onError: (error) => {
                        console.error("Failed to update RFI:", error);
                      },
                    }
                  );
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="label">
                  <span className="label-text font-medium">RFI Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  placeholder="Enter RFI title..."
                  defaultValue={editingRFI.title}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Project *</span>
                </label>
                <select
                  name="projectId"
                  className="select select-bordered w-full"
                  defaultValue={editingRFI.projectId}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project: Project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Optional description..."
                  defaultValue={editingRFI.description}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <select
                    name="category"
                    className="select select-bordered w-full"
                    defaultValue={editingRFI.category}
                  >
                    <option value="">Select category</option>
                    <option value="Design">Design</option>
                    <option value="Construction">Construction</option>
                    <option value="Materials">Materials</option>
                    <option value="Specifications">Specifications</option>
                    <option value="Safety">Safety</option>
                    <option value="Quality">Quality</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Priority</span>
                  </label>
                  <select
                    name="priority"
                    className="select select-bordered w-full"
                    defaultValue={editingRFI.priority}
                  >
                    <option value="">Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Status</span>
                  </label>
                  <select
                    name="status"
                    className="select select-bordered w-full"
                    defaultValue={editingRFI.status}
                  >
                    <option value="">Select status</option>
                    <option value="Open">Open</option>
                    <option value="In Review">In Review</option>
                    <option value="Answered">Answered</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Due Date</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    className="input input-bordered w-full"
                    defaultValue={
                      editingRFI.dueDate
                        ? new Date(editingRFI.dueDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                  />
                </div>
              </div>

              {/* Answer field for RFI */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Answer</span>
                </label>
                <textarea
                  name="answer"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Provide answer to this RFI..."
                  defaultValue={editingRFI.answer || ""}
                />
              </div>

              {/* Assignees Selection */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Assign To</span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">
                      Loading users...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No users available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                          {editRFISelectedAssignees.includes(user.id) ? (
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() => handleRemoveEditAssignee(user.id)}
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleAddEditAssignee(user.id)}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {editRFISelectedAssignees.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Assigned to: {editRFISelectedAssignees.length} user(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditRFIModal(false);
                    setEditingRFI(null);
                    setEditRFISelectedAssignees([]);
                  }}
                  disabled={updateRFIMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateRFIMutation.isPending}
                >
                  {updateRFIMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Updating...
                    </>
                  ) : (
                    "Update RFI"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Thread Modal */}
      {showEditThreadModal && editingThread && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Update Thread</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingThread) {
                  const formData = new FormData(e.currentTarget);
                  const updatedThread: UpdateThreadDto = {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    projectId: formData.get("projectId") as string,
                    participantIds: editThreadSelectedUsers,
                  };
                  updateThreadMutation.mutate(
                    { id: editingThread.id, thread: updatedThread },
                    {
                      onSuccess: () => {
                        setShowEditThreadModal(false);
                        setEditingThread(null);
                        setEditThreadSelectedUsers([]);
                      },
                      onError: (error) => {
                        console.error("Failed to update thread:", error);
                      },
                    }
                  );
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="label">
                  <span className="label-text font-medium">Thread Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  placeholder="Enter thread title..."
                  defaultValue={editingThread.title}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Optional description..."
                  defaultValue={editingThread.description}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Project *</span>
                </label>
                <select
                  name="projectId"
                  className="select select-bordered w-full"
                  defaultValue={editingThread.projectId}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project: Project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Add Participants
                  </span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">
                      Loading users...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No users available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                          {editThreadSelectedUsers.includes(user.id) ? (
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() =>
                                handleRemoveEditThreadUser(user.id)
                              }
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleAddEditThreadUser(user.id)}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {editThreadSelectedUsers.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Selected: {editThreadSelectedUsers.length} participant(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditThreadModal(false);
                    setEditingThread(null);
                    setEditThreadSelectedUsers([]);
                  }}
                  disabled={updateThreadMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateThreadMutation.isPending}
                >
                  {updateThreadMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Updating...
                    </>
                  ) : (
                    "Update Thread"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete RFI Confirmation Modal */}
      {showDeleteRFIModal && deletingRFI && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this RFI? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteRFIModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-error" onClick={confirmDeleteRFI}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;

<div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this RFI? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteRFIModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-error" onClick={confirmDeleteRFI}>
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this RFI? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteRFIModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-error" onClick={confirmDeleteRFI}>
                Delete
              </button>
            </div>
          </div>
        </div>


   
}

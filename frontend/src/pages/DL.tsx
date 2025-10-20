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
   
}

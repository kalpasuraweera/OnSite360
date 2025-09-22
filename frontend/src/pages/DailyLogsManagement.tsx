import { useState, useEffect } from "react";
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
  MdLocationOn,
  MdImage,
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
import LocationPicker from "../components/LocationPicker";
import ImageUpload from "../components/ImageUpload";

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

  // Form state for adding/editing logs
  const [logForm, setLogForm] = useState<CreateDailyLogDto>({
    date: moment().format("YYYY-MM-DD"),
    projectId: "",
    weather: "",
    notes: "",
    workHours: 0,
    workersPresent: 0,
    location: "",
    coordinates: undefined,
    images: [],
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
    location: "",
    coordinates: undefined as { latitude: number; longitude: number } | undefined,
    images: [] as string[],
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

  // Mutations
  const createLogMutation = useCreateDailyLog();
  const updateLogMutation = useUpdateDailyLog();
  const deleteLogMutation = useDeleteDailyLog();

  // Activity mutations
  const createActivityMutation = useCreateDailyActivity();
  const updateActivityMutation = useUpdateDailyActivity();
  const deleteActivityMutation = useDeleteDailyActivity();

  // Handle form changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLogForm((prev) => ({
      ...prev,
      [name]:
        name === "workHours" || name === "workersPresent"
          ? Number(value)
          : value,
    }));
  };

  // Handle project change
  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setLogForm((prev) => ({ ...prev, projectId }));
  };

  // Handle form submit for adding/editing log
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      if (editingLog) {
        const updateData: UpdateDailyLogDto = {
          date: logForm.date,
          weather: logForm.weather,
          notes: logForm.notes,
          workHours: logForm.workHours,
          workersPresent: logForm.workersPresent,
        };
        await updateLogMutation.mutateAsync({
          id: editingLog.id,
          log: updateData,
        });
      } else {
        await createLogMutation.mutateAsync(logForm);
      }

      // Reset form
      setLogForm({
        date: moment().format("YYYY-MM-DD"),
        projectId: selectedProject,
        weather: "",
        notes: "",
        workHours: 0,
        workersPresent: 0,
        location: "",
        coordinates: undefined,
        images: [],
      });
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
      workHours: log.workHours || 0,
      workersPresent: log.workersPresent || 0,
      location: log.location || "",
      coordinates: log.coordinates,
      images: log.images || [],
    });
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
        // Update existing activity
        const activityData: UpdateDailyActivityDto = {
          activity: activityForm.activity || undefined,
          startTime: combineDateTime(activityForm.startTime),
          endTime: combineDateTime(activityForm.endTime),
          progress: activityForm.progress || undefined,
          status: activityForm.status,
          notes: activityForm.notes || undefined,
          location: activityForm.location || undefined,
          coordinates: activityForm.coordinates,
          images: activityForm.images,
        };
        await updateActivityMutation.mutateAsync({
          id: editingActivity.id,
          activity: activityData,
        });
      } else {
        // Create new activity
        const activityData: CreateDailyActivityDto = {
          activity: activityForm.activity,
          dailyLogId: selectedLogForActivity.id,
          startTime: combineDateTime(activityForm.startTime),
          endTime: combineDateTime(activityForm.endTime),
          progress: activityForm.progress || undefined,
          status: activityForm.status,
          notes: activityForm.notes || undefined,
          location: activityForm.location || undefined,
          coordinates: activityForm.coordinates,
          images: activityForm.images,
        };
        await createActivityMutation.mutateAsync(activityData);
      }

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
        location: "",
        coordinates: undefined,
        images: [],
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
      location: "",
      coordinates: undefined,
      images: [],
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
      location: activity.location || "",
      coordinates: activity.coordinates,
      images: activity.images || [],
    });
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

  return (
    <div className="mobile-container min-h-screen bg-base-200 pb-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-0">
        <div>
          <h1 className="mobile-heading text-primary">Daily Logs Management</h1>
          <p className="mobile-text text-base-content/70 mt-1">
            Track and manage daily project activities and work progress.
          </p>
        </div>
        {/* Project selection */}
        <div className="flex items-center justify-start lg:justify-end">
          <div className="w-full sm:w-auto">
            <label className="label label-text font-medium mb-1 lg:hidden">
              Project:
            </label>
            <select
              className="select select-bordered w-full sm:w-auto mobile-input"
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

      {/* Tabs for log management - Mobile-first responsive */}
      <div className="tabs tabs-boxed mt-6 bg-base-100 overflow-x-auto">
        <button
          className={`tab mobile-text whitespace-nowrap ${
            activeTab === "view_all" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setActiveTab("view_all")}
        >
          <MdVisibility className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">All Logs</span>
          <span className="sm:hidden">All</span>
        </button>
        <button
          className={`tab mobile-text whitespace-nowrap ${
            activeTab === "view_specific" ? "tab-active font-bold" : ""
          }`}
          onClick={() => setActiveTab("view_specific")}
        >
          <MdSearch className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">By Date</span>
          <span className="sm:hidden">Date</span>
        </button>
        <button
          className={`tab mobile-text whitespace-nowrap ${
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
              workHours: 0,
              workersPresent: 0,
              location: "",
              coordinates: undefined,
              images: [],
            });
          }}
        >
          <MdAdd className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Add Log</span>
          <span className="sm:hidden">Add</span>
        </button>
        {selectedLogForDetails && (
          <button
            className={`tab mobile-text whitespace-nowrap ${
              activeTab === "view_details" ? "tab-active font-bold" : ""
            }`}
            onClick={() => setActiveTab("view_details")}
          >
            <MdVisibility className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Log Details</span>
            <span className="sm:hidden">Details</span>
          </button>
        )}
      </div>

      <div
        id="tab-navigation"
        className="bg-base-100 border border-base-300 mobile-card min-h-[400px] mt-4 sm:mt-6"
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
                          {log.workersPresent !== null &&
                            log.workersPresent !== undefined && (
                              <div className="flex items-center gap-2">
                                <MdPeople className="text-blue-500" />
                                <span className="text-sm font-medium text-gray-600">
                                  Workers:
                                </span>
                                <span className="text-sm">
                                  {log.workersPresent}
                                </span>
                              </div>
                            )}
                          {log.workHours !== null &&
                            log.workHours !== undefined && (
                              <div className="flex items-center gap-2">
                                <MdAccessTime className="text-green-500" />
                                <span className="text-sm font-medium text-gray-600">
                                  Work Hours:
                                </span>
                                <span className="text-sm">
                                  {log.workHours}h
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
                        No daily logs were found for{" "}
                        {moment(selectedDate).format("MMMM D, YYYY")}.
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
                                  <span className="text-sm font-medium text-gray-600">
                                    Weather:
                                  </span>
                                  <span className="text-sm">{log.weather}</span>
                                </div>
                              )}
                              {log.workersPresent !== null &&
                                log.workersPresent !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <MdPeople className="text-blue-500" />
                                    <span className="text-sm font-medium text-gray-600">
                                      Workers:
                                    </span>
                                    <span className="text-sm">
                                      {log.workersPresent}
                                    </span>
                                  </div>
                                )}
                              {log.workHours !== null &&
                                log.workHours !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <MdAccessTime className="text-green-500" />
                                    <span className="text-sm font-medium text-gray-600">
                                      Work Hours:
                                    </span>
                                    <span className="text-sm">
                                      {log.workHours}h
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
                              Logged by {log.logger.firstName}{" "}
                              {log.logger.lastName} •{" "}
                              {moment(log.createdAt).format(
                                "MMM D, YYYY [at] h:mm A"
                              )}
                            </div>

                            {/* Quick Summary */}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {log.activities && log.activities.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <MdWork className="text-blue-500" />
                                  <span>
                                    {log.activities.length} activities
                                  </span>
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
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Select a Date
                  </h3>
                  <p className="text-gray-500">
                    Choose a date to view daily logs for that specific day.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "add_log" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  editingLog ? "bg-orange-100" : "bg-purple-100"
                }`}
              >
                {editingLog ? (
                  <MdEdit className="text-orange-600" />
                ) : (
                  <MdAdd className="text-purple-600" />
                )}
              </div>
              {editingLog ? "Edit Daily Log" : "Add New Daily Log"}
            </h2>

            <form onSubmit={handleLogSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Date</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    className="input input-bordered w-full"
                    value={logForm.date}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Weather</span>
                  </label>
                  <input
                    type="text"
                    name="weather"
                    className="input input-bordered w-full"
                    value={logForm.weather}
                    onChange={handleFormChange}
                    placeholder="e.g., Sunny, 72°F"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Workers Present
                    </span>
                  </label>
                  <input
                    type="number"
                    name="workersPresent"
                    className="input input-bordered w-full"
                    value={logForm.workersPresent}
                    onChange={handleFormChange}
                    min="0"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Work Hours</span>
                  </label>
                  <input
                    type="number"
                    name="workHours"
                    className="input input-bordered w-full"
                    value={logForm.workHours}
                    onChange={handleFormChange}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Notes</span>
                </label>
                <textarea
                  name="notes"
                  className="textarea textarea-bordered w-full"
                  rows={4}
                  value={logForm.notes}
                  onChange={handleFormChange}
                  placeholder="Describe work completed, issues encountered, or any other relevant information..."
                />
              </div>

              {/* Location Section */}
              <div className="bg-base-100 rounded-xl p-6 border border-base-300">
                <div className="flex items-center gap-2 mb-4">
                  <MdLocationOn className="text-primary text-xl" />
                  <h3 className="text-lg font-semibold">Location Information</h3>
                </div>
                <LocationPicker
                  location={logForm.location || ""}
                  coordinates={logForm.coordinates}
                  onLocationChange={(location, coordinates) => {
                    setLogForm(prev => ({
                      ...prev,
                      location,
                      coordinates
                    }));
                  }}
                  placeholder="Enter work site location or use GPS"
                  className="mobile-card"
                />
              </div>

              {/* Images Section */}
              <div className="bg-base-100 rounded-xl p-6 border border-base-300">
                <div className="flex items-center gap-2 mb-4">
                  <MdImage className="text-primary text-xl" />
                  <h3 className="text-lg font-semibold">Daily Log Photos</h3>
                </div>
                <ImageUpload
                  images={logForm.images || []}
                  onImagesChange={(images) => {
                    setLogForm(prev => ({
                      ...prev,
                      images
                    }));
                  }}
                  maxImages={10}
                  allowCamera={true}
                  className="mobile-card"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    createLogMutation.isPending || updateLogMutation.isPending
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
                        workHours: 0,
                        workersPresent: 0,
                        location: "",
                        coordinates: undefined,
                        images: [],
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                {selectedLogForDetails.workersPresent !== null &&
                  selectedLogForDetails.workersPresent !== undefined && (
                    <div className="flex items-center gap-2">
                      <MdPeople className="text-blue-500" />
                      <span className="text-sm font-medium text-gray-600">
                        Workers:
                      </span>
                      <span className="text-sm">
                        {selectedLogForDetails.workersPresent}
                      </span>
                    </div>
                  )}
                {selectedLogForDetails.workHours !== null &&
                  selectedLogForDetails.workHours !== undefined && (
                    <div className="flex items-center gap-2">
                      <MdAccessTime className="text-green-500" />
                      <span className="text-sm font-medium text-gray-600">
                        Work Hours:
                      </span>
                      <span className="text-sm">
                        {selectedLogForDetails.workHours}h
                      </span>
                    </div>
                  )}
              </div>

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
                            <div className="bg-base-300 p-3 rounded-lg">
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

                {/* Location Section for Activity */}
                <div className="bg-base-100 rounded-lg p-4 border border-base-300">
                  <div className="flex items-center gap-2 mb-3">
                    <MdLocationOn className="text-primary text-lg" />
                    <h4 className="font-semibold">Activity Location</h4>
                  </div>
                  <LocationPicker
                    location={activityForm.location || ""}
                    coordinates={activityForm.coordinates}
                    onLocationChange={(location, coordinates) => {
                      setActivityForm(prev => ({
                        ...prev,
                        location,
                        coordinates
                      }));
                    }}
                    placeholder="Specific area where this activity is performed"
                    showManualEntry={true}
                  />
                </div>

                {/* Images Section for Activity */}
                <div className="bg-base-100 rounded-lg p-4 border border-base-300">
                  <div className="flex items-center gap-2 mb-3">
                    <MdImage className="text-primary text-lg" />
                    <h4 className="font-semibold">Activity Photos</h4>
                  </div>
                  <ImageUpload
                    images={activityForm.images || []}
                    onImagesChange={(images) => {
                      setActivityForm(prev => ({
                        ...prev,
                        images
                      }));
                    }}
                    maxImages={5}
                    allowCamera={true}
                  />
                </div>

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
                        location: "",
                        coordinates: undefined,
                        images: [],
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
}

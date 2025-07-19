import { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdCalendarToday, MdVisibility } from "react-icons/md";
import moment from "moment";
import { useAuthStore } from "../stores/useAuthStore";
import { useUserProjects } from "../hooks/useUsers";
import {
  useDailyLogs,
  useDailyLogsByDate,
  useCreateDailyLog,
  useUpdateDailyLog,
  useDeleteDailyLog,
  type DailyLog,
  type CreateDailyLogDto,
  type UpdateDailyLogDto,
} from "../hooks/useSchedule";

type DailyLogTab = "view_all" | "view_specific" | "add_log";

export default function DailyLogsManagement() {
  // Tab state
  const [activeTab, setActiveTab] = useState<DailyLogTab>("view_all");
  
  // Project selection
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logToDelete, setLogToDelete] = useState<DailyLog | null>(null);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  
  // Form state for adding/editing logs
  const [logForm, setLogForm] = useState<CreateDailyLogDto>({
    date: moment().format("YYYY-MM-DD"),
    projectId: "",
    weather: "",
    notes: "",
    workHours: 0,
    workersPresent: 0,
  });

  // Get auth user
  const { user } = useAuthStore();

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(user?.id || "");

  // Set default project when projects load
  useEffect(() => {
    if (Array.isArray(projects) && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
      setLogForm(prev => ({ ...prev, projectId: projects[0].id }));
    }
  }, [projects, selectedProject]);

  // Fetch all daily logs for selected project
  const { data: allDailyLogs = [], isLoading: allLogsLoading } = useDailyLogs(selectedProject);

  // Fetch daily logs for specific date
  const { data: specificDateLogs = [], isLoading: specificLogsLoading } = useDailyLogsByDate(
    selectedProject,
    selectedDate
  );

  // Mutations
  const createLogMutation = useCreateDailyLog();
  const updateLogMutation = useUpdateDailyLog();
  const deleteLogMutation = useDeleteDailyLog();

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLogForm(prev => ({
      ...prev,
      [name]: name === "workHours" || name === "workersPresent" ? Number(value) : value,
    }));
  };

  // Handle project change
  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setLogForm(prev => ({ ...prev, projectId }));
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
        await updateLogMutation.mutateAsync({ id: editingLog.id, log: updateData });
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

  // Check if projects is available and is an array
  const hasProjects = Array.isArray(projects) && projects.length > 0;

  // If no projects available, show a message
  if (!projectsLoading && !hasProjects) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No Projects Available</h2>
          <p className="text-gray-500">You need to be assigned to a project to view daily logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Daily Logs Management</h1>
          <p className="text-gray-500">Track and manage daily project activities</p>
        </div>
        
        {/* Project Selection */}
        {hasProjects && (
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Project:</label>
            <select
              className="select select-bordered"
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs tabs-bordered mb-6">
        <button
          className={`tab text-base ${activeTab === "view_all" ? "tab-active font-bold" : ""}`}
          onClick={() => setActiveTab("view_all")}
        >
          <MdVisibility className="mr-2" />
          View All Logs
        </button>
        <button
          className={`tab text-base ${activeTab === "view_specific" ? "tab-active font-bold" : ""}`}
          onClick={() => setActiveTab("view_specific")}
        >
          <MdSearch className="mr-2" />
          View Specific Date
        </button>
        <button
          className={`tab text-base ${activeTab === "add_log" ? "tab-active font-bold" : ""}`}
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
            });
          }}
        >
          <MdAdd className="mr-2" />
          Add Daily Log
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "view_all" && (
        <div className="bg-base-100 rounded-2xl p-6 shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Daily Logs</h2>
            <div className="text-sm text-gray-500">
              {allLogsLoading ? "Loading..." : `${allDailyLogs.length} logs found`}
            </div>
          </div>

          {allLogsLoading ? (
            <div className="text-center py-8">
              <div className="loading loading-spinner loading-lg"></div>
              <p className="mt-4 text-gray-500">Loading daily logs...</p>
            </div>
          ) : allDailyLogs.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Daily Logs Found</h3>
              <p className="text-gray-500 mb-4">Start by creating your first daily log entry.</p>
              <button
                className="btn btn-primary"
                onClick={() => setActiveTab("add_log")}
              >
                <MdAdd className="mr-2" />
                Add Daily Log
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {allDailyLogs.map((log) => (
                <div key={log.id} className="bg-base-200 rounded-lg p-6 border border-base-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold">
                          {moment(log.date).format("MMMM D, YYYY")}
                        </h3>
                        <span className="badge badge-neutral">
                          {moment(log.date).format("dddd")}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {log.weather && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Weather:</span>
                            <span className="text-sm">{log.weather}</span>
                          </div>
                        )}
                        {log.workersPresent !== null && log.workersPresent !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Workers:</span>
                            <span className="text-sm">{log.workersPresent}</span>
                          </div>
                        )}
                        {log.workHours !== null && log.workHours !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Work Hours:</span>
                            <span className="text-sm">{log.workHours}h</span>
                          </div>
                        )}
                      </div>

                      {log.notes && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-600">Notes:</span>
                          <p className="text-sm text-gray-700 mt-1">{log.notes}</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Logged by {log.logger.firstName} {log.logger.lastName} • {moment(log.createdAt).format("MMM D, YYYY [at] h:mm A")}
                      </div>

                      {log.activities && log.activities.length > 0 && (
                        <div className="mt-4">
                          <span className="text-sm font-medium text-gray-600">Activities ({log.activities.length}):</span>
                          <div className="mt-2 space-y-2">
                            {log.activities.map((activity) => (
                              <div key={activity.id} className="text-sm bg-white p-3 rounded border">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{activity.activity}</span>
                                  <span className={`badge badge-sm ${
                                    activity.status === 'COMPLETED' ? 'badge-success' :
                                    activity.status === 'IN_PROGRESS' ? 'badge-warning' :
                                    activity.status === 'ON_HOLD' ? 'badge-error' :
                                    'badge-neutral'
                                  }`}>
                                    {activity.status.replace('_', ' ')}
                                  </span>
                                </div>
                                {activity.progress !== null && activity.progress !== undefined && (
                                  <div className="mt-1">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-primary h-2 rounded-full" 
                                          style={{ width: `${activity.progress}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs">{activity.progress}%</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleEditLog(log)}
                      >
                        <MdEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-error btn-outline"
                        onClick={() => handleDeleteLog(log)}
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
        <div className="bg-base-100 rounded-2xl p-6 shadow">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">View Logs for Specific Date</h2>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Select Date:</label>
              <input
                type="date"
                className="input input-bordered"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {selectedDate ? (
            <>
              {specificLogsLoading ? (
                <div className="text-center py-8">
                  <div className="loading loading-spinner loading-lg"></div>
                  <p className="mt-4 text-gray-500">Loading logs for {moment(selectedDate).format("MMMM D, YYYY")}...</p>
                </div>
              ) : specificDateLogs.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Logs Found</h3>
                  <p className="text-gray-500 mb-4">
                    No daily logs were found for {moment(selectedDate).format("MMMM D, YYYY")}.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setLogForm(prev => ({ ...prev, date: selectedDate }));
                      setActiveTab("add_log");
                    }}
                  >
                    <MdAdd className="mr-2" />
                    Add Log for This Date
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {specificDateLogs.map((log) => (
                    <div key={log.id} className="bg-base-200 rounded-lg p-6 border border-base-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {log.weather && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">Weather:</span>
                                <span className="text-sm">{log.weather}</span>
                              </div>
                            )}
                            {log.workersPresent !== null && log.workersPresent !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">Workers:</span>
                                <span className="text-sm">{log.workersPresent}</span>
                              </div>
                            )}
                            {log.workHours !== null && log.workHours !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">Work Hours:</span>
                                <span className="text-sm">{log.workHours}h</span>
                              </div>
                            )}
                          </div>

                          {log.notes && (
                            <div className="mb-4">
                              <span className="text-sm font-medium text-gray-600">Notes:</span>
                              <p className="text-sm text-gray-700 mt-1">{log.notes}</p>
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Logged by {log.logger.firstName} {log.logger.lastName} • {moment(log.createdAt).format("MMM D, YYYY [at] h:mm A")}
                          </div>

                          {log.activities && log.activities.length > 0 && (
                            <div className="mt-4">
                              <span className="text-sm font-medium text-gray-600">Activities ({log.activities.length}):</span>
                              <div className="mt-2 space-y-2">
                                {log.activities.map((activity) => (
                                  <div key={activity.id} className="text-sm bg-white p-3 rounded border">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{activity.activity}</span>
                                      <span className={`badge badge-sm ${
                                        activity.status === 'COMPLETED' ? 'badge-success' :
                                        activity.status === 'IN_PROGRESS' ? 'badge-warning' :
                                        activity.status === 'ON_HOLD' ? 'badge-error' :
                                        'badge-neutral'
                                      }`}>
                                        {activity.status.replace('_', ' ')}
                                      </span>
                                    </div>
                                    {activity.progress !== null && activity.progress !== undefined && (
                                      <div className="mt-1">
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div 
                                              className="bg-primary h-2 rounded-full" 
                                              style={{ width: `${activity.progress}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-xs">{activity.progress}%</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleEditLog(log)}
                          >
                            <MdEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-error btn-outline"
                            onClick={() => handleDeleteLog(log)}
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
            <div className="text-center py-12">
              <MdCalendarToday className="mx-auto text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Date</h3>
              <p className="text-gray-500">Choose a date to view daily logs for that specific day.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "add_log" && (
        <div className="bg-base-100 rounded-2xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-6">
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
                  <span className="label-text font-medium">Workers Present</span>
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

            <div className="flex gap-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createLogMutation.isPending || updateLogMutation.isPending}
              >
                {createLogMutation.isPending || updateLogMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {editingLog ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {editingLog ? "Update Log" : "Create Log"}
                  </>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && logToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the daily log for {moment(logToDelete.date).format("MMMM D, YYYY")}? 
              This action cannot be undone.
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
    </div>
  );
}

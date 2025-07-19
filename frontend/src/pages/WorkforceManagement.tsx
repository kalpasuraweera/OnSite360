import { useState } from "react";
import { MdPersonAdd, MdEdit, MdDelete, MdFileDownload, MdAnalytics, MdPeople, MdSchedule, MdSave, MdNoteAdd, MdCheck } from "react-icons/md";
import React from "react";
import {
  useCrewMembers,
  useCreateCrewMember,
  useUpdateCrewMember,
  useDeleteCrewMember,
  useMarkAttendance,
  type CrewMember,
  type CreateCrewMemberDto,
  type AttendanceRecord,
  type Project,
} from "../hooks/useProjects";
import { useUserProjects } from "../hooks/useUsers";
import { useAuthStore } from "../stores/useAuthStore";

// Add date-fns for date formatting (optional, or use native Date)
const todayStr = new Date().toISOString().slice(0, 10);

type WorkforceTab = "all" | "attendance" | "analytics";

const WORKFORCE_TAB_LABELS: Record<WorkforceTab, string> = {
  all: "All Staff",
  attendance: "Attendance",
  analytics: "Analytics",
};

// Extended CrewMember interface for UI state - currently unused but may be needed for future features
// interface CrewMemberWithAttendance extends CrewMember {
//   assignedTask?: string;
//   attendance?: string;
//   safetyStatus?: string;
// }

const WorkforceManagement = () => {
  // API hooks
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(
    user?.id || ""
  );
  const { data: crewMembers, isLoading: crewMembersLoading } = useCrewMembers();
  
  // State management
  const [activeTab, setActiveTab] = useState<WorkforceTab>("all");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<string>(todayStr);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editWorker, setEditWorker] = useState<CrewMember | null>(null);
  const [editWorkerData, setEditWorkerData] = useState<CreateCrewMemberDto>({
    name: "",
    role: "",
    phone: "",
    email: "",
    skills: [],
    isActive: true,
    hireDate: "",
  });
  const [newWorkerData, setNewWorkerData] = useState<CreateCrewMemberDto>({
    name: "",
    role: "",
    phone: "",
    email: "",
    skills: [],
    isActive: true,
    hireDate: "",
  });

  // Attendance state: { [workerId]: { status, notes } }
  const [attendanceState, setAttendanceState] = useState<Record<string, { status: string; notes: string }>>({});
  const [attendanceFilter] = useState<string>("all");
  
  // Bulk operations state
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const [bulkStatus, setBulkStatus] = useState<string>("Present");
  
  // Notes visibility state
  const [showNotes, setShowNotes] = useState<Record<string, boolean>>({});
  
  // Modal states for confirmations
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState<boolean>(false);

  // Mutation hooks
  const createCrewMemberMutation = useCreateCrewMember();
  const updateCrewMemberMutation = useUpdateCrewMember();
  const deleteCrewMemberMutation = useDeleteCrewMember();
  const markAttendanceMutation = useMarkAttendance();

  // Set default project when projects are loaded
  React.useEffect(() => {
    if (
      Array.isArray(projects) &&
      projects.length > 0 &&
      !selectedProject &&
      !projectsLoading
    ) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject, projectsLoading]);

  // Filter workers by project, search term, and attendance status
  const filteredWorkers = React.useMemo(() => {
    // Handle case when crewMembers is undefined, null, or not an array
    if (!crewMembers || !Array.isArray(crewMembers)) return [];
    
    return crewMembers.filter((worker: CrewMember) => {
      const nameMatch = worker.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeTab === "attendance" && attendanceFilter !== "all") {
        const workerAttendance = attendanceState[worker.id]?.status ?? "Present";
        const attendanceMatch = workerAttendance === attendanceFilter;
        return nameMatch && attendanceMatch;
      }
      
      return nameMatch;
    });
  }, [crewMembers, searchTerm, activeTab, attendanceFilter, attendanceState]);

  // Helper: is selected date today?
  const isToday = attendanceDate === todayStr;

  // Early return for loading states to prevent render errors
  if (projectsLoading || crewMembersLoading) {
    return (
      <div className="p-8">
        <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
          <div className="text-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-2">Loading workforce data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handler for attendance change
  const handleAttendanceChange = (workerId: string, status: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        status,
        notes: prev[workerId]?.notes || "",
      },
    }));
  };

  // Handler for notes change
  const handleNotesChange = (workerId: string, notes: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        status: prev[workerId]?.status || "Present",
        notes,
      },
    }));
  };

  // Toggle notes visibility
  const toggleNotes = (workerId: string) => {
    setShowNotes(prev => ({
      ...prev,
      [workerId]: !prev[workerId]
    }));
  };

  // Bulk attendance operations
  const applyBulkAttendance = () => {
    const updates: Record<string, { status: string; notes: string }> = {};
    (filteredWorkers || []).forEach((worker: CrewMember) => {
      updates[worker.id] = {
        status: bulkStatus,
        notes: attendanceState[worker.id]?.notes || ""
      };
    });
    setAttendanceState(prev => ({ ...prev, ...updates }));
  };

  // Save all attendance changes
  const saveAttendanceChanges = async () => {
    if (!selectedProject) return;
    
    try {
      const crewAttendance: AttendanceRecord[] = Object.entries(attendanceState).map(([crewMemberId, attendance]) => ({
        crewMemberId,
        status: attendance.status,
        notes: attendance.notes,
        checkInTime: new Date().toISOString(),
        isApproved: true,
      }));

      await markAttendanceMutation.mutateAsync({
        projectId: selectedProject,
        date: attendanceDate,
        crewAttendance,
      });

      setAttendanceState({});
      setShowSaveConfirm(false);
    } catch (error) {
      console.error('Failed to save attendance:', error);
    }
  };

  // Confirm save attendance changes
  const confirmSaveAttendance = () => {
    saveAttendanceChanges();
  };

  // Handle input changes for new worker form
  const handleNewWorkerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewWorkerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle skills change for new worker
  const handleNewWorkerSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewWorkerData((prev) => ({
      ...prev,
      skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
    }));
  };

  // Handle skills change for edit worker
  const handleEditWorkerSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditWorkerData((prev) => ({
      ...prev,
      skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
    }));
  };

  // Handle input changes for edit worker form
  const handleEditWorkerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditWorkerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open edit worker modal
  const handleEditWorker = (worker: CrewMember) => {
    setEditWorker(worker);
    setEditWorkerData({
      name: worker.name,
      role: worker.role,
      phone: worker.phone || "",
      email: worker.email || "",
      skills: worker.skills || [],
      isActive: worker.isActive,
      hireDate: worker.hireDate || "",
    });
  };

  // Add new worker
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerData.name || !newWorkerData.role) return;
    
    try {
      await createCrewMemberMutation.mutateAsync(newWorkerData);
      setShowAddWorker(false);
      setNewWorkerData({
        name: "",
        role: "",
        phone: "",
        email: "",
        skills: [],
        isActive: true,
        hireDate: "",
      });
    } catch (error) {
      console.error('Failed to create crew member:', error);
    }
  };

  // Update worker details
  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWorkerData.name || !editWorkerData.role || !editWorker) return;
    
    try {
      await updateCrewMemberMutation.mutateAsync({
        crewMemberId: editWorker.id,
        ...editWorkerData,
      });
      setEditWorker(null);
      setEditWorkerData({
        name: "",
        role: "",
        phone: "",
        email: "",
        skills: [],
        isActive: true,
        hireDate: "",
      });
    } catch (error) {
      console.error('Failed to update crew member:', error);
    }
  };

  // Delete worker (show modal instead of confirm)
  const handleDeleteWorker = (workerId: string) => {
    setWorkerToDelete(workerId);
    setShowDeleteConfirm(true);
  };

  // Confirm delete worker
  const confirmDeleteWorker = async () => {
    if (!workerToDelete) return;
    
    try {
      await deleteCrewMemberMutation.mutateAsync(workerToDelete);
      setShowDeleteConfirm(false);
      setWorkerToDelete(null);
    } catch (error) {
      console.error('Failed to delete crew member:', error);
    }
  };

  const handleExport = () => {
    if (!filteredWorkers.length) return;
    
    const csv =
      "Name,Role,Phone,Email,Skills,Active Status,Hire Date\n" +
      filteredWorkers
        .map(
          (w: CrewMember) =>
            `${w.name},${w.role},${w.phone || ""},${w.email || ""},"${(w.skills || []).join("|")}",${w.isActive ? "Active" : "Inactive"},${w.hireDate || ""}`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Workforce_${
      projects.find((p: Project) => p.id === selectedProject)?.name || "Project"
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        {/* Heading with project selector */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-3xl font-bold">Workforce Management</h1>
            <p className="text-gray-500 mt-1">
              Manage staff assignments, attendance, skills, and safety for your
              projects.
            </p>
          </div>
          <div>
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

        {/* Tabs for workforce management */}
        <div className="tabs tabs-border mb-4 mt-6">
          {(Object.keys(WORKFORCE_TAB_LABELS) as WorkforceTab[]).map((tab) => (
            <button
              key={tab}
              className={`tab text-base flex items-center gap-2 ${
                activeTab === tab ? "tab-active font-bold" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" && <MdPeople />}
              {tab === "attendance" && <MdSchedule />}
              {tab === "analytics" && <MdAnalytics />}
              {WORKFORCE_TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Controls and Search bar in one row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div className="flex items-center gap-4">
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={() => setShowAddWorker(true)}
            >
              <MdPersonAdd />
              Add Worker
            </button>
            <button
              className="btn btn-outline flex items-center gap-2"
              onClick={handleExport}
            >
              <MdFileDownload />
              Export Workforce (CSV)
            </button>
          </div>
          <div className="flex items-center justify-end">
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              placeholder="Search worker by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Add Worker Modal */}
        {showAddWorker && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setShowAddWorker(false)}
              >
                ✕
              </button>
              <h3 className="font-bold text-lg mb-4">Add New Worker</h3>
              <form onSubmit={handleAddWorker} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Name *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="input input-bordered w-full"
                      value={newWorkerData.name}
                      onChange={handleNewWorkerChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Role *</span>
                    </label>
                    <input
                      type="text"
                      name="role"
                      className="input input-bordered w-full"
                      value={newWorkerData.role}
                      onChange={handleNewWorkerChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Phone</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="input input-bordered w-full"
                      value={newWorkerData.phone}
                      onChange={handleNewWorkerChange}
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="input input-bordered w-full"
                      value={newWorkerData.email}
                      onChange={handleNewWorkerChange}
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Hire Date</span>
                    </label>
                    <input
                      type="date"
                      name="hireDate"
                      className="input input-bordered w-full"
                      value={newWorkerData.hireDate}
                      onChange={handleNewWorkerChange}
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Status</span>
                    </label>
                    <select
                      name="isActive"
                      className="select select-bordered w-full"
                      value={newWorkerData.isActive ? "true" : "false"}
                      onChange={(e) => setNewWorkerData(prev => ({ ...prev, isActive: e.target.value === "true" }))}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Skills (comma separated)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={(newWorkerData.skills || []).join(", ")}
                    onChange={handleNewWorkerSkillsChange}
                    placeholder="e.g. Carpentry, Electrical, Safety"
                  />
                </div>
                <div className="modal-action">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createCrewMemberMutation.isPending}
                  >
                    {createCrewMemberMutation.isPending ? "Adding..." : "Add Worker"}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowAddWorker(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setShowAddWorker(false)}>close</button>
            </form>
          </div>
        )}

        {/* Delete Worker Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Confirm Delete</h3>
              <p className="py-4">Are you sure you want to delete this worker?</p>
              <div className="modal-action">
                <button className="btn btn-error" onClick={confirmDeleteWorker}>
                  Delete
                </button>
                <button className="btn" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setShowDeleteConfirm(false)}>close</button>
            </form>
          </div>
        )}

        {/* Save Attendance Confirmation Modal */}
        {showSaveConfirm && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MdSave />
                Save Attendance Changes
              </h3>
              <p className="py-4">
                Are you sure you want to save attendance changes for{" "}
                <span className="font-bold">{Object.keys(attendanceState).length}</span>{" "}
                workers for <span className="font-bold">{attendanceDate}</span>?
              </p>
              <div className="modal-action">
                <button className="btn btn-success" onClick={confirmSaveAttendance}>
                  <MdSave />
                  Save Changes
                </button>
                <button className="btn" onClick={() => setShowSaveConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setShowSaveConfirm(false)}>close</button>
            </form>
          </div>
        )}

        {/* Attendance Controls */}
        {activeTab === "attendance" && (
          <div className="bg-base-100 p-6 rounded-xl border border-base-300 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <label className="font-semibold flex items-center gap-2">
                  <span>Date:</span>
                  <input
                    type="date"
                    className="input input-bordered input-sm"
                    style={{ minWidth: "130px" }}
                    value={attendanceDate}
                    max={todayStr}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />
                </label>
                
                {isToday && (
                  <>
                    <div className="divider divider-horizontal"></div>
                    <div className="flex items-center gap-2">
                      <label className="label cursor-pointer flex items-center gap-2">
                        <span className="label-text font-medium">Bulk Mode:</span>
                        <input 
                          type="checkbox" 
                          className="toggle toggle-primary" 
                          checked={bulkMode}
                          onChange={(e) => setBulkMode(e.target.checked)}
                        />
                      </label>
                    </div>
                    
                    {bulkMode && (
                      <div className="flex items-center gap-2">
                        <select
                          className="select select-bordered select-sm"
                          value={bulkStatus}
                          onChange={(e) => setBulkStatus(e.target.value)}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Half Day">Half Day</option>
                          <option value="Sick Leave">Sick Leave</option>
                          <option value="Holiday">Holiday</option>
                        </select>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={applyBulkAttendance}
                        >
                          Apply to All ({filteredWorkers?.length || 0})
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Save Changes button */}
              {isToday && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={saveAttendanceChanges}
                >
                  <MdSave />
                  Save Changes
                </button>
              )}
            </div>
            
            {/* Attendance Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(() => {
                const stats = (filteredWorkers || []).reduce((acc: Record<string, number>, worker: CrewMember) => {
                  const status = attendanceState[worker.id]?.status ?? "Present";
                  acc[status] = (acc[status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                return (
                  <>
                    <div className="stat bg-success text-success-content rounded-xl">
                      <div className="stat-title text-xs opacity-80">Present</div>
                      <div className="stat-value text-2xl">{stats.Present || 0}</div>
                    </div>
                    <div className="stat bg-error text-error-content rounded-xl">
                      <div className="stat-title text-xs opacity-80">Absent</div>
                      <div className="stat-value text-2xl">{stats.Absent || 0}</div>
                    </div>
                    <div className="stat bg-warning text-warning-content rounded-xl">
                      <div className="stat-title text-xs opacity-80">Half Day</div>
                      <div className="stat-value text-2xl">{stats["Half Day"] || 0}</div>
                    </div>
                    <div className="stat bg-info text-info-content rounded-xl">
                      <div className="stat-title text-xs opacity-80">Sick Leave</div>
                      <div className="stat-value text-2xl">{stats["Sick Leave"] || 0}</div>
                    </div>
                    <div className="stat bg-neutral text-neutral-content rounded-xl">
                      <div className="stat-title text-xs opacity-80">Holiday</div>
                      <div className="stat-value text-2xl">{stats.Holiday || 0}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Workforce Table */}
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-100 border border-base-300 rounded-2xl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                {activeTab === "attendance" ? (
                  <>
                    <th>Status</th>
                    <th>Quick Toggle</th>
                    <th>Notes</th>
                  </>
                ) : activeTab === "all" ? (
                  <>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Skills</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {activeTab === "analytics" ? (
                <tr>
                  <td colSpan={2} className="p-0">
                    <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setActiveTab("all")}
                          >
                            ← Back to All Staff
                          </button>
                          <h2 className="text-2xl font-bold">Workforce Analytics</h2>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="stat bg-base-100 rounded-xl shadow">
                          <div className="stat-title">Total Staff</div>
                          <div className="stat-value text-primary">
                            {filteredWorkers?.length || 0}
                          </div>
                          <div className="stat-desc">All roles</div>
                        </div>
                        <div className="stat bg-base-100 rounded-xl shadow">
                          <div className="stat-title">Active Workers</div>
                          <div className="stat-value text-success">
                            {filteredWorkers?.filter((w: CrewMember) => w.isActive).length || 0}
                          </div>
                          <div className="stat-desc">Currently active</div>
                        </div>
                        <div className="stat bg-base-100 rounded-xl shadow">
                          <div className="stat-title">Total Skills</div>
                          <div className="stat-value text-info">
                            {Array.from(new Set(filteredWorkers?.flatMap((w: CrewMember) => w.skills || []) || [])).length}
                          </div>
                          <div className="stat-desc">Unique skills</div>
                        </div>
                        <div className="stat bg-base-100 rounded-xl shadow">
                          <div className="stat-title">Roles</div>
                          <div className="stat-value text-warning">
                            {Array.from(new Set(filteredWorkers?.map((w: CrewMember) => w.role) || [])).length}
                          </div>
                          <div className="stat-desc">Role diversity</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-base-100 p-4 rounded-xl">
                          <h3 className="font-bold text-lg mb-4">Active Status</h3>
                          <div className="space-y-2">
                            {Object.entries(
                              (filteredWorkers || []).reduce((acc: Record<string, number>, worker: CrewMember) => {
                                const status = worker.isActive ? "Active" : "Inactive";
                                acc[status] = (acc[status] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            ).map(([status, count]) => (
                              <div key={status} className="flex justify-between items-center">
                                <span className={`badge ${
                                  status === "Active" ? "badge-success" : "badge-error"
                                }`}>
                                  {status}
                                </span>
                                <span className="font-bold">{count as number}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-base-100 p-4 rounded-xl">
                          <h3 className="font-bold text-lg mb-4">Role Distribution</h3>
                          <div className="space-y-2">
                            {Object.entries(
                              (filteredWorkers || []).reduce((acc: Record<string, number>, worker: CrewMember) => {
                                const role = worker.role;
                                acc[role] = (acc[role] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            ).map(([role, count]) => (
                              <div key={role} className="flex justify-between items-center">
                                <span className="badge badge-outline">
                                  {role}
                                </span>
                                <span className="font-bold">{count as number}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 bg-base-100 p-4 rounded-xl">
                        <h3 className="font-bold text-lg mb-4">Skills Distribution</h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(
                            (filteredWorkers || []).reduce((acc: Record<string, number>, worker: CrewMember) => {
                              (worker.skills || []).forEach((skill: string) => {
                                acc[skill] = (acc[skill] || 0) + 1;
                              });
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([skill, count]) => (
                            <div key={skill} className="flex items-center gap-2 bg-neutral text-neutral-content px-3 py-1 rounded-lg">
                              <span>{skill}</span>
                              <span className="badge badge-sm">{count as number}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (filteredWorkers && filteredWorkers.length > 0) ? (
                filteredWorkers.map((worker: CrewMember) => {
                  // For attendance: use attendanceState or default to "Present"
                  const att = attendanceState[worker.id]?.status ?? "Present";

                  if (activeTab === "attendance") {
                    // Enhanced attendance view with toggle buttons and notes
                    return (
                      <tr key={worker.id} className="hover:bg-base-200">
                        <td className="font-medium flex items-center gap-2">
                          <div className="avatar">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                              <span className="text-xs font-bold">{worker.name.charAt(0)}</span>
                            </div>
                          </div>
                          {worker.name}
                          <span className="text-sm text-gray-500">({worker.role})</span>
                        </td>
                        <td>{worker.role}</td>
                        <td>
                          {isToday ? (
                            <select
                              className={`select select-sm select-bordered ${
                                att === "Present" ? "select-success" :
                                att === "Absent" ? "select-error" :
                                att === "Half Day" ? "select-warning" :
                                att === "Sick Leave" ? "select-info" :
                                att === "Holiday" ? "select-neutral" :
                                "select-bordered"
                              }`}
                              value={att}
                              onChange={(e) => handleAttendanceChange(worker.id, e.target.value)}
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Half Day">Half Day</option>
                              <option value="Sick Leave">Sick Leave</option>
                              <option value="Holiday">Holiday</option>
                            </select>
                          ) : (
                            <span className={`badge badge-lg ${
                              att === "Present" ? "badge-success" :
                              att === "Absent" ? "badge-error" :
                              att === "Half Day" ? "badge-warning" :
                              att === "Sick Leave" ? "badge-info" :
                              att === "Holiday" ? "badge-neutral" :
                              "badge-ghost"
                            }`}>
                              {att}
                            </span>
                          )}
                        </td>
                        <td>
                          {isToday && (
                            <div className="flex items-center gap-2">
                              <label className="label cursor-pointer flex items-center gap-2">
                                <span className="label-text text-sm">Present:</span>
                                <input 
                                  type="checkbox" 
                                  className="toggle toggle-success toggle-sm" 
                                  checked={att === "Present"}
                                  onChange={(e) => {
                                    handleAttendanceChange(
                                      worker.id, 
                                      e.target.checked ? "Present" : "Absent"
                                    );
                                  }}
                                />
                              </label>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {showNotes[worker.id] ? (
                              <div className="flex items-center gap-2 w-full">
                                <input
                                  type="text"
                                  className="input input-xs input-bordered flex-1"
                                  placeholder="Add notes..."
                                  value={attendanceState[worker.id]?.notes || ""}
                                  onChange={(e) => handleNotesChange(worker.id, e.target.value)}
                                  disabled={!isToday}
                                />
                                <button
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => toggleNotes(worker.id)}
                                >
                                  <MdCheck />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {attendanceState[worker.id]?.notes && (
                                  <span className="text-xs text-gray-600 truncate max-w-20">
                                    {attendanceState[worker.id].notes}
                                  </span>
                                )}
                                <button
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => toggleNotes(worker.id)}
                                  disabled={!isToday}
                                >
                                  <MdNoteAdd />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  if (activeTab === "all") {
                    return (
                      <tr
                        key={worker.id}
                        className="hover:bg-base-200"
                      >
                        <td className="font-medium flex items-center gap-2">
                          <div className="avatar">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                              <span className="text-xs font-bold">{worker.name.charAt(0)}</span>
                            </div>
                          </div>
                          {worker.name}
                        </td>
                        <td>{worker.role}</td>
                        <td>{worker.phone || "N/A"}</td>
                        <td>{worker.email || "N/A"}</td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {(worker.skills || []).map((skill: string) => (
                              <span key={skill} className="badge badge-neutral">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              worker.isActive ? "badge-success" : "badge-error"
                            }`}
                          >
                            {worker.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-primary"
                              title="Edit Worker"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditWorker(worker);
                              }}
                            >
                              <MdEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-error"
                              title="Delete Worker"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWorker(worker.id);
                              }}
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return null;
                })
              ) : (
                <tr>
                  <td
                    colSpan={
                      activeTab === "attendance"
                        ? 5
                        : activeTab === "all"
                        ? 7
                        : 2
                    }
                    className="text-center text-gray-500 py-8"
                  >
                    No workforce data found for this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Worker Modal */}
        {editWorker && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setEditWorker(null)}
              >
                ✕
              </button>
              <h3 className="font-bold text-lg mb-4">Edit Worker</h3>
              <form onSubmit={handleUpdateWorker}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label font-semibold">Name</label>
                    <input
                      className="input input-bordered w-full"
                      name="name"
                      value={editWorkerData.name}
                      onChange={handleEditWorkerChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="label font-semibold">Role</label>
                    <input
                      className="input input-bordered w-full"
                      name="role"
                      value={editWorkerData.role}
                      onChange={handleEditWorkerChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="label font-semibold">Phone</label>
                    <input
                      className="input input-bordered w-full"
                      name="phone"
                      type="tel"
                      value={editWorkerData.phone || ""}
                      onChange={handleEditWorkerChange}
                    />
                  </div>
                  <div>
                    <label className="label font-semibold">Email</label>
                    <input
                      className="input input-bordered w-full"
                      name="email"
                      type="email"
                      value={editWorkerData.email || ""}
                      onChange={handleEditWorkerChange}
                    />
                  </div>
                  <div>
                    <label className="label font-semibold">Hire Date</label>
                    <input
                      className="input input-bordered w-full"
                      name="hireDate"
                      type="date"
                      value={editWorkerData.hireDate || ""}
                      onChange={handleEditWorkerChange}
                    />
                  </div>
                  <div>
                    <label className="label font-semibold">Status</label>
                    <select
                      className="select select-bordered w-full"
                      name="isActive"
                      value={editWorkerData.isActive ? "true" : "false"}
                      onChange={(e) => setEditWorkerData(prev => ({ ...prev, isActive: e.target.value === "true" }))}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label font-semibold">Skills (comma separated)</label>
                  <input
                    className="input input-bordered w-full"
                    value={(editWorkerData.skills || []).join(", ")}
                    onChange={handleEditWorkerSkillsChange}
                    placeholder="e.g. Carpentry, Electrical, Safety"
                  />
                </div>
                <div className="modal-action">
                  <button 
                    className="btn btn-primary" 
                    type="submit"
                    disabled={updateCrewMemberMutation.isPending}
                  >
                    {updateCrewMemberMutation.isPending ? "Updating..." : "Update Worker"}
                  </button>
                  <button 
                    type="button"
                    className="btn" 
                    onClick={() => setEditWorker(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setEditWorker(null)}>close</button>
            </form>
          </div>
        )}

        {/* Loading and Error States */}
        {!projectsLoading && !crewMembersLoading && (!crewMembers || !Array.isArray(crewMembers) || crewMembers.length === 0) && (
          <div className="text-center py-8">
            <div className="bg-base-100 p-6 rounded-xl border border-base-300">
              <MdPeople className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Crew Members Found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first crew member to this project.</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddWorker(true)}
              >
                <MdPersonAdd />
                Add First Crew Member
              </button>
            </div>
          </div>
        )}

        {!filteredWorkers.length && !projectsLoading && !crewMembersLoading && crewMembers && Array.isArray(crewMembers) && crewMembers.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No workers match your current search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkforceManagement;

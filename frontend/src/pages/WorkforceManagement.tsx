import { useState } from "react";
import { MdPersonAdd, MdEdit, MdDelete, MdFileDownload, MdAnalytics, MdPeople, MdSchedule, MdSave, MdNoteAdd, MdCheck } from "react-icons/md";
import React from "react";

// Add date-fns for date formatting (optional, or use native Date)
const todayStr = new Date().toISOString().slice(0, 10);

// Mock projects
const mockProjects = [
  { id: "p1", name: "Downtown Tower" },
  { id: "p2", name: "Greenfield Mall" },
  { id: "p3", name: "Harbor Bridge" },
];

type WorkforceTab = "all" | "attendance" | "analytics";

const WORKFORCE_TAB_LABELS: Record<WorkforceTab, string> = {
  all: "All Staff",
  attendance: "Attendance",
  analytics: "Analytics",
};

// Extend Worker type for demo (add age, phone, address, profilePic)
interface Worker {
  id: string;
  name: string;
  role: string;
  assignedTask: string;
  attendance: string;
  skills: string[];
  safetyStatus: string;
  projectId: string;
  age?: number;
  phone?: string;
  address?: string;
  profilePic?: string;
}

// Update mockWorkers with demo personal data and proper worker roles
const mockWorkers: Worker[] = [
  {
    id: "1",
    name: "Alice Johnson",
    role: "Mason",
    assignedTask: "Foundation Work",
    attendance: "Present",
    skills: ["Bricklaying", "Stonework"],
    safetyStatus: "Cleared",
    projectId: "p1",
    age: 32,
    phone: "555-1234",
    address: "123 Main St, Downtown",
    profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    id: "2",
    name: "Bob Smith",
    role: "Electrician",
    assignedTask: "Electrical Installation",
    attendance: "Absent",
    skills: ["Wiring", "Electrical Safety"],
    safetyStatus: "Pending",
    projectId: "p1",
    age: 45,
    phone: "555-5678",
    address: "456 Oak Ave, Suburbia",
    profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: "3",
    name: "Charlie Lee",
    role: "Carpenter",
    assignedTask: "Framing Work",
    attendance: "Present",
    skills: ["Framing", "Finishing"],
    safetyStatus: "Cleared",
    projectId: "p2",
    age: 28,
    phone: "555-8765",
    address: "789 Pine Rd, Greenfield",
    profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: "4",
    name: "Diana Green",
    role: "Labourer",
    assignedTask: "Site Cleanup",
    attendance: "Present",
    skills: ["General Labor", "Equipment Operation"],
    safetyStatus: "Cleared",
    projectId: "p3",
    age: 38,
    phone: "555-4321",
    address: "321 Maple St, Harbor",
    profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    id: "5",
    name: "Mike Wilson",
    role: "Plumber",
    assignedTask: "Pipe Installation",
    attendance: "Half Day",
    skills: ["Plumbing", "Pipe Fitting"],
    safetyStatus: "Cleared",
    projectId: "p1",
    age: 35,
    phone: "555-9876",
    address: "567 Cedar Ave, Downtown",
    profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    id: "6",
    name: "Sarah Miller",
    role: "Welder",
    assignedTask: "Steel Fabrication",
    attendance: "Sick Leave",
    skills: ["Arc Welding", "Metal Cutting"],
    safetyStatus: "Cleared",
    projectId: "p2",
    age: 29,
    phone: "555-4567",
    address: "890 Birch St, Greenfield",
    profilePic: "https://randomuser.me/api/portraits/women/6.jpg",
  },
];

const WorkforceManagement = () => {
  const [activeTab, setActiveTab] = useState<WorkforceTab>("all");
  const [selectedProject, setSelectedProject] = useState<string>(
    mockProjects[0].id
  );
  const [attendanceDate, setAttendanceDate] = useState<string>(todayStr);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showAddWorker, setShowAddWorker] = useState(false);
  // Removed unused newWorker state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [editWorkerData, setEditWorkerData] = useState<Worker>({
    id: "",
    name: "",
    role: "",
    assignedTask: "",
    attendance: "Present",
    skills: [],
    safetyStatus: "Cleared",
    projectId: mockProjects[0].id,
    age: undefined,
    phone: "",
    address: "",
    profilePic: "",
  });

  // Attendance state: { [workerId]: { status, notes } }
  const [attendanceState, setAttendanceState] = useState<Record<string, { status: string; notes: string }>>({});
  const [attendanceFilter] = useState<string>("all"); // Only using attendanceFilter, not setter
  
  // Bulk operations state
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const [bulkStatus, setBulkStatus] = useState<string>("Present");
  
  // Notes visibility state
  const [showNotes, setShowNotes] = useState<Record<string, boolean>>({});
  
  // Modal states for confirmations
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState<boolean>(false);

  // Filter workers by project, search term, and attendance status
  const filteredWorkers = mockWorkers.filter(
    (w) => {
      const projectMatch = w.projectId === selectedProject || activeTab === "all";
      const nameMatch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeTab === "attendance" && attendanceFilter !== "all") {
        const workerAttendance = attendanceState[w.id]?.status ?? w.attendance;
        const attendanceMatch = workerAttendance === attendanceFilter;
        return projectMatch && nameMatch && attendanceMatch;
      }
      
      return projectMatch && nameMatch;
    }
  );

  // Helper: is selected date today?
  const isToday = attendanceDate === todayStr;

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
    filteredWorkers.forEach(worker => {
      updates[worker.id] = {
        status: bulkStatus,
        notes: attendanceState[worker.id]?.notes || ""
      };
    });
    setAttendanceState(prev => ({ ...prev, ...updates }));
  };

  // Save all attendance changes
  const saveAttendanceChanges = () => {
    setShowSaveConfirm(true);
  };

  // Confirm save attendance changes
  const confirmSaveAttendance = () => {
    // In a real app, this would save to backend
    alert(`Saved attendance for ${Object.keys(attendanceState).length} workers`);
    setShowSaveConfirm(false);
  };

  // Handle input changes for add worker form
  // Removed unused handleNewWorkerChange

  // Handle skills as comma separated
  // Removed unused handleSkillsChange

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
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  // Open edit worker modal
  const handleEditWorker = (worker: Worker) => {
    setEditWorker(worker);
    setEditWorkerData({ ...worker });
  };

  // Update worker details
  const handleUpdateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWorkerData.name || !editWorkerData.role) return;
    
    const workerIndex = mockWorkers.findIndex(w => w.id === editWorker?.id);
    if (workerIndex !== -1) {
      mockWorkers[workerIndex] = { ...editWorkerData };
    }
    
    setEditWorker(null);
    setEditWorkerData({
      id: "",
      name: "",
      role: "",
      assignedTask: "",
      attendance: "Present",
      skills: [],
      safetyStatus: "Cleared",
      projectId: mockProjects[0].id,
      age: undefined,
      phone: "",
      address: "",
      profilePic: "",
    });
  };

  // Delete worker (show modal instead of confirm)
  const handleDeleteWorker = (workerId: string) => {
    setWorkerToDelete(workerId);
    setShowDeleteConfirm(true);
  };

  // Confirm delete worker
  const confirmDeleteWorker = () => {
    if (workerToDelete) {
      const workerIndex = mockWorkers.findIndex(w => w.id === workerToDelete);
      if (workerIndex !== -1) {
        mockWorkers.splice(workerIndex, 1);
      }
    }
    setShowDeleteConfirm(false);
    setWorkerToDelete(null);
  };

  // Add new worker to mockWorkers (for demo, just push to array)
  // Removed unused handleAddWorker

  const handleExport = () => {
    const workers = filteredWorkers;
    const csv =
      "Name,Role,Assigned Task,Attendance,Skills,Safety Status\n" +
      workers
        .map(
          (w) =>
            `${w.name},${w.role},${w.assignedTask},${
              w.attendance
            },"${w.skills.join("|")}",${w.safetyStatus}`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Workforce_${
      mockProjects.find((p) => p.id === selectedProject)?.name || "Project"
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
            >
              {mockProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
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
              {/* Add worker form content would go here */}
              <p className="text-gray-500">Add worker form implementation needed</p>
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
                          Apply to All ({filteredWorkers.length})
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
                const stats = filteredWorkers.reduce((acc, worker) => {
                  const status = attendanceState[worker.id]?.status ?? worker.attendance;
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
                    <th>Assigned Task</th>
                    <th>Attendance</th>
                    <th>Skills</th>
                    <th>Safety Status</th>
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
                            {filteredWorkers.length}
                          </div>
                          <div className="stat-desc">All roles</div>
                        </div>
                        <div className="stat bg-base-100 rounded-xl shadow">
                          <div className="stat-title">Present Today</div>
                          <div className="stat-value text-success">
                            {filteredWorkers.filter(w => w.attendance === "Present").length}
                          </div>
                          <div className="stat-desc">On site</div>
                        </div>
                        <div className="stat bg-base-100 rounded-xl shadow">
                          <div className="stat-title">Safety Cleared</div>
                          <div className="stat-value text-success">
                            {filteredWorkers.filter(w => w.safetyStatus === "Cleared").length}
                          </div>
                          <div className="stat-desc">Safety compliant</div>
                        </div>
                        <div className="stat bg-base-100 rounded-xl shadow">
                          <div className="stat-title">Active Roles</div>
                          <div className="stat-value text-info">
                            {Array.from(new Set(filteredWorkers.map(w => w.role))).length}
                          </div>
                          <div className="stat-desc">Role diversity</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-base-100 p-4 rounded-xl">
                          <h3 className="font-bold text-lg mb-4">Attendance Status</h3>
                          <div className="space-y-2">
                            {Object.entries(
                              filteredWorkers.reduce((acc, worker) => {
                                const status = worker.attendance;
                                acc[status] = (acc[status] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            ).map(([status, count]) => (
                              <div key={status} className="flex justify-between items-center">
                                <span className={`badge ${
                                  status === "Present" ? "badge-success" :
                                  status === "Absent" ? "badge-error" :
                                  status === "Late" ? "badge-warning" :
                                  "badge-info"
                                }`}>
                                  {status}
                                </span>
                                <span className="font-bold">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-base-100 p-4 rounded-xl">
                          <h3 className="font-bold text-lg mb-4">Safety Status</h3>
                          <div className="space-y-2">
                            {Object.entries(
                              filteredWorkers.reduce((acc, worker) => {
                                const status = worker.safetyStatus;
                                acc[status] = (acc[status] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            ).map(([status, count]) => (
                              <div key={status} className="flex justify-between items-center">
                                <span className={`badge ${
                                  status === "Cleared" ? "badge-success" :
                                  status === "Pending" ? "badge-warning" :
                                  "badge-error"
                                }`}>
                                  {status}
                                </span>
                                <span className="font-bold">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 bg-base-100 p-4 rounded-xl">
                        <h3 className="font-bold text-lg mb-4">Skills Distribution</h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(
                            filteredWorkers.reduce((acc, worker) => {
                              worker.skills.forEach(skill => {
                                acc[skill] = (acc[skill] || 0) + 1;
                              });
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([skill, count]) => (
                            <div key={skill} className="flex items-center gap-2 bg-neutral text-neutral-content px-3 py-1 rounded-lg">
                              <span>{skill}</span>
                              <span className="badge badge-sm">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredWorkers.length > 0 ? (
                filteredWorkers.map((worker) => {
                  // For demo: use attendanceState or fallback to worker.attendance
                  const att = attendanceState[worker.id]?.status ?? worker.attendance;

                  if (activeTab === "attendance") {
                    // Enhanced attendance view with toggle buttons and notes
                    return (
                      <tr key={worker.id} className="hover:bg-base-200">
                        <td className="font-medium flex items-center gap-2">
                          <img
                            src={worker.profilePic}
                            alt={worker.name}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
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
                        className="hover:bg-base-200 cursor-pointer"
                        onClick={() => setSelectedWorker(worker)}
                      >
                        <td className="font-medium flex items-center gap-2">
                          <img
                            src={worker.profilePic}
                            alt={worker.name}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                          {worker.name}
                        </td>
                        <td>{worker.role}</td>
                        <td>{worker.assignedTask}</td>
                        <td>
                          <span
                            className={`badge ${
                              worker.attendance === "Present"
                                ? "badge-success"
                                : "badge-error"
                            }`}
                          >
                            {worker.attendance}
                          </span>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {worker.skills.map((skill) => (
                              <span key={skill} className="badge badge-neutral">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              worker.safetyStatus === "Cleared"
                                ? "badge-success"
                                : "badge-warning"
                            }`}
                          >
                            {worker.safetyStatus}
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
                onClick={() => {
                  setEditWorker(null);
                  setEditWorkerData({
                    id: "",
                    name: "",
                    role: "",
                    assignedTask: "",
                    attendance: "Present",
                    skills: [],
                    safetyStatus: "Cleared",
                    projectId: mockProjects[0].id,
                    age: undefined,
                    phone: "",
                    address: "",
                    profilePic: "",
                  });
                }}
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
                    <label className="label font-semibold">Skills (comma separated)</label>
                    <input
                      className="input input-bordered w-full"
                      value={editWorkerData.skills.join(", ")}
                      onChange={handleEditWorkerSkillsChange}
                    />
                  </div>
                  <div>
                    <label className="label font-semibold">Project</label>
                    <select
                      className="select select-bordered w-full"
                      name="projectId"
                      value={editWorkerData.projectId}
                      onChange={handleEditWorkerChange}
                    >
                      {mockProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label font-semibold">Age</label>
                    <input
                      className="input input-bordered w-full"
                      name="age"
                      type="number"
                      min={16}
                      value={editWorkerData.age ?? ""}
                      onChange={handleEditWorkerChange}
                    />
                  </div>
                  <div>
                    <label className="label font-semibold">Phone</label>
                    <input
                      className="input input-bordered w-full"
                      name="phone"
                      value={editWorkerData.phone}
                      onChange={handleEditWorkerChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label font-semibold">Address</label>
                    <input
                      className="input input-bordered w-full"
                      name="address"
                      value={editWorkerData.address}
                      onChange={handleEditWorkerChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label font-semibold">Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="file-input file-input-bordered w-full"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setEditWorkerData(prev => ({
                              ...prev,
                              profilePic: ev.target?.result as string,
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {editWorkerData.profilePic && (
                      <img
                        src={editWorkerData.profilePic}
                        alt="Profile Preview"
                        className="mt-2 w-16 h-16 rounded-full object-cover border"
                      />
                    )}
                  </div>
                </div>
                <div className="modal-action">
                  <button className="btn btn-primary" type="submit">
                    Update Worker
                  </button>
                  <button 
                    type="button"
                    className="btn" 
                    onClick={() => {
                      setEditWorker(null);
                      setEditWorkerData({
                        id: "",
                        name: "",
                        role: "",
                        assignedTask: "",
                        attendance: "Present",
                        skills: [],
                        safetyStatus: "Cleared",
                        projectId: mockProjects[0].id,
                        age: undefined,
                        phone: "",
                        address: "",
                        profilePic: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => {
                setEditWorker(null);
                setEditWorkerData({
                  id: "",
                  name: "",
                  role: "",
                  assignedTask: "",
                  attendance: "Present",
                  skills: [],
                  safetyStatus: "Cleared",
                  projectId: mockProjects[0].id,
                  age: undefined,
                  phone: "",
                  address: "",
                  profilePic: "",
                });
              }}>close</button>
            </form>
          </div>
        )}

        {/* Worker Personal Data Modal */}
        {selectedWorker && (
          <div className="modal modal-open">
            <div className="modal-box">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setSelectedWorker(null)}
              >
                ✕
              </button>
              <div className="flex flex-col items-center gap-4">
                <img
                  src={selectedWorker.profilePic}
                  alt={selectedWorker.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                />
                <h3 className="text-2xl font-bold">{selectedWorker.name}</h3>
                <div className="w-full">
                  <div className="mb-2">
                    <span className="font-semibold">Role:</span> {selectedWorker.role}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Age:</span> {selectedWorker.age ?? "-"}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Phone:</span> {selectedWorker.phone ?? "-"}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Address:</span> {selectedWorker.address ?? "-"}
                  </div>
                </div>
                <div className="modal-action w-full">
                  <button className="btn btn-primary flex-1">
                    Edit
                  </button>
                  <button className="btn btn-outline flex-1">
                    Message
                  </button>
                </div>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setSelectedWorker(null)}>close</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkforceManagement;

import { useState } from "react";
import { MdPersonAdd, MdEdit, MdDelete, MdFileDownload } from "react-icons/md";
import React from "react";

// Add date-fns for date formatting (optional, or use native Date)
const todayStr = new Date().toISOString().slice(0, 10);

// Mock projects
const mockProjects = [
  { id: "p1", name: "Downtown Tower" },
  { id: "p2", name: "Greenfield Mall" },
  { id: "p3", name: "Harbor Bridge" },
];

type WorkforceTab = "all" | "assignments" | "attendance" | "skills" | "safety";

const WORKFORCE_TAB_LABELS: Record<WorkforceTab, string> = {
  all: "All Staff",
  assignments: "Assignments",
  attendance: "Attendance",
  skills: "Skills Matrix",
  safety: "Safety Records",
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

// Update mockWorkers with demo personal data
const mockWorkers: Worker[] = [
  {
    id: "1",
    name: "Alice Johnson",
    role: "Site Engineer",
    assignedTask: "Foundation Inspection",
    attendance: "Present",
    skills: ["Inspection", "Surveying"],
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
    role: "Foreman",
    assignedTask: "Material Delivery",
    attendance: "Absent",
    skills: ["Logistics", "Team Lead"],
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
    role: "Electrician",
    assignedTask: "Wiring",
    attendance: "Present",
    skills: ["Wiring", "Safety"],
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
    role: "Safety Officer",
    assignedTask: "Safety Audit",
    attendance: "Present",
    skills: ["Safety", "First Aid"],
    safetyStatus: "Cleared",
    projectId: "p3",
    age: 38,
    phone: "555-4321",
    address: "321 Maple St, Harbor",
    profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
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
  const [editAssignmentWorker, setEditAssignmentWorker] = useState<Worker | null>(null);
  const [editAssignedTask, setEditAssignedTask] = useState<string>("");
  const [editSafetyWorker, setEditSafetyWorker] = useState<Worker | null>(null);
  const [editSafetyStatus, setEditSafetyStatus] = useState<string>("");
  const [editSkillsWorker, setEditSkillsWorker] = useState<Worker | null>(null);
  const [editWorkerSkills, setEditWorkerSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState<string>("");
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
  const [showAttendanceNotes, setShowAttendanceNotes] = useState<Record<string, boolean>>({});
  const [bulkAttendanceMode, setBulkAttendanceMode] = useState<boolean>(false);
  const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("Present");
  const [attendanceFilter] = useState<string>("all"); // Only using attendanceFilter, not setter
  
  // Modal states for confirmations
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  // Removed unused showBulkSaveConfirm state

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
      },
    }));
  };

  // Handler for notes change
  const handleNotesChange = (workerId: string, notes: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        notes,
      },
    }));
  };

  // Handler for save/update (show modal instead of alert)
  const handleSave = (workerId: string) => {
    const worker = mockWorkers.find(w => w.id === workerId);
    const workerName = worker?.name || "Unknown Worker";
    const status = attendanceState[workerId]?.status || "Present";
    const notes = attendanceState[workerId]?.notes || "";
    setSaveMessage(`Saved attendance for ${workerName}: ${status}${notes ? `, Notes: ${notes}` : ""}`);
    setShowSaveConfirm(true);
  };

  const toggleNotesVisibility = (workerId: string) => {
    setShowAttendanceNotes(prev => ({
      ...prev,
      [workerId]: !prev[workerId]
    }));
  };

  const handleBulkAttendanceToggle = () => {
    setBulkAttendanceMode(!bulkAttendanceMode);
    setSelectedWorkers(new Set());
  };

  const handleWorkerSelection = (workerId: string, isChecked: boolean) => {
    setSelectedWorkers(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(workerId);
      } else {
        newSet.delete(workerId);
      }
      return newSet;
    });
  };

  const handleSelectAllWorkers = (isChecked: boolean) => {
    if (isChecked) {
      const allWorkerIds = filteredWorkers.map(w => w.id);
      setSelectedWorkers(new Set(allWorkerIds));
    } else {
      setSelectedWorkers(new Set());
    }
  };

  const applyBulkAttendance = () => {
    const updates: Record<string, { status: string; notes: string }> = {};
    selectedWorkers.forEach(workerId => {
      updates[workerId] = {
        status: bulkStatus,
        notes: attendanceState[workerId]?.notes || ""
      };
    });
    
    setAttendanceState(prev => ({
      ...prev,
      ...updates
    }));
    
    setBulkAttendanceMode(false);
    setSelectedWorkers(new Set());
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

  // Handle skills update
  const handleEditSkills = (worker: Worker) => {
    setEditSkillsWorker(worker);
    setEditWorkerSkills([...worker.skills]);
    setNewSkill("");
  };

  // Add new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !editWorkerSkills.includes(newSkill.trim())) {
      setEditWorkerSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setEditWorkerSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  // Save skills update
  const handleUpdateSkills = () => {
    if (editSkillsWorker) {
      const workerIndex = mockWorkers.findIndex(w => w.id === editSkillsWorker.id);
      if (workerIndex !== -1) {
        mockWorkers[workerIndex].skills = [...editWorkerSkills];
      }
    }
    setEditSkillsWorker(null);
    setEditWorkerSkills([]);
    setNewSkill("");
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
              className={`tab text-base ${
                activeTab === tab ? "tab-active font-bold" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            {/* ...existing code... */}
          </div>
        )}

        {/* Save Attendance Confirmation Modal */}
        {showSaveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-base-100 rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 btn btn-sm btn-circle"
                type="button"
                onClick={() => setShowSaveConfirm(false)}
                aria-label="Close"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4">Attendance Saved</h2>
              <p className="mb-6">{saveMessage}</p>
              <button className="btn btn-primary w-full" onClick={() => setShowSaveConfirm(false)}>
                OK
              </button>
            </div>
          </div>
        )}

        {/* Delete Worker Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-base-100 rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 btn btn-sm btn-circle"
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                aria-label="Close"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="mb-6">Are you sure you want to delete this worker?</p>
              <div className="flex gap-4">
                <button className="btn btn-error flex-1" onClick={confirmDeleteWorker}>
                  Delete
                </button>
                <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Controls: Date Picker for Attendance */}
        {activeTab === "attendance" && (
          <div className="sticky top-0 z-10 bg-base-200 py-4 mb-4 rounded-lg border">
            <div className="flex flex-wrap items-center gap-4">
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
                  <button
                    className={`btn btn-sm ${bulkAttendanceMode ? 'btn-error' : 'btn-primary'}`}
                    onClick={handleBulkAttendanceToggle}
                  >
                    {bulkAttendanceMode ? 'Cancel Bulk' : 'Bulk Update'}
                  </button>
                  
                  {bulkAttendanceMode && (
                    <>
                      <select
                        className="select select-bordered select-sm"
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value)}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Sick Leave">Sick Leave</option>
                      </select>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={applyBulkAttendance}
                        disabled={selectedWorkers.size === 0}
                      >
                        Apply to {selectedWorkers.size} workers
                      </button>
                    </>
                  )}
                </>
              )}
              
              <div className="flex-1"></div>
              <span className="text-sm text-gray-500">
                {isToday
                  ? "You can mark attendance for today."
                  : "Viewing past attendance (read-only)."}
              </span>
            </div>
            
            {/* Attendance Summary */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const stats = filteredWorkers.reduce((acc, worker) => {
                  const status = attendanceState[worker.id]?.status ?? worker.attendance;
                  acc[status] = (acc[status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                return (
                  <>
                    <div className="stat bg-base-100 rounded-lg">
                      <div className="stat-title text-xs">Present</div>
                      <div className="stat-value text-lg text-success">{stats.Present || 0}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg">
                      <div className="stat-title text-xs">Absent</div>
                      <div className="stat-value text-lg text-error">{stats.Absent || 0}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg">
                      <div className="stat-title text-xs">Late</div>
                      <div className="stat-value text-lg text-warning">{stats.Late || 0}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg">
                      <div className="stat-title text-xs">Sick Leave</div>
                      <div className="stat-value text-lg text-info">{stats["Sick Leave"] || 0}</div>
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
                {activeTab === "attendance" && bulkAttendanceMode && (
                  <th>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedWorkers.size === filteredWorkers.length && filteredWorkers.length > 0}
                      onChange={(e) => handleSelectAllWorkers(e.target.checked)}
                    />
                  </th>
                )}
                <th>Name</th>
                <th>Role</th>
                {activeTab === "attendance" ? (
                  <>
                    <th>Status</th>
                    <th>Notes</th>
                    {isToday && <th>Actions</th>}
                  </>
                ) : (
                  <>
                    {activeTab === "assignments" && <th>Assigned Task</th>}
                    {activeTab === "skills" && <th>Skills</th>}
                    {activeTab === "safety" && <th>Safety Status</th>}
                    {activeTab === "all" && (
                      <>
                        <th>Assigned Task</th>
                        <th>Attendance</th>
                        <th>Skills</th>
                        <th>Safety Status</th>
                      </>
                    )}
                    <th>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length > 0 ? (
                filteredWorkers.map((worker) => {
                  // For demo: use attendanceState or fallback to worker.attendance
                  const att = attendanceState[worker.id]?.status ?? worker.attendance;

                  if (activeTab === "attendance") {
                    // Enhanced attendance view with notes and better UI
                    return (
                      <tr key={worker.id} className="hover:bg-base-200">
                        {bulkAttendanceMode && (
                          <td>
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm"
                              checked={selectedWorkers.has(worker.id)}
                              onChange={(e) => handleWorkerSelection(worker.id, e.target.checked)}
                            />
                          </td>
                        )}
                        <td className="font-medium">{worker.name}</td>
                        <td>{worker.role}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {isToday ? (
                              <select
                                className={`select select-sm select-bordered ${
                                  att === "Present" ? "select-success" :
                                  att === "Absent" ? "select-error" :
                                  att === "Late" ? "select-warning" :
                                  "select-info"
                                }`}
                                value={att}
                                onChange={(e) => handleAttendanceChange(worker.id, e.target.value)}
                              >
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Late">Late</option>
                                <option value="Sick Leave">Sick Leave</option>
                              </select>
                            ) : (
                              <span className={`badge ${
                                att === "Present" ? "badge-success" :
                                att === "Absent" ? "badge-error" :
                                att === "Late" ? "badge-warning" :
                                "badge-info"
                              }`}>
                                {att}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {showAttendanceNotes[worker.id] || (attendanceState[worker.id]?.notes && attendanceState[worker.id].notes.length > 0) ? (
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
                                  onClick={() => toggleNotesVisibility(worker.id)}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => toggleNotesVisibility(worker.id)}
                                disabled={!isToday}
                              >
                                📝 Add Note
                              </button>
                            )}
                          </div>
                        </td>
                        {isToday && (
                          <td>
                            <button
                              className="btn btn-success btn-xs"
                              onClick={() => handleSave(worker.id)}
                            >
                              Save
                            </button>
                          </td>
                        )}
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

                  if (activeTab === "assignments") {
                    return (
                      <tr key={worker.id} className="hover:bg-base-200">
                        <td className="font-medium">{worker.name}</td>
                        <td>{worker.role}</td>
                        <td>{worker.assignedTask}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setEditAssignmentWorker(worker);
                              setEditAssignedTask(worker.assignedTask);
                            }}
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  if (activeTab === "safety") {
                    return (
                      <tr key={worker.id} className="hover:bg-base-200">
                        <td className="font-medium">{worker.name}</td>
                        <td>{worker.role}</td>
                        <td>
                          <span
                            className={`badge ${
                              worker.safetyStatus === "Cleared"
                                ? "badge-success"
                                : worker.safetyStatus === "Pending"
                                ? "badge-warning"
                                : worker.safetyStatus === "Suspended"
                                ? "badge-error"
                                : "badge-info"
                            }`}
                          >
                            {worker.safetyStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setEditSafetyWorker(worker);
                              setEditSafetyStatus(worker.safetyStatus);
                            }}
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  if (activeTab === "skills") {
                    return (
                      <tr key={worker.id} className="hover:bg-base-200">
                        <td className="font-medium">{worker.name}</td>
                        <td>{worker.role}</td>
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
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEditSkills(worker)}
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={worker.id} className="hover:bg-base-200">
                      <td className="font-medium">{worker.name}</td>
                      <td>{worker.role}</td>
                      {activeTab === "assignments" && (
                        <td>{worker.assignedTask}</td>
                      )}
                      {activeTab === "attendance" && (
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
                      )}
                      {activeTab === "skills" && (
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {worker.skills.map((skill) => (
                              <span key={skill} className="badge badge-neutral">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}
                      {activeTab === "safety" && (
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
                      )}
                      {activeTab === "all" && (
                        <>
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
                        </>
                      )}
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-primary"
                            title="Edit Worker"
                          >
                            <MdEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            title="Delete Worker"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={
                      activeTab === "attendance" 
                        ? (bulkAttendanceMode ? 6 : 5) + (isToday ? 1 : 0)
                        : 8
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

        {/* Update Assignment Modal */}
        {editAssignmentWorker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-base-100 rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 btn btn-sm btn-circle"
                onClick={() => {
                  setEditAssignmentWorker(null);
                  setEditAssignedTask("");
                }}
                aria-label="Close"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4">Update Assignment</h2>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={editAssignmentWorker.profilePic}
                    alt={editAssignmentWorker.name}
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <span className="font-semibold">{editAssignmentWorker.name}</span>
                  <span className="text-gray-500">({editAssignmentWorker.role})</span>
                </div>
                <label className="label font-semibold">Assigned Task</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editAssignedTask}
                  onChange={(e) => setEditAssignedTask(e.target.value)}
                  placeholder="Enter new task assignment..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-outline flex-1"
                  onClick={() => {
                    setEditAssignmentWorker(null);
                    setEditAssignedTask("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary flex-1"
                  onClick={() => {
                    // Update the worker's assigned task
                    const workerIndex = mockWorkers.findIndex(w => w.id === editAssignmentWorker.id);
                    if (workerIndex !== -1) {
                      mockWorkers[workerIndex].assignedTask = editAssignedTask;
                    }
                    setEditAssignmentWorker(null);
                    setEditAssignedTask("");
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Safety Status Modal */}
        {editSafetyWorker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-base-100 rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 btn btn-sm btn-circle"
                onClick={() => {
                  setEditSafetyWorker(null);
                  setEditSafetyStatus("");
                }}
                aria-label="Close"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4">Update Safety Status</h2>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={editSafetyWorker.profilePic}
                    alt={editSafetyWorker.name}
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <span className="font-semibold">{editSafetyWorker.name}</span>
                  <span className="text-gray-500">({editSafetyWorker.role})</span>
                </div>
                <label className="label font-semibold">Safety Status</label>
                <select
                  className="select select-bordered w-full"
                  value={editSafetyStatus}
                  onChange={(e) => setEditSafetyStatus(e.target.value)}
                >
                  <option value="Cleared">Cleared</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-outline flex-1"
                  onClick={() => {
                    setEditSafetyWorker(null);
                    setEditSafetyStatus("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary flex-1"
                  onClick={() => {
                    // Update the worker's safety status
                    const workerIndex = mockWorkers.findIndex(w => w.id === editSafetyWorker.id);
                    if (workerIndex !== -1) {
                      mockWorkers[workerIndex].safetyStatus = editSafetyStatus;
                    }
                    setEditSafetyWorker(null);
                    setEditSafetyStatus("");
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Skills Modal */}
        {editSkillsWorker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-base-100 rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 btn btn-sm btn-circle"
                onClick={() => {
                  setEditSkillsWorker(null);
                  setEditWorkerSkills([]);
                  setNewSkill("");
                }}
                aria-label="Close"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4">Update Skills</h2>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={editSkillsWorker.profilePic}
                    alt={editSkillsWorker.name}
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <span className="font-semibold">{editSkillsWorker.name}</span>
                  <span className="text-gray-500">({editSkillsWorker.role})</span>
                </div>
                
                {/* Add New Skill */}
                <label className="label font-semibold">Add New Skill</label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter skill name..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleAddSkill}
                    disabled={!newSkill.trim()}
                  >
                    Add
                  </button>
                </div>

                {/* Current Skills */}
                <label className="label font-semibold">Current Skills</label>
                <div className="min-h-[100px] max-h-[200px] overflow-y-auto border border-base-300 rounded-lg p-3">
                  {editWorkerSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {editWorkerSkills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-1 bg-neutral text-neutral-content px-2 py-1 rounded-lg">
                          <span className="text-sm">{skill}</span>
                          <button
                            className="btn btn-ghost btn-xs text-neutral-content hover:text-error"
                            onClick={() => handleRemoveSkill(skill)}
                            title="Remove skill"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      No skills added yet
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  className="btn btn-outline flex-1"
                  onClick={() => {
                    setEditSkillsWorker(null);
                    setEditWorkerSkills([]);
                    setNewSkill("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleUpdateSkills}
                >
                  Update Skills
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Worker Modal */}
        {editWorker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <form
              className="bg-base-100 rounded-xl shadow-lg p-8 w-full max-w-lg relative"
              onSubmit={handleUpdateWorker}
            >
              <button
                className="absolute top-2 right-2 btn btn-sm btn-circle"
                type="button"
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
                aria-label="Close"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4">Edit Worker</h2>
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
              <button className="btn btn-primary mt-6 w-full" type="submit">
                Update Worker
              </button>
            </form>
          </div>
        )}

        {/* Worker Personal Data Modal */}
        {selectedWorker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-base-100 rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 btn btn-sm btn-circle"
                onClick={() => setSelectedWorker(null)}
                aria-label="Close"
              >
                ✕
              </button>
              <div className="flex flex-col items-center gap-4">
                <img
                  src={selectedWorker.profilePic}
                  alt={selectedWorker.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                />
                <h2 className="text-2xl font-bold">{selectedWorker.name}</h2>
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
                <div className="flex gap-2">
                  <button className="btn btn-primary flex-1">
                    Edit
                  </button>
                  <button className="btn btn-outline flex-1">
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update button for attendance (only for today, only if attendance tab) */}
        {activeTab === "attendance" && isToday && (
          <div className="flex justify-end mt-4">
            <button
              className="btn btn-success"
              onClick={() => {
                // Save all attendance at once
                filteredWorkers.forEach((worker) => handleSave(worker.id));
              }}
            >
              Update Attendance
            </button>
          </div>
        )}

        {/* Summary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-title">Total Staff</div>
            <div className="stat-value text-primary">
              {
                mockWorkers.filter((w) => w.projectId === selectedProject)
                  .length
              }
            </div>
            <div className="stat-desc">All roles</div>
          </div>
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-title">Present</div>
            <div className="stat-value text-success">
              {
                mockWorkers.filter(
                  (w) =>
                    w.projectId === selectedProject &&
                    w.attendance === "Present"
                ).length
              }
            </div>
            <div className="stat-desc">On site</div>
          </div>
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-title">Cleared Safety</div>
            <div className="stat-value text-success">
              {
                mockWorkers.filter(
                  (w) =>
                    w.projectId === selectedProject &&
                    w.safetyStatus === "Cleared"
                ).length
              }
            </div>
            <div className="stat-desc">Safety checks</div>
          </div>
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-title">Unique Skills</div>
            <div className="stat-value text-info">
              {
                Array.from(
                  new Set(
                    mockWorkers
                      .filter((w) => w.projectId === selectedProject)
                      .flatMap((w) => w.skills)
                  )
                ).length
              }
            </div>
            <div className="stat-desc">Skill diversity</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkforceManagement;

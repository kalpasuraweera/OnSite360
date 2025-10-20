import React, { useState, useRef } from "react";
import { MdFileUpload, MdDelete } from "react-icons/md";

type DocItem = {
  id: string;
  name: string;
  size: number;
  type: string;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const DocumentPage: React.FC = () => {
  const [files, setFiles] = useState<DocItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: DocItem[] = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFiles((prev) => [...newFiles, ...prev]);
  };

  const onUploadClick = () => inputRef.current?.click();

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>

      <div className="mb-4 flex gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="Upload documents"
        />
        <button
          className="btn btn-primary"
          onClick={onUploadClick}
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
                    const stats = (filteredWorkers || []).reduce(
                      (acc: Record<string, number>, worker: CrewMember) => {
                        const status =
                          attendanceState[worker.id]?.status ?? "Present";
                        acc[status] = (acc[status] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    );

                    return (
                      <>
                        <div className="stat bg-base-200 text-success rounded-xl border border-base-300">
                          <div className="stat-title text-xs opacity-80">
                            Present
                          </div>
                          <div className="stat-value text-2xl">
                            {stats.Present || 0}
                          </div>
                        </div>
                        <div className="stat bg-base-200 text-error rounded-xl border border-base-300">
                          <div className="stat-title text-xs opacity-80">
                            Absent
                          </div>
                          <div className="stat-value text-2xl">
                            {stats.Absent || 0}
                          </div>
                        </div>
                        <div className="stat bg-base-200 text-warning rounded-xl border border-base-300">
                          <div className="stat-title text-xs opacity-80">
                            Half Day
                          </div>
                          <div className="stat-value text-2xl">
                            {stats["Half Day"] || 0}
                          </div>
                        </div>
                        <div className="stat bg-base-200 text-info rounded-xl border border-base-300">
                          <div className="stat-title text-xs opacity-80">
                            Sick Leave
                          </div>
                          <div className="stat-value text-2xl">
                            {stats["Sick Leave"] || 0}
                          </div>
                        </div>
                        <div className="stat bg-base-200 text-neutral rounded-xl border border-base-300">
                          <div className="stat-title text-xs opacity-80">
                            Holiday
                          </div>
                          <div className="stat-value text-2xl">
                            {stats.Holiday || 0}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* No Attendance Data Message for Attendance Tab */}
            {activeTab === "attendance" &&
              attendanceDataStatus.noDataForDate && (
                <div className="text-center py-12">
                  <div className="bg-base-100 p-8 rounded-xl border border-base-300">
                    <MdSchedule className="mx-auto text-6xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No Attendance Record
                    </h3>
                    <p className="text-gray-500 mb-4">
                      No attendance has been recorded for {attendanceDate}.
                    </p>
                    {isToday ? (
                      <div className="text-sm text-gray-600">
                        {!filteredWorkers || filteredWorkers.length === 0 ? (
                          <div>
                            <p className="mb-2 text-warning">
                              No crew members found for this project.
                            </p>
                            <p className="mb-2">
                              To start recording attendance:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                              <li>
                                First, add crew members to this project using
                                the "Add Worker" button
                              </li>
                              <li>
                                Then return to the Attendance tab to record
                                their attendance
                              </li>
                              <li>Mark attendance status for each worker</li>
                              <li>
                                Click "Save Changes" to create the attendance
                                record
                              </li>
                            </ol>
                          </div>
                        ) : (
                          <div>
                            <p className="mb-2">
                              To start recording attendance:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                              <li>
                                Use the date selector above to ensure today's
                                date is selected
                              </li>
                              <li>
                                Mark attendance status for each worker (table
                                will appear once attendance is created)
                              </li>
                              <li>
                                Click "Save Changes" to create the attendance
                                record
                              </li>
                            </ol>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Attendance records can only be created for today's date.
                      </p>
                    )}
                  </div>
                </div>
              )}

            {/* Workforce Table - Only show if not on attendance tab with no data */}
            {!(
              activeTab === "attendance" && attendanceDataStatus.noDataForDate
            ) && (
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
                          <th>Hire Date</th>
                          <th>Status</th>
                          <th>Created</th>
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
                                <h2 className="text-2xl font-bold">
                                  Workforce Analytics
                                </h2>
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
                                  {filteredWorkers?.filter(
                                    (w: CrewMember) => w.isActive
                                  ).length || 0}
                                </div>
                                <div className="stat-desc">
                                  Currently active
                                </div>
                              </div>
                              <div className="stat bg-base-100 rounded-xl shadow">
                                <div className="stat-title">Total Skills</div>
                                <div className="stat-value text-info">
                                  {
                                    Array.from(
                                      new Set(
                                        filteredWorkers?.flatMap(
                                          (w: CrewMember) => w.skills || []
                                        ) || []
                                      )
                                    ).length
                                  }
                                </div>
                                <div className="stat-desc">Unique skills</div>
                              </div>
                              <div className="stat bg-base-100 rounded-xl shadow">
                                <div className="stat-title">Roles</div>
                                <div className="stat-value text-warning">
                                  {
                                    Array.from(
                                      new Set(
                                        filteredWorkers?.map(
                                          (w: CrewMember) => w.role
                                        ) || []
                                      )
                                    ).length
                                  }
                                </div>
                                <div className="stat-desc">Role diversity</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="bg-base-100 p-4 rounded-xl">
                                <h3 className="font-bold text-lg mb-4">
                                  Active Status
                                </h3>
                                <div className="space-y-2">
                                  {Object.entries(
                                    (filteredWorkers || []).reduce(
                                      (
                                        acc: Record<string, number>,
                                        worker: CrewMember
                                      ) => {
                                        const status = worker.isActive
                                          ? "Active"
                                          : "Inactive";
                                        acc[status] = (acc[status] || 0) + 1;
                                        return acc;
                                      },
                                      {} as Record<string, number>
                                    )
                                  ).map(([status, count]) => (
                                    <div
                                      key={status}
                                      className="flex justify-between items-center"
                                    >
                                      <span
                                        className={`badge ${
                                          status === "Active"
                                            ? "badge-success"
                                            : "badge-error"
                                        }`}
                                      >
                                        {status}
                                      </span>
                                      <span className="font-bold">
                                        {count as number}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-base-100 p-4 rounded-xl">
                                <h3 className="font-bold text-lg mb-4">
                                  Role Distribution
                                </h3>
                                <div className="space-y-2">
                                  {Object.entries(
                                    (filteredWorkers || []).reduce(
                                      (
                                        acc: Record<string, number>,
                                        worker: CrewMember
                                      ) => {
                                        const role = worker.role;
                                        acc[role] = (acc[role] || 0) + 1;
                                        return acc;
                                      },
                                      {} as Record<string, number>
                                    )
                                  ).map(([role, count]) => (
                                    <div
                                      key={role}
                                      className="flex justify-between items-center"
                                    >
                                      <span className="badge badge-outline">
                                        {role}
                                      </span>
                                      <span className="font-bold">
                                        {count as number}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 bg-base-100 p-4 rounded-xl">
                              <h3 className="font-bold text-lg mb-4">
                                Skills Distribution
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(
                                  (filteredWorkers || []).reduce(
                                    (
                                      acc: Record<string, number>,
                                      worker: CrewMember
                                    ) => {
                                      (worker.skills || []).forEach(
                                        (skill: string) => {
                                          acc[skill] = (acc[skill] || 0) + 1;
                                        }
                                      );
                                      return acc;
                                    },
                                    {} as Record<string, number>
                                  )
                                ).map(([skill, count]) => (
                                  <div
                                    key={skill}
                                    className="flex items-center gap-2 bg-neutral text-neutral-content px-3 py-1 rounded-lg"
                                  >
                                    <span>{skill}</span>
                                    <span className="badge badge-sm">
                                      {count as number}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredWorkers && filteredWorkers.length > 0 ? (
                      filteredWorkers.map((worker: CrewMember) => {
                        // For attendance: use attendanceState or default to "Present"
                        const att =
                          attendanceState[worker.id]?.status ?? "Present";

                        if (activeTab === "attendance") {
                          // Enhanced attendance view with toggle buttons and notes
                          return (
                            <tr key={worker.id} className="hover:bg-base-200">
                              <td className="font-medium flex items-center gap-2">
                                <div className="w-8 h-8 min-w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {worker.name.charAt(0)}
                                  </span>
                                </div>
                                {worker.name}
                                <span className="text-sm text-gray-500">
                                  ({worker.role})
                                </span>
                              </td>
                              <td>{worker.role}</td>
                              <td>
                                {isToday ? (
                                  <select
                                    className={`select select-sm select-bordered ${
                                      att === "Present"
                                        ? "select-success"
                                        : att === "Absent"
                                        ? "select-error"
                                        : att === "Half Day"
                                        ? "select-warning"
                                        : att === "Sick Leave"
                                        ? "select-info"
                                        : att === "Holiday"
                                        ? "select-neutral"
                                        : "select-bordered"
                                    }`}
                                    value={att}
                                    onChange={(e) =>
                                      handleAttendanceChange(
                                        worker.id,
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Half Day">Half Day</option>
                                    <option value="Sick Leave">
                                      Sick Leave
                                    </option>
                                    <option value="Holiday">Holiday</option>
                                  </select>
                                ) : (
                                  <span
                                    className={`badge badge-lg ${
                                      att === "Present"
                                        ? "badge-success"
                                        : att === "Absent"
                                        ? "badge-error"
                                        : att === "Half Day"
                                        ? "badge-warning"
                                        : att === "Sick Leave"
                                        ? "badge-info"
                                        : att === "Holiday"
                                        ? "badge-neutral"
                                        : "badge-ghost"
                                    }`}
                                  >
                                    {att}
                                  </span>
                                )}
                              </td>
                              <td>
                                {isToday && (
                                  <div className="flex items-center gap-2">
                                    <label className="label cursor-pointer flex items-center gap-2">
                                      <span className="label-text text-sm">
                                        Present:
                                      </span>
                                      <input
                                        type="checkbox"
                                        className="toggle toggle-success toggle-sm"
                                        checked={att === "Present"}
                                        onChange={(e) => {
                                          handleAttendanceChange(
                                            worker.id,
                                            e.target.checked
                                              ? "Present"
                                              : "Absent"
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
                                        value={
                                          attendanceState[worker.id]?.notes ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleNotesChange(
                                            worker.id,
                                            e.target.value
                                          )
                                        }
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
                            <tr key={worker.id} className="hover:bg-base-200">
                              <td className="font-medium flex items-center gap-2">
                                <div className="w-8 h-8 min-w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {worker.name.charAt(0)}
                                  </span>
                                </div>
                                {worker.name}
                              </td>
                              <td>{worker.role}</td>
                              <td>{worker.phone || "N/A"}</td>
                              <td>{worker.email || "N/A"}</td>
                              <td>
                                <div className="flex flex-wrap gap-1">
                                  {(worker.skills || []).map(
                                    (skill: string) => (
                                      <span
                                        key={skill}
                                        className="badge badge-neutral"
                                      >
                                        {skill}
                                      </span>
                                    )
                                  )}
                                </div>
                              </td>
                              <td>
                                {worker.hireDate ? (
                                  <span className="text-sm">
                                    {new Date(
                                      worker.hireDate
                                    ).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    worker.isActive
                                      ? "badge-success"
                                      : "badge-error"
                                  }`}
                                >
                                  {worker.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td>
                                <span className="text-sm text-gray-500">
                                  {new Date(
                                    worker.createdAt
                                  ).toLocaleDateString()}
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
                              ? 9
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
            )}

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
                        <select
                          name="role"
                          className="select select-bordered w-full"
                          value={editWorkerData.role}
                          onChange={handleEditWorkerChange}
                          required
                        >
                          <option value="">Select a role</option>
                          <option value="Project Manager">
                            Project Manager
                          </option>
                          <option value="Site Supervisor">
                            Site Supervisor
                          </option>
                          <option value="Foreman">Foreman</option>
                          <option value="Carpenter">Carpenter</option>
                          <option value="Electrician">Electrician</option>
                          <option value="Plumber">Plumber</option>
                          <option value="Mason">Mason</option>
                          <option value="Roofer">Roofer</option>
                          <option value="HVAC Technician">
                            HVAC Technician
                          </option>
                          <option value="Heavy Equipment Operator">
                            Heavy Equipment Operator
                          </option>
                          <option value="General Laborer">
                            General Laborer
                          </option>
                          <option value="Safety Officer">Safety Officer</option>
                          <option value="Quality Control Inspector">
                            Quality Control Inspector
                          </option>
                          <option value="Welder">Welder</option>
                          <option value="Painter">Painter</option>
                          <option value="Drywall Installer">
                            Drywall Installer
                          </option>
                          <option value="Flooring Specialist">
                            Flooring Specialist
                          </option>
                          <option value="Concrete Worker">
                            Concrete Worker
                          </option>
                          <option value="Landscaper">Landscaper</option>
                          <option value="Other">Other</option>
                        </select>
                        {editWorkerData.role === "Other" && (
                          <input
                            type="text"
                            className="input input-bordered w-full mt-2"
                            placeholder="Specify custom role"
                            onChange={(e) =>
                              setEditWorkerData((prev) => ({
                                ...prev,
                                role: e.target.value,
                              }))
                            }
                          />
                        )}
                      </div>
                      <div>
                        <label className="label font-semibold">Phone</label>
                        <input
                          className="input input-bordered w-full"
                          name="phone"
                          type="tel"
                          value={editWorkerData.phone || ""}
                          onChange={handleEditWorkerChange}
                          placeholder="(555) 123-4567"
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
                          placeholder="worker@company.com"
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
                          onChange={(e) =>
                            setEditWorkerData((prev) => ({
                              ...prev,
                              isActive: e.target.value === "true",
                            }))
                          }
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label font-semibold">Skills</label>
                      <TagsInput
                        value={editWorkerData.skills || []}
                        onChange={(skills) =>
                          setEditWorkerData((prev) => ({ ...prev, skills }))
                        }
                        placeholder="Type skills and press Enter (e.g. Carpentry, Electrical Installation, Safety Protocols)"
                        maxTags={20}
                        className="w-full"
                      />
                      <div className="mt-2">
                        {editWorkerData.role &&
                        ROLE_SPECIFIC_SKILLS[editWorkerData.role] ? (
                          <>
                            <div className="text-xs text-gray-600 mb-2">
                              Recommended skills for {editWorkerData.role}:
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {ROLE_SPECIFIC_SKILLS[editWorkerData.role].map(
                                (skill) => (
                                  <button
                                    key={skill}
                                    type="button"
                                    className="btn btn-xs btn-primary btn-outline"
                                    onClick={() => {
                                      const currentSkills =
                                        editWorkerData.skills || [];
                                      if (!currentSkills.includes(skill)) {
                                        setEditWorkerData((prev) => ({
                                          ...prev,
                                          skills: [...currentSkills, skill],
                                        }));
                                      }
                                    }}
                                    disabled={(
                                      editWorkerData.skills || []
                                    ).includes(skill)}
                                  >
                                    {skill}
                                  </button>
                                )
                              )}
                            </div>
                          </>
                        ) : null}
                        <div className="text-xs text-gray-600 mb-2">
                          Other common skills:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {COMMON_SKILLS.slice(0, 8).map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => {
                                const currentSkills =
                                  editWorkerData.skills || [];
                                if (!currentSkills.includes(skill)) {
                                  setEditWorkerData((prev) => ({
                                    ...prev,
                                    skills: [...currentSkills, skill],
                                  }));
                                }
                              }}
                              disabled={(editWorkerData.skills || []).includes(
                                skill
                              )}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="modal-action">
                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={updateCrewMemberMutation.isPending}
                      >
                        {updateCrewMemberMutation.isPending
                          ? "Updating..."
                          : "Update Worker"}
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setEditWorker(null)}
                        aria-label="Cancel edit"
                        title="Cancel edit"
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
            {!projectsLoading &&
              !crewMembersLoading &&
              (!crewMembers ||
                !Array.isArray(crewMembers) ||
                crewMembers.length === 0) && (
                <div className="text-center py-8">
                  <div className="bg-base-100 p-6 rounded-xl border border-base-300">
                    <MdPeople className="mx-auto text-4xl text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Crew Members Found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Get started by adding your first crew member to this
                      project.
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowAddWorker(true)}
                      aria-label="Add first crew member"
                      title="Add first crew member"
                    >
                      <MdPersonAdd />
                      Add First Crew Member
                    </button>
                  </div>
                </div>
              )}

            {!filteredWorkers.length &&
              !projectsLoading &&
              !crewMembersLoading &&
              crewMembers &&
              Array.isArray(crewMembers) &&
              crewMembers.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No workers match your current search criteria.
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export const DocumentPage = WorkforceManagement;
export default WorkforceManagement;

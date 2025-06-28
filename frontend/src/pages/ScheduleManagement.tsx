import React, { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

const phases = [
  {
    name: "Foundation & Structure",
    progress: 100,
    status: "Completed",
    statusColor: "bg-green-100 text-green-700",
    dateLabel: "Completed on Jan 30, 2024",
  },
  {
    name: "MEP Systems",
    progress: 60,
    status: "In Progress",
    statusColor: "bg-blue-100 text-blue-700",
    dateLabel: "Expected completion: Mar 15, 2024",
  },
  {
    name: "Interior Finishes",
    progress: 20,
    status: "Upcoming",
    statusColor: "bg-gray-100 text-gray-700",
    dateLabel: "Starting: Mar 20, 2024",
  },
  {
    name: "Exterior & Landscaping",
    progress: 0,
    status: "Planned",
    statusColor: "bg-gray-100 text-gray-700",
    dateLabel: "Starting: May 1, 2024",
  },
];

const updates = [
  {
    title: "MEP Installation Progress",
    type: "Progress Update",
    typeColor: "border border-gray-300 bg-white text-gray-700",
    desc: "HVAC systems installation is 60% complete. Electrical rough-in proceeding on schedule.",
    date: "2024-01-15",
  },
  {
    title: "Material Delivery Completed",
    type: "Milestone",
    typeColor: "border border-gray-300 bg-white text-gray-700",
    desc: "All materials for Phase 2 have been delivered and inspected. Quality meets specifications.",
    date: "2024-01-12",
  },
  {
    title: "Weather Impact Assessment",
    type: "Status Update",
    typeColor: "border border-gray-300 bg-white text-gray-700",
    desc: "Recent weather conditions caused minor delays, but overall timeline remains on track.",
    date: "2024-01-10",
  },
];

// Milestones data
const milestones = [
  {
    icon: <HiOutlineCheckCircle className="text-green-600 w-6 h-6 mr-2" />,
    title: "Foundation Complete",
    desc: "Completed Jan 30, 2024",
    bg: "bg-green-50",
  },
  {
    icon: <HiOutlineClock className="text-blue-600 w-6 h-6 mr-2" />,
    title: "MEP Systems 75% Complete",
    desc: "Target: Mar 15, 2024",
    bg: "bg-blue-50",
  },
  {
    icon: <HiOutlineExclamationCircle className="text-gray-500 w-6 h-6 mr-2" />,
    title: "Interior Finishes Start",
    desc: "Scheduled: Mar 20, 2024",
    bg: "bg-gray-50",
  },
];

const milestonePhotos = [
  { label: "Foundation - Week 1" },
  { label: "Foundation - Week 2" },
];

// Daily Reports data
const todayProgress = {
  date: "January 15, 2024",
  hours: 32,
  tasksCompleted: 3,
  tasksTotal: 4,
  crew: 8,
  desc: "Completed panel installation in Building A",
};
const dailyReports = [
  {
    date: "2024-01-15",
    hours: 32,
    tasks: "3 of 4 tasks",
    crew: 8,
    desc: "Completed panel installation in Building A",
    status: "Submitted",
  },
  {
    date: "2024-01-14",
    hours: 28,
    tasks: "2 of 3 tasks",
    crew: 7,
    desc: "Completed panel installation in Building A",
    status: "Submitted",
  },
  {
    date: "2024-01-13",
    hours: 24,
    tasks: "3 of 3 tasks",
    crew: 6,
    desc: "Finished rough-in work on Floor 1",
    status: "Submitted",
  },
  {
    date: "2024-01-12",
    hours: 30,
    tasks: "4 of 4 tasks",
    crew: 8,
    desc: "All scheduled work completed ahead of time",
    status: "Submitted",
  },
];
const photoDocs = [
  {
    label: "Panel Installation - Building A",
    location: "Downtown Office",
    date: "2024-01-15",
  },
  {
    label: "Conduit Routing - Floor 2",
    location: "Downtown Office",
    date: "2024-01-15",
  },
  {
    label: "Lighting Fixtures - Retail",
    location: "Shopping Center",
    date: "2024-01-14",
  },
  {
    label: "Emergency Systems Test",
    location: "Residential Tower",
    date: "2024-01-14",
  },
];

// Documentation data
const todayLog = {
  date: "January 15, 2024 - Monday",
  weather: "Clear, 45°F",
  crew: 24,
  work: "Foundation pour for Building A completed. Electrical rough-in started on Floor 2…",
  issues: "Minor delay due to material delivery…",
  photos: [1, 2, 3],
};

// Daily Logs data
const logEntries = [
  {
    date: "2024-01-15",
    weather: "Clear, 45°F",
    crew: 22,
    desc: "Foundation pour completed on schedule",
    status: "Submitted",
  },
  {
    date: "2024-01-14",
    weather: "Cloudy, 42°F",
    crew: 24,
    desc: "Electrical rough-in started on floor 2",
    status: "Submitted",
  },
  {
    date: "2024-01-13",
    weather: "Light rain, 38°F",
    crew: 20,
    desc: "Indoor work only due to weather",
    status: "Submitted",
  },
];
const logSummary = [
  {
    date: "2024-01-15",
    user: "Mike Johnson",
    crew: 22,
    desc: "Foundation pour completed on schedule",
    weather: "Clear, 45°F",
  },
  {
    date: "2024-01-14",
    user: "Mike Johnson",
    crew: 24,
    desc: "Electrical rough-in started on floor 2",
    weather: "Cloudy, 42°F",
  },
  {
    date: "2024-01-13",
    user: "Sarah Wilson",
    crew: 20,
    desc: "Indoor work only due to weather",
    weather: "Light rain, 38°F",
  },
];

const ScheduleManagement = () => {
  const [tab, setTab] = useState("Progress Tracking");

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">
        {tab === "Progress Tracking"
          ? "Progress Overview"
          : tab === "Milestones"
          ? "Project Milestones"
          : tab === "Daily Reports"
          ? "Daily Progress Reports"
          : tab === "Documentation"
          ? "Today's Log Entry"
          : tab === "Daily Logs"
          ? "Recent Log Entries"
          : ""}
      </h1>
      <p className="text-gray-500 mb-6">
        {tab === "Progress Tracking" &&
          "Comprehensive project management and daily log tracking"}
        {tab === "Milestones" &&
          "Key project achievements and upcoming targets"}
        {tab === "Daily Reports" && "Submit daily work progress and updates"}
        {tab === "Documentation" && ""}
        {tab === "Daily Logs" && "Previous daily reports"}
      </p>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          "Progress Tracking",
          "Milestones",
          "Daily Reports",
          "Documentation",
          "Daily Logs",
        ].map((t) => (
          <button
            key={t}
            className={`btn btn-outline btn-lg ${
              tab === t
                ? "btn-active bg-white border-gray-300"
                : "bg-gray-50 border-gray-200 text-gray-500"
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {/* Main Content */}
      {tab === "Progress Tracking" && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Construction Phases */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="text-2xl font-bold mb-1">Construction Phases</div>
            <div className="text-gray-500 mb-6">
              Current status of major construction phases
            </div>
            {phases.map((phase) => (
              <div key={phase.name} className="mb-7 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{phase.name}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${phase.statusColor} border border-gray-200`}
                  >
                    {phase.status}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded mb-1">
                  <div
                    className="h-2 bg-black rounded"
                    style={{ width: `${phase.progress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500">{phase.dateLabel}</div>
              </div>
            ))}
          </div>
          {/* Recent Updates */}
          <div className="w-full lg:w-[420px] flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="text-2xl font-bold mb-1">Recent Updates</div>
            <div className="text-gray-500 mb-6">
              Latest project communications
            </div>
            <div className="space-y-6">
              {updates.map((u, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{u.title}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${u.typeColor}`}
                    >
                      {u.type}
                    </span>
                  </div>
                  <div className="text-gray-600 text-sm mb-1">{u.desc}</div>
                  <div className="text-xs text-gray-400">{u.date}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-outline btn-lg w-full mt-6">
              View All Updates
            </button>
          </div>
        </div>
      )}

      {tab === "Milestones" && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Project Milestones */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="text-2xl font-bold mb-2">Project Milestones</div>
            <div className="text-gray-500 mb-6">
              Key project achievements and upcoming targets
            </div>
            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-center rounded-xl px-4 py-3 ${m.bg}`}
                >
                  {m.icon}
                  <div>
                    <div className="font-semibold">{m.title}</div>
                    <div className="text-gray-500 text-sm">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Overall Project Progress */}
          <div className="w-full lg:w-[600px] flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="text-2xl font-bold mb-2">
              Overall Project Progress
            </div>
            <div className="text-gray-500 mb-6">
              Visual progress tracking and photos
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {milestonePhotos.map((p, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center bg-gray-100 rounded-xl h-32"
                >
                  <svg
                    width="36"
                    height="36"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="mb-2 text-gray-400"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      d="M21 19V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12"
                    />
                    <circle
                      cx="12"
                      cy="13"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="text-gray-500 text-sm">{p.label}</span>
                </div>
              ))}
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold">Overall Project Progress</span>
              <span className="font-bold text-lg">73%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded mb-4">
              <div
                className="h-2 bg-black rounded"
                style={{ width: "73%" }}
              ></div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline flex-1">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline mr-1"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m2 4-4 4m0 0-4-4m4 4V4"
                  />
                </svg>
                Upload Photos
              </button>
              <button className="btn btn-outline flex-1">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline mr-1"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M8 6h8m-8 4h8m-8 4h5m-7 4h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                  />
                </svg>
                Progress Report
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "Daily Reports" && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Daily Progress Reports */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="text-2xl font-bold mb-2">
              Today's Progress - {todayProgress.date}
            </div>
            <div className="bg-green-50 rounded-xl p-4 mb-4">
              <div className="flex flex-wrap gap-6 mb-2">
                <span>
                  <span className="font-semibold">Hours Worked:</span>{" "}
                  {todayProgress.hours} hours
                </span>
                <span>
                  <span className="font-semibold">Tasks Completed:</span>{" "}
                  {todayProgress.tasksCompleted} of {todayProgress.tasksTotal}
                </span>
                <span>
                  <span className="font-semibold">Crew Members:</span>{" "}
                  {todayProgress.crew} present
                </span>
              </div>
              <button className="btn btn-neutral btn-sm">
                View Full Report
              </button>
            </div>
            <div className="space-y-3">
              {dailyReports.map((r, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row md:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                >
                  <div>
                    <div className="font-semibold">{r.date}</div>
                    <div className="text-gray-500 text-sm">
                      {r.hours}h worked &nbsp; {r.tasks} &nbsp; {r.crew} crew
                    </div>
                    <div className="text-sm mt-1">{r.desc}</div>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <span className="badge badge-success badge-lg text-xs px-3 py-1">
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-block btn-lg mt-6 btn-neutral">
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                className="inline mr-1"
              >
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Submit Today's Report
            </button>
          </div>
          {/* Photo Documentation */}
          <div className="w-full lg:w-[420px] flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="text-2xl font-bold mb-2">Photo Documentation</div>
            <div className="text-gray-500 mb-6">
              Progress photos and work documentation
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {photoDocs.map((p, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center bg-gray-100 rounded-xl h-32"
                >
                  <svg
                    width="36"
                    height="36"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="mb-2 text-gray-400"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      d="M21 19V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12"
                    />
                    <circle
                      cx="12"
                      cy="13"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm font-semibold">
                    {p.label}
                  </span>
                  <span className="text-gray-400 text-xs">{p.location}</span>
                  <span className="text-gray-400 text-xs">{p.date}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline flex-1">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline mr-1"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m2 4-4 4m0 0-4-4m4 4V4"
                  />
                </svg>
                Take Photo
              </button>
              <button className="btn btn-outline flex-1">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline mr-1"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M8 6h8m-8 4h8m-8 4h5m-7 4h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                  />
                </svg>
                Upload Photos
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "Documentation" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-4xl mx-auto">
          <div className="text-2xl font-bold mb-1">Today's Log Entry</div>
          <div className="text-gray-500 mb-6">{todayLog.date}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold mb-1">Weather</label>
              <input
                className="input input-bordered w-full"
                value={todayLog.weather}
                readOnly
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Crew Count</label>
              <input
                className="input input-bordered w-full"
                value={todayLog.crew}
                readOnly
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              Work Completed Today
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={todayLog.work}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Issues/Delays</label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={todayLog.issues}
              readOnly
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Site Photos</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center bg-gray-100 rounded-xl h-32"
                >
                  <svg
                    width="36"
                    height="36"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="mb-2 text-gray-400"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      d="M21 19V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12"
                    />
                    <circle
                      cx="12"
                      cy="13"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "Daily Logs" && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Recent Log Entries */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="text-2xl font-bold mb-1">Recent Log Entries</div>
            <div className="text-gray-500 mb-6">Previous daily reports</div>
            {logEntries.map((entry, idx) => (
              <div
                key={idx}
                className="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="font-semibold mb-1">{entry.date}</div>
                <div className="flex items-center text-gray-500 text-sm mb-1 gap-2">
                  {entry.weather.includes("Clear") && (
                    <span title="Clear">&#9728;</span>
                  )}
                  {entry.weather.includes("Cloudy") && (
                    <span title="Cloudy">&#9729;</span>
                  )}
                  {entry.weather.includes("rain") && (
                    <span title="Rain">&#127783;</span>
                  )}
                  <span>{entry.weather}</span>
                  <span>&bull;</span>
                  <span>
                    <span className="inline-block align-middle">&#128101;</span>{" "}
                    {entry.crew} crew
                  </span>
                </div>
                <div className="mb-2">{entry.desc}</div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">
                    <span className="inline-block align-middle">&#128065;</span>{" "}
                    View Details
                  </span>
                  <span className="badge badge-success badge-outline">
                    {entry.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Daily Logs Summary */}
          <div className="w-full lg:w-[420px] flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="text-2xl font-bold mb-1">Daily Logs Summary</div>
            <div className="text-gray-500 mb-6">
              Site supervisor reports and updates
            </div>
            <div className="space-y-4">
              {logSummary.map((log, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{log.date}</span>
                    <span className="text-gray-400 text-sm">{log.weather}</span>
                  </div>
                  <div className="text-gray-700 text-sm">
                    {log.user} &bull; {log.crew} crew members
                  </div>
                  <div className="font-medium">{log.desc}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-block btn-lg mt-6 btn-neutral">
              Review All Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;

import { useState } from "react";
import {
  MdCalendarToday,
  MdTimeline,
  MdViewList,
  MdBarChart,
} from "react-icons/md";

// Mock projects
const mockProjects = [
  { id: "p1", name: "Downtown Tower" },
  { id: "p2", name: "Greenfield Mall" },
  { id: "p3", name: "Harbor Bridge" },
];

type ScheduleTab = "gantt" | "timeline" | "calendar" | "logs";

// Mock schedule data
const mockGantt = [
  {
    task: "Site Preparation",
    start: "2024-07-01",
    end: "2024-07-10",
    progress: 100,
  },
  { task: "Foundation", start: "2024-07-11", end: "2024-07-25", progress: 80 },
  { task: "Framing", start: "2024-07-26", end: "2024-08-10", progress: 30 },
];

const mockTimeline = [
  { date: "2024-07-01", event: "Site cleared" },
  { date: "2024-07-11", event: "Foundation started" },
  { date: "2024-07-20", event: "First inspection" },
  { date: "2024-07-26", event: "Framing started" },
];

const mockCalendar = [
  { date: "2024-07-05", event: "Concrete delivery" },
  { date: "2024-07-15", event: "Inspection" },
  { date: "2024-07-28", event: "Material order" },
];

const mockLogs: Record<string, { title: string; details: string }[]> = {
  "2024-07-05": [
    {
      title: "Concrete delivered",
      details: "50 cubic meters delivered at 8:00 AM.",
    },
    { title: "Weather", details: "Sunny, 28°C." },
  ],
  "2024-07-15": [
    { title: "Inspection", details: "Passed all safety checks." },
    { title: "Notes", details: "Minor delay due to equipment maintenance." },
  ],
  "2024-07-28": [
    { title: "Material order", details: "Steel beams ordered for next phase." },
  ],
};

const ScheduleManagement = () => {
  const [activeTab, setActiveTab] = useState<ScheduleTab>("gantt");
  const [selectedProject, setSelectedProject] = useState<string>(
    mockProjects[0].id
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Filtered data by project (mock: all data shown for all projects)
  // In real app, filter by selectedProject

  return (
    <div className="p-8">
      <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
        {/* Heading with project selector */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-3xl font-bold">Schedule Management</h1>
            <p className="text-gray-500 mt-1">
              Manage project schedules: Gantt charts, timelines, calendars, and
              daily logs.
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

        {/* Tabs for schedule types */}
        <div className="tabs tabs-border mb-4 mt-6">
          <button
            className={`tab text-base ${
              activeTab === "gantt" ? "tab-active font-bold" : ""
            }`}
            onClick={() => setActiveTab("gantt")}
          >
            <MdBarChart className="inline mr-1" /> Gantt Chart
          </button>
          <button
            className={`tab text-base ${
              activeTab === "timeline" ? "tab-active font-bold" : ""
            }`}
            onClick={() => setActiveTab("timeline")}
          >
            <MdTimeline className="inline mr-1" /> Timeline
          </button>
          <button
            className={`tab text-base ${
              activeTab === "calendar" ? "tab-active font-bold" : ""
            }`}
            onClick={() => setActiveTab("calendar")}
          >
            <MdCalendarToday className="inline mr-1" /> Calendar
          </button>
          <button
            className={`tab text-base ${
              activeTab === "logs" ? "tab-active font-bold" : ""
            }`}
            onClick={() => setActiveTab("logs")}
          >
            <MdViewList className="inline mr-1" /> Daily Logs
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {/* Gantt Chart */}
          {activeTab === "gantt" && (
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Gantt Chart (Mock)</h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockGantt.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.task}</td>
                        <td>{row.start}</td>
                        <td>{row.end}</td>
                        <td>
                          <div className="w-40 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${row.progress}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs">{row.progress}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timeline */}
          {activeTab === "timeline" && (
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Project Timeline</h2>
              <div className="space-y-4">
                {mockTimeline.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 cursor-pointer ${
                      selectedDate === item.date ? "bg-primary/10" : ""
                    } rounded-lg p-2`}
                    onClick={() => {
                      setSelectedDate(item.date);
                      setActiveTab("logs");
                    }}
                  >
                    <div className="w-32 font-semibold">{item.date}</div>
                    <div>{item.event}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar */}
          {activeTab === "calendar" && (
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Project Calendar</h2>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {Array.from({ length: 31 }, (_, i) => {
                  const date = `2024-07-${(i + 1).toString().padStart(2, "0")}`;
                  const event = mockCalendar.find((e) => e.date === date);
                  return (
                    <div
                      key={date}
                      className={`border rounded-lg p-2 text-center cursor-pointer ${
                        event ? "bg-primary/10 border-primary" : "bg-base-200"
                      } ${selectedDate === date ? "ring-2 ring-primary" : ""}`}
                      onClick={() => {
                        setSelectedDate(date);
                        setActiveTab("logs");
                      }}
                    >
                      <div className="font-bold">{i + 1}</div>
                      {event && (
                        <div className="text-xs mt-1">{event.event}</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500">
                Click a date to view logs.
              </div>
            </div>
          )}

          {/* Daily Logs */}
          {activeTab === "logs" && (
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">
                Daily Logs{" "}
                {selectedDate && (
                  <span className="text-base font-normal">
                    ({selectedDate})
                  </span>
                )}
              </h2>
              {selectedDate && mockLogs[selectedDate] ? (
                <div className="space-y-4">
                  {mockLogs[selectedDate].map((log, idx) => (
                    <div
                      key={idx}
                      className="border border-base-300 rounded-lg p-4 bg-base-200"
                    >
                      <div className="font-semibold">{log.title}</div>
                      <div className="text-gray-600">{log.details}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">
                  No logs found for this date.
                </div>
              )}
              <div className="mt-6">
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveTab("calendar")}
                >
                  ← Back to Calendar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;

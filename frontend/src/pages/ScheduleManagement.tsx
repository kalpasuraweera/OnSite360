import { useState } from "react";
import {
  MdCalendarToday,
  MdTimeline,
  MdViewList,
  MdBarChart,
} from "react-icons/md";
import { Calendar, momentLocalizer, type View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set up the localizer
const localizer = momentLocalizer(moment);

// Custom styles for react-big-calendar
const calendarStyle = {
  height: '100%',
  fontFamily: 'inherit',
} as const;

const eventStyleGetter = (event: { resource: string }) => {
  let backgroundColor = '#3174ad';
  let borderColor = '#3174ad';
  
  // Color code events by resource type
  switch (event.resource) {
    case 'delivery':
      backgroundColor = '#10b981'; // green
      borderColor = '#10b981';
      break;
    case 'inspection':
      backgroundColor = '#f59e0b'; // yellow
      borderColor = '#f59e0b';
      break;
    case 'order':
      backgroundColor = '#ef4444'; // red
      borderColor = '#ef4444';
      break;
    case 'milestone':
      backgroundColor = '#8b5cf6'; // purple
      borderColor = '#8b5cf6';
      break;
    default:
      backgroundColor = '#3174ad'; // blue
      borderColor = '#3174ad';
  }
  
  return {
    style: {
      backgroundColor,
      borderColor,
      color: 'white',
      border: '1px solid ' + borderColor,
      borderRadius: '4px',
    }
  };
};

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
    start: "2025-07-01",
    end: "2025-07-10",
    progress: 100,
  },
  { task: "Foundation", start: "2025-07-11", end: "2025-07-25", progress: 80 },
  { task: "Framing", start: "2025-07-26", end: "2025-08-10", progress: 30 },
];

const mockTimeline = [
  { date: "2025-07-01", event: "Site cleared" },
  { date: "2025-07-11", event: "Foundation started" },
  { date: "2025-07-20", event: "First inspection" },
  { date: "2025-07-26", event: "Framing started" },
];

const mockCalendar = [
  {
    id: 1,
    title: "Concrete delivery",
    start: new Date(2025, 6, 5, 8, 0), // July 5, 2025 8:00 AM
    end: new Date(2025, 6, 5, 9, 0),   // July 5, 2025 9:00 AM
    resource: "delivery"
  },
  {
    id: 2,
    title: "Inspection",
    start: new Date(2025, 6, 15, 10, 0), // July 15, 2025 10:00 AM
    end: new Date(2025, 6, 15, 12, 0),   // July 15, 2025 12:00 PM
    resource: "inspection"
  },
  {
    id: 3,
    title: "Material order",
    start: new Date(2025, 6, 28, 14, 0), // July 28, 2025 2:00 PM
    end: new Date(2025, 6, 28, 15, 0),   // July 28, 2025 3:00 PM
    resource: "order"
  },
  {
    id: 4,
    title: "Site cleared",
    start: new Date(2025, 6, 1, 9, 0),   // July 1, 2025 9:00 AM
    end: new Date(2025, 6, 1, 17, 0),    // July 1, 2025 5:00 PM
    resource: "milestone"
  },
  {
    id: 5,
    title: "Foundation started",
    start: new Date(2025, 6, 11, 8, 0),  // July 11, 2025 8:00 AM
    end: new Date(2025, 6, 11, 17, 0),   // July 11, 2025 5:00 PM
    resource: "milestone"
  },
  {
    id: 6,
    title: "Framing started",
    start: new Date(2025, 6, 26, 8, 0),  // July 26, 2025 8:00 AM
    end: new Date(2025, 6, 26, 17, 0),   // July 26, 2025 5:00 PM
    resource: "milestone"
  }
];

const mockLogs: Record<string, { title: string; details: string }[]> = {
  "2025-07-05": [
    {
      title: "Concrete delivered",
      details: "50 cubic meters delivered at 8:00 AM.",
    },
    { title: "Weather", details: "Sunny, 28°C." },
  ],
  "2025-07-15": [
    { title: "Inspection", details: "Passed all safety checks." },
    { title: "Notes", details: "Minor delay due to equipment maintenance." },
  ],
  "2025-07-28": [
    { title: "Material order", details: "Steel beams ordered for next phase." },
  ],
};

const ScheduleManagement = () => {
  const [activeTab, setActiveTab] = useState<ScheduleTab>("gantt");
  const [selectedProject, setSelectedProject] = useState<string>(
    mockProjects[0].id
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('month');

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
              <div style={{ height: '600px' }}>
                <Calendar
                  localizer={localizer}
                  events={mockCalendar}
                  startAccessor="start"
                  endAccessor="end"
                  style={calendarStyle}
                  eventPropGetter={eventStyleGetter}
                  date={currentDate}
                  onNavigate={(newDate) => setCurrentDate(newDate)}
                  view={currentView}
                  onView={(newView) => setCurrentView(newView)}
                  onSelectEvent={(event) => {
                    // Convert the event date to the format expected by logs
                    const dateString = moment(event.start).format('YYYY-MM-DD');
                    setSelectedDate(dateString);
                    setActiveTab("logs");
                  }}
                  onSelectSlot={(slotInfo) => {
                    // Handle clicking on empty slots
                    const dateString = moment(slotInfo.start).format('YYYY-MM-DD');
                    setSelectedDate(dateString);
                    setActiveTab("logs");
                  }}
                  selectable
                  popup
                  views={['month', 'week', 'day', 'agenda']}
                  step={30}
                  showMultiDayTimes
                  formats={{
                    dateFormat: 'D',
                    dayFormat: 'ddd D',
                    weekdayFormat: 'ddd',
                    monthHeaderFormat: 'MMMM YYYY',
                    dayHeaderFormat: 'dddd, MMMM D',
                    dayRangeHeaderFormat: ({ start, end }) => 
                      `${moment(start).format('MMMM D')} - ${moment(end).format('MMMM D, YYYY')}`,
                    agendaDateFormat: 'ddd, MMM D',
                    agendaTimeFormat: 'h:mm A',
                    agendaTimeRangeFormat: ({ start, end }) => 
                      `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`,
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Click on an event or date to view logs for that day.
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Deliveries</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Inspections</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm">Milestones</span>
                </div>
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

import { useState } from "react";
import {
  MdCalendarToday,
  MdTimeline,
  MdViewList,
  MdBarChart,
  MdConstruction,
  MdWbSunny,
  MdGroup,
  MdSecurity,
  MdLocalShipping,
  MdBuild,
  MdCheckCircle,
  MdWarning,
  MdAssignment,
  MdSchedule,
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

// Helper function to get icon for log types
const getLogIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('weather')) return <MdWbSunny className="text-yellow-500" />;
  if (lowerTitle.includes('delivery') || lowerTitle.includes('delivered')) return <MdLocalShipping className="text-green-500" />;
  if (lowerTitle.includes('meeting') || lowerTitle.includes('briefing')) return <MdGroup className="text-blue-500" />;
  if (lowerTitle.includes('safety') || lowerTitle.includes('security')) return <MdSecurity className="text-red-500" />;
  if (lowerTitle.includes('inspection') || lowerTitle.includes('check') || lowerTitle.includes('quality')) return <MdCheckCircle className="text-green-600" />;
  if (lowerTitle.includes('equipment') || lowerTitle.includes('tools') || lowerTitle.includes('prep')) return <MdBuild className="text-gray-600" />;
  if (lowerTitle.includes('foundation') || lowerTitle.includes('framing') || lowerTitle.includes('construction') || lowerTitle.includes('installation')) return <MdConstruction className="text-orange-500" />;
  if (lowerTitle.includes('order') || lowerTitle.includes('material') || lowerTitle.includes('planning')) return <MdAssignment className="text-purple-500" />;
  if (lowerTitle.includes('holiday') || lowerTitle.includes('delay')) return <MdWarning className="text-amber-500" />;
  
  return <MdSchedule className="text-blue-400" />; // Default icon
};

// Helper function to get log category color
const getLogCategoryColor = (title: string) => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('weather')) return 'bg-yellow-50 border-yellow-200';
  if (lowerTitle.includes('delivery') || lowerTitle.includes('delivered')) return 'bg-green-50 border-green-200';
  if (lowerTitle.includes('meeting') || lowerTitle.includes('briefing')) return 'bg-blue-50 border-blue-200';
  if (lowerTitle.includes('safety') || lowerTitle.includes('security')) return 'bg-red-50 border-red-200';
  if (lowerTitle.includes('inspection') || lowerTitle.includes('check') || lowerTitle.includes('quality')) return 'bg-emerald-50 border-emerald-200';
  if (lowerTitle.includes('equipment') || lowerTitle.includes('tools') || lowerTitle.includes('prep')) return 'bg-gray-50 border-gray-200';
  if (lowerTitle.includes('foundation') || lowerTitle.includes('framing') || lowerTitle.includes('construction') || lowerTitle.includes('installation')) return 'bg-orange-50 border-orange-200';
  if (lowerTitle.includes('order') || lowerTitle.includes('material') || lowerTitle.includes('planning')) return 'bg-purple-50 border-purple-200';
  if (lowerTitle.includes('holiday') || lowerTitle.includes('delay')) return 'bg-amber-50 border-amber-200';
  
  return 'bg-slate-50 border-slate-200'; // Default
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
  { date: "2025-07-02", event: "Land surveying completed" },
  { date: "2025-07-03", event: "Foundation preparation" },
  { date: "2025-07-04", event: "Holiday - No work" },
  { date: "2025-07-05", event: "Concrete delivery" },
  { date: "2025-07-06", event: "Foundation pour" },
  { date: "2025-07-07", event: "Foundation curing" },
  { date: "2025-07-08", event: "Lumber delivery" },
  { date: "2025-07-09", event: "Framing started" },
  { date: "2025-07-10", event: "Framing continued" },
  { date: "2025-07-11", event: "Foundation officially approved" },
  { date: "2025-07-12", event: "Roof installation" },
  { date: "2025-07-13", event: "Roofing progress" },
  { date: "2025-07-15", event: "First inspection" },
  { date: "2025-07-26", event: "Framing phase complete" },
];

const mockCalendar = [
  {
    id: 1,
    title: "Site cleared",
    start: new Date(2025, 6, 1, 9, 0),   // July 1, 2025 9:00 AM
    end: new Date(2025, 6, 1, 17, 0),    // July 1, 2025 5:00 PM
    resource: "milestone"
  },
  {
    id: 2,
    title: "Land surveying",
    start: new Date(2025, 6, 2, 8, 0),   // July 2, 2025 8:00 AM
    end: new Date(2025, 6, 2, 12, 0),    // July 2, 2025 12:00 PM
    resource: "inspection"
  },
  {
    id: 3,
    title: "Foundation prep",
    start: new Date(2025, 6, 3, 8, 0),   // July 3, 2025 8:00 AM
    end: new Date(2025, 6, 3, 17, 0),    // July 3, 2025 5:00 PM
    resource: "milestone"
  },
  {
    id: 4,
    title: "Holiday - No work",
    start: new Date(2025, 6, 4, 0, 0),   // July 4, 2025 All day
    end: new Date(2025, 6, 4, 23, 59),   // July 4, 2025 All day
    resource: "milestone"
  },
  {
    id: 5,
    title: "Concrete delivery",
    start: new Date(2025, 6, 5, 8, 0),   // July 5, 2025 8:00 AM
    end: new Date(2025, 6, 5, 9, 0),     // July 5, 2025 9:00 AM
    resource: "delivery"
  },
  {
    id: 6,
    title: "Foundation pour",
    start: new Date(2025, 6, 6, 7, 0),   // July 6, 2025 7:00 AM
    end: new Date(2025, 6, 6, 15, 0),    // July 6, 2025 3:00 PM
    resource: "milestone"
  },
  {
    id: 7,
    title: "Foundation curing",
    start: new Date(2025, 6, 7, 9, 0),   // July 7, 2025 9:00 AM
    end: new Date(2025, 6, 7, 17, 0),    // July 7, 2025 5:00 PM
    resource: "milestone"
  },
  {
    id: 8,
    title: "Lumber delivery",
    start: new Date(2025, 6, 8, 10, 0),  // July 8, 2025 10:00 AM
    end: new Date(2025, 6, 8, 11, 0),    // July 8, 2025 11:00 AM
    resource: "delivery"
  },
  {
    id: 9,
    title: "Framing start",
    start: new Date(2025, 6, 9, 8, 0),   // July 9, 2025 8:00 AM
    end: new Date(2025, 6, 9, 17, 0),    // July 9, 2025 5:00 PM
    resource: "milestone"
  },
  {
    id: 10,
    title: "Framing continued",
    start: new Date(2025, 6, 10, 8, 0),  // July 10, 2025 8:00 AM
    end: new Date(2025, 6, 10, 17, 0),   // July 10, 2025 5:00 PM
    resource: "milestone"
  },
  {
    id: 11,
    title: "Foundation started",
    start: new Date(2025, 6, 11, 8, 0),  // July 11, 2025 8:00 AM
    end: new Date(2025, 6, 11, 17, 0),   // July 11, 2025 5:00 PM
    resource: "milestone"
  },
  {
    id: 12,
    title: "Roof installation",
    start: new Date(2025, 6, 12, 7, 0),  // July 12, 2025 7:00 AM
    end: new Date(2025, 6, 12, 16, 0),   // July 12, 2025 4:00 PM
    resource: "milestone"
  },
  {
    id: 13,
    title: "Roofing progress",
    start: new Date(2025, 6, 13, 8, 0),  // July 13, 2025 8:00 AM
    end: new Date(2025, 6, 13, 17, 0),   // July 13, 2025 5:00 PM
    resource: "milestone"
  },
  {
    id: 14,
    title: "Inspection",
    start: new Date(2025, 6, 15, 10, 0), // July 15, 2025 10:00 AM
    end: new Date(2025, 6, 15, 12, 0),   // July 15, 2025 12:00 PM
    resource: "inspection"
  },
  {
    id: 15,
    title: "Material order",
    start: new Date(2025, 6, 28, 14, 0), // July 28, 2025 2:00 PM
    end: new Date(2025, 6, 28, 15, 0),   // July 28, 2025 3:00 PM
    resource: "order"
  }
];

const mockLogs: Record<string, { title: string; details: string }[]> = {
  "2025-07-01": [
    {
      title: "Site cleared",
      details: "Site preparation completed. All debris removed and ground leveled.",
    },
    { title: "Weather", details: "Cloudy, 22°C. Light rain in the afternoon." },
    { title: "Equipment", details: "Excavator and bulldozer on site." },
  ],
  "2025-07-02": [
    {
      title: "Surveying",
      details: "Land surveyor completed boundary marking and elevation checks.",
    },
    { title: "Weather", details: "Partly cloudy, 24°C." },
    { title: "Team Meeting", details: "Daily briefing with construction crew at 7:00 AM." },
    { title: "Permit Review", details: "Building permits reviewed and approved by city inspector." },
    { title: "Site Access", details: "Temporary access road completed for heavy equipment." },
    { title: "Utilities", details: "Utility lines marked and verified with city utilities department." },
    { title: "Safety Setup", details: "Construction barriers and safety signage installed around perimeter." },
    { title: "Equipment Check", details: "All surveying equipment calibrated and GPS coordinates verified." },
  ],
  "2025-07-03": [
    {
      title: "Foundation prep",
      details: "Excavation started for foundation. Marked utility lines.",
    },
    { title: "Weather", details: "Sunny, 26°C. Perfect working conditions." },
    { title: "Safety", details: "Safety inspection completed. All workers equipped with PPE." },
  ],
  "2025-07-04": [
    {
      title: "Holiday",
      details: "No work scheduled - Independence Day holiday.",
    },
    { title: "Security", details: "Security guard on site for equipment protection." },
  ],
  "2025-07-05": [
    {
      title: "Concrete delivered",
      details: "50 cubic meters delivered at 8:00 AM.",
    },
    { title: "Weather", details: "Sunny, 28°C." },
    { title: "Foundation work", details: "Foundation forms set up and reinforcement placed." },
    { title: "Quality Control", details: "Concrete samples taken for compression testing." },
    { title: "Rebar Installation", details: "Steel reinforcement bars positioned according to structural plans." },
    { title: "Form Inspection", details: "Foundation forms inspected and approved by structural engineer." },
    { title: "Concrete Testing", details: "Slump test performed - concrete meets specifications." },
    { title: "Pump Setup", details: "Concrete pump positioned and hoses laid out for efficient pour." },
    { title: "Crew Briefing", details: "Pour sequence and safety procedures reviewed with concrete crew." },
    { title: "Tools Ready", details: "Vibrators, floats, and finishing tools prepared for tomorrow's pour." },
  ],
  "2025-07-06": [
    {
      title: "Foundation pour",
      details: "Foundation concrete poured. Quality control tests completed.",
    },
    { title: "Weather", details: "Hot and sunny, 32°C." },
    { title: "Inspection", details: "Building inspector approved foundation work." },
  ],
  "2025-07-07": [
    {
      title: "Curing process",
      details: "Foundation curing in progress. Water applied for proper hydration.",
    },
    { title: "Weather", details: "Sunny, 30°C. High humidity." },
    { title: "Material delivery", details: "Lumber delivery scheduled for tomorrow." },
    { title: "Foundation Inspection", details: "Foundation cure monitored - 72 hours complete, strength developing well." },
    { title: "Lumber Prep", details: "Lumber order verified and delivery truck access route planned." },
    { title: "Site Organization", details: "Material storage areas cleared and organized for incoming lumber." },
    { title: "Form Removal", details: "Foundation forms partially removed - concrete surface looks excellent." },
    { title: "Waterproofing", details: "Foundation waterproofing membrane applied to exterior walls." },
    { title: "Backfill Prep", details: "Backfill material tested and approved for compaction requirements." },
    { title: "Next Phase Planning", details: "Framing crew scheduled and tools/equipment inventory completed." },
    { title: "Quality Check", details: "Foundation dimensions verified against architectural plans - all within tolerance." },
  ],
  "2025-07-08": [
    {
      title: "Lumber delivery",
      details: "Framing lumber delivered and organized on site.",
    },
    { title: "Weather", details: "Overcast, 25°C." },
    { title: "Preparation", details: "Tools and equipment prepared for framing work." },
  ],
  "2025-07-09": [
    {
      title: "Framing start",
      details: "Wall framing begun. First floor walls erected.",
    },
    { title: "Weather", details: "Light rain, 23°C. Work continued under tarps." },
    { title: "Progress", details: "30% of first floor framing completed." },
  ],
  "2025-07-10": [
    {
      title: "Framing continued",
      details: "Second floor framing started. Roof trusses delivered.",
    },
    { title: "Weather", details: "Clearing up, 27°C." },
    { title: "Quality check", details: "Structural engineer reviewed framing work." },
  ],
  "2025-07-11": [
    {
      title: "Foundation started",
      details: "Foundation work officially signed off and approved.",
    },
    { title: "Weather", details: "Sunny, 29°C." },
    { title: "Roof prep", details: "Roof trusses positioned and ready for installation." },
  ],
  "2025-07-12": [
    {
      title: "Roof installation",
      details: "Roof trusses installed. Sheathing work begun.",
    },
    { title: "Weather", details: "Partly cloudy, 26°C. Light breeze." },
    { title: "Safety meeting", details: "Height safety briefing conducted for roof work." },
  ],
  "2025-07-13": [
    {
      title: "Roofing progress",
      details: "Roof sheathing 70% complete. Preparing for shingle installation.",
    },
    { title: "Weather", details: "Sunny, 31°C. Excellent conditions." },
    { title: "Material order", details: "Roofing materials and gutters ordered for next week." },
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Daily Logs</h2>
                  {selectedDate && (
                    <p className="text-base-content/70 mt-1">
                      {moment(selectedDate).format('dddd, MMMM D, YYYY')}
                    </p>
                  )}
                </div>
                {selectedDate && (
                  <div className="badge badge-primary badge-lg">
                    {mockLogs[selectedDate]?.length || 0} entries
                  </div>
                )}
              </div>

              {selectedDate && mockLogs[selectedDate] ? (
                <div className="space-y-4">
                  {mockLogs[selectedDate].map((log, idx) => (
                    <div
                      key={idx}
                      className={`relative border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${getLogCategoryColor(log.title)}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getLogIcon(log.title)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-base-content">
                              {log.title}
                            </h3>
                            <span className="text-xs font-medium text-base-content/50 bg-base-content/10 px-2 py-1 rounded-full">
                              Entry #{idx + 1}
                            </span>
                          </div>
                          <p className="text-base-content/80 leading-relaxed">
                            {log.details}
                          </p>
                        </div>
                      </div>
                      
                      {/* Add a subtle left border for visual hierarchy */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/30 rounded-l-xl"></div>
                    </div>
                  ))}
                  
                  {/* Summary footer */}
                  <div className="mt-8 p-4 bg-base-200 rounded-xl border border-base-300">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-base-content/70">
                        Total entries for this date
                      </span>
                      <span className="font-semibold text-primary">
                        {mockLogs[selectedDate].length} logs recorded
                      </span>
                    </div>
                  </div>
                </div>
              ) : selectedDate ? (
                <div className="text-center py-12">
                  <div className="text-6xl text-base-content/20 mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                    No logs found
                  </h3>
                  <p className="text-base-content/50">
                    No construction logs were recorded for {moment(selectedDate).format('MMMM D, YYYY')}
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl text-base-content/20 mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                    Select a date
                  </h3>
                  <p className="text-base-content/50 mb-6">
                    Choose a date from the calendar or timeline to view daily construction logs
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab("calendar")}
                  >
                    <MdCalendarToday className="mr-2" />
                    Go to Calendar
                  </button>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveTab("calendar")}
                >
                  <MdCalendarToday className="mr-1" />
                  Calendar
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveTab("timeline")}
                >
                  <MdTimeline className="mr-1" />
                  Timeline
                </button>
                {selectedDate && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelectedDate(null)}
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;

import {
  HiOutlineCalendar,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { HiOutlineClock } from "react-icons/hi2";
import StatCard from "../components/StatCard";

const upcomingEvents = [
  {
    date: "18",
    month: "JAN",
    title: "Foundation Pour - Building A",
    location: "Downtown Office Complex",
    time: "08:00 AM",
    duration: "6 hours",
    company: "Alpha Construction",
    priority: "High",
    status: "Scheduled",
  },
  {
    date: "19",
    month: "JAN",
    title: "Electrical Inspection",
    location: "Residential Tower A",
    time: "10:00 AM",
    duration: "2 hours",
    company: "ElectriCorp",
    priority: "Medium",
    status: "Confirmed",
  },
];

const Schedule = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Schedule Management</h1>
      <p className="text-gray-500 mb-6">
        Coordinate schedules across all projects and teams
      </p>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<HiOutlineCalendar className="inline w-7 h-7 text-secondary" />}
          value={12}
          label="Today's Tasks"
        />
        <StatCard
          icon={<HiOutlineClock className="inline w-7 h-7 text-secondary" />}
          value={47}
          label="This Week"
        />
        <StatCard
          icon={
            <HiOutlineExclamation className="inline w-7 h-7 text-secondary" />
          }
          value={3}
          label="Conflicts"
        />
        <StatCard
          icon={
            <HiOutlineCheckCircle className="inline w-7 h-7 text-secondary" />
          }
          value="89%"
          label="Completed"
        />
      </div>
      {/* Tabs */}
      <div className="mb-6">
        <div className="tabs tabs-lift">
          <input
            type="radio"
            name="schedule_tabs"
            className="tab [--tab-bg:white] [--tab-border-color:white]"
            aria-label="Calendar View"
            defaultChecked
          />
          <div className="tab-content bg-base-200 border-base-300 p-6">
            {/* Calendar View Section */}
            <h2 className="text-2xl font-bold mb-1">Master Schedule</h2>
            <p className="text-neutral-500 mb-4">
              Organization-wide schedule coordination
            </p>
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <div className="flex gap-2">
                <button className="btn btn-neutral btn-sm">Filter</button>
                <button className="btn btn-primary btn-sm">+ Add Event</button>
              </div>
            </div>
            <div className="bg-base-100 border border-base-300 rounded-2xl flex flex-col items-center justify-center py-16 mb-8">
              <HiOutlineCalendar className="w-12 h-12 text-gray-400 mb-2" />
              <div className="font-semibold text-lg text-gray-500 mb-1">
                Calendar View
              </div>
              <div className="text-gray-400 text-sm">
                Interactive calendar component would be implemented here
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingEvents.map((e, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row md:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-base-200 mr-2">
                        <span className="font-bold text-lg">{e.date}</span>
                        <span className="text-xs text-gray-500">{e.month}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{e.title}</div>
                        <div className="text-gray-500 text-sm">
                          {e.location} &bull; {e.time} - {e.duration}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {e.company}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <span
                        className={`badge badge-lg text-xs px-3 py-1 ${
                          e.priority === "High"
                            ? "badge-error"
                            : e.priority === "Medium"
                            ? "badge-warning"
                            : "badge-neutral"
                        }`}
                      >
                        {e.priority}
                      </span>
                      <span className="badge badge-outline badge-lg text-xs px-3 py-1">
                        {e.status}
                      </span>
                      <button className="btn btn-soft btn-accent btn-sm">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <input
            type="radio"
            name="schedule_tabs"
            className="tab"
            aria-label="Timeline"
          />
          <div className="tab-content bg-base-200 border-base-300 p-6">
            <h2 className="text-2xl font-bold">Timeline</h2>
            <p className="text-neutral-500">Timeline view coming soon.</p>
          </div>
          <input
            type="radio"
            name="schedule_tabs"
            className="tab"
            aria-label="Conflicts"
          />
          <div className="tab-content bg-base-200 border-base-300 p-6">
            <h2 className="text-2xl font-bold">Conflicts</h2>
            <p className="text-neutral-500">
              Conflict resolution tools coming soon.
            </p>
          </div>
          <input
            type="radio"
            name="schedule_tabs"
            className="tab"
            aria-label="Resource Planning"
          />
          <div className="tab-content bg-base-200 border-base-300 p-6">
            <h2 className="text-2xl font-bold">Resource Planning</h2>
            <p className="text-neutral-500">
              Resource planning tools coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;

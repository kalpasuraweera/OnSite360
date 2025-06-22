import {
  HiOutlineBell,
  HiOutlineUserGroup,
  HiOutlineSpeakerphone,
  HiOutlineMail,
} from "react-icons/hi";
import StatCard from "../components/StatCard";

const inboxMessages = [
  {
    sender: "John Smith",
    subject: "Project Timeline Update Required",
    preview: "Hi team, we need to update the timeline for the downtown offi...",
    date: "2024-01-15 14:30",
    unread: true,
    urgent: true,
    count: 2,
  },
  {
    sender: "Sarah Johnson",
    subject: "Safety Inspection Results",
    preview:
      "The safety inspection for Site A has been completed. Overall sc...",
    date: "2024-01-15 12:15",
    unread: true,
    urgent: false,
    count: 1,
  },
];

const Communications = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Communications Center</h1>
      <p className="text-gray-500 mb-6">
        Manage messages, announcements, and system-wide communications
      </p>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<HiOutlineMail className="inline w-7 h-7 text-secondary" />}
          value={12}
          label="Unread Messages"
        />
        <StatCard
          icon={<HiOutlineBell className="inline w-7 h-7 text-secondary" />}
          value={5}
          label="Active Alerts"
        />
        <StatCard
          icon={
            <HiOutlineSpeakerphone className="inline w-7 h-7 text-secondary" />
          }
          value={8}
          label="Announcements"
        />
        <StatCard
          icon={
            <HiOutlineUserGroup className="inline w-7 h-7 text-secondary" />
          }
          value={89}
          label="Online Users"
        />
      </div>
      {/* Tabs */}
      <div className="mb-6">
        <div className="tabs tabs-lift">
          <input
            type="radio"
            name="comm_tabs"
            className="tab [--tab-bg:white] [--tab-border-color:white]"
            aria-label="Messages"
            defaultChecked
          />
          <div className="tab-content bg-base-200 border-base-300 p-6">
            {/* Messages Section */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Inbox */}
              <div className="w-full md:w-1/3">
                <div className="font-bold text-lg mb-2">Inbox</div>
                <div className="flex items-center mb-3">
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full"
                    placeholder="Search messages..."
                  />
                  <button className="btn btn-primary btn-sm ml-2">
                    + Compose
                  </button>
                </div>
                <div className="space-y-2">
                  {inboxMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`border border-base-300 rounded-xl p-3 bg-base-100 cursor-pointer flex flex-col gap-1 ${
                        msg.unread ? "shadow-sm" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{msg.sender}</span>
                        <span className="text-xs text-gray-400">
                          {msg.count > 1 && (
                            <span className="mr-1 bg-gray-100 rounded-full px-2 py-0.5 text-xs font-bold text-gray-700">
                              {msg.count}
                            </span>
                          )}
                          {msg.urgent && (
                            <span className="text-red-500" title="Urgent">
                              &#9888;
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="font-medium text-sm truncate">
                        {msg.subject}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {msg.preview}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          {msg.date}
                        </span>
                        {msg.unread && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Message Preview */}
              <div className="w-full md:w-2/3 flex flex-col items-center justify-center border border-base-300 bg-base-100 rounded-2xl min-h-[340px]">
                <div className="text-xl font-bold mb-2">Select a message</div>
                <div className="flex flex-col items-center text-gray-400">
                  <svg
                    width="56"
                    height="56"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="mb-2"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      d="M21 7.5V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5M21 7.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v.5M21 7.5l-9 6.5-9-6.5"
                    />
                  </svg>
                  <span className="text-gray-400">
                    Select a message to view its contents
                  </span>
                </div>
              </div>
            </div>
          </div>
          <input
            type="radio"
            name="comm_tabs"
            className="tab"
            aria-label="Announcements"
          />
          <div className="tab-content bg-base-200 border-base-300 p-6">
            <div className="text-2xl font-bold mb-2">Announcements</div>
            <p className="text-neutral-500">
              View and manage announcements here.
            </p>
          </div>
          <input
            type="radio"
            name="comm_tabs"
            className="tab"
            aria-label="Broadcast"
          />
          <div className="tab-content bg-base-200 border-base-300 p-6">
            <div className="text-2xl font-bold mb-2">Broadcast</div>
            <p className="text-neutral-500">Send broadcast messages here.</p>
          </div>
          <input
            type="radio"
            name="comm_tabs"
            className="tab"
            aria-label="Templates"
          />
          <div className="tab-content bg-base-200 border-base-300 p-6">
            <div className="text-2xl font-bold mb-2">Templates</div>
            <p className="text-neutral-500">Manage message templates here.</p>
          </div>
          <input
            type="radio"
            name="comm_tabs"
            className="tab"
            aria-label="Notifications"
          />
          <div className="tab-content bg-base-200 border-base-300 p-6">
            <div className="text-2xl font-bold mb-2">Notifications</div>
            <p className="text-neutral-500">System notifications and alerts.</p>
          </div>
          <input
            type="radio"
            name="comm_tabs"
            className="tab"
            aria-label="Analytics"
          />
          <div className="tab-content bg-base-200 border-base-300 p-6">
            <div className="text-2xl font-bold mb-2">Analytics</div>
            <p className="text-neutral-500">
              View communication analytics here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communications;

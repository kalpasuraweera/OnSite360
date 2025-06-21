import {
  HiOutlineBell,
  HiOutlineUserGroup,
  HiOutlineSpeakerphone,
  HiOutlineMail,
  HiOutlineDotsHorizontal,
  HiOutlineChatAlt2,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import StatCard from "../components/StatCard";
import { useState } from "react";

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

// Announcements data
const announcements = [
  {
    title: "System Maintenance Window",
    author: "System Administrator",
    date: "2024-01-15",
    body: "Scheduled maintenance will occur on January 20th from 2:00 AM to 4:00 AM EST.",
    audience: "All Users",
    views: 156,
    status: "active",
  },
  {
    title: "New Safety Protocols",
    author: "Safety Manager",
    date: "2024-01-14",
    body: "Updated safety protocols are now in effect for all construction sites.",
    audience: "Site Personnel",
    views: 89,
    status: "active",
  },
  {
    title: "Holiday Schedule",
    author: "HR Department",
    date: "2024-01-12",
    body: "Office will be closed on January 16th for Martin Luther King Jr. Day.",
    audience: "All Users",
    views: 203,
    status: "expired",
  },
];

// Templates data
const templates = [
  {
    title: "Project Status Update",
    tag: "Project Management",
    usage: 45,
    lastUsed: "2024-01-15",
  },
  {
    title: "Safety Alert",
    tag: "Safety",
    usage: 23,
    lastUsed: "2024-01-14",
  },
  {
    title: "Meeting Invitation",
    tag: "General",
    usage: 67,
    lastUsed: "2024-01-15",
  },
];

// Notification settings data
const notificationSettings = [
  {
    group: "Email Notifications",
    options: [
      "New user registrations",
      "Project status updates",
      "Safety incidents",
      "System maintenance alerts",
      "Daily activity summaries",
    ],
    checked: [true, true, true, false, true],
  },
  {
    group: "Push Notifications",
    options: [
      "Urgent messages",
      "Safety alerts",
      "Project deadlines",
      "Team mentions",
    ],
    checked: [true, true, true, false],
  },
  {
    group: "SMS Notifications",
    options: [
      "Emergency alerts",
      "Critical system issues",
      "Security breaches",
    ],
    checked: [true, true, true],
  },
];

// Analytics data (placeholder)
const analytics = [
  { label: "Messages Sent", value: 124 },
  { label: "Announcements", value: 8 },
  { label: "Broadcasts", value: 5 },
  { label: "Templates Used", value: 67 },
];

const projectMessages = [
  {
    title: "Schedule Update for Floor 2 Work",
    author: "John Smith - Project Manager",
    body: "Please note the revised schedule for electrical rough-in work…",
    time: "2 hours ago",
    priority: "High",
    priorityColor: "bg-red-500 text-white",
    unread: true,
  },
  {
    title: "Material Delivery Confirmation",
    author: "Sarah Johnson - Site Supervisor",
    body: "The electrical panels have been delivered and are ready for installation…",
    time: "4 hours ago",
    priority: "Medium",
    priorityColor: "bg-gray-200 text-gray-700",
    unread: true,
  },
  {
    title: "Safety Briefing – New Protocols",
    author: "Mike Wilson - Safety Manager",
    body: "Updated safety protocols are now in effect for all electrical work…",
    time: "1 day ago",
    priority: "Medium",
    priorityColor: "bg-gray-200 text-gray-700",
    unread: false,
  },
];

const recentIssues = [
  {
    title: "Material Shortage",
    desc: "Running low on 12 AWG wire for Floor 2",
    date: "2024-01-14",
    status: "Resolved",
    statusColor: "bg-black text-white",
  },
  {
    title: "Equipment Issue",
    desc: "Conduit bender needs calibration",
    date: "2024-01-13",
    status: "In Progress",
    statusColor: "bg-gray-200 text-gray-700",
  },
];

const Communications = () => {
  const [tab, setTab] = useState("Messages");

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Project Communications */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="text-2xl font-bold mb-1">Project Communications</div>
          <div className="text-gray-500 mb-6">
            Messages and updates from project teams
          </div>
          <div className="space-y-4">
            {projectMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`relative border rounded-xl p-5 flex flex-col gap-2 ${
                  msg.unread
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-base">{msg.title}</div>
                    <div className="text-gray-500 text-sm">{msg.author}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${msg.priorityColor}`}
                    >
                      {msg.priority}
                    </span>
                    {msg.unread && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block ml-1"></span>
                    )}
                  </div>
                </div>
                <div className="text-gray-700 text-sm truncate">{msg.body}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{msg.time}</span>
                  <button className="btn btn-outline btn-sm flex items-center gap-1">
                    <HiOutlineChatAlt2 className="w-4 h-4" />
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Issue Reporting */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="text-2xl font-bold mb-1">Issue Reporting</div>
          <div className="text-gray-500 mb-6">
            Report problems and track resolutions
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
            <div className="font-semibold mb-2">Report New Issue</div>
            <select className="select select-bordered w-full mb-2">
              <option>Safety concern</option>
              <option>Material shortage</option>
              <option>Equipment issue</option>
              <option>Other</option>
            </select>
            <textarea
              className="textarea textarea-bordered w-full mb-3"
              placeholder="Describe the issue…"
            />
            <button className="btn btn-block btn-lg bg-black text-white hover:bg-gray-800">
              <HiOutlineExclamationCircle className="inline w-5 h-5 mr-1" />
              Submit Issue
            </button>
          </div>
          <div>
            <div className="font-bold mb-2">Recent Issues</div>
            <div className="space-y-3">
              {recentIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{issue.title}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${issue.statusColor}`}
                    >
                      {issue.status}
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm">{issue.desc}</div>
                  <div className="text-xs text-gray-400">{issue.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
          {[
            "Messages",
            "Announcements",
            "Broadcast",
            "Templates",
            "Notifications",
            "Analytics",
          ].map((t) => (
            <input
              key={t}
              type="radio"
              name="comm_tabs"
              className={`tab${
                t === "Messages"
                  ? " [--tab-bg:white] [--tab-border-color:white]"
                  : ""
              }`}
              aria-label={t}
              checked={tab === t}
              onChange={() => setTab(t)}
              readOnly
            />
          ))}
          {/* Messages Tab */}
          {tab === "Messages" && (
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
          )}
          {/* Announcements Tab */}
          {tab === "Announcements" && (
            <div className="tab-content bg-base-200 border-base-300 p-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="text-2xl font-bold">
                      System Announcements
                    </div>
                    <div className="text-gray-500">
                      Manage organization-wide announcements and notices
                    </div>
                  </div>
                  <button className="btn btn-primary">
                    + New Announcement
                  </button>
                </div>
                <div className="space-y-6 mt-4">
                  {announcements.map((a, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-xl p-5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-lg">{a.title}</div>
                          <div className="text-gray-500 text-sm mb-2">
                            By {a.author} &middot; {a.date}
                          </div>
                          <div className="mb-2">{a.body}</div>
                          <div className="text-xs text-gray-500">
                            Audience: {a.audience} &nbsp;
                            <span className="inline-flex items-center">
                              <svg
                                className="inline w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 0 18 15.158V11a6.002 6.002 0 0 0-4-5.659V4a2 2 0 1 0-4 0v1.341C7.67 6.165 6 8.388 6 11v4.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
                              </svg>
                              {a.views} views
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              a.status === "active"
                                ? "bg-black text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {a.status}
                          </span>
                          <button className="btn btn-ghost btn-sm">
                            <HiOutlineDotsHorizontal className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="btn btn-neutral btn-sm">Edit</button>
                        <button className="btn btn-outline btn-sm">
                          Analytics
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Broadcast Tab */}
          {tab === "Broadcast" && (
            <div className="tab-content bg-base-200 border-base-300 p-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="text-2xl font-bold mb-1">Broadcast Message</div>
                <div className="text-gray-500 mb-6">
                  Send messages to multiple users or groups
                </div>
                <form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block font-semibold mb-1">
                        Recipients
                      </label>
                      <select className="select select-bordered w-full">
                        <option>Select recipient group</option>
                        <option>All Users</option>
                        <option>Site Personnel</option>
                        <option>Project Managers</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">
                        Priority
                      </label>
                      <select className="select select-bordered w-full">
                        <option>Select priority</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">Subject</label>
                    <input
                      className="input input-bordered w-full"
                      placeholder="Enter message subject"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">Message</label>
                    <textarea
                      className="textarea textarea-bordered w-full min-h-[120px]"
                      placeholder="Type your message here..."
                    />
                  </div>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="checkbox" /> Send email
                      notification
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="checkbox" /> Send SMS
                      notification
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="checkbox" /> Push
                      notification
                    </label>
                  </div>
                  <div className="flex justify-between items-center">
                    <button className="btn btn-outline">Save as Draft</button>
                    <div className="flex gap-2">
                      <button className="btn btn-neutral">Preview</button>
                      <button className="btn btn-primary flex gap-2 items-center">
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="2"
                            d="M10 19l7-7m0 0l-7-7m7 7H3"
                          />
                        </svg>
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Templates Tab */}
          {tab === "Templates" && (
            <div className="tab-content bg-base-200 border-base-300 p-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="text-2xl font-bold">Message Templates</div>
                    <div className="text-gray-500">
                      Manage reusable message templates
                    </div>
                  </div>
                  <button className="btn btn-primary">+ New Template</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {templates.map((t, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-lg">{t.title}</div>
                          <span className="badge badge-neutral mt-2">
                            {t.tag}
                          </span>
                        </div>
                        <button className="btn btn-ghost btn-sm">
                          <HiOutlineDotsHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-gray-500 text-sm mb-2">
                        Usage: <span className="font-semibold">{t.usage}</span>{" "}
                        times
                      </div>
                      <div className="text-gray-500 text-sm mb-4">
                        Last used: {t.lastUsed}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <button className="btn btn-neutral btn-sm flex-1">
                          Edit
                        </button>
                        <button className="btn btn-outline btn-sm flex-1">
                          Use
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Notifications Tab */}
          {tab === "Notifications" && (
            <div className="tab-content bg-base-200 border-base-300 p-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-3xl">
                <div className="text-2xl font-bold mb-1">
                  Notification Settings
                </div>
                <div className="text-gray-500 mb-6">
                  Configure system-wide notification preferences
                </div>
                <form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {notificationSettings.map((group, idx) => (
                      <div key={idx}>
                        <div className="font-semibold mb-2">{group.group}</div>
                        {group.options.map((opt, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between mb-2"
                          >
                            <span>{opt}</span>
                            <input
                              type="checkbox"
                              className="checkbox"
                              defaultChecked={group.checked[i]}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-primary mt-6">
                    Save Notification Settings
                  </button>
                </form>
              </div>
            </div>
          )}
          {/* Analytics Tab */}
          {tab === "Analytics" && (
            <div className="tab-content bg-base-200 border-base-300 p-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-2xl">
                <div className="text-2xl font-bold mb-1">Analytics</div>
                <div className="text-gray-500 mb-6">
                  View communication analytics here.
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {analytics.map((a, idx) => (
                    <div
                      key={idx}
                      className="bg-base-100 border border-base-300 rounded-xl p-6 flex flex-col items-center"
                    >
                      <div className="text-3xl font-bold">{a.value}</div>
                      <div className="text-gray-500">{a.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Communications;

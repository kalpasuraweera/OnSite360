import { useState } from "react";

// Dummy data for threads
const dummyThreads = [
  {
    id: "1",
    title: "Downtown Office Complex - Daily Updates",
    participants: ["John Smith", "Sarah Johnson", "Mike Davis"],
    lastMessage: "Foundation inspection completed successfully",
    lastMessageTime: "2024-06-28T10:30:00Z",
    unreadCount: 3,
    projectId: "1"
  },
  {
    id: "2",
    title: "Safety Protocol Discussion",
    participants: ["Emily Brown", "Mike Davis", "John Smith"],
    lastMessage: "New safety guidelines have been approved",
    lastMessageTime: "2024-06-28T09:15:00Z",
    unreadCount: 0,
    projectId: null
  },
  {
    id: "3",
    title: "Residential Tower A - Planning Phase",
    participants: ["Sarah Johnson", "Emily Brown"],
    lastMessage: "Structural plans need review by Friday",
    lastMessageTime: "2024-06-27T16:45:00Z",
    unreadCount: 1,
    projectId: "2"
  }
];

// Dummy data for RFIs
const dummyRFIs = [
  {
    id: "RFI-001",
    title: "Concrete specifications for foundation",
    project: "Downtown Office Complex",
    submittedBy: "Mike Davis",
    assignedTo: "Sarah Johnson",
    status: "Open",
    priority: "High",
    dateSubmitted: "2024-06-26",
    dueDate: "2024-06-30",
    description: "Need clarification on concrete grade for foundation work in section B"
  },
  {
    id: "RFI-002",
    title: "HVAC system placement",
    project: "Residential Tower A",
    submittedBy: "John Smith",
    assignedTo: "Emily Brown",
    status: "In Review",
    priority: "Medium",
    dateSubmitted: "2024-06-25",
    dueDate: "2024-07-02",
    description: "Questions about HVAC unit placement on floors 15-20"
  },
  {
    id: "RFI-003",
    title: "Fire safety compliance",
    project: "Shopping Mall Renovation",
    submittedBy: "Emily Brown",
    assignedTo: "John Smith",
    status: "Resolved",
    priority: "High",
    dateSubmitted: "2024-06-20",
    dueDate: "2024-06-28",
    description: "Fire exit requirements for new layout configuration"
  }
];

// Dummy data for issues
const dummyIssues = [
  {
    id: "ISS-001",
    title: "Delayed material delivery",
    project: "Downtown Office Complex",
    reportedBy: "Mike Davis",
    assignedTo: "John Smith",
    status: "Open",
    severity: "Critical",
    dateReported: "2024-06-27",
    description: "Steel beams delivery delayed by 2 weeks, impacting schedule"
  },
  {
    id: "ISS-002",
    title: "Weather damage to equipment",
    project: "Residential Tower A",
    reportedBy: "Sarah Johnson",
    assignedTo: "Mike Davis",
    status: "In Progress",
    severity: "Medium",
    dateReported: "2024-06-26",
    description: "Rain damage to crane control system, needs repair"
  },
  {
    id: "ISS-003",
    title: "Permit approval pending",
    project: "Shopping Mall Renovation",
    reportedBy: "John Smith",
    assignedTo: "Emily Brown",
    status: "Resolved",
    severity: "Low",
    dateReported: "2024-06-20",
    description: "Waiting for city permit approval for electrical work"
  }
];

// Dummy messages for selected thread
const dummyMessages = [
  {
    id: "1",
    sender: "John Smith",
    message: "Good morning team! Let's start with today's progress update.",
    timestamp: "2024-06-28T08:00:00Z"
  },
  {
    id: "2",
    sender: "Mike Davis",
    message: "Foundation work is on schedule. We completed section A yesterday.",
    timestamp: "2024-06-28T08:15:00Z"
  },
  {
    id: "3",
    sender: "Sarah Johnson",
    message: "Excellent! Any concerns with the concrete quality?",
    timestamp: "2024-06-28T08:20:00Z"
  },
  {
    id: "4",
    sender: "Mike Davis",
    message: "Foundation inspection completed successfully",
    timestamp: "2024-06-28T10:30:00Z"
  }
];

const Communication = () => {
  const [activeTab, setActiveTab] = useState("threads");
  const [selectedThread, setSelectedThread] = useState<typeof dummyThreads[0] | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const handleSelectThread = (thread: typeof dummyThreads[0]) => {
    setSelectedThread(thread);
    setActiveTab("chat");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return "badge-error";
      case "In Review":
      case "In Progress":
        return "badge-warning";
      case "Resolved":
        return "badge-success";
      default:
        return "badge-neutral";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
      case "Critical":
        return "badge-error";
      case "Medium":
        return "badge-warning";
      case "Low":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Communication</h1>
      <p className="text-gray-500 mb-6">Team discussions, RFIs, and issue tracking</p>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label="Threads"
          checked={activeTab === "threads"}
          onChange={() => setActiveTab("threads")}
        />
        {activeTab === "threads" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold">Discussion Threads</h2>
              <p className="text-neutral-500 mb-4">
                Group conversations and project discussions
              </p>

              <div className="space-y-4">
                {dummyThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4 cursor-pointer hover:bg-base-50"
                    onClick={() => handleSelectThread(thread)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-semibold text-lg">{thread.title}</div>
                        {thread.unreadCount > 0 && (
                          <span className="badge badge-error badge-sm">{thread.unreadCount}</span>
                        )}
                      </div>
                      <div className="text-gray-500 text-sm mb-2">{thread.lastMessage}</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-400">
                          {new Date(thread.lastMessageTime).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          Participants: {thread.participants.join(", ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 lg:mt-0">
                      <button className="btn btn-soft btn-accent btn-sm">
                        Join Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button className="btn btn-primary">
                  + New Thread
                </button>
              </div>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label="Chat"
          checked={activeTab === "chat"}
          onChange={() => setActiveTab("chat")}
        />
        {activeTab === "chat" && selectedThread && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 rounded-2xl overflow-hidden">
              <div className="bg-base-100 p-4 border-b border-base-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">{selectedThread.title}</h2>
                    <p className="text-sm text-gray-500">
                      Participants: {selectedThread.participants.join(", ")}
                    </p>
                  </div>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab("threads")}
                  >
                    ← Back to Threads
                  </button>
                </div>
              </div>

              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {dummyMessages.map((message) => (
                  <div key={message.id} className="chat chat-start">
                    <div className="chat-header">
                      {message.sender}
                      <time className="text-xs opacity-50 ml-2">
                        {formatTime(message.timestamp)}
                      </time>
                    </div>
                    <div className="chat-bubble">{message.message}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label="RFIs"
          checked={activeTab === "rfis"}
          onChange={() => setActiveTab("rfis")}
        />
        {activeTab === "rfis" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold">Request for Information (RFI)</h2>
              <p className="text-neutral-500 mb-4">
                Track information requests and responses
              </p>

              <div className="space-y-4">
                {dummyRFIs.map((rfi) => (
                  <div
                    key={rfi.id}
                    className="border border-base-300 bg-base-100 rounded-2xl p-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-neutral">{rfi.id}</span>
                          <span className={`badge ${getPriorityBadge(rfi.priority)}`}>
                            {rfi.priority}
                          </span>
                          <span className={`badge ${getStatusBadge(rfi.status)}`}>
                            {rfi.status}
                          </span>
                        </div>
                        <div className="font-semibold text-lg mb-1">{rfi.title}</div>
                        <div className="text-gray-500 text-sm mb-2">{rfi.description}</div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Project:</span> {rfi.project} | 
                          <span className="font-medium"> Submitted by:</span> {rfi.submittedBy} | 
                          <span className="font-medium"> Assigned to:</span> {rfi.assignedTo}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Submitted:</span> {new Date(rfi.dateSubmitted).toLocaleDateString()} | 
                          <span className="font-medium"> Due:</span> {new Date(rfi.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-soft btn-accent btn-sm">
                          View Details
                        </button>
                        <button className="btn btn-sm btn-outline btn-primary">
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button className="btn btn-primary">
                  + New RFI
                </button>
              </div>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label="Issues"
          checked={activeTab === "issues"}
          onChange={() => setActiveTab("issues")}
        />
        {activeTab === "issues" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold">Issues & Problems</h2>
              <p className="text-neutral-500 mb-4">
                Track and resolve project issues
              </p>

              <div className="space-y-4">
                {dummyIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="border border-base-300 bg-base-100 rounded-2xl p-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-neutral">{issue.id}</span>
                          <span className={`badge ${getPriorityBadge(issue.severity)}`}>
                            {issue.severity}
                          </span>
                          <span className={`badge ${getStatusBadge(issue.status)}`}>
                            {issue.status}
                          </span>
                        </div>
                        <div className="font-semibold text-lg mb-1">{issue.title}</div>
                        <div className="text-gray-500 text-sm mb-2">{issue.description}</div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Project:</span> {issue.project} | 
                          <span className="font-medium"> Reported by:</span> {issue.reportedBy} | 
                          <span className="font-medium"> Assigned to:</span> {issue.assignedTo}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Reported:</span> {new Date(issue.dateReported).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-soft btn-accent btn-sm">
                          View Details
                        </button>
                        <button className="btn btn-sm btn-outline btn-primary">
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button className="btn btn-primary">
                  + Report Issue
                </button>
              </div>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="comm_tab_group"
          className="tab"
          aria-label="Analytics"
          checked={activeTab === "analytics"}
          onChange={() => setActiveTab("analytics")}
        />
        {activeTab === "analytics" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2">Communication Analytics</h2>
              <p className="text-neutral-500 mb-4">
                Overview of communication metrics and performance
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Active Threads</div>
                  <div className="stat-value text-primary">{dummyThreads.length}</div>
                  <div className="stat-desc">Total discussions</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Open RFIs</div>
                  <div className="stat-value text-warning">{dummyRFIs.filter(r => r.status === "Open").length}</div>
                  <div className="stat-desc">Pending responses</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Open Issues</div>
                  <div className="stat-value text-error">{dummyIssues.filter(i => i.status === "Open").length}</div>
                  <div className="stat-desc">Need attention</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Resolution Rate</div>
                  <div className="stat-value text-success">78%</div>
                  <div className="stat-desc">This month</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Issue Severity Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Critical</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">1</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: "33%" }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Medium</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">1</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "33%" }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Low</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">1</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "33%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-base-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Response Times</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Average RFI Response:</span>
                      <span className="font-medium">2.3 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Issue Resolution:</span>
                      <span className="font-medium">4.7 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thread Activity:</span>
                      <span className="font-medium">23 msgs/day</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;

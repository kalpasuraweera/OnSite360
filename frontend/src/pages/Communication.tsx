import { useState } from "react";
import { 
  useThreads, 
  useCreateThread,
  useThreadMessages,
  useSendMessage,
  useRFIs,
  type Thread,
  type CreateThreadDto
} from "../hooks/useCommunication";
import { useProjects, type Project } from "../hooks/useProjects";
import { useUsers } from "../hooks/useUsers";

const Communication = () => {
  // API hooks
  const { data: threads = [], isLoading: threadsLoading, error: threadsError } = useThreads();
  const { data: projectsResponse } = useProjects();
  const projects = projectsResponse?.data || [];
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: rfis = [], isLoading: rfisLoading } = useRFIs();
  
  const createThreadMutation = useCreateThread();
  const sendMessageMutation = useSendMessage();

  // State
  const [activeTab, setActiveTab] = useState("threads");
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  // Create thread modal state
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Get messages for selected thread
  const { data: messages = [] } = useThreadMessages(selectedThread?.id || "");

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread);
    console.log(thread);
    setActiveTab("chat");
  };

  // Create thread handlers
  const handleCreateThread = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const newThread: CreateThreadDto = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      projectId: formData.get("projectId") as string,
      participantIds: selectedUsers
    };

    createThreadMutation.mutate(newThread, {
      onSuccess: () => {
        setShowCreateThreadModal(false);
        (event.target as HTMLFormElement).reset();
        setSelectedUsers([]);
      },
      onError: (error) => {
        console.error("Failed to create thread:", error);
      },
    });
  };

  const handleAddUser = (userId: string) => {
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers(prev => [...prev, userId]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
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
    if (newMessage.trim() && selectedThread) {
      sendMessageMutation.mutate({
        content: newMessage,
        threadId: selectedThread.id
      }, {
        onSuccess: () => {
          setNewMessage("");
        },
        onError: (error) => {
          console.error("Failed to send message:", error);
        }
      });
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
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Discussion Threads</h2>
                  <p className="text-neutral-500">
                    Group conversations and project discussions
                  </p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateThreadModal(true)}
                >
                  + New Thread
                </button>
              </div>

              {threadsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : threadsError ? (
                <div className="text-center py-8 text-error">
                  Failed to load threads. Please try again.
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No threads found. Create your first thread to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4 cursor-pointer hover:bg-base-50"
                      onClick={() => handleSelectThread(thread)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-lg">{thread.title}</div>
                          {thread.project && (
                            <span className="badge badge-info badge-sm">{thread.project.name}</span>
                          )}
                        </div>
                        {thread.description && (
                          <div className="text-gray-500 text-sm mb-2">{thread.description}</div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-400">
                            Created: {new Date(thread.createdAt).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            Participants: {thread.users.length}
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
              )}
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
                      Participants: {selectedThread.users.map(u => `${u.firstName} ${u.lastName}`).join(", ")}
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
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="chat chat-start">
                      <div className="chat-header">
                        {message.sender.firstName} {message.sender.lastName}
                        <time className="text-xs opacity-50 ml-2">
                          {formatTime(message.createdAt)}
                        </time>
                      </div>
                      <div className="chat-bubble">{message.content}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sendMessageMutation.isPending}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={sendMessageMutation.isPending || !newMessage.trim()}
                  >
                    {sendMessageMutation.isPending ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Send"
                    )}
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

              {rfisLoading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : rfis.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No RFIs found. Create your first RFI to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {rfis.map((rfi) => (
                    <div
                      key={rfi.id}
                      className="border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="badge badge-neutral">{rfi.id}</span>
                            {rfi.priority && (
                              <span className={`badge ${getPriorityBadge(rfi.priority)}`}>
                                {rfi.priority}
                              </span>
                            )}
                            {rfi.status && (
                              <span className={`badge ${getStatusBadge(rfi.status)}`}>
                                {rfi.status}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-lg mb-1">{rfi.title}</div>
                          <div className="text-gray-500 text-sm mb-2">{rfi.description}</div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Thread:</span> {rfi.thread?.title || 'N/A'} | 
                            <span className="font-medium"> Created by:</span> {rfi.createdBy.firstName} {rfi.createdBy.lastName}
                            {rfi.assignee && (
                              <>
                                | <span className="font-medium"> Assigned to:</span> {rfi.assignee.firstName} {rfi.assignee.lastName}
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Created:</span> {new Date(rfi.createdAt).toLocaleDateString()} | 
                            <span className="font-medium"> Updated:</span> {new Date(rfi.updatedAt).toLocaleDateString()}
                          </div>
                          {rfi.response && (
                            <div className="mt-2 p-2 bg-base-200 rounded text-sm">
                              <span className="font-medium">Response:</span> {rfi.response}
                            </div>
                          )}
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
              )}

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

              <div className="text-center py-8 text-gray-500">
                Issues tracking feature coming soon...
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
                  <div className="stat-value text-primary">{threads.length}</div>
                  <div className="stat-desc">Total discussions</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Open RFIs</div>
                  <div className="stat-value text-warning">{rfis.filter(r => r.status === "Open").length}</div>
                  <div className="stat-desc">Pending responses</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Total RFIs</div>
                  <div className="stat-value text-info">{rfis.length}</div>
                  <div className="stat-desc">All time</div>
                </div>
                <div className="stat bg-base-100 rounded-xl shadow">
                  <div className="stat-title">Resolution Rate</div>
                  <div className="stat-value text-success">
                    {rfis.length > 0 ? Math.round((rfis.filter(r => r.status === "Resolved").length / rfis.length) * 100) : 0}%
                  </div>
                  <div className="stat-desc">RFI completion</div>
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

      {/* Create Thread Modal */}
      {showCreateThreadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Thread</h3>
            
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Thread Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  placeholder="Enter thread title..."
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Project *</span>
                </label>
                <select
                  name="projectId"
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project: Project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Add Participants</span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">No users available</div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                          {selectedUsers.includes(user.id) ? (
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() => handleRemoveUser(user.id)}
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleAddUser(user.id)}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedUsers.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Selected: {selectedUsers.length} participant(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCreateThreadModal(false);
                    setSelectedUsers([]);
                  }}
                  disabled={createThreadMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createThreadMutation.isPending}
                >
                  {createThreadMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating...
                    </>
                  ) : (
                    "Create Thread"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;

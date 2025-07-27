import { useState, useMemo } from "react";
import {
  useThreads,
  useCreateThread,
  useUpdateThread,
  useThreadMessages,
  useSendMessage,
  useRFIs,
  useCreateRFI,
  useUpdateRFI,
  useDeleteRFI,
  type Thread,
  type CreateThreadDto,
  type CreateRFIDto,
  type UpdateThreadDto,
  type UpdateRFIDto,
  type RFI,
} from "../hooks/useCommunication";
import { type Project } from "../hooks/useProjects";
import { useUsers, useUserProjects } from "../hooks/useUsers";
import { useAuthStore } from "../stores/useAuthStore";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { IoClose } from "react-icons/io5";
import { IoAttach } from "react-icons/io5";
import { IoCamera } from "react-icons/io5";
import { IoInformationCircle } from "react-icons/io5";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Communication = () => {
  // Auth store
  const { user: currentUser } = useAuthStore();

  // API hooks
  const {
    data: threads = [],
    isLoading: threadsLoading,
    error: threadsError,
  } = useThreads();
  const { data: projects = [] } = useUserProjects(currentUser?.id || "");
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: rfis = [], isLoading: rfisLoading } = useRFIs();

  const createThreadMutation = useCreateThread();
  const updateThreadMutation = useUpdateThread();
  const sendMessageMutation = useSendMessage();
  const createRFIMutation = useCreateRFI();
  const updateRFIMutation = useUpdateRFI();
  const deleteRFIMutation = useDeleteRFI();

  // State
  const [activeTab, setActiveTab] = useState("threads");
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Create thread modal state
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Create RFI modal state
  const [showCreateRFIModal, setShowCreateRFIModal] = useState(false);
  const [selectedRFIThread, setSelectedRFIThread] = useState<string>("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  // Edit/Update RFI modal state
  const [showEditRFIModal, setShowEditRFIModal] = useState(false);
  const [editingRFI, setEditingRFI] = useState<RFI | null>(null);
  const [editRFISelectedAssignees, setEditRFISelectedAssignees] = useState<
    string[]
  >([]);

  // Update thread modal state
  const [showEditThreadModal, setShowEditThreadModal] = useState(false);
  const [editingThread, setEditingThread] = useState<Thread | null>(null);
  const [editThreadSelectedUsers, setEditThreadSelectedUsers] = useState<
    string[]
  >([]);

  // Thread info section state
  const [showThreadInfo, setShowThreadInfo] = useState(false);

  // Delete confirmation state
  const [showDeleteRFIModal, setShowDeleteRFIModal] = useState(false);
  const [deletingRFI, setDeletingRFI] = useState<RFI | null>(null);

  // Get messages for selected thread
  const { data: messages = [] } = useThreadMessages(selectedThread?.id || "");

  // Get RFIs for the selected thread
  const selectedThreadRFIs = rfis.filter(
    (rfi) => rfi.threadId === selectedThread?.id
  );

  // Analytics calculations
  const analyticsData = useMemo(() => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // RFI status breakdown
    const rfisByStatus = rfis.reduce((acc, rfi) => {
      const status = rfi.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // RFI priority breakdown
    const rfisByPriority = rfis.reduce((acc, rfi) => {
      const priority = rfi.priority || "Unknown";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // RFI category breakdown
    const rfisByCategory = rfis.reduce((acc, rfi) => {
      const category = rfi.category || "Other";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 7 days)
    const recentThreads = threads.filter(
      (thread) => new Date(thread.createdAt) > lastWeek
    ).length;

    const recentRFIs = rfis.filter(
      (rfi) => new Date(rfi.createdAt) > lastWeek
    ).length;

    // Thread activity by project
    const threadsByProject = threads.reduce((acc, thread) => {
      const projectName = thread.project?.name || "Unknown";
      acc[projectName] = (acc[projectName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average response time (mock data for now)
    const avgResponseTime =
      rfis.length > 0
        ? Math.round(
            rfis.reduce((acc, rfi) => {
              if (rfi.answeredAt && rfi.createdAt) {
                const responseTime =
                  new Date(rfi.answeredAt).getTime() -
                  new Date(rfi.createdAt).getTime();
                return acc + responseTime / (1000 * 60 * 60 * 24); // Convert to days
              }
              return acc;
            }, 0) / rfis.filter((rfi) => rfi.answeredAt).length
          )
        : 0;

    return {
      rfisByStatus,
      rfisByPriority,
      rfisByCategory,
      threadsByProject,
      recentThreads,
      recentRFIs,
      avgResponseTime: avgResponseTime || 2.5,
      totalMessages: messages.length,
      activeUsers: users.filter((user) =>
        threads.some((thread) => thread.users.some((u) => u.id === user.id))
      ).length,
    };
  }, [rfis, threads, messages, users]);

  // Chart data configurations
  const rfiStatusChartData = {
    labels: Object.keys(analyticsData.rfisByStatus),
    datasets: [
      {
        data: Object.values(analyticsData.rfisByStatus),
        backgroundColor: [
          "#ef4444", // red for Open
          "#f59e0b", // amber for In Review
          "#10b981", // emerald for Resolved
          "#6b7280", // gray for others
        ],
        borderWidth: 0,
      },
    ],
  };

  const rfiPriorityChartData = {
    labels: ["Low", "Medium", "High", "Critical"],
    datasets: [
      {
        label: "RFIs by Priority",
        data: [
          analyticsData.rfisByPriority.Low || 0,
          analyticsData.rfisByPriority.Medium || 0,
          analyticsData.rfisByPriority.High || 0,
          analyticsData.rfisByPriority.Critical || 0,
        ],
        backgroundColor: ["#3b82f6", "#f59e0b", "#ef4444", "#dc2626"],
        borderRadius: 4,
      },
    ],
  };

  const threadActivityChartData = {
    labels: Object.keys(analyticsData.threadsByProject).slice(0, 5), // Top 5 projects
    datasets: [
      {
        label: "Threads",
        data: Object.values(analyticsData.threadsByProject).slice(0, 5),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread);
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
      participantIds: selectedUsers,
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
      setSelectedUsers((prev) => [...prev, userId]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
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
      case "Answered":
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
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedThread) {
      sendMessageMutation.mutate(
        {
          content: newMessage,
          threadId: selectedThread.id,
        },
        {
          onSuccess: () => {
            setNewMessage("");
          },
          onError: (error) => {
            console.error("Failed to send message:", error);
          },
        }
      );
    }
  };

  // File and Camera handlers
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        // Handle file upload logic here
        console.log('Selected files:', files);
        // You can process the files here or pass them to a state
      }
    };
    input.click();
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera by default
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) {
        // Handle camera capture logic here
        console.log('Captured image:', files[0]);
        // You can process the captured image here or pass it to a state
      }
    };
    input.click();
  };

  // Create RFI handlers
  const handleCreateRFI = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      let threadId = selectedRFIThread;
      let projectId = formData.get("projectId") as string;

      // If no thread is selected, create a new thread automatically
      if (!selectedRFIThread) {
        const title = formData.get("title") as string;
        const newThreadData: CreateThreadDto = {
          title: `RFI: ${title}`,
          description: formData.get("description") as string,
          projectId: projectId,
          participantIds: selectedAssignees,
        };
        const newThread = await createThreadMutation.mutateAsync(newThreadData);
        threadId = newThread.id;
      } else {
        // If linking to existing thread, use the thread's project ID
        const existingThread = threads.find((t) => t.id === selectedRFIThread);
        if (existingThread) {
          projectId = existingThread.projectId;
        }
      }

      const newRFI: CreateRFIDto = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: (formData.get("category") as string) || undefined,
        priority: (formData.get("priority") as string) || undefined,
        projectId: projectId,
        assignedToIds: selectedAssignees,
        threadId: threadId || undefined,
        dueDate: (formData.get("dueDate") as string) || undefined,
      };

      createRFIMutation.mutate(newRFI, {
        onSuccess: () => {
          setShowCreateRFIModal(false);
          (event.target as HTMLFormElement).reset();
          setSelectedRFIThread("");
          setSelectedAssignees([]);
        },
        onError: (error) => {
          console.error("Failed to create RFI:", error);
        },
      });
    } catch (error) {
      console.error("Failed to create thread for RFI:", error);
    }
  };

  const handleAddAssignee = (userId: string) => {
    if (!selectedAssignees.includes(userId)) {
      setSelectedAssignees((prev) => [...prev, userId]);
    }
  };

  const handleRemoveAssignee = (userId: string) => {
    setSelectedAssignees((prev) => prev.filter((id) => id !== userId));
  };

  // RFI Edit handlers
  const handleEditRFI = (rfi: RFI) => {
    setEditingRFI(rfi);
    // Extract assignee IDs from assignees array
    const assigneeIds = rfi.assignees
      ? rfi.assignees.map((assignee) => assignee.id)
      : [];
    setEditRFISelectedAssignees(assigneeIds);
    setShowEditRFIModal(true);
  };

  const handleAddEditAssignee = (userId: string) => {
    if (!editRFISelectedAssignees.includes(userId)) {
      setEditRFISelectedAssignees((prev) => [...prev, userId]);
    }
  };

  const handleRemoveEditAssignee = (userId: string) => {
    setEditRFISelectedAssignees((prev) => prev.filter((id) => id !== userId));
  };

  // RFI Delete handlers
  const handleDeleteRFI = (rfi: RFI) => {
    setDeletingRFI(rfi);
    setShowDeleteRFIModal(true);
  };

  const confirmDeleteRFI = () => {
    if (!deletingRFI) return;

    deleteRFIMutation.mutate(deletingRFI.id, {
      onSuccess: () => {
        setShowDeleteRFIModal(false);
        setDeletingRFI(null);
      },
      onError: (error) => {
        console.error("Failed to delete RFI:", error);
      },
    });
  };

  // Thread Edit handlers
  const handleEditThread = (thread: Thread) => {
    setEditingThread(thread);
    setEditThreadSelectedUsers(thread.users?.map((u) => u.id) || []);
    setShowEditThreadModal(true);
  };

  const handleAddEditThreadUser = (userId: string) => {
    if (!editThreadSelectedUsers.includes(userId)) {
      setEditThreadSelectedUsers((prev) => [...prev, userId]);
    }
  };

  const handleRemoveEditThreadUser = (userId: string) => {
    setEditThreadSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Communication</h1>
      <p className="text-gray-500 mb-6">
        Team discussions, RFIs, and analytics dashboard
      </p>

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
                      className="flex flex-col lg:flex-row lg:items-center justify-between border border-base-300 bg-base-100 rounded-2xl p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-lg">
                            {thread.title}
                          </div>
                          {thread.project && (
                            <span className="badge badge-neutral badge-sm">
                              {thread.project.name}
                            </span>
                          )}
                        </div>
                        {thread.description && (
                          <div className="text-gray-500 text-sm mb-2">
                            {thread.description}
                          </div>
                        )}
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-xs text-accent">
                            Created:{" "}
                            {new Date(thread.createdAt).toLocaleString()}
                          </span>
                          <span className="text-xs badge badge-success text-base-200 font-medium">
                            Participants: {thread.users.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 lg:mt-0">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSelectThread(thread)}
                        >
                          Join Chat
                        </button>
                        <button
                          className="btn btn-soft btn-sm"
                          onClick={() => handleEditThread(thread)}
                        >
                          Edit
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
          <div className="tab-content p-5 w-full">
            <div className="flex flex-col lg:flex-row gap-3 w-full h-[calc(100vh-300px)]">
              {/* Thread Information Panel */}
              <div
                id="thread-info"
                className={`bg-base-200 border border-base-300 rounded-2xl p-4 lg:w-1/3 w-full transition-all duration-300 flex flex-col ${
                  showThreadInfo ? "block" : "hidden"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Thread Information</h2>
                  <button
                    className="btn btn-circle"
                    onClick={() => setShowThreadInfo(false)}
                  >
                    <IoClose size={15} />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto flex-1">
                  {/* Thread Details */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="font-bold text-lg mb-2">{selectedThread.title}</h3>
                    {selectedThread.description && (
                      <p className="text-sm text-gray-600 mb-3">{selectedThread.description}</p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Type:</span>
                        <span>General</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <span className="badge badge-sm badge-success">
                          Active
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Privacy:</span>
                        <span>Public</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Messages:</span>
                        <span>{messages.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Created:</span>
                        <span>{new Date(selectedThread.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Info */}
                  {selectedThread.project && (
                    <div className="bg-base-100 p-4 rounded-xl">
                      <h4 className="font-bold mb-2">Project</h4>
                      <p className="text-sm">{selectedThread.project.name}</p>
                    </div>
                  )}

                  {/* Participants */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h4 className="font-bold mb-2">Participants ({selectedThread.users.length})</h4>
                    <div className="space-y-2">
                      {selectedThread.users.map((user) => (
                        <div key={user.id} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {user.firstName.charAt(0)}
                            </span>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-gray-500 text-xs">{user.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Chat Screen */}
              <div className={`bg-base-200 border border-base-300 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
                showThreadInfo ? 'lg:w-2/3 w-full' : 'w-full'
              }`}>
                <div className="bg-primary p-4 border-b border-base-300">
                  <div className="flex flex-col sm:flex-row justify-between text-primary-content items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex-1 sm:flex-initial">
                        <button
                          className="text-lg sm:text-xl font-bold hover:underline cursor-pointer text-left"
                          onClick={() => setShowThreadInfo(!showThreadInfo)}
                          title="Click to view thread information"
                        >
                          {selectedThread.title}
                        </button>
                        <p className="text-xs sm:text-sm">
                          Participants:{" "}
                          <span className="hidden sm:inline">
                            {selectedThread.users
                              .map((u) => `${u.firstName} ${u.lastName}`)
                              .join(", ")}
                          </span>
                          <span className="sm:hidden">
                            {selectedThread.users.length} member{selectedThread.users.length !== 1 ? 's' : ''}
                          </span>
                        </p>
                      </div>
                      <button
                        className="btn btn-ghost btn-circle btn-sm"
                        onClick={() => setShowThreadInfo(!showThreadInfo)}
                        title="Thread Information"
                      >
                        <IoInformationCircle size={20} />
                      </button>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        className="btn btn-active btn-sm sm:btn-md w-full sm:w-auto"
                        onClick={() => setActiveTab("threads")}
                      >
                        <span className="hidden sm:inline">Export Thread</span>
                        <span className="sm:hidden">Export</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Display RFIs associated with this thread */}
                {selectedThreadRFIs.length > 0 && (
                  <div className="bg-base-300 p-4 border-b border-base-300">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">
                      Related RFIs ({selectedThreadRFIs.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedThreadRFIs.map((rfi) => (
                        <div
                          key={rfi.id}
                          className="flex items-center justify-between bg-base-200 p-4 rounded-xl"
                        >
                          <div className="flex-1">
                            <span className="text-lg font-medium">
                              {rfi.title}
                            </span>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="badge badge-sm badge-neutral">
                                {rfi.id}
                              </span>
                              {rfi.status && (
                                <span
                                  className={`badge badge-sm ${getStatusBadge(
                                    rfi.status
                                  )}`}
                                >
                                  {rfi.status}
                                </span>
                              )}
                              {rfi.priority && (
                                <span
                                  className={`badge badge-xs ${getPriorityBadge(
                                    rfi.priority
                                  )}`}
                                >
                                  {rfi.priority}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            className="btn btn-xs btn-outline"
                            onClick={() => setActiveTab("rfis")}
                          >
                            View RFI
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser =
                        currentUser?.id === message.senderId;
                      return (
                        <div
                          key={message.id}
                          className={`chat ${
                            isCurrentUser ? "chat-end" : "chat-start"
                          }`}
                        >
                          <div className="chat-header text-xs sm:text-sm">
                            <span className="hidden sm:inline">
                              {message.sender.firstName} {message.sender.lastName}
                            </span>
                            <span className="sm:hidden">
                              {message.sender.firstName}
                            </span>
                            <time className="text-xs opacity-50 ml-2">
                              {formatTime(message.createdAt)}
                            </time>
                          </div>
                          <div className="chat-bubble bg-neutral text-neutral-content text-sm sm:text-base max-w-xs sm:max-w-md">
                            {message.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-base-300 bg-base-300"
                >
                  <div className="flex gap-2 items-end">
                    {/* File and Camera Actions */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-circle btn-sm sm:btn-md bg-base-200 rounded-full p-1"
                        onClick={handleFileUpload}
                        title="Upload Documents"
                      >
                        <div className="flex items-center justify-center">
                          <IoAttach size={18} />
                        </div>
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-circle btn-sm sm:btn-md bg-base-200 rounded-full p-1"
                        onClick={handleCameraCapture}
                        title="Take Photo"
                      >
                        <div className="flex items-center justify-center">
                          <IoCamera size={18} />
                        </div>
                      </button>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered input-sm sm:input-md flex-1"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendMessageMutation.isPending}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm sm:btn-md"
                      disabled={
                        sendMessageMutation.isPending || !newMessage.trim()
                      }
                    >
                      {sendMessageMutation.isPending ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <span className="hidden sm:inline">Send</span>
                      )}
                      <span className="sm:hidden">📤</span>
                    </button>
                  </div>
                </form>
              </div>
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
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    Request for Information (RFI)
                  </h2>
                  <p className="text-neutral-500">
                    Track information requests and responses
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateRFIModal(true)}
                >
                  + New RFI
                </button>
              </div>

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
                            <span className="badge badge-neutral">
                              {rfi.id}
                            </span>
                            {rfi.priority && (
                              <span
                                className={`badge ${getPriorityBadge(
                                  rfi.priority
                                )}`}
                              >
                                {rfi.priority}
                              </span>
                            )}
                            {rfi.status && (
                              <span
                                className={`badge ${getStatusBadge(
                                  rfi.status
                                )}`}
                              >
                                {rfi.status}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-lg mb-1">
                            {rfi.title}
                          </div>
                          <div className="text-gray-500 text-sm mb-2">
                            {rfi.description}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Thread:</span>{" "}
                            {rfi.thread?.title || "No thread linked"} |
                            <span className="font-medium"> Created by:</span>{" "}
                            {rfi.requester
                              ? `${rfi.requester.firstName} ${rfi.requester.lastName}`
                              : "Unknown"}
                            {rfi.assignees && rfi.assignees.length > 0 && (
                              <>
                                |{" "}
                                <span className="font-medium">
                                  {" "}
                                  Assigned to:
                                </span>{" "}
                                {rfi.assignees
                                  .map((a) => `${a.firstName} ${a.lastName}`)
                                  .join(", ")}
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Created:</span>{" "}
                            {new Date(rfi.createdAt).toLocaleDateString()} |
                            <span className="font-medium"> Updated:</span>{" "}
                            {new Date(rfi.updatedAt).toLocaleDateString()}
                            {rfi.dueDate && (
                              <>
                                | <span className="font-medium"> Due:</span>{" "}
                                {new Date(rfi.dueDate).toLocaleDateString()}
                              </>
                            )}
                          </div>
                          {rfi.answer && (
                            <div className="mt-2 p-2 bg-base-200 rounded text-sm">
                              <span className="font-medium">Answer:</span>{" "}
                              {rfi.answer}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {rfi.threadId && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                const thread = threads.find(
                                  (t) => t.id === rfi.threadId
                                );
                                if (thread) {
                                  handleSelectThread(thread);
                                }
                              }}
                            >
                              Open Chat
                            </button>
                          )}
                          <button
                            className="btn btn-soft btn-sm"
                            onClick={() => handleEditRFI(rfi)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => handleDeleteRFI(rfi)}
                          >
                            Delete
                          </button>
                        </div>
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
          aria-label="Analytics"
          checked={activeTab === "analytics"}
          onChange={() => setActiveTab("analytics")}
        />
        {activeTab === "analytics" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    Communication Analytics
                  </h2>
                  <p className="text-neutral-500">
                    Comprehensive insights into communication performance and
                    trends
                  </p>
                </div>
                <div className="badge badge-neutral badge-lg">Last 30 Days</div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="stat bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    </svg>
                  </div>
                  <div className="stat-title text-blue-100">Active Threads</div>
                  <div className="stat-value">{threads.length}</div>
                  <div className="stat-desc text-blue-200">
                    +{analyticsData.recentThreads} this week
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2V3a2 2 0 012-2 2 2 0 012 2v8a4 4 0 01-4 4H6a4 4 0 01-4-4V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-amber-100">Open RFIs</div>
                  <div className="stat-value">
                    {analyticsData.rfisByStatus.Open || 0}
                  </div>
                  <div className="stat-desc text-amber-200">
                    {rfis.filter((r) => r.status === "Open").length} pending
                    responses
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-emerald-100">
                    Resolution Rate
                  </div>
                  <div className="stat-value">
                    {rfis.length > 0
                      ? Math.round(
                          ((analyticsData.rfisByStatus.Resolved || 0) /
                            rfis.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="stat-desc text-emerald-200">
                    {analyticsData.rfisByStatus.Resolved || 0} resolved RFIs
                  </div>
                </div>

                <div className="stat bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
                  <div className="stat-figure">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <div className="stat-title text-purple-100">Active Users</div>
                  <div className="stat-value">{analyticsData.activeUsers}</div>
                  <div className="stat-desc text-purple-200">
                    Participating in discussions
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* RFI Status Distribution */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      RFI Status Distribution
                    </h3>
                    <div className="badge badge-neutral badge-sm">
                      {rfis.length} Total
                    </div>
                  </div>
                  <div className="h-64">
                    {Object.keys(analyticsData.rfisByStatus).length > 0 ? (
                      <Doughnut
                        data={rfiStatusChartData}
                        options={chartOptions}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No RFI data available
                      </div>
                    )}
                  </div>
                </div>

                {/* RFI Priority Breakdown */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      RFI Priority Breakdown
                    </h3>
                    <div className="badge badge-neutral badge-sm">
                      By Priority
                    </div>
                  </div>
                  <div className="h-64">
                    {Object.keys(analyticsData.rfisByPriority).length > 0 ? (
                      <Bar data={rfiPriorityChartData} options={chartOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No priority data available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Thread Activity by Project */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Thread Activity by Project
                  </h3>
                  <div className="h-48">
                    {Object.keys(analyticsData.threadsByProject).length > 0 ? (
                      <Line
                        data={threadActivityChartData}
                        options={chartOptions}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No project data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Avg RFI Response Time
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {analyticsData.avgResponseTime}
                        </span>
                        <span className="text-sm text-gray-500">days</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (analyticsData.avgResponseTime / 5) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Thread Engagement
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {(
                            analyticsData.totalMessages / threads.length || 0
                          ).toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          msgs/thread
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((analyticsData.totalMessages / threads.length ||
                              0) /
                              10) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Recent Activity
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {analyticsData.recentRFIs +
                            analyticsData.recentThreads}
                        </span>
                        <span className="text-sm text-gray-500">this week</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((analyticsData.recentRFIs +
                              analyticsData.recentThreads) /
                              20) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* RFI Categories */}
                <div className="bg-base-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">RFI Categories</h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.rfisByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 6)
                      .map(([category, count]) => (
                        <div
                          key={category}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm font-medium">
                            {category}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (count /
                                      Math.max(
                                        ...Object.values(
                                          analyticsData.rfisByCategory
                                        )
                                      )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold w-8 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    {Object.keys(analyticsData.rfisByCategory).length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        No category data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Thread Modal */}
      {showCreateThreadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(4px)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
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
                  <span className="label-text font-medium">
                    Add Participants
                  </span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">
                      Loading users...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No users available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
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

      {/* Create RFI Modal */}
      {showCreateRFIModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(4px)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New RFI</h3>

            <form onSubmit={handleCreateRFI} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">RFI Title *</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="input input-bordered w-full"
                    placeholder="Enter RFI title..."
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Project *</span>
                  </label>
                  <select
                    name="projectId"
                    className="select select-bordered w-full"
                    required={!selectedRFIThread}
                    disabled={!!selectedRFIThread}
                    value={
                      selectedRFIThread
                        ? threads.find((t) => t.id === selectedRFIThread)
                            ?.projectId || ""
                        : undefined
                    }
                  >
                    <option value="">
                      {selectedRFIThread
                        ? `Project: ${
                            threads.find((t) => t.id === selectedRFIThread)
                              ?.project?.name || "Unknown"
                          }`
                        : "Select a project"}
                    </option>
                    {!selectedRFIThread &&
                      projects.map((project: Project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                  </select>
                  {selectedRFIThread && (
                    <div className="label">
                      <span className="label-text-alt text-info">
                        Project is set by the selected thread
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Description *</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Describe the information you need..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <select
                    name="category"
                    className="select select-bordered w-full"
                  >
                    <option value="">Select category</option>
                    <option value="Design">Design</option>
                    <option value="Construction">Construction</option>
                    <option value="Materials">Materials</option>
                    <option value="Specifications">Specifications</option>
                    <option value="Safety">Safety</option>
                    <option value="Quality">Quality</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Priority</span>
                  </label>
                  <select
                    name="priority"
                    className="select select-bordered w-full"
                  >
                    <option value="">Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Due Date</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Thread Selection */}
              <div className="divider">Thread Association</div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Link to Existing Thread
                  </span>
                </label>
                <select
                  value={selectedRFIThread}
                  onChange={(e) => setSelectedRFIThread(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">Create new thread for this RFI</option>
                  {threads.map((thread) => (
                    <option key={thread.id} value={thread.id}>
                      {thread.title} ({thread.project?.name || "No project"})
                    </option>
                  ))}
                </select>
                <div className="label">
                  <span className="label-text-alt text-gray-500">
                    {selectedRFIThread
                      ? "RFI will be linked to the selected thread"
                      : "A new thread will be created automatically for this RFI"}
                  </span>
                </div>
              </div>

              {/* Assignees Selection */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Assign To</span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">
                      Loading users...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No users available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                          {selectedAssignees.includes(user.id) ? (
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() => handleRemoveAssignee(user.id)}
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleAddAssignee(user.id)}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedAssignees.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Assigned to: {selectedAssignees.length} user(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCreateRFIModal(false);
                    setSelectedRFIThread("");
                    setSelectedAssignees([]);
                  }}
                  disabled={
                    createRFIMutation.isPending ||
                    createThreadMutation.isPending
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    createRFIMutation.isPending ||
                    createThreadMutation.isPending
                  }
                >
                  {createRFIMutation.isPending ||
                  createThreadMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating...
                    </>
                  ) : (
                    "Create RFI"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit RFI Modal */}
      {showEditRFIModal && editingRFI && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit RFI</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingRFI) {
                  const formData = new FormData(e.currentTarget);
                  const updatedRFI: UpdateRFIDto = {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    category: (formData.get("category") as string) || undefined,
                    priority: (formData.get("priority") as string) || undefined,
                    status: (formData.get("status") as string) || undefined,
                    assignedToIds: editRFISelectedAssignees,
                    dueDate: (formData.get("dueDate") as string) || undefined,
                    answer: (formData.get("answer") as string) || undefined,
                  };
                  updateRFIMutation.mutate(
                    { id: editingRFI.id, rfi: updatedRFI },
                    {
                      onSuccess: () => {
                        setShowEditRFIModal(false);
                        setEditingRFI(null);
                        setEditRFISelectedAssignees([]);
                      },
                      onError: (error) => {
                        console.error("Failed to update RFI:", error);
                      },
                    }
                  );
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="label">
                  <span className="label-text font-medium">RFI Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  placeholder="Enter RFI title..."
                  defaultValue={editingRFI.title}
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Project *</span>
                </label>
                <select
                  name="projectId"
                  className="select select-bordered w-full"
                  defaultValue={editingRFI.projectId}
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
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Optional description..."
                  defaultValue={editingRFI.description}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <select
                    name="category"
                    className="select select-bordered w-full"
                    defaultValue={editingRFI.category}
                  >
                    <option value="">Select category</option>
                    <option value="Design">Design</option>
                    <option value="Construction">Construction</option>
                    <option value="Materials">Materials</option>
                    <option value="Specifications">Specifications</option>
                    <option value="Safety">Safety</option>
                    <option value="Quality">Quality</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Priority</span>
                  </label>
                  <select
                    name="priority"
                    className="select select-bordered w-full"
                    defaultValue={editingRFI.priority}
                  >
                    <option value="">Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Status</span>
                  </label>
                  <select
                    name="status"
                    className="select select-bordered w-full"
                    defaultValue={editingRFI.status}
                  >
                    <option value="">Select status</option>
                    <option value="Open">Open</option>
                    <option value="In Review">In Review</option>
                    <option value="Answered">Answered</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Due Date</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    className="input input-bordered w-full"
                    defaultValue={
                      editingRFI.dueDate
                        ? new Date(editingRFI.dueDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                  />
                </div>
              </div>

              {/* Answer field for RFI */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Answer</span>
                </label>
                <textarea
                  name="answer"
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Provide answer to this RFI..."
                  defaultValue={editingRFI.answer || ""}
                />
              </div>

              {/* Assignees Selection */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Assign To</span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">
                      Loading users...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No users available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                          {editRFISelectedAssignees.includes(user.id) ? (
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() => handleRemoveEditAssignee(user.id)}
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleAddEditAssignee(user.id)}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {editRFISelectedAssignees.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Assigned to: {editRFISelectedAssignees.length} user(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditRFIModal(false);
                    setEditingRFI(null);
                    setEditRFISelectedAssignees([]);
                  }}
                  disabled={updateRFIMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateRFIMutation.isPending}
                >
                  {updateRFIMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Updating...
                    </>
                  ) : (
                    "Update RFI"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Thread Modal */}
      {showEditThreadModal && editingThread && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Update Thread</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingThread) {
                  const formData = new FormData(e.currentTarget);
                  const updatedThread: UpdateThreadDto = {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    projectId: formData.get("projectId") as string,
                    participantIds: editThreadSelectedUsers,
                  };
                  updateThreadMutation.mutate(
                    { id: editingThread.id, thread: updatedThread },
                    {
                      onSuccess: () => {
                        setShowEditThreadModal(false);
                        setEditingThread(null);
                        setEditThreadSelectedUsers([]);
                      },
                      onError: (error) => {
                        console.error("Failed to update thread:", error);
                      },
                    }
                  );
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="label">
                  <span className="label-text font-medium">Thread Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  placeholder="Enter thread title..."
                  defaultValue={editingThread.title}
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
                  defaultValue={editingThread.description}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Project *</span>
                </label>
                <select
                  name="projectId"
                  className="select select-bordered w-full"
                  defaultValue={editingThread.projectId}
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
                  <span className="label-text font-medium">
                    Add Participants
                  </span>
                </label>
                <div className="border border-base-300 rounded-lg p-3 min-h-[100px] max-h-32 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center text-gray-500">
                      Loading users...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No users available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {user.firstName} {user.lastName} ({user.email})
                          </span>
                          {editThreadSelectedUsers.includes(user.id) ? (
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              onClick={() =>
                                handleRemoveEditThreadUser(user.id)
                              }
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleAddEditThreadUser(user.id)}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {editThreadSelectedUsers.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Selected: {editThreadSelectedUsers.length} participant(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditThreadModal(false);
                    setEditingThread(null);
                    setEditThreadSelectedUsers([]);
                  }}
                  disabled={updateThreadMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateThreadMutation.isPending}
                >
                  {updateThreadMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Updating...
                    </>
                  ) : (
                    "Update Thread"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete RFI Confirmation Modal */}
      {showDeleteRFIModal && deletingRFI && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this RFI? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteRFIModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-error" onClick={confirmDeleteRFI}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;

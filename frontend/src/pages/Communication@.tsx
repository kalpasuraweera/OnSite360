import { useState, useMemo } from "react";
import {
  useThreads,
  useCreateThread,
  useUpdateThread,
  useThreadMessages,
  useSendMessage,
  useSendMessageWithAttachments,
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
import { IoDocument, IoImage, IoTrash } from "react-icons/io5";

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
  const sendMessageWithAttachmentsMutation = useSendMessageWithAttachments();
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

  // File attachment state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
    if ((newMessage.trim() || selectedFiles.length > 0) && selectedThread) {
      if (selectedFiles.length > 0) {
        // Send message with attachments
        sendMessageWithAttachmentsMutation.mutate(
          {
            message: {
              content: newMessage || " ", // Ensure content is not empty
              threadId: selectedThread.id,
            },
            files: selectedFiles,
          },
          {
            onSuccess: () => {
              setNewMessage("");
              setSelectedFiles([]);
            },
            onError: (error) => {
              console.error("Failed to send message with attachments:", error);
            },
          }
        );
      } else {
        // Send regular message
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
        const fileArray = Array.from(files);
        setSelectedFiles(prev => [...prev, ...fileArray]);
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
        setSelectedFiles(prev => [...prev, files[0]]);
      }
    };
    input.click();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Helper functions for file handling
  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const getFileIcon = (filename: string) => {
    if (isImageFile(filename)) {
      return <IoImage className="text-blue-500" />;
    }
    return <IoDocument className="text-gray-500" />;
  };

  const getAttachmentUrl = (attachment: string): string => {
    // If attachment starts with http, it's already a full URL
    if (attachment.startsWith('http')) {
      return attachment;
    }
    // Otherwise, construct the URL using the backend base URL
    return `${import.meta.env.VITE_DOCUMENTS_URL || 'http://localhost:3000'}${attachment}`;
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
                            {message.attachment && (
                              <div className="mt-2">
                                {isImageFile(message.attachment) ? (
                                  <img
                                    src={getAttachmentUrl(message.attachment)}
                                    alt="Attachment"
                                    className="max-w-full h-auto rounded-lg cursor-pointer"
                                    onClick={() => window.open(getAttachmentUrl(message.attachment!), '_blank')}
                                  />
                                ) : (
                                  <a
                                    href={getAttachmentUrl(message.attachment)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                                  >
                                    {getFileIcon(message.attachment)}
                                    <span className="text-xs">
                                      {message.attachment.split('/').pop()}
                                    </span>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Attachment Preview */}
                {selectedFiles.length > 0 && (
                  <div className="px-3 sm:px-4 py-2 bg-base-200 border-t border-base-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="btn btn-ghost btn-xs"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-1">
                            {getFileIcon(file.name)}
                            <span className="text-xs max-w-20 truncate">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="btn btn-ghost btn-circle btn-xs text-red-500 hover:bg-red-100"
                          >
                            <IoTrash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                      disabled={sendMessageMutation.isPending || sendMessageWithAttachmentsMutation.isPending}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm sm:btn-md"
                      disabled={
                        sendMessageMutation.isPending || 
                        sendMessageWithAttachmentsMutation.isPending || 
                        (!newMessage.trim() && selectedFiles.length === 0)
                      }
                    >
                      {(sendMessageMutation.isPending || sendMessageWithAttachmentsMutation.isPending) ? (
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


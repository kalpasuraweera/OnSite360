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
  const { data: threads = [], isLoading: threadsLoading, error: threadsError } = useThreads();
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

  // Attach section state
  const [showAttach, setShowAttach] = useState(false);

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
};

export default Communication;

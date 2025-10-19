import {
  HiOutlineChartBar,
  HiOutlineUserCircle,
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineTrendingUp,
  HiOutlineExclamation,
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup,
  HiOutlineLightningBolt,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineUser,
  HiOutlineDocumentReport,
  HiOutlineChatAlt2,
  HiOutlineDocumentText,
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineCalculator,
  HiOutlineCollection,
  HiOutlineCalendar,
  HiOutlineDocumentDuplicate,
  HiOutlineFlag,
} from "react-icons/hi";
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
import StatCard from "../components/StatCard";
import { useAuthStore } from "../stores/useAuthStore";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip as LeafletTooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import type { Project } from "../hooks/useProjects";
import { useUsers, useUserNotifications } from "../hooks/useUsers";
import { useRFIs } from "../hooks/useCommunication"; // <-- add this import
import type { User } from "../hooks/useUsers";
import { useTasks } from "../hooks/useTasks";
import type { Task } from "../hooks/useTasks";

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

const Dashboard = () => {
  // Chart data configurations
  // Fetch data from API hooks
  const projectsQuery = useProjects();
  const usersQuery = useUsers();
  const tasksQuery = useTasks();
  const authUser = useAuthStore((s) => s.user);
  const notificationsQuery = useUserNotifications(authUser?.id ?? "");
  const rfisQuery = useRFIs(); // <-- fetch RFIs

  // Local type: some backend responses include status/state or _count
  type ProjectWithOptional = Project & {
    status?: string;
    state?: string;
    _count?: { threads?: number };
  };

  // Chart: project status breakdown (derive from projects when possible)
  const projectStatusData = useMemo(() => {
    // Use project.type instead of status to produce a type breakdown
    const labels = [
      "Commercial",
      "Residential",
      "Industrial",
      "Mixed Use",
      "Other",
    ];
    const counts = new Array(labels.length).fill(0);

    const projects = projectsQuery.data?.data ?? [];
    (projects as ProjectWithOptional[]).forEach((p) => {
      const rawType = (p.type ?? "Other").toString();
      const idx = labels.findIndex(
        (lbl) => lbl.toLowerCase() === rawType.toLowerCase()
      );
      counts[idx >= 0 ? idx : labels.length - 1]++;
    });

    return {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: [
            "#3B82F6", // Commercial
            "#10B981", // Residential
            "#F59E0B", // Industrial
            "#A78BFA", // Mixed Use
            "#6B7280", // Other
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [projectsQuery.data?.data]);

  // Monthly activity chart - derive from project start/end dates if available
  const monthlyActivityData = useMemo(() => {
    const projects = (projectsQuery.data?.data ?? []) as Project[];
    // collect valid start/end dates
    const starts: Date[] = [];
    const ends: Date[] = [];

    projects.forEach((p) => {
      if (p.startDate) {
        const d = new Date(p.startDate as string);
        if (!isNaN(d.getTime())) starts.push(d);
      }
      if (p.endDate) {
        const d = new Date(p.endDate as string);
        if (!isNaN(d.getTime())) ends.push(d);
      }
    });

    // fallback: if no dates, use the next 6 months from now (keeps previous UX)
    if (starts.length === 0 && ends.length === 0) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const labels = months.slice(0, 6);
      return {
        labels,
        datasets: [
          {
            label: "Projects Started",
            data: new Array(labels.length).fill(0),
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
          {
            label: "Projects Completed",
            data: new Array(labels.length).fill(0),
            backgroundColor: "rgba(16, 185, 129, 0.8)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 1,
          },
        ],
      };
    }

    // determine range: earliest start, latest end (or use latest start if no ends)
    const minDate = starts.length > 0 ? new Date(Math.min(...starts.map(d => d.getTime()))) : new Date(Math.min(...ends.map(d => d.getTime())));
    const maxDate = ends.length > 0 ? new Date(Math.max(...ends.map(d => d.getTime()))) : new Date(Math.max(...starts.map(d => d.getTime())));

    // Normalize to first of month for iteration
    const startMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    // Build month keys and labels between startMonth and endMonth (inclusive)
    const monthKeys: string[] = [];
    const labels: string[] = [];
    const keyToIndex = new Map<string, number>();
    const maxMonths = 12; // cap to 12 months for chart readability

    let cur = new Date(startMonth);
    while (cur <= endMonth && monthKeys.length < maxMonths) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`; // e.g. 2025-10
      monthKeys.push(key);
      labels.push(cur.toLocaleString(undefined, { month: "short", year: "numeric" })); // "Oct 2025"
      keyToIndex.set(key, monthKeys.length - 1);
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }

    // If computed range is empty (defensive), fallback to last 6 months
    if (monthKeys.length === 0) {
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthKeys.push(key);
        labels.push(d.toLocaleString(undefined, { month: "short", year: "numeric" }));
        keyToIndex.set(key, monthKeys.length - 1);
      }
    }

    const startedCounts = new Array(monthKeys.length).fill(0);
    const completedCounts = new Array(monthKeys.length).fill(0);

    projects.forEach((p) => {
      if (p.startDate) {
        const sd = new Date(p.startDate as string);
        if (!isNaN(sd.getTime())) {
          const key = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, "0")}`;
          const idx = keyToIndex.get(key);
          if (typeof idx === "number") startedCounts[idx]++;
        }
      }
      if (p.endDate) {
        const ed = new Date(p.endDate as string);
        if (!isNaN(ed.getTime())) {
          const key = `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, "0")}`;
          const idx = keyToIndex.get(key);
          if (typeof idx === "number") completedCounts[idx]++;
        }
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "Projects Started",
          data: startedCounts,
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
        {
          label: "Projects Completed",
          data: completedCounts,
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [projectsQuery.data?.data]);

  // Performance data: derive from tasks (user activity) and placeholder for system performance (no API)
  const performanceData = useMemo(() => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    // Derive user activity as percentage of completed tasks over total tasks per week (simple heuristic)
    const tasks: Task[] = (tasksQuery.data as Task[]) ?? [];
    const weekCompleted: number[] = [0, 0, 0, 0];
    const weekTotal: number[] = [0, 0, 0, 0];

    tasks.forEach((t) => {
      const created = new Date(t.createdAt);
      const day = created.getDate();
      const weekIndex = Math.min(3, Math.floor((day - 1) / 7));
      weekTotal[weekIndex]++;
      if (t.status === "Completed") weekCompleted[weekIndex]++;
    });

    const userActivity = weekTotal.map((tot, i) =>
      tot === 0 ? 0 : Math.round((weekCompleted[i] / tot) * 100)
    );
    // System performance - no API available; keep placeholder but add comment
    const systemPerformance = [95, 95, 95, 95]; // NOTE: no hook/api for real system uptime/perf

    return {
      labels: weeks,
      datasets: [
        {
          label: "System Performance (%)",
          data: systemPerformance,
          borderColor: "rgba(16, 185, 129, 1)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "User Activity (%)",
          data: userActivity,
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [tasksQuery.data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  // Quick actions buttons
  const navigate = useNavigate();
  const quickActions = [
    {
      label: "Permission Management",
      className: "btn btn-primary",
      onClick: () => navigate("/permission-management"),
    },
    {
      label: "Role Management",
      className: "btn btn-neutral",
      onClick: () => navigate("/role-management"),
    },
    {
      label: "User Management",
      className: "btn btn-accent",
      onClick: () => navigate("/user-management"),
    },
  ];

  // Summary statistics cards
  // Derived statistic cards using API data where possible
  const totalUsers = (usersQuery.data as User[])?.length ?? 0;
  const totalProjects = (projectsQuery.data?.data as Project[])?.length ?? 0;
  const totalTasks = (tasksQuery.data as Task[])?.length ?? 0;

  // Count users whose updatedAt is today (local date)
  const activeToday = (() => {
    const users: User[] = (usersQuery.data as User[]) ?? [];
    const now = new Date();
    return users.filter((u) => {
      if (!u.updatedAt) return false;
      const d = new Date(u.updatedAt);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }).length;
  })();

  const completedTasks = ((tasksQuery.data as Task[]) ?? []).filter(
    (t) => t.status === "Completed"
  ).length;

  const avgProgress =
    totalTasks === 0
      ? 0
      : Math.round(
          ((tasksQuery.data as Task[]) ?? []).reduce(
            (acc: number, t: Task) => acc + (t.progress || 0),
            0
          ) / totalTasks
        );

  const lastAdminActivity = useMemo(() => {
    // derive most recent updatedAt from users whose role name includes "admin"
    const users: User[] = (usersQuery.data as User[]) ?? [];
    const admins = users.filter((u) => !!u.role?.name && /admin/i.test(u.role.name));
    if (admins.length === 0) return "--";
    const latest = admins.reduce((prev, cur) => {
      const pd = prev.updatedAt ? new Date(prev.updatedAt).getTime() : 0;
      const cd = cur.updatedAt ? new Date(cur.updatedAt).getTime() : 0;
      return cd > pd ? cur : prev;
    }, admins[0]);
    // show date only (no time)
    return latest.updatedAt ? new Date(latest.updatedAt).toLocaleDateString() : "--";
  }, [usersQuery.data]);

  // add after lastAdminActivity (or near other derived stats)
  const atRiskCount = useMemo(() => {
	// Count projects that are over budget or have at least one overdue phase.
	// Mirrors the RiskManagement.tsx logic: overBudget || overduePhases
	const projects = (projectsQuery.data?.data ?? []) as any[];
	const now = new Date();
	let count = 0;

	projects.forEach((p) => {
		// budget and spent may be on project as numbers or strings or costToDate
		const budgetRaw = p.budget ?? p.projectBudget ?? null;
		const costRaw = p.costToDate ?? p.totalSpent ?? null;

		const budget = typeof budgetRaw === "number" ? budgetRaw : budgetRaw ? Number(budgetRaw) : NaN;
		const costToDate = typeof costRaw === "number" ? costRaw : costRaw ? Number(costRaw) : NaN;

		const overBudget = !Number.isNaN(budget) && !Number.isNaN(costToDate) && costToDate > budget;

		// phases may be provided on the project as `phases`, `projectPhases`, or similar
		const phases = Array.isArray(p.phases)
			? p.phases
			: Array.isArray(p.projectPhases)
			? p.projectPhases
			: Array.isArray(p.schedule?.phases)
			? p.schedule.phases
			: [];

		const overduePhase = Array.isArray(phases) && phases.some((ph: any) => {
			if (!ph || !ph.endDate) return false;
			const end = new Date(ph.endDate);
			const progress = typeof ph.progress === "number" ? ph.progress : Number(ph?.progress ?? 0);
			return end < now && (progress ?? 0) < 100;
		});

		if (overBudget || overduePhase) count++;
	});

	return count;
}, [projectsQuery.data?.data]);

  // add near other derived stats (e.g. after atRiskCount)
  const outstandingValue = useMemo(() => {
    const projects = (projectsQuery.data?.data ?? []) as any[];
    let sumOutstanding = 0;
    projects.forEach((p) => {
      const budgetRaw = p.budget ?? p.projectBudget ?? null;
      const costRaw = p.costToDate ?? p.totalSpent ?? null;

      const budget = typeof budgetRaw === "number" ? budgetRaw : budgetRaw ? Number(budgetRaw) : NaN;
      const costToDate = typeof costRaw === "number" ? costRaw : costRaw ? Number(costRaw) : NaN;

      if (!Number.isNaN(budget)) {
        const outstanding = Number.isNaN(costToDate) ? budget : Math.max(0, budget - costToDate);
        sumOutstanding += outstanding;
      }
    });

    // format as USD, show 0 if none
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(sumOutstanding || 0);
  }, [projectsQuery.data?.data]);

  const statCards = [
    {
      id: "total-users",
      icon: <HiOutlineUsers className="inline w-7 h-7 text-secondary" />,
      value: totalUsers,
      label: "Total Users",
    },
    {
      id: "active-sessions",
      icon: <HiOutlineUserCircle className="inline w-7 h-7 text-secondary" />,
      // Count of users updated today (uses usersQuery.updatedAt)
      value: activeToday,
      label: "Active Today",
    },
    {
      id: "admin-activity",
      icon: <HiOutlineUserGroup className="inline w-7 h-7 text-secondary" />,
      // Shows the most recent updatedAt for any user with "admin" in their role name
      value: lastAdminActivity,
      label: "Admin Activity",
    },
    {
      id: "alerts",
      icon: (
        <svg
          width="28"
          height="28"
          fill="none"
          viewBox="0 0 24 24"
          className="inline-block text-secondary"
        >
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M12 9v4m0 4h.01M21 19H3l9-16 9 16Z"
          />
        </svg>
      ),
      // show actual user notification count (falls back to 0)
      value: notificationsQuery.data?.length ?? 0,
      label: "Alerts",
    },
    {
      id: "active-projects",
      icon: <HiOutlineBriefcase className="inline w-7 h-7 text-secondary" />,
      value: totalProjects,
      label: "Active Projects",
    },
    {
      id: "avg-progress",
      icon: <HiOutlineTrendingUp className="inline w-7 h-7 text-secondary" />,
      value: `${avgProgress}%`,
      label: "Avg Progress",
    },
    {
      id: "total-value",
      icon: (
        <HiOutlineCurrencyDollar className="inline w-7 h-7 text-secondary" />
      ),
      // If projects have budget field, sum them; otherwise note no budget info
      value: (() => {
        const projects: Project[] =
          (projectsQuery.data?.data as Project[]) ?? [];
        const sum = projects.reduce(
          (acc, p) => acc + (Number(p.budget) || 0),
          0
        );
        return sum > 0 ? `$${(sum / 1_000_000).toFixed(1)}M` : "--"; // display in millions
      })(),
      label: "Total Value",
    },
    {
      id: "at-risk",
      icon: <HiOutlineExclamation className="inline w-7 h-7 text-secondary" />,
      value: atRiskCount,
      label: "At risk",
    },
    {
      id: "outstanding-value",
      icon: (
        <HiOutlineCurrencyDollar className="inline w-7 h-7 text-secondary" />
      ),
      // Sum of max(0, budget - costToDate) across projects formatted as USD
      value: outstandingValue,
      label: "Outstanding Value",
    },
    {
      id: "team-members",
      icon: <HiOutlineUserGroup className="inline w-7 h-7 text-secondary" />,
      value: totalUsers,
      label: "Team Members",
    },
    {
      id: "efficiency",
      icon: (
        <HiOutlineLightningBolt className="inline w-7 h-7 text-secondary" />
      ),
      value: "91%",
      label: "Efficiency",
    },
    {
      id: "project-success-rate",
      icon: <HiOutlineCheckCircle className="inline w-7 h-7 text-secondary" />,
      value: "87%",
      label: "Project Success Rate",
    },
    {
      id: "avg-project-roi",
      icon: <HiOutlineTrendingUp className="inline w-7 h-7 text-secondary" />,
      value: "14%",
      label: "Avg Project ROI",
    },
    {
      id: "team-productivity",
      icon: (
        <HiOutlineLightningBolt className="inline w-7 h-7 text-secondary" />
      ),
      value: "88%",
      label: "Team Productivity",
    },
    {
      id: "urgent-tasks",
      icon: <HiOutlineExclamation className="inline w-7 h-7 text-secondary" />,
      value: ((tasksQuery.data as Task[]) ?? []).filter(
        (t) => t.priority === "Critical" || t.priority === "High"
      ).length,
      label: "Urgent Tasks",
    },
    {
      id: "tasks-complete",
      icon: <HiOutlineCheckCircle className="inline w-7 h-7 text-secondary" />,
      value: completedTasks,
      label: "Tasks Complete",
    },
    {
      id: "active-crew",
      icon: <HiOutlineUser className="inline w-7 h-7 text-secondary" />,
      value: 18,
      label: "Active Crew",
    },
    {
      id: "open-rfis",
      icon: (
        <HiOutlineDocumentReport className="inline w-7 h-7 text-secondary" />
      ),
      // TODO: no hook for RFIs in hooks folder; add a placeholder comment
      value: "--", // no hook for RFIs
      label: "Open RFIs",
    },
    {
      id: "conversation-awaiting",
      icon: <HiOutlineChatAlt2 className="inline w-7 h-7 text-secondary" />,
      // Conversations/threads: derive from projects threads count if available
      value: projectsQuery.data?.data
        ? (projectsQuery.data?.data as ProjectWithOptional[]).reduce(
            (acc: number, p: ProjectWithOptional) =>
              acc + (p._count?.threads || 0),
            0
          )
        : "--",
      label: "Conversation Awaiting",
    },
    {
      id: "notifications",
      icon: <HiOutlineBell className="inline w-7 h-7 text-secondary" />,
      value: (notificationsQuery.data ?? []).length ?? 0,
      label: "Notifications",
    },
    {
      id: "active-rfis",
      icon: <HiOutlineDocumentText className="inline w-7 h-7 text-secondary" />,
      value: 9,
      label: "Active RFIs",
    },
    {
      id: "approvals-pending",
      icon: (
        <HiOutlineClipboardList className="inline w-7 h-7 text-secondary" />
      ),
      value: "--", // no hook for approvals
      label: "Approvals Pending",
    },
    {
      id: "drawing-revisions",
      icon: (
        <HiOutlineDocumentDuplicate className="inline w-7 h-7 text-secondary" />
      ),
      value: 2,
      label: "Drawing Revisions",
    },
    {
      id: "calculations",
      icon: <HiOutlineCalculator className="inline w-7 h-7 text-secondary" />,
      value: 15,
      label: "Calculations",
    },
    {
      id: "active-jobs",
      icon: <HiOutlineCollection className="inline w-7 h-7 text-secondary" />,
      value: 6,
      label: "Active Jobs",
    },
    {
      id: "hours-this-week",
      icon: <HiOutlineClock className="inline w-7 h-7 text-secondary" />,
      value: "--", // no attendance/time tracking hook used here
      label: "Hours This Week",
    },
    {
      id: "pending-invoices",
      icon: (
        <HiOutlineCurrencyDollar className="inline w-7 h-7 text-secondary" />
      ),
      value: 8,
      label: "Pending Invoices",
    },
    {
      id: "completion-rate",
      icon: <HiOutlineCheckCircle className="inline w-7 h-7 text-secondary" />,
      value: "92%",
      label: "Completion Rate",
    },
    {
      id: "overall-progress",
      icon: <HiOutlineTrendingUp className="inline w-7 h-7 text-secondary" />,
      value: "81%",
      label: "Overall Progress",
    },
    {
      id: "timeline",
      icon: <HiOutlineCalendar className="inline w-7 h-7 text-secondary" />,
      value: "On Track",
      label: "TimeLine",
    },
    {
      id: "budget-status",
      icon: (
        <HiOutlineCurrencyDollar className="inline w-7 h-7 text-secondary" />
      ),
      value: "Under",
      label: "Budget Status",
    },
    {
      id: "milestones",
      icon: <HiOutlineFlag className="inline w-7 h-7 text-secondary" />,
      value: 11,
      label: "Milestones",
    },
  ];

  // Additional charts data for various roles
  const resourceAllocationData = useMemo(() => {
    const projects = (projectsQuery.data?.data ?? []) as any[];
    const maxItems = 12;
    const slice = projects.slice(0, maxItems);

    const labels = slice.map((p) => p.name ?? p.id ?? "Project");
    const data = slice.map((p) => Number(p._count?.tasks ?? 0));

    return {
      labels,
      datasets: [
        {
          label: "Task Count",
          data,
          backgroundColor: labels.map((_, i) =>
            ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#f97316", "#8b5cf6"][i % 6]
          ),
          borderWidth: 1,
        },
      ],
    };
  }, [projectsQuery.data?.data]);

  const safetyIncidentsData = useMemo(() => {
    // Use document counts per project
    const projects = (projectsQuery.data?.data ?? []) as any[];
    const maxItems = 12;
    const slice = projects.slice(0, maxItems);

    const labels = slice.map((p) => p.name ?? p.id ?? "Project");
    const data = slice.map((p) => Number(p._count?.documents ?? 0));

    return {
      labels,
      datasets: [
        {
          label: "Document Count",
          data,
          backgroundColor: "rgba(251,191,36,0.7)",
          borderColor: "#f59e42",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [projectsQuery.data?.data]);

  const clientSatisfactionData = useMemo(() => {
    // Use thread counts per project
    const projects = (projectsQuery.data?.data ?? []) as any[];
    const maxItems = 12;
    const slice = projects.slice(0, maxItems);

    const labels = slice.map((p) => p.name ?? p.id ?? "Project");
    const data = slice.map((p) => Number(p._count?.threads ?? 0));

    return {
      labels,
      datasets: [
        {
          label: "Thread Count",
          data,
          backgroundColor: labels.map((_, i) =>
            ["rgba(96,165,250,0.7)", "rgba(16,185,129,0.7)", "rgba(251,113,133,0.7)", "rgba(253,224,71,0.7)"][i % 4]
          ),
          borderWidth: 1,
        },
      ],
    };
  }, [projectsQuery.data?.data]);

  // replace the static costBreakdownData with a memoized per-project cost dataset
const costBreakdownData = useMemo(() => {
  const projects = (projectsQuery.data?.data ?? []) as any[];
  if (!projects || projects.length === 0) {
    return {
      labels: [],
      datasets: [
        {
          label: "Project Cost ($)",
          data: [],
          backgroundColor: [],
          borderWidth: 1,
        },
      ],
    };
  }

  const maxItems = 12;
  const slice = projects.slice(0, maxItems);

  const labels = slice.map((p) => p.name ?? p.id ?? "Project");
  const values = slice.map((p) =>
    Number(p.costToDate ?? p.totalSpent ?? p.totalCost ?? p.cost ?? 0)
  );

  const palette = [
    "#6366f1",
    "#f472b6",
    "#facc15",
    "#34d399",
    "#60a5fa",
    "#f97316",
    "#ef4444",
    "#7c3aed",
    "#06b6d4",
    "#f43f5e",
    "#10b981",
    "#8b5cf6",
  ];

  return {
    labels,
    datasets: [
      {
        label: "Project Cost ($)",
        data: values,
        backgroundColor: values.map((_, i) => palette[i % palette.length]),
        borderWidth: 1,
      },
    ],
  };
}, [projectsQuery.data?.data]);

  // replace rfiResponseTimeData with a memo that counts RFIs per project
const rfiCountPerProjectData = useMemo(() => {
	const projects = (projectsQuery.data?.data ?? []) as any[];
	const rfis = (rfisQuery.data ?? []) as any[];
	const maxItems = 12;
	const slice = projects.slice(0, maxItems);

	const labels = slice.map((p) => p.name ?? p.id ?? "Project");
	const data = slice.map((p) => {
		// count rfis where rfi.project?.id or rfi.projectId matches project id
		return rfis.filter(
			(r: any) => (r.project?.id ?? r.projectId ?? "") === p.id
		).length;
	});

	return {
		labels,
		datasets: [
			{
				label: "Open RFIs",
				data,
				backgroundColor: "rgba(59,130,246,0.7)",
				borderColor: "#2563eb",
				borderWidth: 2,
			},
		],
	};
}, [projectsQuery.data?.data, rfisQuery.data]);

  // Chart grid configuration
  const chartsGrid = [
    {
      key: "project-status",
      title: "Project Status Distribution",
      chart: <Doughnut data={projectStatusData} options={doughnutOptions} />,
    },
    {
      key: "monthly-activity",
      title: "Monthly Project Activity",
      chart: <Bar data={monthlyActivityData} options={chartOptions} />,
    },
    // New charts for different roles
    {
      key: "resource-allocation",
      title: "Resource Allocation (Engineer)",
      chart: (
        <Bar
          data={resourceAllocationData}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: { display: false },
            },
            scales: {
              x: { stacked: false },
              y: { beginAtZero: true, max: 100 },
            },
          }}
        />
      ),
    },
    {
      key: "safety-incidents",
      title: "Safety Incidents Trend (Site Supervisor)",
      chart: (
        <Line
          data={safetyIncidentsData}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          }}
        />
      ),
    },
    {
      key: "client-satisfaction",
      title: "Client Satisfaction (Client)",
      chart: (
        <Bar
          data={clientSatisfactionData}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: { display: false },
            },
            scales: {
              y: { beginAtZero: true, max: 100 },
            },
          }}
        />
      ),
    },
    {
      key: "cost-breakdown",
      title: "Cost Breakdown (Project Manager)",
      chart: (
        <Doughnut
          data={costBreakdownData}
          options={{
            ...doughnutOptions,
            plugins: {
              ...doughnutOptions.plugins,
              legend: { position: "right" as const },
            },
          }}
        />
      ),
    },
    {
      key: "rfi-response-time",
      title: "RFI Count per Project",
      chart: (
        <Bar
          data={rfiCountPerProjectData}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: { display: false },
            },
            scales: {
              y: { beginAtZero: true },
            },
          }}
        />
      ),
    },
  ];

  // Last chart for performance overview
  const lastChart = [
    {
      title: "Performance Overview",
      chart: <Line data={performanceData} options={chartOptions} />,
    },
  ];

  const user = useAuthStore((state) => state.user);

  const DashboardLayout = [
    {
      role: "System Admin",
      statCardIds: [
        "total-users",
        "active-sessions",
        "admin-activity", // updated id
        "alerts",
      ],
      chartKeys: ["project-status", "monthly-activity", "performance-overview"],
    },
    {
      role: "Engineer",
      statCardIds: [
        "team-members",
        "efficiency",
        "project-success-rate",
        "avg-project-roi",
      ],
      chartKeys: ["resource-allocation", "cost-breakdown"],
    },
    {
      role: "Site Supervisor",
      statCardIds: [
        "urgent-tasks",
        "tasks-complete",
        "active-crew",
        "open-rfis",
      ],
      chartKeys: ["safety-incidents", "rfi-response-time"],
    },
    {
      role: "Project Client",
      statCardIds: [
        "active-rfis",
        "approvals-pending",
        "drawing-revisions",
        "calculations",
      ],
      chartKeys: ["client-satisfaction", "rfi-response-time"],
    },
    {
      role: "Project Manager",
      statCardIds: [
        "hours-this-week",
        "pending-invoices",
        "completion-rate",
        "overall-progress",
      ],
      chartKeys: ["cost-breakdown", "rfi-response-time", "resource-allocation","safety-incidents", "client-satisfaction"],
    },
    {
      role: "Executive Admin",
      statCardIds: ["outstanding-value", "total-value", "avg-progress", "alerts"],
      chartKeys: ["project-status", "cost-breakdown"],
    },
    {
      role: "Project Director",
      statCardIds: [
        "overall-progress",
        "budget-status",
        "timeline",
        "milestones",
      ],
      chartKeys: ["monthly-activity", "cost-breakdown", "performance-overview"],
    },
  ];

  // Determine layout for current user role
  const roleLayout = DashboardLayout.find(
    (layout) => layout.role === user?.role?.name
  );

  // Filter stat cards and charts based on role, fallback to all if not found
  const visibleStatCards = roleLayout
    ? statCards.filter((card) => roleLayout.statCardIds.includes(card.id))
    : statCards;

  const visibleCharts = roleLayout
    ? chartsGrid.filter((chart) =>
        roleLayout.chartKeys.includes(
          chart.key || chart.title?.toLowerCase().replace(/\s/g, "-")
        )
      )
    : chartsGrid;

  // Compute project coordinates list and a sensible center for the map
  const projectCoords = useMemo(() => {
    const projects = (projectsQuery.data?.data ?? []) as any[];
    const coords: { id: string; lat: number; lng: number; project: any }[] = [];

    projects.forEach((p) => {
      const raw = p.coordinates;
      if (!raw) return;
      let parsed: any = null;
      try {
        parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch (e) {
        // Ignore parse errors
        parsed = raw;
      }
      if (
        parsed &&
        (parsed.lat !== undefined || parsed.latitude !== undefined)
      ) {
        const lat = parsed.lat ?? parsed.latitude;
        const lng = parsed.lng ?? parsed.longitude ?? parsed.lon ?? parsed.long;
        if (typeof lat === "number" && typeof lng === "number") {
          coords.push({ id: p.id, lat, lng, project: p });
        }
      }
    });

    return coords;
  }, [projectsQuery.data?.data]);

  const mapCenter = useMemo(() => {
    if (projectCoords.length > 0)
      return { lat: projectCoords[0].lat, lng: projectCoords[0].lng };
    return { lat: 40.7128, lng: -74.006 }; // fallback
  }, [projectCoords]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
        System overview and key performance metrics
      </p>

      {/* Quick Actions - Only for System Admin */}
      {user?.role?.name === "System Admin" && (
        <div className="bg-base-200 rounded-2xl p-4 sm:p-6 border border-base-300 shadow-xl shadow-base-300 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className={`btn ${action.className} w-full text-sm sm:text-base`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Updates - For all except System Admin */}
      {user?.role?.name !== "System Admin" && (
        <div className="bg-base-200 rounded-2xl p-4 sm:p-6 border border-base-300 shadow-xl shadow-base-300 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">
                Today Updates
              </h3>
              <p className="text-sm text-neutral">Downtown Project</p>
            </div>
            <button className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto">
              Go to Project
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-1">
            <img
              src="/img1.jpg"
              alt=""
              className="w-full h-20 sm:h-auto object-cover rounded"
            />
            <img
              src="/img2.jpg"
              alt=""
              className="w-full h-20 sm:h-auto object-cover rounded"
            />
            <img
              src="/img1.jpg"
              alt=""
              className="w-full h-20 sm:h-auto object-cover rounded"
            />
            <img
              src="/img2.jpg"
              alt=""
              className="w-full h-20 sm:h-auto object-cover rounded"
            />
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {visibleStatCards.map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            value={card.value}
            label={card.label}
          />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {visibleCharts.map((item) => (
          <div
            key={item.key}
            className="bg-base-200 rounded-2xl p-4 sm:p-6 border border-base-300 shadow-xl shadow-base-300"
          >
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              {item.title}
            </h3>
            <div className="h-48 sm:h-64">{item.chart}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="bg-base-200 rounded-2xl p-4 sm:p-6 border border-base-300 shadow-xl shadow-base-300 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-semibold">Map</h3>
          <input
            type="search"
            placeholder="Enter Map Location"
            className="input input-bordered w-full sm:w-auto sm:max-w-xs text-sm"
          />
        </div>
        <div className="p-2 sm:p-4 w-full relative mt-4">
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Project Locations
          </h3>
          <div style={{ height: 250, width: "100%" }} className="sm:h-[350px]">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Render markers for all projects that have coordinates */}
              {projectCoords.map((c) => {
                console.log("Rendering marker for project:", c.project.name);
                const p = c.project;
                const start = p.startDate
                  ? new Date(p.startDate).toLocaleDateString()
                  : "N/A";
                const end = p.endDate
                  ? new Date(p.endDate).toLocaleDateString()
                  : "N/A";
                const budget = p.budget
                  ? `$${Number(p.budget).toLocaleString()}`
                  : "N/A";
                return (
                  <Marker key={c.id} position={{ lat: c.lat, lng: c.lng }}>
                    <LeafletTooltip>{p.name ?? "Project"}</LeafletTooltip>
                    <Popup>
                      <div className="max-w-xs">
                        <h4 className="font-semibold">{p.name}</h4>
                        {p.type && (
                          <div className="text-sm text-muted">
                            Type: {p.type}
                          </div>
                        )}
                        {p.location && (
                          <div className="text-sm">Address: {p.location}</div>
                        )}
                        <div className="text-sm">Start: {start}</div>
                        <div className="text-sm">End: {end}</div>
                        <div className="text-sm">Budget: {budget}</div>
                        {/* Optionally show a short description */}
                        {p.description && (
                          <p className="mt-2 text-sm">{p.description}</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Performance Chart - Full Width */}
      {!roleLayout && (
        <div className="bg-base-200 rounded-2xl p-4 sm:p-6 border border-base-300 mb-4 sm:mb-6 shadow-xl shadow-base-300">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">
            {lastChart[0].title}
          </h3>
          <div className="h-64 sm:h-80">{lastChart[0].chart}</div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

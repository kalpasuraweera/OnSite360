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
  const projectStatusData = {
    labels: ["Active", "Completed", "On Hold", "Planning"],
    datasets: [
      {
        data: [32, 18, 5, 12],
        backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#6B7280"],
        borderWidth: 0,
      },
    ],
  };

  const monthlyActivityData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Projects Started",
        data: [8, 12, 15, 10, 18, 14],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "Projects Completed",
        data: [5, 8, 10, 12, 15, 16],
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
    ],
  };

  const performanceData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "System Performance (%)",
        data: [95, 98, 92, 96],
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "User Activity (%)",
        data: [88, 85, 90, 87],
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

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
  const quickActions = [
    { label: "Create New Project", className: "btn btn-primary" },
    { label: "Generate Report", className: "btn btn-neutral" },
    { label: "System Backup", className: "btn btn-accent" },
  ];

  // Summary statistics cards
  const statCards = [
    {
      id: "total-users",
      icon: <HiOutlineUsers className="inline w-7 h-7 text-secondary" />,
      value: 247,
      label: "Total Users",
    },
    {
      id: "active-sessions",
      icon: <HiOutlineUserCircle className="inline w-7 h-7 text-secondary" />,
      value: 89,
      label: "Active Sessions",
    },
    {
      id: "system-health",
      icon: <HiOutlineChartBar className="inline w-7 h-7 text-secondary" />,
      value: "98%",
      label: "System Health",
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
      value: 3,
      label: "Alerts",
    },
    {
      id: "active-projects",
      icon: <HiOutlineBriefcase className="inline w-7 h-7 text-secondary" />,
      value: 12,
      label: "Active Projects",
    },
    {
      id: "avg-progress",
      icon: <HiOutlineTrendingUp className="inline w-7 h-7 text-secondary" />,
      value: "76%",
      label: "Avg Progress",
    },
    {
      id: "total-value",
      icon: (
        <HiOutlineCurrencyDollar className="inline w-7 h-7 text-secondary" />
      ),
      value: "$2.4M",
      label: "Total Value",
    },
    {
      id: "at-risk",
      icon: <HiOutlineExclamation className="inline w-7 h-7 text-secondary" />,
      value: 2,
      label: "At risk",
    },
    {
      id: "portfolio-value",
      icon: (
        <HiOutlineCurrencyDollar className="inline w-7 h-7 text-secondary" />
      ),
      value: "$8.1M",
      label: "Portfolio Value",
    },
    {
      id: "team-members",
      icon: <HiOutlineUserGroup className="inline w-7 h-7 text-secondary" />,
      value: 34,
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
      value: 5,
      label: "Urgent Tasks",
    },
    {
      id: "tasks-complete",
      icon: <HiOutlineCheckCircle className="inline w-7 h-7 text-secondary" />,
      value: 120,
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
      value: 7,
      label: "Open RFIs",
    },
    {
      id: "conversation-awaiting",
      icon: <HiOutlineChatAlt2 className="inline w-7 h-7 text-secondary" />,
      value: 4,
      label: "Conversation Awaiting",
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
      value: 3,
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
      value: 320,
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
  const resourceAllocationData = {
    labels: ["Labor", "Equipment", "Materials", "Subcontractors"],
    datasets: [
      {
        label: "Allocation (%)",
        data: [40, 25, 20, 15],
        backgroundColor: ["#f87171", "#60a5fa", "#34d399", "#fbbf24"],
        borderWidth: 1,
      },
    ],
  };

  const safetyIncidentsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Incidents",
        data: [2, 1, 3, 0, 2, 1],
        backgroundColor: "rgba(251, 191, 36, 0.7)",
        borderColor: "#f59e42",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const clientSatisfactionData = {
    labels: ["Site A", "Site B", "Site C", "Site D"],
    datasets: [
      {
        label: "Satisfaction (%)",
        data: [92, 85, 78, 88],
        backgroundColor: [
          "rgba(96,165,250,0.7)",
          "rgba(16,185,129,0.7)",
          "rgba(251,113,133,0.7)",
          "rgba(253,224,71,0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const costBreakdownData = {
    labels: ["Labor", "Materials", "Equipment", "Overheads", "Misc"],
    datasets: [
      {
        label: "Cost ($K)",
        data: [120, 90, 60, 30, 10],
        backgroundColor: [
          "#6366f1",
          "#f472b6",
          "#facc15",
          "#34d399",
          "#60a5fa",
        ],
        borderWidth: 1,
      },
    ],
  };

  const rfiResponseTimeData = {
    labels: ["RFI-101", "RFI-102", "RFI-103", "RFI-104", "RFI-105"],
    datasets: [
      {
        label: "Response Time (days)",
        data: [2, 4, 1, 3, 2],
        backgroundColor: "rgba(59,130,246,0.7)",
        borderColor: "#2563eb",
        borderWidth: 2,
      },
    ],
  };

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
              y: { beginAtZero: true, stepSize: 1 },
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
      title: "RFI Response Time (System Admin/Subcontractor)",
      chart: (
        <Bar
          data={rfiResponseTimeData}
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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-6">
        System overview and key performance metrics
      </p>

      {/* Quick Actions */}
      <div className="bg-base-200 rounded-2xl p-6 border border-base-300 shadow-xl shadow-base-300 mb-6">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className={`btn ${action.className} w-full`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            value={card.value}
            label={card.label}
          />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {chartsGrid.map((item) => (
          <div
            key={item.key}
            className="bg-base-200 rounded-2xl p-6 border border-base-300 shadow-xl shadow-base-300 "
          >
            <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
            <div className="h-64">{item.chart}</div>
          </div>
        ))}
      </div>

      {/* Performance Chart - Full Width */}
      <div className="bg-base-200 rounded-2xl p-6 border border-base-300 mb-6 shadow-xl shadow-base-300 ">
        <h3 className="text-xl font-semibold mb-4">{lastChart[0].title}</h3>
        <div className="h-80">
          {}
          {lastChart[0].chart}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

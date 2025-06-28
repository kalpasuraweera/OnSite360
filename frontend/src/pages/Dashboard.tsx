import {
  HiOutlineChartBar,
  HiOutlineUserCircle,
  HiOutlineUsers,
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
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
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
    labels: ['Active', 'Completed', 'On Hold', 'Planning'],
    datasets: [
      {
        data: [32, 18, 5, 12],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#F59E0B',
          '#6B7280',
        ],
        borderWidth: 0,
      },
    ],
  };

  const monthlyActivityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Projects Started',
        data: [8, 12, 15, 10, 18, 14],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Projects Completed',
        data: [5, 8, 10, 12, 15, 16],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const performanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'System Performance (%)',
        data: [95, 98, 92, 96],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'User Activity (%)',
        data: [88, 85, 90, 87],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
        position: 'top' as const,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-6">
        System overview and key performance metrics
      </p>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<HiOutlineUsers className="inline w-7 h-7 text-secondary" />}
          value={247}
          label="Total Users"
        />
        <StatCard
          icon={
            <HiOutlineUserCircle className="inline w-7 h-7 text-secondary" />
          }
          value={89}
          label="Active Sessions"
        />
        <StatCard
          icon={<HiOutlineChartBar className="inline w-7 h-7 text-secondary" />}
          value="98%"
          label="System Health"
        />
        <StatCard
          icon={
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
          }
          value={3}
          label="Alerts"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Project Status Chart */}
        <div className="bg-base-100 rounded-2xl p-6 border border-base-300">
          <h3 className="text-xl font-semibold mb-4">Project Status Distribution</h3>
          <div className="h-64">
            <Doughnut data={projectStatusData} options={doughnutOptions} />
          </div>
        </div>

        {/* Monthly Activity Chart */}
        <div className="bg-base-100 rounded-2xl p-6 border border-base-300">
          <h3 className="text-xl font-semibold mb-4">Monthly Project Activity</h3>
          <div className="h-64">
            <Bar data={monthlyActivityData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Performance Chart - Full Width */}
      <div className="bg-base-100 rounded-2xl p-6 border border-base-300 mb-6">
        <h3 className="text-xl font-semibold mb-4">Performance Trends</h3>
        <div className="h-80">
          <Line data={performanceData} options={chartOptions} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-base-100 rounded-2xl p-6 border border-base-300">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-primary">Create New Project</button>
          <button className="btn btn-neutral">Generate Report</button>
          <button className="btn btn-accent">System Backup</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

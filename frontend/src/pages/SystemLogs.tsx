import { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Types for our system logs and metrics
interface ServerLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  message: string;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskSpace: {
    total: number;
    used: number;
    free: number;
  };
  uptime: number;
}

interface DatabaseMetrics {
  connections: number;
  queryResponseTime: number;
  size: number;
  tables: number;
  lastBackup: string;
}

interface UserActivityMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  activeSessionsCount: number;
}

const SystemLogs = () => {
  const [activeTab, setActiveTab] = useState("server_logs");
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [dbMetrics, setDbMetrics] = useState<DatabaseMetrics | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserActivityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logLevel, setLogLevel] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24h");

  // Mock data fetching - in a real app, these would be API calls
  useEffect(() => {
    // Simulate API loading delay
    setTimeout(() => {
      // Mock server logs
      setLogs([
        { 
          id: '1', 
          timestamp: '2023-07-12T14:32:15Z', 
          level: 'info', 
          source: 'auth-service',
          message: 'User authenticated successfully'
        },
        { 
          id: '2', 
          timestamp: '2023-07-12T14:35:22Z', 
          level: 'warning', 
          source: 'file-service',
          message: 'Storage space running low (15% remaining)'
        },
        { 
          id: '3', 
          timestamp: '2023-07-12T15:12:08Z', 
          level: 'error', 
          source: 'db-service',
          message: 'Database connection timeout after 30s'
        },
        { 
          id: '4', 
          timestamp: '2023-07-12T15:14:45Z', 
          level: 'critical', 
          source: 'api-gateway',
          message: 'Service unavailable - unable to process requests'
        },
        { 
          id: '5', 
          timestamp: '2023-07-12T15:18:32Z', 
          level: 'info', 
          source: 'monitoring',
          message: 'Daily system health check completed'
        },
      ]);

      // Mock system metrics
      setSystemMetrics({
        cpuUsage: 42,
        memoryUsage: 68,
        diskSpace: {
          total: 500,
          used: 320,
          free: 180
        },
        uptime: 1209600 // 14 days in seconds
      });

      // Mock database metrics
      setDbMetrics({
        connections: 24,
        queryResponseTime: 0.12,
        size: 4.2, // GB
        tables: 32,
        lastBackup: '2023-07-12T02:00:00Z'
      });

      // Mock user activity metrics
      setUserMetrics({
        totalUsers: 1250,
        activeUsers: 78,
        newUsersToday: 5,
        activeSessionsCount: 32
      });

      setIsLoading(false);
    }, 1000);
  }, []);

  // Format uptime from seconds to days, hours, minutes
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Format the timestamp to a more readable format
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get badge color based on log level
  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'info':
        return 'badge-info';
      case 'warning':
        return 'badge-warning';
      case 'error':
        return 'badge-error';
      case 'critical':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  // Filter logs based on selected level
  const filteredLogs = logs.filter(log => 
    logLevel === 'all' || log.level === logLevel
  );

  // Chart data for disk usage
  const diskUsageData = {
    labels: ['Used Space', 'Free Space'],
    datasets: [
      {
        data: systemMetrics ? [systemMetrics.diskSpace.used, systemMetrics.diskSpace.free] : [0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for user metrics
  const userMetricsData = {
    labels: ['Active Users', 'Inactive Users'],
    datasets: [
      {
        data: userMetrics ? [userMetrics.activeUsers, userMetrics.totalUsers - userMetrics.activeUsers] : [0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(201, 203, 207, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // System resource usage chart
  const systemResourceData = {
    labels: ['CPU', 'Memory'],
    datasets: [
      {
        label: 'Usage %',
        data: systemMetrics ? [systemMetrics.cpuUsage, systemMetrics.memoryUsage] : [0, 0],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">System Logs & Monitoring</h1>
      <p className="text-gray-500 mb-6">
        View system performance, logs, and metrics for troubleshooting and monitoring
      </p>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="system_logs_tab_group"
          className="tab"
          aria-label="Server Logs"
          checked={activeTab === "server_logs"}
          onChange={() => setActiveTab("server_logs")}
        />
        {activeTab === "server_logs" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Server Logs</h2>
                <div className="flex gap-2">
                  <select 
                    className="select select-bordered select-sm"
                    value={logLevel}
                    onChange={(e) => setLogLevel(e.target.value)}
                  >
                    <option value="all">All Levels</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                  <select 
                    className="select select-bordered select-sm"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="1h">Last Hour</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                  <button className="btn btn-sm btn-outline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                  <button className="btn btn-sm btn-outline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : filteredLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Source</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                          <td>
                            <span className={`badge ${getLogLevelBadge(log.level)} badge-sm`}>
                              {log.level.toUpperCase()}
                            </span>
                          </td>
                          <td>{log.source}</td>
                          <td className="break-all">{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No logs found matching your filter criteria.
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing {filteredLogs.length} of {logs.length} logs
                </div>
                <div className="join">
                  <button className="join-item btn btn-sm">«</button>
                  <button className="join-item btn btn-sm">1</button>
                  <button className="join-item btn btn-sm btn-active">2</button>
                  <button className="join-item btn btn-sm">3</button>
                  <button className="join-item btn btn-sm">»</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="system_logs_tab_group"
          className="tab"
          aria-label="System Health"
          checked={activeTab === "system_health"}
          onChange={() => setActiveTab("system_health")}
        />
        {activeTab === "system_health" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">System Health & Performance</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : systemMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* System Overview Stats */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-bold mb-3">System Overview</h3>
                    <div className="stats stats-vertical shadow w-full">
                      <div className="stat">
                        <div className="stat-title">CPU Usage</div>
                        <div className="stat-value">{systemMetrics.cpuUsage}%</div>
                        <div className="stat-desc">
                          <progress 
                            className={`progress w-full ${systemMetrics.cpuUsage > 80 ? 'progress-error' : 'progress-success'}`} 
                            value={systemMetrics.cpuUsage} 
                            max="100"
                          ></progress>
                        </div>
                      </div>
                      
                      <div className="stat">
                        <div className="stat-title">Memory Usage</div>
                        <div className="stat-value">{systemMetrics.memoryUsage}%</div>
                        <div className="stat-desc">
                          <progress 
                            className={`progress w-full ${systemMetrics.memoryUsage > 80 ? 'progress-error' : 'progress-success'}`} 
                            value={systemMetrics.memoryUsage} 
                            max="100"
                          ></progress>
                        </div>
                      </div>
                      
                      <div className="stat">
                        <div className="stat-title">System Uptime</div>
                        <div className="stat-value text-lg">{formatUptime(systemMetrics.uptime)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Disk Usage */}
                  <div className="bg-base-100 p-4 rounded-xl flex flex-col">
                    <h3 className="text-lg font-bold mb-3">Disk Usage</h3>
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div style={{ width: '180px', height: '180px' }}>
                        <Pie data={diskUsageData} />
                      </div>
                      <div className="stats shadow mt-3 w-full">
                        <div className="stat">
                          <div className="stat-title">Total Space</div>
                          <div className="stat-value text-lg">{systemMetrics.diskSpace.total} GB</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">Used Space</div>
                          <div className="stat-value text-lg">{systemMetrics.diskSpace.used} GB</div>
                          <div className="stat-desc">
                            {Math.round((systemMetrics.diskSpace.used / systemMetrics.diskSpace.total) * 100)}% used
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resource Usage Over Time */}
                  <div className="bg-base-100 p-4 rounded-xl md:col-span-2">
                    <h3 className="text-lg font-bold mb-3">Resource Usage</h3>
                    <Bar 
                      data={systemResourceData}
                      options={{
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: 'Usage %'
                            }
                          }
                        },
                        plugins: {
                          title: {
                            display: true,
                            text: 'Current System Resource Usage'
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No system metrics available. Please check your monitoring service.
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="radio"
          name="system_logs_tab_group"
          className="tab"
          aria-label="Database"
          checked={activeTab === "database"}
          onChange={() => setActiveTab("database")}
        />
        {activeTab === "database" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">Database Metrics</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : dbMetrics ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="stat bg-base-100 rounded-xl shadow">
                      <div className="stat-title">Active Connections</div>
                      <div className="stat-value">{dbMetrics.connections}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-xl shadow">
                      <div className="stat-title">Avg Query Time</div>
                      <div className="stat-value">{dbMetrics.queryResponseTime}s</div>
                    </div>
                    <div className="stat bg-base-100 rounded-xl shadow">
                      <div className="stat-title">Database Size</div>
                      <div className="stat-value">{dbMetrics.size} GB</div>
                    </div>
                    <div className="stat bg-base-100 rounded-xl shadow">
                      <div className="stat-title">Total Tables</div>
                      <div className="stat-value">{dbMetrics.tables}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-base-100 p-4 rounded-xl">
                      <h3 className="text-lg font-bold mb-3">Backup Status</h3>
                      <div className="overflow-x-auto">
                        <table className="table w-full">
                          <tbody>
                            <tr>
                              <td className="font-medium">Last Backup</td>
                              <td>{new Date(dbMetrics.lastBackup).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td className="font-medium">Backup Status</td>
                              <td><span className="badge badge-success">Successful</span></td>
                            </tr>
                            <tr>
                              <td className="font-medium">Backup Size</td>
                              <td>3.8 GB</td>
                            </tr>
                            <tr>
                              <td className="font-medium">Backup Retention</td>
                              <td>30 days</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <button className="btn btn-sm btn-primary mt-4">Run Manual Backup</button>
                    </div>

                    <div className="bg-base-100 p-4 rounded-xl">
                      <h3 className="text-lg font-bold mb-3">Recent Database Operations</h3>
                      <div className="overflow-x-auto">
                        <table className="table w-full">
                          <thead>
                            <tr>
                              <th>Time</th>
                              <th>Operation</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>10:32 AM</td>
                              <td>Index Rebuild</td>
                              <td><span className="badge badge-success">Completed</span></td>
                            </tr>
                            <tr>
                              <td>09:15 AM</td>
                              <td>Schema Update</td>
                              <td><span className="badge badge-success">Completed</span></td>
                            </tr>
                            <tr>
                              <td>08:05 AM</td>
                              <td>Scheduled Backup</td>
                              <td><span className="badge badge-success">Completed</span></td>
                            </tr>
                            <tr>
                              <td>Yesterday 11:42 PM</td>
                              <td>Vacuum Full</td>
                              <td><span className="badge badge-success">Completed</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No database metrics available. Please check your database connection.
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="radio"
          name="system_logs_tab_group"
          className="tab"
          aria-label="User Activity"
          checked={activeTab === "user_activity"}
          onChange={() => setActiveTab("user_activity")}
        />
        {activeTab === "user_activity" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">User Activity Monitoring</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : userMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-bold mb-3">User Statistics</h3>
                    <div className="stats stats-vertical shadow w-full">
                      <div className="stat">
                        <div className="stat-title">Total Registered Users</div>
                        <div className="stat-value">{userMetrics.totalUsers}</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">Currently Active Users</div>
                        <div className="stat-value">{userMetrics.activeUsers}</div>
                        <div className="stat-desc">{Math.round((userMetrics.activeUsers / userMetrics.totalUsers) * 100)}% of total users</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">New Users Today</div>
                        <div className="stat-value">{userMetrics.newUsersToday}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-base-100 p-4 rounded-xl flex flex-col">
                    <h3 className="text-lg font-bold mb-3">User Activity Distribution</h3>
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div style={{ width: '180px', height: '180px' }}>
                        <Pie data={userMetricsData} />
                      </div>
                      <div className="stats shadow mt-3 w-full">
                        <div className="stat">
                          <div className="stat-title">Active Sessions</div>
                          <div className="stat-value">{userMetrics.activeSessionsCount}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-base-100 p-4 rounded-xl md:col-span-2">
                    <h3 className="text-lg font-bold mb-3">Recent Login Activity</h3>
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>User</th>
                            <th>IP Address</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>10:45 AM</td>
                            <td>john.doe@example.com</td>
                            <td>192.168.1.105</td>
                            <td><span className="badge badge-success">Success</span></td>
                          </tr>
                          <tr>
                            <td>10:32 AM</td>
                            <td>sarah.smith@example.com</td>
                            <td>192.168.1.127</td>
                            <td><span className="badge badge-success">Success</span></td>
                          </tr>
                          <tr>
                            <td>10:15 AM</td>
                            <td>unknown@example.com</td>
                            <td>45.238.12.72</td>
                            <td><span className="badge badge-error">Failed</span></td>
                          </tr>
                          <tr>
                            <td>09:58 AM</td>
                            <td>michael.brown@example.com</td>
                            <td>192.168.1.114</td>
                            <td><span className="badge badge-success">Success</span></td>
                          </tr>
                          <tr>
                            <td>09:42 AM</td>
                            <td>emily.jones@example.com</td>
                            <td>192.168.1.132</td>
                            <td><span className="badge badge-success">Success</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No user activity metrics available.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import AppLayout from "./components/AppLayout";
import PermissionManagement from "./pages/PermissionManagement";
import PermissionRoute from "./components/PermissionRoute";
import ScheduleManagement from "./pages/ScheduleManagement";
import { useSystemStore } from "./stores/useSystemStore";
import Integrations from "./pages/Integrations";
import SystemLogs from "./pages/SystemLogs";
import ProjectOversight from "./pages/ProjectOversight";
import EmployeeManagement from "./pages/EmployeeManagement";
import Communication from "./pages/Communication";
import DocumentManagement from "./pages/DocumentManagement";
import ScheduleManagement from "./pages/ScheduleManagement";
import TaskManagement from "./pages/TaskManagement";
import WorkforceManagement from "./pages/WorkforceManagement";

const queryClient = new QueryClient();

function App() {
  const theme = useSystemStore((state) => state.theme);

  // Apply theme to document when component mounts or theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute redirectTo="/home">
          <AppLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "",
          element: (
            <PermissionRoute pageId="dashboard">
              <Dashboard />
            </PermissionRoute>
          ),
        },
        {
          path: "dashboard",
          element: (
            <PermissionRoute pageId="dashboard">
              <Dashboard />
            </PermissionRoute>
          ),
        },
        {
          path: "role-management",
          element: (
            <PermissionRoute pageId="role-management">
              <RoleManagement />
            </PermissionRoute>
          ),
        },
        {
          path: "user-management",
          element: (
            <PermissionRoute pageId="user-management">
              <UserManagement />
            </PermissionRoute>
          ),
        },
        {
          path: "permission-management",
          element: (
            <PermissionRoute pageId="permission-management">
              <PermissionManagement />
            </PermissionRoute>
          ),
        },
        {
          path: "integrations",
          element: (
            <PermissionRoute pageId="integrations">
              <Integrations />
            </PermissionRoute>
          ),
        },
        {
          path: "system-logs",
          element: (
            <PermissionRoute pageId="system-logs">
              <SystemLogs />
            </PermissionRoute>
          ),
        },
        {
          path: "project-oversight",
          element: (
            <PermissionRoute pageId="project-oversight">
              <ProjectOversight />
            </PermissionRoute>
          ),
        },
        {
          path: "employee-management",
          element: (
            <PermissionRoute pageId="employee-management">
              <EmployeeManagement />
            </PermissionRoute>
          ),
        },
        {
          path: "communication",
          element: (
            <PermissionRoute pageId="communication">
              <Communication />
            </PermissionRoute>
          ),
        },
        {
          path: "schedule-management",
          element: (
            <PermissionRoute pageId="schedule-management">
              <ScheduleManagement />
            </PermissionRoute>
          ),
        },
        {
          path: "document-management",
          element: (
            <PermissionRoute pageId="document-management">
              <DocumentManagement />
            </PermissionRoute>
          ),
        },
        {
          path: "schedule-management",
          element: (
            <PermissionRoute pageId="schedule-management">
              <ScheduleManagement />
            </PermissionRoute>
          ),
        },
        {
          path: "task-management",
          element: (
            <PermissionRoute pageId="task-management">
              <TaskManagement />
            </PermissionRoute>
          ),
        },
        {
          path: "workforce-management",
          element: (
            <PermissionRoute pageId="workforce-management">
              <WorkforceManagement />
            </PermissionRoute>
          ),
        },
        { path: "*", element: <NotFound /> },
      ],
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;

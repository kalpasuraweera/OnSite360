import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import Schedule from "./pages/Schedule";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import AppLayout from "./components/AppLayout";
import DashboardSettings from "./pages/DashboardSettings";
import DashboardReports from "./pages/DashboardReports";

const queryClient = new QueryClient();

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute redirectTo="/home">
          <AppLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "", element: <Dashboard /> }, // / (dashboard home)
        { path: "dashboard", element: <Dashboard /> }, // /dashboard
        { path: "schedule-management", element: <Schedule /> }, // /schedule
        { path: "settings", element: <DashboardSettings /> }, // /settings
        { path: "reports", element: <DashboardReports /> }, // /reports
        { path: "user-management", element: <UserManagement /> }, // /user-management
        { path: "*", element: <NotFound /> }, // Catch-all route for undefined paths
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

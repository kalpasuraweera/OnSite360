import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./SideBar";
import TopNav from "./TopNav";
import { useAuthStore } from "../stores/useAuthStore";

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate("/login");
  };

  const permissions = [
    {
      page_id: "dashboard",
      page_name: "Dashboard",
      level: "read-write",
      components: [],
    },
    {
      page_id: "settings",
      page_name: "Settings",
      level: "read-write",
      components: [],
    },
    {
      page_id: "reports",
      page_name: "Reports",
      level: "read-write",
      components: [],
    },
    {
      page_id: "document-management",
      page_name: "Document Management",
      level: "read-write",
      components: [
        {
          component_id: "upload-document",
          component_name: "Upload Document",
          level: "write",
        },
        {
          component_id: "view-document",
          component_name: "View Document",
          level: "read",
        },
        {
          component_id: "edit-document",
          component_name: "Edit Document",
          level: "write",
        },
        {
          component_id: "delete-document",
          component_name: "Delete Document",
          level: "write",
        },
      ],
    },
    {
      page_id: "user-management",
      page_name: "User Management",
      level: "read-write",
      components: [],
    },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar
        permissions={permissions}
        activeRoute={location.pathname}
        onNavigate={(path) => navigate(path)}
      />
      <div className="flex-1 flex flex-col">
        <TopNav onNavigate={(path) => navigate(path)} onLogout={handleLogout} />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;

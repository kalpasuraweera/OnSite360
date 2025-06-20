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

  const permissions =
    useAuthStore((state) => state.user?.role?.rolePermissions) || [];

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

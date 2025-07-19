import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./SideBar";
import TopNav from "./TopNav";
import { useAuthStore } from "../stores/useAuthStore";
import { useSystemStore } from "../stores/useSystemStore";

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setIsMobile = useSystemStore((state) => state.setIsMobile);

  // Handle mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [setIsMobile]);

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
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onNavigate={(path) => navigate(path)} onLogout={handleLogout} />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;

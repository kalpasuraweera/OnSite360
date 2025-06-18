import { useState } from "react";
import type { Permission } from "../types/database";
import {
  HiOutlineHome,
  HiOutlineMenu,
  HiOutlineUserCircle,
} from "react-icons/hi";
import { useAuthStore } from "../stores/useAuthStore";

// Sidebar Component
const Sidebar = ({
  permissions,
  activeRoute,
  onNavigate,
}: {
  permissions: Permission[];
  activeRoute: string;
  onNavigate: (path: string) => void;
}) => {
  const accessiblePages = permissions.filter(
    (p) => p.level === "read" || p.level === "read-write"
  );
  const user = useAuthStore((s) => s.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-16"
      } bg-base-200 border border-base-300 transition-all duration-200 flex flex-col`}
    >
      <div className="flex flex-col gap-2 px-4 py-4">
        <button
          className="btn btn-ghost btn-circle"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          <HiOutlineMenu className="w-6 h-6" />
        </button>
        {sidebarOpen && (
          <div className="flex flex-col bg-base-300 w-full p-2 rounded-2xl">
            <span className="font-bold text-lg">
              {user?.firstName || "User"}
            </span>
            <p className="text-sm">user@gmail.com</p>
          </div>
        )}
      </div>
      <nav className="flex-1">
        <ul className="menu p-2 w-full mt-5">
          {accessiblePages.map((page) => (
            <li key={page.page_id}>
              <a
                className={`flex text-neutral items-center gap-3 px-4 py-2 hover:bg-base-300 w-full ${
                  activeRoute === `/${page.page_id}` ? "bg-neutral-focus" : ""
                }`}
                onClick={() => onNavigate(`/${page.page_id}`)}
              >
                <HiOutlineHome className="w-5 h-5" />
                {sidebarOpen && page.page_name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 py-4 border-t">
        <div className="flex items-center gap-2">
          <HiOutlineUserCircle className="w-6 h-6" />
          {sidebarOpen && <span className="text-sm">System Administrator</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

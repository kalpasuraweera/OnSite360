import type { Permission } from "../types/database";
import { HiOutlineHome } from "react-icons/hi";
import { useSystemStore } from "../stores/useSystemStore";

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
  const accessiblePages = permissions
    .filter((p) => p.level === 1 || p.level === 2 || p.level === 3)
    .map((p) => ({
      page_id: p.permission.pageId,
      page_name: p.permission.pageName,
    }));
  const sidebarOpen = useSystemStore((s) => s.sidebarOpen);
  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-16"
      } bg-base-200 border border-base-300 transition-all duration-200 flex flex-col`}
    >
      <div className="flex flex-col gap-2 px-4 py-4">
        {/* Sidebar toggle button is now handled in TopNav via useSystemStore */}
        {sidebarOpen && (
          <img
            src="/logo.png"
            alt="Logo"
            className="w-52 flex justify-center"
          />
        )}
      </div>
      <nav className="flex-1">
        <ul className="menu p-2 w-full mt-5">
          {accessiblePages.map((page) => (
            <li key={page.page_id}>
              <a
                className={`flex text-base-content items-center gap-3 px-4 py-2 hover:bg-base-300 w-full ${
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
    </div>
  );
};

export default Sidebar;

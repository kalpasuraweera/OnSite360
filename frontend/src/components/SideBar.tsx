import type { Permission } from "../types/database";
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
    }))
    .sort((a, b) => {
      // Always put dashboard first
      if (a.page_id === "dashboard") return -1;
      if (b.page_id === "dashboard") return 1;
      // Otherwise maintain alphabetical order by page_name
      return a.page_name.localeCompare(b.page_name);
    });
  const sidebarOpen = useSystemStore((s) => s.sidebarOpen);
  const setSidebarOpen = useSystemStore((s) => s.setSidebarOpen);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 top-0 left-0 h-full z-50 lg:z-auto
        ${sidebarOpen ? "w-64 min-w-64" : "lg:w-16"} 
        bg-base-200 border-r border-base-300 transition-all duration-200 flex flex-col`}
      >
        <div className="flex flex-col gap-2 px-4 py-4">
          {/* Show logo on mobile when sidebar is open, or on desktop when expanded */}
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
                  className={`flex text-base-content items-center gap-3 px-4 py-3 hover:bg-base-300 w-full rounded-lg ${
                    activeRoute === `/${page.page_id}` ? "bg-neutral-focus" : ""
                  }`}
                  onClick={() => {
                    onNavigate(`/${page.page_id}`);
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  {/* Show page name when sidebar is open */}
                  {sidebarOpen && (
                    <span className="truncate">{page.page_name}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

import {
  HiOutlineBell,
  HiOutlineChatAlt2,
  HiOutlineUserCircle,
  HiOutlineLogout,
} from "react-icons/hi";
import { useAuthStore } from "../stores/useAuthStore";

const TopNav = ({
  onLogout,
  onNavigate,
}: {
  onLogout: () => void;
  onNavigate: (path: string) => void;
}) => {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="navbar flex justify-between items-center gap-4 bg-base-200 border border-base-300 rounded-2xl p-2">
      <img src="/logo.png" alt="Logo" className="w-44 flex justify-center" />
      <div className="flex items-center gap-4 p-1">
        {/* Notification count */}
        <button className="btn btn-ghost btn-circle relative">
          <HiOutlineBell className="w-6 h-6" />
          <span className="badge badge-error badge-xs absolute top-0 right-0">
            3
          </span>
        </button>

        {/* Conversation count */}
        <button className="btn btn-ghost btn-circle relative">
          <HiOutlineChatAlt2 className="w-6 h-6" />
          <span className="badge badge-primary badge-xs absolute top-0 right-0">
            7
          </span>
        </button>

        {/* User Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <div className="flex items-center gap-2">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="flex items-center justify-center">
                <HiOutlineUserCircle className="w-6 h-6 text-gray-500" />
              </div>
            </label>
            <span className="badge badge-base-300">{user?.firstName}</span>
          </div>

          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-200 rounded-box w-52"
          >
            <li>
              <button onClick={() => onNavigate("/profile")}>Profile</button>
            </li>
            <li>
              <button onClick={() => onNavigate("/settings")}>Settings</button>
            </li>
            <li className="text-error">
              <button
                onClick={onLogout}
                className="flex justify-between items-center"
              >
                Logout
                <HiOutlineLogout className="w-5 h-5 ml-2" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TopNav;

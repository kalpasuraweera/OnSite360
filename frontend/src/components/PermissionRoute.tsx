import React from "react";// Adjust import to your user context/hook
import { useAuthStore } from "../stores/useAuthStore";
import NotAllowed from "./NotAllowed";

interface PermissionRouteProps {
  pageId: string;
  children: React.ReactNode;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ pageId, children }) => {
  const user = useAuthStore((state) => state.user);

  if (!user?.role?.rolePermissions.some((permission) => permission.permission.pageId === pageId)) {
    return <NotAllowed />;
  }

  return <>{children}</>;
};

export default PermissionRoute;
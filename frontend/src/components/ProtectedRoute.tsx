import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

interface ProtectedRouteProps {
    children: ReactNode;
    redirectTo?: string; // Optional redirect path
}

const ProtectedRoute = ({ 
    children, 
    redirectTo = "/login" // Default value is "/login"
}: ProtectedRouteProps) => {
    const token = useAuthStore((state) => state.token);

    if (!token) {
        // Redirect to specified route if not authenticated
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

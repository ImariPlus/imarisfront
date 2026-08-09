import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id: string;
  role: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let redirectTo: string | null = null;

  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const { role } = jwtDecode<JwtPayload>(token);
      if (!allowedRoles.includes(role)) {
        redirectTo = "/dashboard";
      }
    } catch {
      redirectTo = "/login";
    }
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
import { Navigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export default function RequireAdmin({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="p-8 text-muted-foreground">Φόρτωση...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

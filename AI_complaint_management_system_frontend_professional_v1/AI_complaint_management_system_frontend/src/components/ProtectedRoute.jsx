import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

function ProtectedRoute({ children, roles, role }) {
  const user = getUser();

  // Redirect users who are not logged in
  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  // Support both "role" and "roles" props
  const allowedRoles = roles || (role ? [role] : null);

  // Redirect users who don't have permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardRoutes = {
      STUDENT: "/student",
      ADMIN: "/admin",
      STAFF: "/staff",
      HOSTEL_WARDEN: "/warden",
      SECURITY: "/security",
    };

    return (
      <Navigate
        to={dashboardRoutes[user.role] || "/login"}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
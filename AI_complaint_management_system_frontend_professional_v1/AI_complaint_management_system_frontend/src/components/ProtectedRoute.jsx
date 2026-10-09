import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

function ProtectedRoute({ children, roles, role }) {
  const user = getUser();

  // Send users without a valid login token to the login page
  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  // Support both the old "role" prop and the new "roles" array
  const allowedRoles = roles || (role ? [role] : null);

  // Prevent users from opening dashboards they are not allowed to access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
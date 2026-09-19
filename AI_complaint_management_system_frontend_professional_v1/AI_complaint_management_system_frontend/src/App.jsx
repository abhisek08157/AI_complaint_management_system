import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/student/StudentDashboard";
import SubmitComplaint from "./pages/student/SubmitComplaint";
import MyComplaints from "./pages/student/MyComplaints";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageComplaints from "./pages/admin/ManageComplaints";
import ManageStaff from "./pages/admin/ManageStaff";

import StaffDashboard from "./pages/staff/StaffDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/submit"
          element={
            <ProtectedRoute role="STUDENT">
              <SubmitComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/complaints"
          element={
            <ProtectedRoute role="STUDENT">
              <MyComplaints />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute role="ADMIN">
              <ManageComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute role="ADMIN">
              <ManageStaff />
            </ProtectedRoute>
          }
        />

        {/* Staff */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute role="STAFF">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
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
import Notifications from "./pages/student/Notifications";
import Announcements from "./pages/student/Announcements";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageComplaints from "./pages/admin/ManageComplaints";
import ManageStaff from "./pages/admin/ManageStaff";
import ManageAnnouncements from "./pages/admin/ManageAnnouncements";

import StaffDashboard from "./pages/staff/StaffDashboard";

import WardenDashboard from "./pages/warden/WardenDashboard";
import SecurityDashboard from "./pages/security/SecurityDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Student routes */}
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

        
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute role="STUDENT">
              <Notifications />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/student/announcements"
          element={
            <ProtectedRoute role="STUDENT">
              <Announcements />
            </ProtectedRoute>
          }
        />



        {/* Admin routes */}
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

        
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute role="ADMIN">
              <ManageAnnouncements />
            </ProtectedRoute>
          }
        />


        {/* Staff route */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute role="STAFF">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Hostel Warden route */}
        <Route
          path="/warden"
          element={
            <ProtectedRoute role="HOSTEL_WARDEN">
              <WardenDashboard />
            </ProtectedRoute>
          }
        />

        {/* Security route */}
        <Route
          path="/security"
          element={
            <ProtectedRoute role="SECURITY">
              <SecurityDashboard />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
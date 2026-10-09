
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
import StudentFees from "./pages/student/StudentFees";
import StudentTimetable from "./pages/student/StudentTimetable";
import StudentMessMenu from "./pages/student/StudentMessMenu";
import StudentGatePass from "./pages/student/StudentGatePass";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
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

        {/* Student dashboard */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student complaints */}
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

        {/* Student notifications */}
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute role="STUDENT">
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Student announcements */}
        <Route
          path="/student/announcements"
          element={
            <ProtectedRoute role="STUDENT">
              <Announcements />
            </ProtectedRoute>
          }
        />

        {/* Student fees and payments */}
        <Route
          path="/student/fees"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentFees />
            </ProtectedRoute>
          }
        />

        {/* Student timetable */}
        <Route
          path="/student/timetable"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentTimetable />
            </ProtectedRoute>
          }
        />

        {/* Combined student mess menu and feedback page */}
        <Route
          path="/student/mess-menu"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentMessMenu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/gate-pass"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentGatePass />
            </ProtectedRoute>
          }
        />

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* Admin analytics and AI insights */}
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Admin complaint management */}
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute role="ADMIN">
              <ManageComplaints />
            </ProtectedRoute>
          }
        />

        {/* Admin staff management */}
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute role="ADMIN">
              <ManageStaff />
            </ProtectedRoute>
          }
        />

        {/* Admin announcement management */}
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute role="ADMIN">
              <ManageAnnouncements />
            </ProtectedRoute>
          }
        />

        {/* Staff dashboard */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute role="STAFF">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Hostel warden dashboard */}
        <Route
          path="/warden"
          element={
            <ProtectedRoute role="HOSTEL_WARDEN">
              <WardenDashboard />
            </ProtectedRoute>
          }
        />

        {/* Security dashboard */}
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

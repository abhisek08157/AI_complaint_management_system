import { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await API.get(
        "/admin/dashboard"
      );

      setStats(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load dashboard"
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="app-page">
      <h1>Admin Dashboard</h1>

      {error && (
        <div className="error">{error}</div>
      )}

      {stats && (
        <div className="stats-grid">

          <div className="stat-card">
            <h3>Total Complaints</h3>
            <h2>{stats.total}</h2>
          </div>

          <div className="stat-card">
            <h3>Submitted</h3>
            <h2>{stats.submitted}</h2>
          </div>

          <div className="stat-card">
            <h3>Assigned</h3>
            <h2>{stats.assigned}</h2>
          </div>

          <div className="stat-card">
            <h3>In Progress</h3>
            <h2>{stats.inProgress}</h2>
          </div>

          <div className="stat-card">
            <h3>Resolved</h3>
            <h2>{stats.resolved}</h2>
          </div>

        </div>
      )}
      </div>
    </>
  );
}

export default AdminDashboard;
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { getUser } from "../../utils/auth";
import Navbar from "../../components/Navbar";
import ComplaintCard from "../../components/ComplaintCard";

function StudentDashboard() {
  const user = getUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const response = await API.get(`/complaints/user/${user.userId}`);
        setComplaints(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadComplaints();
  }, [user.userId]);

  const stats = useMemo(() => {
    const count = (status) => complaints.filter((item) => item.status === status).length;
    return {
      total: complaints.length,
      submitted: count("SUBMITTED"),
      inProgress: count("IN_PROGRESS"),
      resolved: count("RESOLVED"),
    };
  }, [complaints]);

  return (
    <>
      <Navbar />
      <main className="app-page">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">STUDENT PORTAL</p>
            <h1>Welcome back, {user.name?.split(" ")[0] || "Student"} <span>👋</span></h1>
            <p className="page-subtitle">Report campus issues and track their resolution in one place.</p>
          </div>
          <Link className="primary-button" to="/student/submit">＋ New Complaint</Link>
        </section>

        {error && <div className="alert error">{error}</div>}

        <section className="stats-grid student-stats">
          <div className="stat-card"><span className="stat-icon blue">▤</span><div><p>Total Complaints</p><h2>{loading ? "—" : stats.total}</h2></div></div>
          <div className="stat-card"><span className="stat-icon amber">◷</span><div><p>Submitted</p><h2>{loading ? "—" : stats.submitted}</h2></div></div>
          <div className="stat-card"><span className="stat-icon purple">↻</span><div><p>In Progress</p><h2>{loading ? "—" : stats.inProgress}</h2></div></div>
          <div className="stat-card"><span className="stat-icon green">✓</span><div><p>Resolved</p><h2>{loading ? "—" : stats.resolved}</h2></div></div>
        </section>

        <section className="section-heading">
          <div><h2>Recent complaints</h2><p>Keep track of your latest submissions.</p></div>
          <Link className="text-link" to="/student/complaints">View all →</Link>
        </section>

        {loading ? <div className="empty-state">Loading your complaints...</div> :
          complaints.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">▤</div><h3>No complaints yet</h3><p>Submit your first complaint to get started.</p><Link className="primary-button" to="/student/submit">Submit Complaint</Link></div>
          ) : (
            <div className="complaint-grid">{complaints.slice(0, 3).map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} compact />)}</div>
          )}
      </main>
    </>
  );
}

export default StudentDashboard;

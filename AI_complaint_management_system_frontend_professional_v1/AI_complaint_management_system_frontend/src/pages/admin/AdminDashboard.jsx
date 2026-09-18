import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../../components/Navbar";
import ComplaintCard from "../../components/ComplaintCard";

function AdminDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await API.get("/admin/complaints");
      setComplaints(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load dashboard complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const count = (status) =>
      complaints.filter((item) => item.status === status).length;
    return {
      total: complaints.length,
      submitted: count("SUBMITTED"),
      assigned: count("ASSIGNED"),
      inProgress: count("IN_PROGRESS"),
      resolved: count("RESOLVED"),
    };
  }, [complaints]);

  return (
    <>
      <Navbar />
      <main className="app-page">
        <style>{`
          .app-page {
            width: 100%;
            min-height: calc(100vh - 68px);
            background-color: #F8F4EB;
            padding: 40px 48px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: #2C1F1D;
            box-sizing: border-box;
          }

          .dashboard-header {
            margin-bottom: 32px;
          }

          .dashboard-header h1 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 8px;
            letter-spacing: -0.01em;
          }

          .dashboard-header p {
            font-size: 15px;
            color: #72635B;
            margin: 0;
          }

          .alert.error {
            background: #FDF2F0;
            border: 1px solid #F3C2BA;
            color: #9C2A1B;
            font-size: 14px;
            padding: 14px 18px;
            border-radius: 10px;
            margin-bottom: 24px;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            width: 100%;
            margin-bottom: 40px;
          }

          .stat-card {
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 14px;
            padding: 20px 24px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            box-shadow: 0 8px 24px -6px rgba(44, 31, 29, 0.04);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .stat-card.clickable {
            cursor: pointer;
            background: #2C1F1D;
            border-color: #2C1F1D;
            color: #F8F4EB;
          }

          .stat-card.clickable:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px -4px rgba(44, 31, 29, 0.2);
            background: #3A2A27;
          }

          .stat-card.clickable p {
            color: #C88A2E;
          }

          .stat-card.clickable h2 {
            color: #FFFFFF;
          }

          .stat-card p {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #72635B;
            margin: 0 0 8px;
          }

          .stat-card h2 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0;
            line-height: 1;
          }

          .section-heading {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 20px;
            border-bottom: 1px solid #EFE8DA;
            padding-bottom: 12px;
          }

          .section-heading h2 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 22px;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 4px;
          }

          .section-heading p {
            font-size: 14px;
            color: #72635B;
            margin: 0;
          }

          .text-link {
            color: #C88A2E;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            transition: color 0.2s ease;
          }

          .text-link:hover {
            color: #2C1F1D;
          }

          .complaint-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 24px;
            width: 100%;
          }

          .empty-state {
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 14px;
            padding: 48px 24px;
            text-align: center;
            color: #72635B;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            box-shadow: 0 8px 24px -6px rgba(44, 31, 29, 0.04);
          }

          .empty-icon {
            font-size: 32px;
            color: #D3C7B6;
          }

          .empty-state h3 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 20px;
            color: #2C1F1D;
            margin: 0;
          }

          .empty-state p {
            font-size: 14px;
            margin: 0;
          }

          @media (max-width: 600px) {
            .app-page {
              padding: 24px 16px;
            }
          }
        `}</style>

        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Overview of incoming, active, and completed campus complaints.</p>
        </div>

        {error && <div className="alert error">{error}</div>}

        <section className="stats-grid">
          {/* Redirects to Manage Complaints on click */}
          <div
            className="stat-card clickable"
            onClick={() => navigate("/admin/complaints")}
            title="Click to manage all complaints"
          >
            <p>Total Complaints →</p>
            <h2>{loading ? "—" : stats.total}</h2>
          </div>

          <div className="stat-card">
            <p>Submitted</p>
            <h2>{loading ? "—" : stats.submitted}</h2>
          </div>

          <div className="stat-card">
            <p>Assigned</p>
            <h2>{loading ? "—" : stats.assigned}</h2>
          </div>

          <div className="stat-card">
            <p>In Progress</p>
            <h2>{loading ? "—" : stats.inProgress}</h2>
          </div>

          <div className="stat-card">
            <p>Resolved</p>
            <h2>{loading ? "—" : stats.resolved}</h2>
          </div>
        </section>

        <section className="section-heading">
          <div>
            <h2>Current Complaints</h2>
            <p>Recent campus issues requiring review or active handling.</p>
          </div>
          <Link className="text-link" to="/admin/complaints">
            Manage all →
          </Link>
        </section>

        {loading ? (
          <div className="empty-state">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">▤</div>
            <h3>No complaints found</h3>
            <p>There are no active or recent complaints in the system.</p>
          </div>
        ) : (
          <div className="complaint-grid">
            {complaints.slice(0, 6).map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default AdminDashboard;
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API from "../../services/api";
import { getUser } from "../../utils/auth";
import Navbar from "../../components/Navbar";
import ComplaintCard from "../../components/ComplaintCard";

function StudentDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComplaints = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/complaints/my");

      setComplaints(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const stats = useMemo(() => {
    const count = (status) =>
      complaints.filter(
        (item) => item.status?.toUpperCase() === status
      ).length;

    return {
      total: complaints.length,
      submitted: count("SUBMITTED"),
      assigned: count("ASSIGNED"),
      inProgress: count("IN_PROGRESS"),
      resolved: count("RESOLVED"),
      closed: count("CLOSED"),
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
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: #2C1F1D;
            box-sizing: border-box;
          }

          .welcome-row {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 32px;
          }

          .eyebrow {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #C88A2E;
            margin: 0 0 6px;
          }

          .welcome-row h1 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 8px;
            line-height: 1.2;
          }

          .page-subtitle {
            font-size: 15px;
            color: #72635B;
            margin: 0;
          }

          .primary-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: #2C1F1D;
            color: #F8F4EB;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(44, 31, 29, 0.12);
            white-space: nowrap;
            border: none;
            cursor: pointer;
          }

          .primary-button:hover {
            background: #C88A2E;
            color: #2C1F1D;
            transform: translateY(-1px);
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
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            width: 100%;
            margin-bottom: 40px;
          }

          .stat-card {
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 14px;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: 0 8px 24px -6px rgba(44, 31, 29, 0.04);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-sizing: border-box;
            min-width: 0;
          }

          .stat-card.clickable {
            cursor: pointer;
          }

          .stat-card.clickable:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px -4px rgba(44, 31, 29, 0.1);
            border-color: #C88A2E;
          }

          .stat-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
          }

          .stat-icon.blue {
            background: #2C1F1D;
            color: #FAF6EE;
          }

          .stat-icon.amber {
            background: #FDF8ED;
            color: #C88A2E;
            border: 1px solid #E2D7C3;
          }

          .stat-icon.purple {
            background: #FAF0E6;
            color: #9A5B2C;
            border: 1px solid #EAD2C1;
          }

          .stat-icon.green {
            background: #F0F7F4;
            color: #2D6A4F;
            border: 1px solid #C2E2D3;
          }

          .stat-card p {
            font-size: 12.5px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #72635B;
            margin: 0 0 6px;
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
            gap: 16px;
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
            white-space: nowrap;
          }

          .text-link:hover {
            color: #2C1F1D;
          }

          .complaint-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
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
            margin: 0 0 8px;
          }

          @media (max-width: 768px) {
            .app-page {
              padding: 24px 16px;
            }

            .welcome-row {
              flex-direction: column;
              align-items: flex-start;
            }

            .welcome-row h1 {
              font-size: 27px;
            }

            .primary-button {
              width: 100%;
              white-space: normal;
            }

            .section-heading {
              align-items: flex-start;
            }

            .stats-grid {
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 12px;
            }

            .stat-card {
              padding: 16px 12px;
              gap: 10px;
            }

            .stat-icon {
              width: 36px;
              height: 36px;
              font-size: 16px;
            }

            .stat-card h2 {
              font-size: 26px;
            }

            .stat-card p {
              font-size: 11px;
            }

            .complaint-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <section className="welcome-row">
          <div>
            <p className="eyebrow">STUDENT PORTAL</p>

            <h1>
              Welcome back, {user?.name?.split(" ")[0] || "Student"} 👋
            </h1>

            <p className="page-subtitle">
              Report campus issues and track their resolution in one place.
            </p>
          </div>

          <Link className="primary-button" to="/student/submit">
            ＋ New Complaint
          </Link>
        </section>

        {error && (
          <div className="alert error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="primary-button"
              onClick={loadComplaints}
              disabled={loading}
            >
              {loading ? "Retrying..." : "Try again"}
            </button>
          </div>
        )}

        <section className="stats-grid student-stats">
          <div
            className="stat-card clickable"
            onClick={() => navigate("/student/complaints")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                navigate("/student/complaints");
              }
            }}
            role="button"
            tabIndex={0}
            title="Click to view all complaints"
          >
            <span className="stat-icon blue">▤</span>
            <div>
              <p>Total Complaints</p>
              <h2>{loading ? "—" : stats.total}</h2>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon amber">◷</span>
            <div>
              <p>Submitted</p>
              <h2>{loading ? "—" : stats.submitted}</h2>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon amber">↗</span>
            <div>
              <p>Assigned</p>
              <h2>{loading ? "—" : stats.assigned}</h2>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon purple">↻</span>
            <div>
              <p>In Progress</p>
              <h2>{loading ? "—" : stats.inProgress}</h2>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon green">✓</span>
            <div>
              <p>Resolved</p>
              <h2>{loading ? "—" : stats.resolved}</h2>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon green">✓</span>
            <div>
              <p>Closed</p>
              <h2>{loading ? "—" : stats.closed}</h2>
            </div>
          </div>
        </section>

        <section className="section-heading">
          <div>
            <h2>Recent complaints</h2>
            <p>Keep track of your latest submissions.</p>
          </div>

          <Link className="text-link" to="/student/complaints">
            View all →
          </Link>
        </section>

        {loading ? (
          <div className="empty-state" role="status">
            Loading your complaints...
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">!</div>
            <h3>Complaints could not be loaded</h3>
            <p>Please check your connection and try again.</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">▤</div>
            <h3>No complaints yet</h3>
            <p>Submit your first complaint to get started.</p>
            <Link className="primary-button" to="/student/submit">
              Submit Complaint
            </Link>
          </div>
        ) : (
          <div className="complaint-grid">
            {complaints.slice(0, 3).map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                compact
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default StudentDashboard;
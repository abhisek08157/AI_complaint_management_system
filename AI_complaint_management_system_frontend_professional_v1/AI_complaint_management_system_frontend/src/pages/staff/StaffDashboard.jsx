import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import { getUser } from "../../utils/auth";
import Navbar from "../../components/Navbar";
import ComplaintCard from "../../components/ComplaintCard";

function StaffDashboard() {
  const user = getUser();

  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchComplaints = useCallback(async () => {
    if (!user?.userId) {
      setError("Unable to identify the logged-in staff member.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      setLoading(true);

      const response = await API.get(
        `/staff/${user.userId}/complaints`
      );

      setComplaints(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load complaints. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const updateStatus = async (complaintId, status) => {
    const body = { status };

    if (status === "RESOLVED") {
      const resolution = window.prompt(
        "Describe the work completed to resolve this complaint:"
      );

      if (resolution === null) return;

      if (!resolution.trim()) {
        setError("Please enter a resolution before submitting.");
        return;
      }

      body.resolution = resolution.trim();
    }

    try {
      setError("");
      setUpdatingId(complaintId);

      await API.put(
        `/staff/complaints/${complaintId}/status`,
        body
      );

      await fetchComplaints();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update complaint status. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const total = complaints.length;

  const assigned = complaints.filter(
    (complaint) => complaint.status === "ASSIGNED"
  ).length;

  const inProgress = complaints.filter(
    (complaint) => complaint.status === "IN_PROGRESS"
  ).length;

  const resolved = complaints.filter(
    (complaint) => complaint.status === "RESOLVED"
  ).length;

  return (
    <>
      <Navbar />

      <main className="staff-page">
        <style>{`
          .staff-page {
            min-height: calc(100vh - 68px);
            background: #F8F4EB;
            padding: 36px 48px;
            color: #2C1F1D;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
            box-sizing: border-box;
          }

          .staff-page * {
            box-sizing: border-box;
          }

          .staff-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
            margin-bottom: 28px;
          }

          .staff-header h1 {
            font: 600 32px Georgia, serif;
            margin: 0 0 8px;
          }

          .staff-header p {
            margin: 0;
            color: #72635B;
            font-size: 15px;
            line-height: 1.6;
          }

          .refresh-button {
            background: #2C1F1D;
            color: #F8F4EB;
            border: 0;
            border-radius: 8px;
            padding: 11px 18px;
            font-weight: 600;
            cursor: pointer;
          }

          .refresh-button:hover:not(:disabled) {
            background: #C88A2E;
            color: #2C1F1D;
          }

          .refresh-button:disabled,
          .staff-action:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .staff-stats {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 18px;
            margin-bottom: 30px;
          }

          .staff-stat {
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
            padding: 20px;
          }

          .staff-stat p {
            color: #72635B;
            font-size: 14px;
            margin: 0 0 12px;
          }

          .staff-stat h2 {
            font-size: 28px;
            margin: 0;
            font-family: Georgia, "Source Serif 4", serif;
          }

          .staff-section-title {
            font: 600 24px Georgia, serif;
            margin: 0 0 18px;
          }

          .staff-error {
            background: #FDF2F0;
            border: 1px solid #F3C2BA;
            color: #9C2A1B;
            padding: 14px 18px;
            border-radius: 10px;
            margin-bottom: 22px;
            overflow-wrap: anywhere;
          }

          .staff-grid {
            display: grid;
            grid-template-columns: repeat(
              auto-fill,
              minmax(min(100%, 310px), 1fr)
            );
            align-items: start;
            gap: 22px;
          }

          .staff-card {
            min-width: 0;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 14px;
            padding: 18px;
            box-shadow: 0 8px 24px -6px rgba(44, 31, 29, 0.04);
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .staff-actions {
            display: flex;
            gap: 10px;
          }

          .staff-action {
            width: 100%;
            border: 0;
            border-radius: 8px;
            padding: 11px 14px;
            background: #2C1F1D;
            color: #FFFFFF;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }

          .staff-action:hover:not(:disabled) {
            background: #C88A2E;
            color: #2C1F1D;
          }

          .staff-action.resolve {
            background: #2D6A4F;
          }

          .staff-action.resolve:hover:not(:disabled) {
            background: #214E3A;
            color: #FFFFFF;
          }

          .staff-resolved {
            color: #2D6A4F;
            font-size: 13px;
            font-weight: 600;
            margin: 0;
            padding: 8px 0;
          }

          .staff-empty {
            background: #FFFFFF;
            border: 1px dashed #D9CBB5;
            border-radius: 14px;
            padding: 42px 24px;
            text-align: center;
            color: #72635B;
          }

          .staff-empty h3 {
            color: #2C1F1D;
            margin: 0 0 10px;
            font-family: Georgia, "Source Serif 4", serif;
          }

          .staff-empty p {
            margin: 0;
            line-height: 1.6;
          }

          @media (max-width: 900px) {
            .staff-stats {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .staff-page {
              padding: 28px 24px;
            }
          }

          @media (max-width: 520px) {
            .staff-page {
              padding: 24px 16px;
            }

            .staff-stats {
              gap: 10px;
            }

            .staff-stat {
              padding: 15px;
            }

            .staff-stat h2 {
              font-size: 25px;
            }

            .staff-header h1 {
              font-size: 28px;
            }

            .staff-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <header className="staff-header">
          <div>
            <h1>Staff Dashboard</h1>
            <p>
              Track your assigned complaints, view student photos,
              and update work progress.
            </p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={fetchComplaints}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </header>

        {error && (
          <div className="staff-error" role="alert">
            {error}
          </div>
        )}

        <section
          className="staff-stats"
          aria-label="Complaint summary"
        >
          <article className="staff-stat">
            <p>Total Assigned to You</p>
            <h2>{total}</h2>
          </article>

          <article className="staff-stat">
            <p>Awaiting Work</p>
            <h2>{assigned}</h2>
          </article>

          <article className="staff-stat">
            <p>In Progress</p>
            <h2>{inProgress}</h2>
          </article>

          <article className="staff-stat">
            <p>Resolved</p>
            <h2>{resolved}</h2>
          </article>
        </section>

        <h2 className="staff-section-title">
          My Assigned Complaints
        </h2>

        {loading ? (
          <div className="staff-empty" role="status">
            Loading your complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div className="staff-empty">
            <h3>No complaints assigned yet</h3>
            <p>
              New complaints assigned to you will appear here.
            </p>
          </div>
        ) : (
          <section className="staff-grid">
            {complaints.map((complaint) => (
              <article
                className="staff-card"
                key={complaint.id ?? complaint.complaintId}
              >
                {/* Displays complaint details and retrieves its photo */}
                <ComplaintCard
                  complaint={complaint}
                  compact={false}
                />

                {/* Staff workflow buttons remain separate */}
                <div className="staff-actions">
                  {complaint.status === "ASSIGNED" && (
                    <button
                      type="button"
                      className="staff-action"
                      disabled={updatingId === complaint.id}
                      onClick={() =>
                        updateStatus(complaint.id, "IN_PROGRESS")
                      }
                    >
                      {updatingId === complaint.id
                        ? "Updating..."
                        : "Start Work"}
                    </button>
                  )}

                  {complaint.status === "IN_PROGRESS" && (
                    <button
                      type="button"
                      className="staff-action resolve"
                      disabled={updatingId === complaint.id}
                      onClick={() =>
                        updateStatus(complaint.id, "RESOLVED")
                      }
                    >
                      {updatingId === complaint.id
                        ? "Updating..."
                        : "Resolve Complaint"}
                    </button>
                  )}

                  {complaint.status === "RESOLVED" && (
                    <p className="staff-resolved">
                      ✓ Resolution submitted
                    </p>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

export default StaffDashboard;
import { useEffect, useState } from "react";
import API from "../../services/api";
import { getUser } from "../../utils/auth";
import Navbar from "../../components/Navbar";

function StaffDashboard() {
  const user = getUser();

  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await API.get(
        `/staff/${user.userId}/complaints`
      );

      setComplaints(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load complaints"
      );
    }
  };

  const updateStatus = async (complaintId, status) => {
    try {
      const body = { status };

      if (status === "RESOLVED") {
        const resolution = prompt("Enter resolution:");
        if (!resolution) return;
        body.resolution = resolution;
      }

      await API.put(
        `/staff/complaints/${complaintId}/status`,
        body
      );

      fetchComplaints();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="app-page">
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

          .error-alert {
            background: #FDF2F0;
            border: 1px solid #F3C2BA;
            color: #9C2A1B;
            font-size: 14px;
            padding: 14px 18px;
            border-radius: 10px;
            margin-bottom: 24px;
          }

          .complaint-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 24px;
            width: 100%;
          }

          .complaint-card {
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 14px;
            padding: 24px;
            box-shadow: 0 8px 24px -6px rgba(44, 31, 29, 0.04);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .complaint-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px -4px rgba(44, 31, 29, 0.08);
          }

          .card-header {
            margin-bottom: 12px;
          }

          .complaint-card h2 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 20px;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 8px;
            line-height: 1.3;
          }

          .complaint-description {
            font-size: 14px;
            color: #584A45;
            line-height: 1.5;
            margin: 0 0 16px;
          }

          .meta-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 12px 0;
            border-top: 1px dashed #EFE8DA;
            border-bottom: 1px dashed #EFE8DA;
            margin-bottom: 20px;
            font-size: 13.5px;
            color: #72635B;
          }

          .meta-list p {
            margin: 0;
            display: flex;
            justify-content: space-between;
          }

          .meta-list strong {
            color: #2C1F1D;
          }

          .status-tag {
            font-weight: 600;
            color: #C88A2E;
          }

          .button-group {
            display: flex;
            gap: 12px;
          }

          .btn-action {
            width: 100%;
            background: #2C1F1D;
            color: #F8F4EB;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-action:hover {
            background: #C88A2E;
            color: #2C1F1D;
          }

          .btn-action.resolve {
            background: #2D6A4F;
            color: #FFFFFF;
          }

          .btn-action.resolve:hover {
            background: #214E3A;
          }

          @media (max-width: 600px) {
            .app-page {
              padding: 24px 16px;
            }
            .complaint-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <div className="dashboard-header">
          <h1>Staff Dashboard</h1>
          <p>View and manage complaints assigned directly to you.</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="complaint-grid">
          {complaints.map((complaint) => (
            <div className="complaint-card" key={complaint.id}>
              <div>
                <div className="card-header">
                  <h2>{complaint.title || "Untitled Complaint"}</h2>
                </div>

                <p className="complaint-description">
                  {complaint.description || "No description provided."}
                </p>

                <div className="meta-list">
                  <p>
                    <strong>Location:</strong>
                    <span>{complaint.location || "N/A"}</span>
                  </p>
                  <p>
                    <strong>Category:</strong>
                    <span>{complaint.category || "OTHER"}</span>
                  </p>
                  <p>
                    <strong>Priority:</strong>
                    <span>{complaint.priority || "MEDIUM"}</span>
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <span className="status-tag">{complaint.status}</span>
                  </p>
                </div>
              </div>

              <div className="button-group">
                {complaint.status === "ASSIGNED" && (
                  <button
                    className="btn-action"
                    onClick={() =>
                      updateStatus(complaint.id, "IN_PROGRESS")
                    }
                  >
                    Start Work
                  </button>
                )}

                {complaint.status === "IN_PROGRESS" && (
                  <button
                    className="btn-action resolve"
                    onClick={() =>
                      updateStatus(complaint.id, "RESOLVED")
                    }
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default StaffDashboard;
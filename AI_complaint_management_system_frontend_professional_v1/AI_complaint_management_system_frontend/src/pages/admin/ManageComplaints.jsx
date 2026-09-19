import { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const complaintsResponse = await API.get("/admin/complaints");
      const staffResponse = await API.get("/admin/staff");

      setComplaints(complaintsResponse.data);
      setStaff(staffResponse.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load data"
      );
    }
  };

  const assignComplaint = async (complaintId, staffId) => {
    if (!staffId) return;

    try {
      await API.put(`/admin/complaints/${complaintId}/assign`, {
        staffId: Number(staffId),
      });

      fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to assign complaint"
      );
    }
  };

  // Helper to find staff ID if assignedStaff name exists
  const getSelectedStaffId = (complaint) => {
    if (!complaint.assignedStaff) return "";
    const matched = staff.find((s) => s.name === complaint.assignedStaff);
    return matched ? matched.id : "";
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

          .page-header {
            margin-bottom: 32px;
          }

          .page-header h1 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 8px;
            letter-spacing: -0.01em;
          }

          .page-header p {
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

          .table-container {
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 14px;
            box-shadow: 0 8px 24px -6px rgba(44, 31, 29, 0.04);
            overflow: hidden;
          }

          .custom-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 14px;
          }

          .custom-table th {
            background: #FAF6EE;
            color: #72635B;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 16px 20px;
            border-bottom: 1px solid #EFE8DA;
          }

          .custom-table td {
            padding: 16px 20px;
            border-bottom: 1px solid #F6F1E7;
            color: #2C1F1D;
            vertical-align: middle;
          }

          .custom-table tbody tr:last-child td {
            border-bottom: none;
          }

          .custom-table tbody tr:hover {
            background-color: #FDFBF7;
          }

          .complaint-id-cell {
            font-weight: 700;
            color: #C88A2E;
            font-size: 13px;
          }

          .title-cell {
            font-weight: 600;
            color: #2C1F1D;
          }

          .priority-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 20px;
            text-transform: capitalize;
          }

          .priority-badge.high, .priority-badge.urgent {
            background: #FDF2F0;
            color: #B93815;
            border: 1px solid #F3C2BA;
          }

          .priority-badge.medium {
            background: #FDF8ED;
            color: #C88A2E;
            border: 1px solid #E2D7C3;
          }

          .priority-badge.low {
            background: #F0F7F4;
            color: #2D6A4F;
            border: 1px solid #C2E2D3;
          }

          .status-pill {
            font-size: 12.5px;
            font-weight: 600;
            color: #584A45;
          }

          .staff-select {
            background: #FAF6EE;
            border: 1px solid #EFE8DA;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 13.5px;
            color: #2C1F1D;
            outline: none;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 100%;
            max-width: 180px;
          }

          .staff-select:hover {
            border-color: #C88A2E;
          }

          .staff-select:focus {
            border-color: #C88A2E;
            box-shadow: 0 0 0 3px rgba(200, 138, 46, 0.15);
          }

          .resolved-staff-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #F0F7F4;
            border: 1px solid #C2E2D3;
            color: #2D6A4F;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
          }

          .resolved-staff-badge .check-icon {
            font-weight: 700;
          }

          @media (max-width: 900px) {
            .app-page {
              padding: 24px 16px;
            }
            .table-container {
              overflow-x: auto;
            }
          }
        `}</style>

        <div className="page-header">
          <h1>Manage Complaints</h1>
          <p>Review incoming issues and assign staff members to resolve them.</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Student</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assign Staff</th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((complaint) => {
                const isResolved = complaint.status === "RESOLVED";

                return (
                  <tr key={complaint.id}>
                    <td className="complaint-id-cell">#{complaint.id}</td>

                    <td className="title-cell">{complaint.title || "Untitled complaint"}</td>

                    <td>{complaint.submittedBy || "N/A"}</td>

                    <td>{complaint.category || "OTHER"}</td>

                    <td>
                      <span
                        className={`priority-badge ${String(complaint.priority || "MEDIUM").toLowerCase()}`}
                      >
                        ● {complaint.priority || "MEDIUM"}
                      </span>
                    </td>

                    <td>
                      <span className="status-pill">{complaint.status}</span>
                    </td>

                    <td>
                      {isResolved ? (
                        <div className="resolved-staff-badge">
                          <span className="check-icon">✓</span>
                          <span>{complaint.assignedStaff || "Unassigned"}</span>
                        </div>
                      ) : (
                        <select
                          className="staff-select"
                          value={getSelectedStaffId(complaint)}
                          onChange={(e) =>
                            assignComplaint(complaint.id, e.target.value)
                          }
                        >
                          <option value="">Select Staff</option>
                          {staff.map((person) => (
                            <option key={person.id} value={person.id}>
                              {person.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ManageComplaints;
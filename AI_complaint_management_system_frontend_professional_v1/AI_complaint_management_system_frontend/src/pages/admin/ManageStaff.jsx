import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function ManageStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingStaffId, setEditingStaffId] = useState(null);
  const [newSpecialization, setNewSpecialization] = useState("");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("/admin/staff");
      setStaffList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load staff list.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSpecialization = async (staffId) => {
    if (!newSpecialization.trim()) return;
    try {
      const response = await API.put(`/admin/staff/${staffId}/specialization`, {
        specialization: newSpecialization.trim(),
      });
      setStaffList((prev) =>
        prev.map((s) => (s.id === staffId ? response.data : s))
      );
      setEditingStaffId(null);
      setNewSpecialization("");
      setSuccess("Staff specialization updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update specialization."
      );
    }
  };

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
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 1px solid #EFE8DA;
            padding-bottom: 16px;
          }

          .dashboard-header h1 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 8px;
          }

          .dashboard-header p {
            font-size: 15px;
            color: #72635B;
            margin: 0;
          }

          .back-link {
            color: #C88A2E;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
          }

          .back-link:hover {
            color: #2C1F1D;
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

          .alert.success {
            background: #F0FDF4;
            border: 1px solid #BBF7D0;
            color: #166534;
            font-size: 14px;
            padding: 14px 18px;
            border-radius: 10px;
            margin-bottom: 24px;
          }

          .staff-table-wrap {
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 14px;
            box-shadow: 0 8px 24px -6px rgba(44, 31, 29, 0.04);
            overflow: hidden;
          }

          .staff-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 14px;
          }

          .staff-table th {
            background: #FCFAF5;
            padding: 16px 20px;
            font-weight: 600;
            color: #4A3B36;
            border-bottom: 1px solid #EFE8DA;
          }

          .staff-table td {
            padding: 16px 20px;
            border-bottom: 1px solid #F4EFE6;
            color: #2C1F1D;
          }

          .spec-badge {
            display: inline-block;
            background: #F4EFE6;
            color: #2C1F1D;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12.5px;
            font-weight: 600;
            border: 1px solid #E2D9C8;
          }

          .edit-btn {
            background: transparent;
            border: 1px solid #C88A2E;
            color: #C88A2E;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
          }

          .edit-btn:hover {
            background: #C88A2E;
            color: #FFFFFF;
          }

          .inline-edit-box {
            display: flex;
            gap: 8px;
            align-items: center;
          }

          .inline-edit-box input {
            padding: 6px 10px;
            font-size: 13px;
            border: 1px solid #E2D9C8;
            border-radius: 6px;
            background: #FCFAF5;
            color: #2C1F1D;
          }

          .save-btn {
            background: #2C1F1D;
            color: #F8F4EB;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
          }

          .cancel-btn {
            background: transparent;
            color: #72635B;
            border: none;
            padding: 6px 8px;
            cursor: pointer;
            font-size: 13px;
          }

          .empty-state {
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 14px;
            padding: 48px 24px;
            text-align: center;
            color: #72635B;
          }
        `}</style>

        <div className="dashboard-header">
          <div>
            <h1>Manage Staff</h1>
            <p>Registered campus staff members and their primary specializations.</p>
          </div>
          <Link to="/admin" className="back-link">
            ← Back to Dashboard
          </Link>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        {loading ? (
          <div className="empty-state">Loading staff directory...</div>
        ) : staffList.length === 0 ? (
          <div className="empty-state">
            <h3>No staff members found</h3>
            <p>There are currently no registered staff accounts.</p>
          </div>
        ) : (
          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>SPECIALIZATION</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id}>
                    <td>#{staff.id}</td>
                    <td>
                      <strong>{staff.name}</strong>
                    </td>
                    <td>{staff.email}</td>
                    <td>
                      {editingStaffId === staff.id ? (
                        <div className="inline-edit-box">
                          <input
                            type="text"
                            value={newSpecialization}
                            onChange={(e) =>
                              setNewSpecialization(e.target.value)
                            }
                            placeholder="e.g. Electrical, Plumbing, IT"
                          />
                        </div>
                      ) : (
                        <span className="spec-badge">
                          {staff.specialization || "Not Assigned"}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingStaffId === staff.id ? (
                        <div className="inline-edit-box">
                          <button
                            className="save-btn"
                            onClick={() => handleUpdateSpecialization(staff.id)}
                          >
                            Save
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => {
                              setEditingStaffId(null);
                              setNewSpecialization("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditingStaffId(staff.id);
                            setNewSpecialization(staff.specialization || "");
                          }}
                        >
                          Edit Specialization
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

export default ManageStaff;
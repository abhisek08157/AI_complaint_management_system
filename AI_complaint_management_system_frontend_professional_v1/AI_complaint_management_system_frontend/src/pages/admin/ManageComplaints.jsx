
import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [complaintsResponse, staffResponse] = await Promise.all([
        API.get("/admin/complaints"),
        API.get("/admin/staff"),
      ]);

      setComplaints(
        Array.isArray(complaintsResponse.data)
          ? complaintsResponse.data
          : []
      );

      setStaff(
        Array.isArray(staffResponse.data) ? staffResponse.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load complaints or staff. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getAssignedStaffName = (complaint) => {
    const assigned = complaint.assignedStaff;

    if (typeof assigned === "string") return assigned;
    if (assigned && typeof assigned === "object") {
      return assigned.name || assigned.fullName || "";
    }

    return "";
  };

  const getSelectedStaffId = (complaint) => {
    const assigned = complaint.assignedStaff;

    if (assigned && typeof assigned === "object") {
      const id = assigned.id ?? assigned.staffId;

      if (id != null) {
        const matched = staff.find(
          (person) => String(person.id ?? person.staffId) === String(id)
        );

        if (matched) return String(matched.id ?? matched.staffId);
      }
    }

    const assignedName = getAssignedStaffName(complaint);

    if (!assignedName) return "";

    const matched = staff.find(
      (person) =>
        person.name?.toLowerCase() === assignedName.toLowerCase()
    );

    return matched
      ? String(matched.id ?? matched.staffId)
      : "";
  };

  const assignComplaint = async (complaintId, staffId) => {
    if (!staffId) return;

    setAssigningId(complaintId);
    setError("");
    setSuccess("");

    try {
      await API.put(`/admin/complaints/${complaintId}/assign`, {
        staffId: Number(staffId),
      });

      setSuccess(`Complaint #${complaintId} was assigned successfully.`);
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to assign the complaint. Please try again."
      );
    } finally {
      setAssigningId(null);
    }
  };

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesSearch =
        !query ||
        [
          complaint.id,
          complaint.complaintId,
          complaint.title,
          complaint.description,
          complaint.location,
          complaint.submittedBy,
          complaint.category,
          getAssignedStaffName(complaint),
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        String(complaint.status || "").toUpperCase() === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        String(complaint.priority || "MEDIUM").toUpperCase() ===
          priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [complaints, search, statusFilter, priorityFilter]);

  const countStatus = (status) =>
    complaints.filter(
      (complaint) =>
        String(complaint.status || "").toUpperCase() === status
    ).length;

  const formatLabel = (value) =>
    String(value || "UNKNOWN")
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <>
      <Navbar />

      <main className="manage-complaints-page">
        <style>{`
          .manage-complaints-page {
            min-height: calc(100vh - 68px);
            padding: 32px 36px 48px;
            background: #F8F4EB;
            color: #2C1F1D;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }

          .manage-complaints-container {
            max-width: 1280px;
            width: 100%;
            margin: 0 auto;
          }

          .manage-complaints-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 20px;
            margin-bottom: 28px;
          }

          .manage-complaints-header h1 {
            margin: 0 0 8px;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            line-height: 1.2;
            font-weight: 600;
            letter-spacing: -0.02em;
          }

          .manage-complaints-header p {
            margin: 0;
            color: #72635B;
            font-size: 14px;
            line-height: 1.6;
          }

          .refresh-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 11px 16px;
            border: 1px solid #2C1F1D;
            border-radius: 8px;
            background: #2C1F1D;
            color: #FFFFFF;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
          }

          .refresh-button:hover {
            background: #493430;
          }

          .refresh-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .complaint-stat-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 15px;
            margin-bottom: 28px;
          }

          .complaint-stat {
            padding: 18px 20px;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
            background: #FFFFFF;
            box-shadow: 0 4px 14px rgba(44, 31, 29, 0.035);
          }

          .complaint-stat span {
            display: block;
            margin-bottom: 10px;
            color: #72635B;
            font-size: 12px;
            font-weight: 600;
          }

          .complaint-stat strong {
            display: block;
            color: #2C1F1D;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 29px;
            line-height: 1.2;
          }

          .complaint-stat.total {
            background: #2C1F1D;
            border-color: #2C1F1D;
          }

          .complaint-stat.total span {
            color: #E2A855;
          }

          .complaint-stat.total strong {
            color: #FFFFFF;
          }

          .complaint-alert {
            padding: 14px 17px;
            margin-bottom: 20px;
            border-radius: 9px;
            font-size: 13px;
            line-height: 1.6;
          }

          .complaint-alert.error {
            background: #FDF2F0;
            border: 1px solid #F3C2BA;
            color: #9C2A1B;
          }

          .complaint-alert.success {
            background: #F0F7F4;
            border: 1px solid #C2E2D3;
            color: #2D6A4F;
          }

          .filter-panel {
            display: grid;
            grid-template-columns: minmax(220px, 1fr) 190px 190px;
            gap: 14px;
            padding: 18px;
            margin-bottom: 20px;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
          }

          .filter-field {
            display: flex;
            flex-direction: column;
            gap: 7px;
            min-width: 0;
          }

          .filter-field label {
            color: #584A45;
            font-size: 12px;
            font-weight: 700;
          }

          .filter-field input,
          .filter-field select {
            width: 100%;
            min-height: 42px;
            padding: 10px 12px;
            border: 1px solid #E5D9C7;
            border-radius: 8px;
            background: #FAF6EE;
            color: #2C1F1D;
            font: inherit;
            font-size: 13px;
            box-sizing: border-box;
          }

          .filter-field input:focus,
          .filter-field select:focus {
            outline: none;
            border-color: #C88A2E;
            box-shadow: 0 0 0 3px rgba(200, 138, 46, 0.14);
          }

          .results-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 14px;
          }

          .results-heading h2 {
            margin: 0 0 5px;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 22px;
            font-weight: 600;
          }

          .results-heading p {
            margin: 0;
            color: #72635B;
            font-size: 12px;
          }

          .results-count {
            padding: 7px 11px;
            border-radius: 20px;
            background: #F1E3CB;
            color: #79501E;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }

          .complaints-table-wrap {
            width: 100%;
            overflow-x: auto;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
            box-shadow: 0 4px 14px rgba(44, 31, 29, 0.035);
          }

          .complaints-table {
            width: 100%;
            min-width: 1000px;
            border-collapse: collapse;
            text-align: left;
            font-size: 13px;
          }

          .complaints-table th {
            padding: 15px 17px;
            background: #F3EBDD;
            color: #72635B;
            border-bottom: 1px solid #E8DDCC;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.045em;
            white-space: nowrap;
          }

          .complaints-table td {
            padding: 16px 17px;
            border-bottom: 1px solid #F0E9DD;
            color: #2C1F1D;
            vertical-align: middle;
          }

          .complaints-table tbody tr:last-child td {
            border-bottom: none;
          }

          .complaints-table tbody tr:hover {
            background: #FDFBF7;
          }

          .complaint-id {
            color: #A66C1E;
            font-weight: 700;
            white-space: nowrap;
          }

          .complaint-title {
            display: block;
            max-width: 240px;
            color: #2C1F1D;
            font-size: 13px;
            font-weight: 700;
            line-height: 1.5;
            overflow-wrap: anywhere;
          }

          .complaint-subtext {
            display: block;
            margin-top: 5px;
            color: #72635B;
            font-size: 11px;
            line-height: 1.5;
            max-width: 240px;
            overflow-wrap: anywhere;
          }

          .category-label {
            display: inline-block;
            padding: 5px 8px;
            border-radius: 6px;
            background: #F5F0E7;
            color: #584A45;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
          }

          .priority-badge,
          .status-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 6px 9px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
          }

          .priority-badge.high,
          .priority-badge.urgent {
            background: #FDF2F0;
            color: #B93815;
          }

          .priority-badge.medium {
            background: #FDF4DE;
            color: #94601C;
          }

          .priority-badge.low {
            background: #F0F7F4;
            color: #2D6A4F;
          }

          .status-badge.submitted {
            background: #E5EEFF;
            color: #2457A7;
          }

          .status-badge.assigned {
            background: #F1E3CB;
            color: #79501E;
          }

          .status-badge.in_progress {
            background: #FFF0D8;
            color: #94601C;
          }

          .status-badge.resolved,
          .status-badge.closed {
            background: #E3F6EB;
            color: #23764A;
          }

          .status-badge.default {
            background: #F0ECE6;
            color: #584A45;
          }

          .staff-cell {
            min-width: 190px;
          }

          .staff-select {
            width: 100%;
            max-width: 210px;
            min-height: 39px;
            padding: 9px 10px;
            border: 1px solid #E5D9C7;
            border-radius: 8px;
            background: #FAF6EE;
            color: #2C1F1D;
            font-size: 12px;
            cursor: pointer;
          }

          .staff-select:focus {
            outline: none;
            border-color: #C88A2E;
            box-shadow: 0 0 0 3px rgba(200, 138, 46, 0.14);
          }

          .staff-select:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }

          .assigned-staff {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 7px 10px;
            border: 1px solid #C2E2D3;
            border-radius: 8px;
            background: #F0F7F4;
            color: #2D6A4F;
            font-size: 12px;
            font-weight: 600;
          }

          .unassigned-label {
            color: #9C2A1B;
            font-size: 12px;
            font-weight: 600;
          }

          .table-message {
            padding: 40px 20px;
            text-align: center;
            background: #FFFFFF;
            color: #72635B;
            font-size: 13px;
            line-height: 1.7;
          }

          .table-message strong {
            display: block;
            margin-bottom: 7px;
            color: #2C1F1D;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 19px;
          }

          .clear-filters {
            margin-top: 12px;
            padding: 8px 13px;
            border: 1px solid #C88A2E;
            border-radius: 7px;
            background: #FFFFFF;
            color: #79501E;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          }

          .clear-filters:hover {
            background: #F5E8D1;
          }

          @media (max-width: 900px) {
            .manage-complaints-page {
              padding: 24px 18px 36px;
            }

            .complaint-stat-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .filter-panel {
              grid-template-columns: 1fr 1fr;
            }

            .filter-field:first-child {
              grid-column: 1 / -1;
            }
          }

          @media (max-width: 550px) {
            .manage-complaints-page {
              padding: 22px 14px 30px;
            }

            .manage-complaints-header {
              align-items: flex-start;
              flex-direction: column;
              gap: 14px;
            }

            .manage-complaints-header h1 {
              font-size: 28px;
            }

            .complaint-stat-grid {
              gap: 10px;
            }

            .complaint-stat {
              padding: 14px;
            }

            .complaint-stat strong {
              font-size: 25px;
            }

            .filter-panel {
              grid-template-columns: 1fr;
              padding: 14px;
            }

            .filter-field:first-child {
              grid-column: auto;
            }

            .results-heading {
              align-items: flex-start;
              flex-direction: column;
            }
          }
        `}</style>

        <div className="manage-complaints-container">
          <header className="manage-complaints-header">
            <div>
              <h1>Manage Complaints</h1>
              <p>
                Review student problems, check their status, and assign
                them to the right staff member.
              </p>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={fetchData}
              disabled={loading}
            >
              ↻ {loading ? "Refreshing..." : "Refresh data"}
            </button>
          </header>

          {error && (
            <div className="complaint-alert error" role="alert">
              {error}
              <button
                type="button"
                className="clear-filters"
                onClick={fetchData}
              >
                Try again
              </button>
            </div>
          )}

          {success && (
            <div className="complaint-alert success" role="status">
              ✓ {success}
            </div>
          )}

          <section className="complaint-stat-grid">
            <div className="complaint-stat total">
              <span>Total complaints</span>
              <strong>{loading ? "—" : complaints.length}</strong>
            </div>

            <div className="complaint-stat">
              <span>Waiting for review</span>
              <strong>{loading ? "—" : countStatus("SUBMITTED")}</strong>
            </div>

            <div className="complaint-stat">
              <span>Assigned to staff</span>
              <strong>{loading ? "—" : countStatus("ASSIGNED")}</strong>
            </div>

            <div className="complaint-stat">
              <span>Fixed / Resolved</span>
              <strong>{loading ? "—" : countStatus("RESOLVED")}</strong>
            </div>
          </section>

          <section className="filter-panel">
            <div className="filter-field">
              <label htmlFor="complaint-search">Search complaints</label>
              <input
                id="complaint-search"
                type="search"
                placeholder="Search by title, ID, student, location..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="complaint-status-filter">Filter by status</label>
              <select
                id="complaint-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="complaint-priority-filter">
                Filter by priority
              </label>
              <select
                id="complaint-priority-filter"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                <option value="ALL">All priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </section>

          <section>
            <div className="results-heading">
              <div>
                <h2>All complaints</h2>
                <p>
                  Review complaint details and manage staff assignments.
                </p>
              </div>

              <span className="results-count">
                {loading ? "Loading..." : `${filteredComplaints.length} found`}
              </span>
            </div>

            <div className="complaints-table-wrap">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Complaint details</th>
                    <th>Student</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned staff</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7">
                        <div className="table-message">
                          Loading complaints...
                        </div>
                      </td>
                    </tr>
                  ) : filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="7">
                        <div className="table-message">
                          <strong>
                            {complaints.length === 0
                              ? "No complaints available"
                              : "No matching complaints"}
                          </strong>
                          {complaints.length === 0
                            ? "Student complaints will appear here when submitted."
                            : "Try changing your search or filters."}

                          {(search ||
                            statusFilter !== "ALL" ||
                            priorityFilter !== "ALL") && (
                            <div>
                              <button
                                type="button"
                                className="clear-filters"
                                onClick={() => {
                                  setSearch("");
                                  setStatusFilter("ALL");
                                  setPriorityFilter("ALL");
                                }}
                              >
                                Clear filters
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((complaint) => {
                      const id = complaint.id ?? complaint.complaintId;
                      const status = String(
                        complaint.status || "UNKNOWN"
                      ).toUpperCase();
                      const priority = String(
                        complaint.priority || "MEDIUM"
                      ).toUpperCase();
                      const assignedName = getAssignedStaffName(complaint);
                      const isResolved =
                        status === "RESOLVED" || status === "CLOSED";

                      return (
                        <tr key={id}>
                          <td className="complaint-id">#{id}</td>

                          <td>
                            <span className="complaint-title">
                              {complaint.title || "Untitled complaint"}
                            </span>
                            {complaint.description && (
                              <span className="complaint-subtext">
                                {complaint.description}
                              </span>
                            )}
                          </td>

                          <td>{complaint.submittedBy || "Not available"}</td>

                          <td>
                            <span className="category-label">
                              {formatLabel(complaint.category || "OTHER")}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`priority-badge ${priority.toLowerCase()}`}
                            >
                              {formatLabel(priority)}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                [
                                  "SUBMITTED",
                                  "ASSIGNED",
                                  "IN_PROGRESS",
                                  "RESOLVED",
                                  "CLOSED",
                                ].includes(status)
                                  ? status.toLowerCase()
                                  : "default"
                              }`}
                            >
                              {formatLabel(status)}
                            </span>
                          </td>

                          <td className="staff-cell">
                            {isResolved ? (
                              assignedName ? (
                                <span className="assigned-staff">
                                  ✓ {assignedName}
                                </span>
                              ) : (
                                <span className="unassigned-label">
                                  Not assigned
                                </span>
                              )
                            ) : (
                              <select
                                className="staff-select"
                                aria-label={`Assign staff to complaint ${id}`}
                                value={getSelectedStaffId(complaint)}
                                disabled={
                                  assigningId === id || staff.length === 0
                                }
                                onChange={(event) =>
                                  assignComplaint(id, event.target.value)
                                }
                              >
                                <option value="">
                                  {assigningId === id
                                    ? "Assigning..."
                                    : staff.length === 0
                                      ? "No staff available"
                                      : "Select staff"}
                                </option>

                                {staff.map((person) => {
                                  const personId =
                                    person.id ?? person.staffId;

                                  return (
                                    <option
                                      key={personId}
                                      value={personId}
                                    >
                                      {person.name ||
                                        person.fullName ||
                                        `Staff #${personId}`}
                                    </option>
                                  );
                                })}
                              </select>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default ManageComplaints;

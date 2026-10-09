
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function ManageStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("ALL");
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/admin/staff");
      setStaffList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load staff list. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const specializations = useMemo(
    () =>
      [
        ...new Set(
          staffList
            .map((person) => person.specialization?.trim())
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [staffList]
  );

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staffList.filter((person) => {
      const matchesSearch =
        !query ||
        [
          person.id,
          person.name,
          person.email,
          person.specialization,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesSpecialization =
        specializationFilter === "ALL"
          ? true
          : specializationFilter === "UNASSIGNED"
            ? !person.specialization?.trim()
            : person.specialization === specializationFilter;

      return matchesSearch && matchesSpecialization;
    });
  }, [staffList, search, specializationFilter]);

  const handleUpdateSpecialization = async (staffId) => {
    const specialization = newSpecialization.trim();

    if (!specialization) {
      setError("Please enter a specialization before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await API.put(
        `/admin/staff/${staffId}/specialization`,
        { specialization }
      );

      setStaffList((previous) =>
        previous.map((person) =>
          person.id === staffId
            ? { ...person, ...response.data }
            : person
        )
      );

      setEditingStaffId(null);
      setNewSpecialization("");
      setSuccess("Staff specialization updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update specialization. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (person) => {
    setEditingStaffId(person.id);
    setNewSpecialization(person.specialization || "");
    setError("");
    setSuccess("");
  };

  const cancelEditing = () => {
    setEditingStaffId(null);
    setNewSpecialization("");
    setError("");
  };

  return (
    <>
      <Navbar />

      <main className="manage-staff-page">
        <style>{`
          .manage-staff-page {
            min-height: calc(100vh - 68px);
            padding: 32px 36px 48px;
            background: #F8F4EB;
            color: #2C1F1D;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }

          .manage-staff-container {
            width: 100%;
            max-width: 1280px;
            margin: 0 auto;
          }

          .staff-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 20px;
            margin-bottom: 28px;
          }

          .staff-header h1 {
            margin: 0 0 8px;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            line-height: 1.2;
            font-weight: 600;
          }

          .staff-header p {
            margin: 0;
            color: #72635B;
            font-size: 14px;
            line-height: 1.6;
          }

          .staff-back-link {
            flex-shrink: 0;
            color: #A66C1E;
            text-decoration: none;
            font-size: 13px;
            font-weight: 700;
          }

          .staff-back-link:hover {
            color: #2C1F1D;
            text-decoration: underline;
          }

          .staff-alert {
            padding: 13px 16px;
            border-radius: 9px;
            margin-bottom: 18px;
            font-size: 13px;
            line-height: 1.6;
          }

          .staff-alert.error {
            background: #FDF2F0;
            border: 1px solid #F3C2BA;
            color: #9C2A1B;
          }

          .staff-alert.success {
            background: #F0F7F4;
            border: 1px solid #C2E2D3;
            color: #2D6A4F;
          }

          .staff-summary-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
            margin-bottom: 26px;
          }

          .staff-summary-card {
            padding: 20px;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
            box-shadow: 0 4px 14px rgba(44, 31, 29, 0.035);
          }

          .staff-summary-card span {
            display: block;
            margin-bottom: 10px;
            color: #72635B;
            font-size: 12px;
            font-weight: 600;
          }

          .staff-summary-card strong {
            display: block;
            color: #2C1F1D;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 29px;
            line-height: 1.2;
          }

          .staff-summary-card.primary {
            background: #2C1F1D;
            border-color: #2C1F1D;
          }

          .staff-summary-card.primary span {
            color: #E2A855;
          }

          .staff-summary-card.primary strong {
            color: #FFFFFF;
          }

          .staff-filter-panel {
            display: grid;
            grid-template-columns: minmax(220px, 1fr) minmax(200px, 280px);
            gap: 14px;
            padding: 18px;
            margin-bottom: 22px;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
          }

          .staff-filter-field {
            display: flex;
            flex-direction: column;
            gap: 7px;
            min-width: 0;
          }

          .staff-filter-field label {
            color: #584A45;
            font-size: 12px;
            font-weight: 700;
          }

          .staff-filter-field input,
          .staff-filter-field select {
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

          .staff-filter-field input:focus,
          .staff-filter-field select:focus,
          .specialization-input:focus {
            outline: none;
            border-color: #C88A2E;
            box-shadow: 0 0 0 3px rgba(200, 138, 46, 0.14);
          }

          .staff-list-heading {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 16px;
            margin-bottom: 14px;
          }

          .staff-list-heading h2 {
            margin: 0 0 5px;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 22px;
            font-weight: 600;
          }

          .staff-list-heading p {
            margin: 0;
            color: #72635B;
            font-size: 12px;
            line-height: 1.6;
          }

          .staff-result-count {
            flex-shrink: 0;
            padding: 7px 11px;
            border-radius: 20px;
            background: #F1E3CB;
            color: #79501E;
            font-size: 12px;
            font-weight: 700;
          }

          .staff-table-wrap {
            width: 100%;
            overflow-x: auto;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
            box-shadow: 0 4px 14px rgba(44, 31, 29, 0.035);
          }

          /* Only the table column proportions are changed */
          .staff-table {
            width: 100%;
            min-width: 760px;
            table-layout: fixed;
            border-collapse: collapse;
            text-align: left;
            font-size: 13px;
          }

          .staff-table th {
            padding: 15px 18px;
            background: #F3EBDD;
            color: #72635B;
            border-bottom: 1px solid #E8DDCC;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.045em;
            white-space: nowrap;
            text-align: left;
          }

          .staff-table td {
            padding: 16px 18px;
            border-bottom: 1px solid #F0E9DD;
            color: #2C1F1D;
            vertical-align: middle;
            text-align: left;
          }

          /* ID */
          .staff-table th:nth-child(1),
          .staff-table td:nth-child(1) {
            width: 7%;
          }

          /* Staff member */
          .staff-table th:nth-child(2),
          .staff-table td:nth-child(2) {
            width: 18%;
          }

          /* Email address */
          .staff-table th:nth-child(3),
          .staff-table td:nth-child(3) {
            width: 25%;
          }

          /* Specialization */
          .staff-table th:nth-child(4),
          .staff-table td:nth-child(4) {
            width: 30%;
          }

          /* Action: reduced width to remove excess empty space */
          .staff-table th:nth-child(5),
          .staff-table td:nth-child(5) {
            width: 20%;
          }

          .staff-table tbody tr:last-child td {
            border-bottom: none;
          }

          .staff-table tbody tr:hover {
            background: #FDFBF7;
          }

          .staff-id {
            color: #A66C1E;
            font-weight: 700;
            white-space: nowrap;
          }

          .staff-name {
            display: block;
            font-weight: 700;
            color: #2C1F1D;
          }

          .staff-email {
            color: #72635B;
            overflow-wrap: anywhere;
          }

          .spec-badge {
            display: inline-block;
            padding: 6px 10px;
            border: 1px solid #E2D9C8;
            border-radius: 7px;
            background: #F4EFE6;
            color: #584A45;
            font-size: 12px;
            font-weight: 600;
          }

          .spec-unassigned {
            color: #9C2A1B;
            background: #FDF2F0;
            border-color: #F3C2BA;
          }

          .staff-action-cell {
            min-width: 0;
            white-space: normal;
          }

          .edit-btn,
          .save-btn,
          .cancel-btn,
          .staff-retry-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 35px;
            padding: 8px 12px;
            border-radius: 7px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s ease, color 0.2s ease;
          }

          .edit-btn {
            border: 1px solid #C88A2E;
            background: transparent;
            color: #94601C;
            white-space: nowrap;
          }

          .edit-btn:hover {
            background: #F5E8D1;
          }

          .inline-edit-box {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
          }

          .specialization-input {
            width: 100%;
            max-width: 220px;
            min-height: 36px;
            padding: 8px 10px;
            border: 1px solid #E2D9C8;
            border-radius: 7px;
            background: #FCFAF5;
            color: #2C1F1D;
            font-size: 12px;
            box-sizing: border-box;
          }

          .save-btn {
            border: 1px solid #2C1F1D;
            background: #2C1F1D;
            color: #FFFFFF;
          }

          .save-btn:hover {
            background: #493430;
          }

          .cancel-btn {
            border: 1px solid #E2D9C8;
            background: #FFFFFF;
            color: #72635B;
          }

          .cancel-btn:hover {
            background: #F4EFE6;
          }

          .save-btn:disabled,
          .edit-btn:disabled,
          .cancel-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .staff-message {
            padding: 40px 22px;
            text-align: center;
            color: #72635B;
            font-size: 13px;
            line-height: 1.7;
          }

          .staff-message h3 {
            margin: 0 0 8px;
            color: #2C1F1D;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 20px;
          }

          .staff-message p {
            margin: 0;
          }

          .staff-retry-btn {
            margin-top: 14px;
            border: 1px solid #2C1F1D;
            background: #2C1F1D;
            color: #FFFFFF;
          }

          .staff-retry-btn:hover {
            background: #493430;
          }

          @media (max-width: 800px) {
            .manage-staff-page {
              padding: 24px 18px 36px;
            }

            .staff-summary-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 550px) {
            .manage-staff-page {
              padding: 22px 14px 30px;
            }

            .staff-header {
              align-items: flex-start;
              flex-direction: column;
              gap: 12px;
            }

            .staff-header h1 {
              font-size: 28px;
            }

            .staff-summary-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }

            .staff-filter-panel {
              grid-template-columns: 1fr;
              padding: 14px;
            }

            .staff-list-heading {
              align-items: flex-start;
              flex-direction: column;
            }
          }
        `}</style>

        <div className="manage-staff-container">
          <header className="staff-header">
            <div>
              <h1>Manage Staff</h1>
              <p>
                View campus staff members and update their areas of
                specialization.
              </p>
            </div>

            <Link to="/admin" className="staff-back-link">
              ← Back to Dashboard
            </Link>
          </header>

          {error && (
            <div className="staff-alert error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="staff-alert success" role="status">
              ✓ {success}
            </div>
          )}

          <section className="staff-summary-grid">
            <div className="staff-summary-card primary">
              <span>Total staff members</span>
              <strong>{loading ? "—" : staffList.length}</strong>
            </div>

            <div className="staff-summary-card">
              <span>Specialization assigned</span>
              <strong>
                {loading
                  ? "—"
                  : staffList.filter((person) =>
                      person.specialization?.trim()
                    ).length}
              </strong>
            </div>

            <div className="staff-summary-card">
              <span>Specialization not assigned</span>
              <strong>
                {loading
                  ? "—"
                  : staffList.filter(
                      (person) => !person.specialization?.trim()
                    ).length}
              </strong>
            </div>
          </section>

          <section className="staff-filter-panel">
            <div className="staff-filter-field">
              <label htmlFor="staff-search">Search staff</label>
              <input
                id="staff-search"
                type="search"
                placeholder="Search by name, ID, email or specialization..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="staff-filter-field">
              <label htmlFor="staff-specialization-filter">
                Filter by specialization
              </label>
              <select
                id="staff-specialization-filter"
                value={specializationFilter}
                onChange={(event) =>
                  setSpecializationFilter(event.target.value)
                }
              >
                <option value="ALL">All specializations</option>
                <option value="UNASSIGNED">Not assigned</option>
                {specializations.map((specialization) => (
                  <option key={specialization} value={specialization}>
                    {specialization}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section>
            <div className="staff-list-heading">
              <div>
                <h2>Staff Directory</h2>
                <p>
                  Edit a staff member's specialization using the action
                  on the right.
                </p>
              </div>

              <span className="staff-result-count">
                {loading ? "Loading..." : `${filteredStaff.length} staff`}
              </span>
            </div>

            <div className="staff-table-wrap">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Staff member</th>
                    <th>Email address</th>
                    <th>Specialization</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5">
                        <div className="staff-message">
                          Loading staff directory...
                        </div>
                      </td>
                    </tr>
                  ) : error && staffList.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        <div className="staff-message">
                          <h3>Could not load staff</h3>
                          <p>Check your connection and try again.</p>
                          <button
                            type="button"
                            className="staff-retry-btn"
                            onClick={fetchStaff}
                          >
                            Try again
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        <div className="staff-message">
                          <h3>
                            {staffList.length === 0
                              ? "No staff members found"
                              : "No matching staff"}
                          </h3>
                          <p>
                            {staffList.length === 0
                              ? "Registered campus staff members will appear here."
                              : "Try changing your search or specialization filter."}
                          </p>

                          {(search || specializationFilter !== "ALL") && (
                            <button
                              type="button"
                              className="staff-retry-btn"
                              onClick={() => {
                                setSearch("");
                                setSpecializationFilter("ALL");
                              }}
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((person) => (
                      <tr key={person.id}>
                        <td className="staff-id">#{person.id}</td>

                        <td>
                          <span className="staff-name">
                            {person.name || "Name unavailable"}
                          </span>
                        </td>

                        <td className="staff-email">
                          {person.email || "Email unavailable"}
                        </td>

                        <td>
                          {editingStaffId === person.id ? (
                            <input
                              className="specialization-input"
                              type="text"
                              value={newSpecialization}
                              onChange={(event) =>
                                setNewSpecialization(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter" &&
                                  !saving
                                ) {
                                  handleUpdateSpecialization(person.id);
                                }

                                if (
                                  event.key === "Escape" &&
                                  !saving
                                ) {
                                  cancelEditing();
                                }
                              }}
                              placeholder="e.g. Electrical, Plumbing, IT"
                              maxLength={100}
                              autoFocus
                              aria-label={`Specialization for ${person.name}`}
                            />
                          ) : (
                            <span
                              className={`spec-badge ${
                                person.specialization?.trim()
                                  ? ""
                                  : "spec-unassigned"
                              }`}
                            >
                              {person.specialization?.trim() ||
                                "Not assigned"}
                            </span>
                          )}
                        </td>

                        <td className="staff-action-cell">
                          {editingStaffId === person.id ? (
                            <div className="inline-edit-box">
                              <button
                                type="button"
                                className="save-btn"
                                onClick={() =>
                                  handleUpdateSpecialization(person.id)
                                }
                                disabled={saving}
                              >
                                {saving ? "Saving..." : "Save"}
                              </button>

                              <button
                                type="button"
                                className="cancel-btn"
                                onClick={cancelEditing}
                                disabled={saving}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="edit-btn"
                              onClick={() => startEditing(person)}
                              disabled={saving}
                            >
                              Edit specialization
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
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

export default ManageStaff;

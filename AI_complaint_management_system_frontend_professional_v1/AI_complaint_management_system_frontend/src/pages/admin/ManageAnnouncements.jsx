
import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

const INITIAL_FORM = {
  title: "",
  content: "",
  category: "GENERAL",
  targetAudience: "STUDENT",
  status: "PUBLISHED",
  publishAt: "",
  expiresAt: "",
};

function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setListError("");

    try {
      const response = await API.get("/announcements/admin");
      setAnnouncements(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to load announcements:", err);
      setListError(
        err.response?.data?.message ||
          "Unable to load announcements. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Please enter an announcement title.");
      return;
    }

    if (!form.content.trim()) {
      setError("Please enter the announcement message.");
      return;
    }

    if (
      form.publishAt &&
      form.expiresAt &&
      new Date(form.expiresAt) <= new Date(form.publishAt)
    ) {
      setError("Expiration must be later than publication.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        content: form.content.trim(),
        publishAt: form.publishAt
          ? `${form.publishAt}:00`
          : null,
        expiresAt: form.expiresAt
          ? `${form.expiresAt}:00`
          : null,
      };

      const response = await API.post("/announcements", payload);

      setSuccess("Announcement submitted successfully.");

      if (response.data) {
        setAnnouncements((previous) => [
          response.data,
          ...previous.filter(
            (item) => item.id !== response.data.id
          ),
        ]);
      } else {
        await fetchAnnouncements();
      }

      setForm({ ...INITIAL_FORM });
    } catch (err) {
      console.error("Failed to create announcement:", err);
      setError(
        err.response?.data?.message ||
          "Unable to create announcement. Check your access and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        announcement.title,
        announcement.content,
        announcement.category,
        announcement.targetAudience,
        announcement.status,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );

    const matchesStatus =
      statusFilter === "ALL" ||
      String(announcement.status ?? "").toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (value) => {
    if (!value) return "Not specified";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not specified";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    const normalized = String(status ?? "").toUpperCase();

    if (normalized === "PUBLISHED") return "published";
    if (normalized === "DRAFT") return "draft";

    return "other";
  };

  return (
    <>
      <Navbar />

      <main className="manage-announcements-page">
        <style>{`
          .manage-announcements-page {
            min-height: calc(100vh - 68px);
            padding: 36px 24px;
            background: #F8F4EB;
            color: #2C1F1D;
            font-family: -apple-system, BlinkMacSystemFont,
              "Segoe UI", sans-serif;
            box-sizing: border-box;
          }

          .manage-announcements-page *,
          .manage-announcements-page *::before,
          .manage-announcements-page *::after {
            box-sizing: border-box;
          }

          .announcements-container {
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
          }

          .announcements-eyebrow {
            margin: 0 0 8px;
            color: #C88A2E;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 2px;
          }

          .announcements-title {
            margin: 0 0 8px;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            line-height: 1.25;
            font-weight: 600;
          }

          .announcements-subtitle {
            margin: 0 0 28px;
            color: #72635B;
            font-size: 14px;
            line-height: 1.7;
          }

          .announcement-alert {
            padding: 12px 14px;
            margin-bottom: 18px;
            border-radius: 8px;
            font-size: 13px;
            line-height: 1.6;
          }

          .announcement-alert.error {
            background: #FDF2F0;
            border: 1px solid #F3C2BA;
            color: #9C2A1B;
          }

          .announcement-alert.success {
            background: #F0F7F4;
            border: 1px solid #C2E2D3;
            color: #2D6A4F;
          }

          .announcement-panel {
            padding: 26px;
            margin-bottom: 28px;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
            box-shadow: 0 4px 14px rgba(44, 31, 29, 0.035);
          }

          .announcement-panel-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            margin-bottom: 22px;
          }

          .announcement-panel-heading h2 {
            margin: 0;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 21px;
            font-weight: 600;
          }

          .announcement-form {
            display: flex;
            flex-direction: column;
            gap: 18px;
          }

          .announcement-field {
            min-width: 0;
          }

          .announcement-field label {
            display: block;
            margin-bottom: 7px;
            color: #51413A;
            font-size: 13px;
            font-weight: 600;
          }

          .announcement-field input,
          .announcement-field textarea,
          .announcement-field select {
            display: block;
            width: 100%;
            min-height: 43px;
            padding: 11px 12px;
            border: 1px solid #E5D9C7;
            border-radius: 7px;
            background: #FFFEFC;
            color: #2C1F1D;
            font: inherit;
            font-size: 14px;
          }

          .announcement-field textarea {
            min-height: 120px;
            resize: vertical;
            line-height: 1.6;
          }

          .announcement-field input:focus,
          .announcement-field textarea:focus,
          .announcement-field select:focus {
            outline: none;
            border-color: #C88A2E;
            box-shadow: 0 0 0 3px rgba(200, 138, 46, 0.12);
          }

          .announcement-field input::placeholder,
          .announcement-field textarea::placeholder {
            color: #A69A8D;
          }

          .announcement-fields-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .announcement-fields-grid.three-columns {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .announcement-help {
            display: block;
            margin-top: 6px;
            color: #8A776A;
            font-size: 11px;
            line-height: 1.5;
          }

          .announcement-primary-btn,
          .announcement-secondary-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 42px;
            padding: 11px 18px;
            border-radius: 7px;
            font: inherit;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s ease;
          }

          .announcement-primary-btn {
            border: 1px solid #2C1F1D;
            background: #2C1F1D;
            color: #FAF6EE;
          }

          .announcement-primary-btn:hover:not(:disabled) {
            background: #493430;
          }

          .announcement-primary-btn:disabled {
            opacity: 0.6;
            cursor: wait;
          }

          .announcement-secondary-btn {
            border: 1px solid #E2D9C8;
            background: #FFFFFF;
            color: #72635B;
          }

          .announcement-secondary-btn:hover {
            background: #F4EFE6;
          }

          .announcement-submit-row {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 12px;
            flex-wrap: wrap;
          }

          .announcement-section-heading {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 18px;
            margin-bottom: 16px;
          }

          .announcement-section-heading h2 {
            margin: 0 0 6px;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 24px;
            font-weight: 600;
          }

          .announcement-section-heading p {
            margin: 0;
            color: #72635B;
            font-size: 13px;
            line-height: 1.6;
          }

          .announcement-count {
            flex-shrink: 0;
            padding: 7px 11px;
            border-radius: 20px;
            background: #F1E3CB;
            color: #79501E;
            font-size: 12px;
            font-weight: 700;
          }

          .announcement-list-filters {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 210px;
            gap: 14px;
            padding: 16px;
            margin-bottom: 16px;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 10px;
          }

          .announcement-list-filters .announcement-field label {
            font-size: 12px;
          }

          .announcement-list-filters input,
          .announcement-list-filters select {
            min-height: 40px;
            font-size: 13px;
          }

          .announcement-list {
            display: grid;
            gap: 14px;
          }

          .announcement-card {
            min-width: 0;
            padding: 22px;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-left: 4px solid #C88A2E;
            border-radius: 10px;
            box-shadow: 0 4px 14px rgba(44, 31, 29, 0.025);
          }

          .announcement-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 10px;
          }

          .announcement-card h3 {
            margin: 0;
            font-size: 17px;
            line-height: 1.45;
            font-weight: 700;
            overflow-wrap: anywhere;
          }

          .announcement-status {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            padding: 5px 9px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
          }

          .announcement-status.published {
            background: #EAF5E9;
            color: #28652B;
          }

          .announcement-status.draft {
            background: #F4EFE6;
            color: #72635B;
          }

          .announcement-status.other {
            background: #FFF3DF;
            color: #895A15;
          }

          .announcement-content {
            margin: 0 0 16px;
            color: #72635B;
            font-size: 13px;
            line-height: 1.75;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
          }

          .announcement-metadata {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px 16px;
            padding-top: 13px;
            border-top: 1px solid #F0E9DD;
            color: #8A776A;
            font-size: 12px;
            line-height: 1.6;
          }

          .announcement-metadata strong {
            color: #584A45;
            font-weight: 600;
          }

          .announcement-empty-state {
            padding: 35px 22px;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
            color: #72635B;
            text-align: center;
            font-size: 13px;
            line-height: 1.7;
          }

          .announcement-empty-state h3 {
            margin: 0 0 8px;
            color: #2C1F1D;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 20px;
          }

          .announcement-empty-state p {
            margin: 0 0 14px;
          }

          @media (max-width: 800px) {
            .manage-announcements-page {
              padding: 28px 18px;
            }

            .announcement-fields-grid.three-columns {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 550px) {
            .manage-announcements-page {
              padding: 22px 14px 30px;
            }

            .announcements-title {
              font-size: 28px;
            }

            .announcement-panel {
              padding: 18px;
            }

            .announcement-fields-grid,
            .announcement-fields-grid.three-columns,
            .announcement-list-filters {
              grid-template-columns: 1fr;
            }

            .announcement-section-heading {
              align-items: flex-start;
              flex-direction: column;
              gap: 10px;
            }

            .announcement-card {
              padding: 17px;
            }

            .announcement-card-header {
              flex-direction: column;
              gap: 10px;
            }
          }
        `}</style>

        <div className="announcements-container">
          <p className="announcements-eyebrow">CAMPUSONE · ADMIN</p>

          <h1 className="announcements-title">
            Manage Announcements
          </h1>

          <p className="announcements-subtitle">
            Publish campus updates and manage announcement visibility.
          </p>

          {error && (
            <div className="announcement-alert error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="announcement-alert success" role="status">
              ✓ {success}
            </div>
          )}

          <section className="announcement-panel">
            <div className="announcement-panel-heading">
              <h2>Create Announcement</h2>
            </div>

            <form className="announcement-form" onSubmit={handleSubmit}>
              <div className="announcement-field">
                <label htmlFor="title">Announcement Title *</label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Mid-Semester Exam Notice"
                  required
                  maxLength={150}
                />
              </div>

              <div className="announcement-field">
                <label htmlFor="content">Announcement Message *</label>
                <textarea
                  id="content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Write the announcement details..."
                  required
                  rows={5}
                />
              </div>

              <div className="announcement-fields-grid three-columns">
                <div className="announcement-field">
                  <label htmlFor="category">Category *</label>
                  <input
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. GENERAL"
                    maxLength={50}
                    required
                  />
                </div>

                <div className="announcement-field">
                  <label htmlFor="targetAudience">
                    Target Audience
                  </label>
                  <select
                    id="targetAudience"
                    name="targetAudience"
                    value={form.targetAudience}
                    onChange={handleChange}
                  >
                    <option value="ALL">Everyone</option>
                    <option value="STUDENT">Students</option>
                    <option value="STAFF">Staff</option>
                    <option value="HOSTEL">Hostel audience</option>
                  </select>
                </div>

                <div className="announcement-field">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>

                <div className="announcement-field">
                  <label htmlFor="publishAt">
                    Publish At (optional)
                  </label>
                  <input
                    id="publishAt"
                    name="publishAt"
                    type="datetime-local"
                    value={form.publishAt}
                    onChange={handleChange}
                  />
                </div>

                <div className="announcement-field">
                  <label htmlFor="expiresAt">
                    Expires At (optional)
                  </label>
                  <input
                    id="expiresAt"
                    name="expiresAt"
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="announcement-submit-row">
                <button
                  className="announcement-primary-btn"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Submitting..." : "Create Announcement"}
                </button>

                <button
                  className="announcement-secondary-btn"
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setForm({ ...INITIAL_FORM });
                    setError("");
                    setSuccess("");
                  }}
                >
                  Clear Form
                </button>
              </div>
            </form>
          </section>

          <section>
            <div className="announcement-section-heading">
              <div>
                <h2>Existing Announcements</h2>
                <p>
                  Review the announcements returned by the admin API.
                </p>
              </div>

              <span className="announcement-count">
                {filteredAnnouncements.length}{" "}
                {filteredAnnouncements.length === 1
                  ? "announcement"
                  : "announcements"}
              </span>
            </div>

            <div className="announcement-list-filters">
              <div className="announcement-field">
                <label htmlFor="announcement-search">
                  Search announcements
                </label>
                <input
                  id="announcement-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, message, category or audience..."
                />
              </div>

              <div className="announcement-field">
                <label htmlFor="announcement-status-filter">
                  Filter by status
                </label>
                <select
                  id="announcement-status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="ALL">All statuses</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            {listError && (
              <div className="announcement-alert error" role="alert">
                <p>{listError}</p>
                <button
                  type="button"
                  className="announcement-secondary-btn"
                  onClick={fetchAnnouncements}
                  disabled={loading}
                >
                  {loading ? "Retrying..." : "Retry loading"}
                </button>
              </div>
            )}

            {loading ? (
              <div className="announcement-empty-state">
                Loading announcements...
              </div>
            ) : announcements.length === 0 ? (
              <div className="announcement-empty-state">
                <h3>No announcements found</h3>
                <p>
                  {listError
                    ? "The announcement list will appear when the request succeeds."
                    : "Create an announcement using the form above."}
                </p>
                {!listError && (
                  <button
                    type="button"
                    className="announcement-secondary-btn"
                    onClick={() => {
                      setForm({ ...INITIAL_FORM });
                      setError("");
                    }}
                  >
                    Create an announcement
                  </button>
                )}
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="announcement-empty-state">
                <h3>No matching announcements</h3>
                <p>Try changing the search term or status filter.</p>
                <button
                  type="button"
                  className="announcement-secondary-btn"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="announcement-list">
                {filteredAnnouncements.map((announcement, index) => (
                  <article
                    key={announcement.id ?? `announcement-${index}`}
                    className="announcement-card"
                  >
                    <div className="announcement-card-header">
                      <h3>{announcement.title || "Untitled announcement"}</h3>

                      <span
                        className={`announcement-status ${getStatusClass(
                          announcement.status
                        )}`}
                      >
                        {announcement.status || "Unknown"}
                      </span>
                    </div>

                    <p className="announcement-content">
                      {announcement.content || "No message provided."}
                    </p>

                    <div className="announcement-metadata">
                      <span>
                        <strong>Category:</strong>{" "}
                        {announcement.category || "—"}
                      </span>

                      <span>
                        <strong>Audience:</strong>{" "}
                        {announcement.targetAudience || "—"}
                      </span>

                      <span>
                        <strong>Published:</strong>{" "}
                        {formatDate(
                          announcement.publishAt ||
                            announcement.createdAt
                        )}
                      </span>

                      {announcement.expiresAt && (
                        <span>
                          <strong>Expires:</strong>{" "}
                          {formatDate(announcement.expiresAt)}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default ManageAnnouncements;

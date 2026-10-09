
import { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "GENERAL",
    targetAudience: "STUDENT",
    status: "PUBLISHED",
    publishAt: "",
    expiresAt: "",
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    setListError("");

    try {
      const response = await API.get("/announcements/admin");

      setAnnouncements(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to load announcements:", err);

      setAnnouncements([]);
      setListError(
        "The announcement list is temporarily unavailable. You can still use the creation form."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      form.publishAt &&
      form.expiresAt &&
      form.expiresAt <= form.publishAt
    ) {
      setError("Expiration must be later than publication.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        publishAt: form.publishAt
          ? `${form.publishAt}:00`
          : null,
        expiresAt: form.expiresAt
          ? `${form.expiresAt}:00`
          : null,
      };

      const response = await API.post(
        "/announcements",
        payload
      );

      setSuccess("Announcement submitted successfully.");

      // Add the returned announcement without reloading the list.
      if (response.data) {
        setAnnouncements((previous) => [
          response.data,
          ...previous.filter(
            (item) => item.id !== response.data.id
          ),
        ]);
      }

      setForm({
        title: "",
        content: "",
        category: "GENERAL",
        targetAudience: "STUDENT",
        status: "PUBLISHED",
        publishAt: "",
        expiresAt: "",
      });
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

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #E5D9C7",
    borderRadius: "7px",
    background: "#FFFEFC",
    color: "#2C1F1D",
    fontSize: "14px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    color: "#51413A",
    fontSize: "13px",
    fontWeight: "600",
  };

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "calc(100vh - 68px)",
          background: "#F8F4EB",
          padding: "36px 24px",
          color: "#2C1F1D",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p
            style={{
              color: "#C88A2E",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            CAMPUSONE · ADMIN
          </p>

          <h1
            style={{
              fontFamily: 'Georgia, "Source Serif 4", serif',
              fontSize: "32px",
              margin: "0 0 8px",
            }}
          >
            Manage Announcements
          </h1>

          <p style={{ color: "#72635B", marginBottom: "28px" }}>
            Publish campus updates and manage announcement visibility.
          </p>

          {error && (
            <p
              role="alert"
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "#FDF2F0",
                color: "#9C2A1B",
              }}
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "#EAF5E9",
                color: "#28652B",
              }}
            >
              {success}
            </p>
          )}

          <section
            style={{
              background: "#FFFFFF",
              padding: "26px",
              border: "1px solid #EFE8DA",
              borderRadius: "12px",
              marginBottom: "28px",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "21px" }}>
              Create Announcement
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle} htmlFor="title">
                  Announcement Title
                </label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="e.g. Mid-Semester Exam Notice"
                  required
                  maxLength={150}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle} htmlFor="content">
                  Announcement Message
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  style={{ ...inputStyle, minHeight: "120px" }}
                  placeholder="Write the announcement details..."
                  required
                  rows={5}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "18px",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <label style={labelStyle} htmlFor="category">
                    Category
                  </label>
                  <input
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle} htmlFor="targetAudience">
                    Target Audience
                  </label>
                  <select
                    id="targetAudience"
                    name="targetAudience"
                    value={form.targetAudience}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="ALL">Everyone</option>
                    <option value="STUDENT">Students</option>
                    <option value="STAFF">Staff</option>
                    <option value="HOSTEL">Hostel audience</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle} htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle} htmlFor="publishAt">
                    Publish At (optional)
                  </label>
                  <input
                    id="publishAt"
                    name="publishAt"
                    type="datetime-local"
                    value={form.publishAt}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle} htmlFor="expiresAt">
                    Expires At (optional)
                  </label>
                  <input
                    id="expiresAt"
                    name="expiresAt"
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving ? "#9D8B78" : "#2C1F1D",
                  color: "#FAF6EE",
                  border: "none",
                  borderRadius: "7px",
                  padding: "12px 22px",
                  fontWeight: "600",
                  cursor: saving ? "wait" : "pointer",
                }}
              >
                {saving ? "Submitting..." : "Create Announcement"}
              </button>
            </form>
          </section>

          <section>
            <h2
              style={{
                fontFamily: 'Georgia, "Source Serif 4", serif',
                fontSize: "24px",
                marginBottom: "16px",
              }}
            >
              Existing Announcements
            </h2>

            {listError && (
              <div
                role="alert"
                style={{
                  background: "#FFF7E8",
                  border: "1px solid #E8D5AF",
                  color: "#76521C",
                  padding: "14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ margin: "0 0 10px" }}>{listError}</p>
                <button
                  type="button"
                  onClick={fetchAnnouncements}
                  disabled={loading}
                  style={{
                    background: "#2C1F1D",
                    color: "#FAF6EE",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    cursor: loading ? "wait" : "pointer",
                  }}
                >
                  {loading ? "Retrying..." : "Retry loading"}
                </button>
              </div>
            )}

            {loading ? (
              <p>Loading announcements...</p>
            ) : announcements.length === 0 ? (
              <div
                style={{
                  background: "#FFFFFF",
                  padding: "28px",
                  border: "1px solid #EFE8DA",
                  borderRadius: "12px",
                  color: "#72635B",
                }}
              >
                {listError
                  ? "Announcements cannot be displayed until the list request succeeds."
                  : "No announcements found."}
              </div>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {announcements.map((announcement, index) => (
                  <article
                    key={announcement.id ?? `announcement-${index}`}
                    style={{
                      background: "#FFFFFF",
                      padding: "22px",
                      border: "1px solid #EFE8DA",
                      borderLeft: "4px solid #C88A2E",
                      borderRadius: "10px",
                    }}
                  >
                    <h3 style={{ margin: "0 0 10px" }}>
                      {announcement.title}
                    </h3>

                    <p
                      style={{
                        color: "#72635B",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                      }}
                    >
                      {announcement.content}
                    </p>

                    <small style={{ color: "#8A776A" }}>
                      Audience: {announcement.targetAudience || "—"}
                      {" · "}
                      Status: {announcement.status || "—"}
                    </small>
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

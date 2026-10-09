
import { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await API.get("/announcements");
        setAnnouncements(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load announcements. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "calc(100vh - 68px)",
          background: "#F8F4EB",
          padding: "40px 24px",
          color: "#2C1F1D",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <p
            style={{
              color: "#C88A2E",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            CAMPUSONE
          </p>

          <h1
            style={{
              fontFamily: 'Georgia, "Source Serif 4", serif',
              fontSize: "32px",
              margin: "0 0 8px",
            }}
          >
            Campus Announcements
          </h1>

          <p style={{ color: "#72635B", marginBottom: "28px" }}>
            Stay informed about campus news, notices, and updates.
          </p>

          {error && (
            <div
              role="alert"
              style={{
                padding: "14px",
                background: "#FDF2F0",
                border: "1px solid #F3C2BA",
                color: "#9C2A1B",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              {error}
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{ marginLeft: "12px" }}
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div
              style={{
                background: "#FFFFFF",
                padding: "36px",
                border: "1px solid #EFE8DA",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              Loading announcements...
            </div>
          ) : announcements.length === 0 ? (
            <div
              style={{
                background: "#FFFFFF",
                padding: "48px 24px",
                border: "1px solid #EFE8DA",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <h2 style={{ marginTop: 0 }}>No announcements yet</h2>
              <p style={{ color: "#72635B", marginBottom: 0 }}>
                Published campus updates will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #EFE8DA",
                    borderLeft: "4px solid #C88A2E",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 8px 24px rgba(44, 31, 29, 0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    {announcement.category && (
                      <span
                        style={{
                          background: "#FAF0E6",
                          color: "#9A5B2C",
                          borderRadius: "20px",
                          padding: "5px 10px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {announcement.category}
                      </span>
                    )}

                    {announcement.publishAt && (
                      <span style={{ color: "#72635B", fontSize: "12px" }}>
                        Published:{" "}
                        {new Date(announcement.publishAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <h2
                    style={{
                      fontSize: "21px",
                      margin: "0 0 12px",
                      fontFamily: 'Georgia, "Source Serif 4", serif',
                    }}
                  >
                    {announcement.title || "Campus announcement"}
                  </h2>

                  <p
                    style={{
                      color: "#72635B",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {announcement.content || "No additional details provided."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Announcements;

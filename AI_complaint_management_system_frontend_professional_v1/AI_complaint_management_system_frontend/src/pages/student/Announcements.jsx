
import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");

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
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <>
      <Navbar />

      <main className="announcements-page">
        <style>{`
          .announcements-page {
            min-height: calc(100vh - 68px);
            box-sizing: border-box;
            background: #F8F4EB;
            padding: 40px 24px 56px;
            color: #2C1F1D;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }

          .announcements-container {
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
          }

          .announcements-header {
            margin-bottom: 30px;
          }

          .eyebrow {
            color: #C88A2E;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .1em;
            margin: 0 0 8px;
          }

          .announcements-header h1 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 34px;
            font-weight: 600;
            line-height: 1.2;
            margin: 0 0 10px;
            color: #2C1F1D;
          }

          .announcements-subtitle {
            color: #72635B;
            font-size: 15px;
            line-height: 1.7;
            margin: 0;
          }

          .announcements-list {
            display: grid;
            gap: 18px;
          }

          .announcement-card {
            min-width: 0;
            box-sizing: border-box;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-left: 4px solid #C88A2E;
            border-radius: 13px;
            padding: 24px 26px;
            box-shadow: 0 5px 18px rgba(44, 31, 29, .035);
            transition: box-shadow .2s ease, border-color .2s ease;
          }

          .announcement-card:hover {
            box-shadow: 0 9px 24px rgba(44, 31, 29, .065);
            border-color: #E2D7C3;
            border-left-color: #C88A2E;
          }

          .announcement-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 14px;
          }

          .announcement-category {
            display: inline-flex;
            align-items: center;
            background: #FAF0E6;
            color: #89531E;
            border-radius: 20px;
            padding: 6px 11px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .03em;
          }

          .announcement-date {
            color: #82746A;
            font-size: 12px;
            line-height: 1.5;
          }

          .announcement-title {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 22px;
            line-height: 1.4;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 12px;
            overflow-wrap: anywhere;
          }

          .announcement-content {
            color: #655750;
            font-size: 14px;
            line-height: 1.8;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            margin: 0;
          }

          .announcement-state {
            box-sizing: border-box;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 14px;
            padding: 48px 24px;
            text-align: center;
          }

          .announcement-state-icon {
            width: 54px;
            height: 54px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            border-radius: 50%;
            background: #FAF6EE;
            color: #C88A2E;
            font-size: 25px;
          }

          .announcement-state h2 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 22px;
            font-weight: 600;
            margin: 0 0 10px;
            color: #2C1F1D;
          }

          .announcement-state p {
            max-width: 450px;
            margin: 0 auto;
            color: #72635B;
            font-size: 14px;
            line-height: 1.7;
          }

          .announcement-retry {
            margin-top: 18px;
            padding: 10px 16px;
            border: 1px solid #E2D7C3;
            border-radius: 8px;
            background: #FFFFFF;
            color: #2C1F1D;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          }

          .announcement-retry:hover:not(:disabled) {
            background: #FAF6EE;
          }

          .announcement-retry:disabled {
            opacity: .6;
            cursor: not-allowed;
          }

          .announcement-error {
            padding: 14px 16px;
            margin-bottom: 20px;
            background: #FDF2F0;
            border: 1px solid #F3C2BA;
            border-radius: 9px;
            color: #9C2A1B;
            font-size: 14px;
            line-height: 1.6;
            overflow-wrap: anywhere;
          }

          @media (max-width: 600px) {
            .announcements-page {
              padding: 26px 16px 40px;
            }

            .announcements-header h1 {
              font-size: 29px;
            }

            .announcement-card {
              padding: 20px 18px;
            }

            .announcement-title {
              font-size: 20px;
            }

            .announcement-state {
              padding: 36px 18px;
            }
          }
        `}</style>

        <div className="announcements-container">
          <header className="announcements-header">
            <p className="eyebrow">STUDENT PORTAL</p>

            <h1>Campus Announcements</h1>

            <p className="announcements-subtitle">
              Stay informed about campus news, notices, and updates.
            </p>
          </header>

          {error && (
            <div className="announcement-error" role="alert">
              <p style={{ margin: 0 }}>{error}</p>

              <button
                type="button"
                className="announcement-retry"
                onClick={fetchAnnouncements}
                disabled={loading}
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="announcement-state" role="status">
              <div className="announcement-state-icon">…</div>
              <h2>Loading announcements</h2>
              <p>Please wait while we retrieve campus updates.</p>
            </div>
          ) : error && announcements.length === 0 ? (
            <div className="announcement-state">
              <div className="announcement-state-icon">!</div>
              <h2>Announcements unavailable</h2>
              <p>
                We couldn't load the latest campus announcements.
                Please try again.
              </p>

              <button
                type="button"
                className="announcement-retry"
                onClick={fetchAnnouncements}
              >
                Retry loading
              </button>
            </div>
          ) : announcements.length === 0 ? (
            <div className="announcement-state">
              <div className="announcement-state-icon">✦</div>
              <h2>No announcements yet</h2>
              <p>
                Published campus updates will appear here when they
                become available.
              </p>
            </div>
          ) : (
            <section
              className="announcements-list"
              aria-label="Campus announcements"
            >
              {announcements.map((announcement, index) => {
                const publishedDate = formatDate(
                  announcement.publishAt ??
                    announcement.publish_at ??
                    announcement.createdAt ??
                    announcement.created_at
                );

                return (
                  <article
                    className="announcement-card"
                    key={announcement.id ?? `announcement-${index}`}
                  >
                    <div className="announcement-meta">
                      {announcement.category ? (
                        <span className="announcement-category">
                          {announcement.category}
                        </span>
                      ) : (
                        <span />
                      )}

                      {publishedDate && (
                        <time className="announcement-date">
                          Published: {publishedDate}
                        </time>
                      )}
                    </div>

                    <h2 className="announcement-title">
                      {announcement.title || "Campus announcement"}
                    </h2>

                    <p className="announcement-content">
                      {announcement.content ||
                        "No additional details provided."}
                    </p>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default Announcements;

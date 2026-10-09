
import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/notifications");
      setNotifications(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const isUnread = (notification) =>
    !(notification.read ?? notification.isRead ?? false);

  const unreadCount = useMemo(
    () => notifications.filter(isUnread).length,
    [notifications]
  );

  const markAsRead = async (id) => {
    if (id == null) {
      setError("This notification has no ID and cannot be marked as read.");
      return;
    }

    setActionLoading(id);
    setError("");

    try {
      await API.put(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, read: true, isRead: true }
            : notification
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to mark this notification as read."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    setActionLoading("all");
    setError("");

    try {
      await API.put("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
          isRead: true,
        }))
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString();
  };

  return (
    <>
      <Navbar />

      <main className="notifications-page">
        <style>{`
          .notifications-page {
            min-height: calc(100vh - 68px);
            box-sizing: border-box;
            padding: 40px 24px 56px;
            background: #F8F4EB;
            color: #2C1F1D;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }

          .notifications-container {
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
          }

          .notifications-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 28px;
          }

          .eyebrow {
            color: #C88A2E;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .1em;
            margin: 0 0 8px;
          }

          .notifications-header h1 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 34px;
            font-weight: 600;
            line-height: 1.2;
            margin: 0 0 10px;
            color: #2C1F1D;
          }

          .header-subtitle {
            color: #72635B;
            font-size: 15px;
            line-height: 1.6;
            margin: 0;
          }

          .unread-summary {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            margin-top: 14px;
            padding: 7px 11px;
            background: #FAF0E6;
            color: #89531E;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
          }

          .unread-dot {
            width: 7px;
            height: 7px;
            background: #C88A2E;
            border-radius: 50%;
          }

          .mark-all-button {
            border: 1px solid #2C1F1D;
            border-radius: 9px;
            padding: 12px 17px;
            background: #2C1F1D;
            color: #F8F4EB;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background .2s ease, opacity .2s ease;
          }

          .mark-all-button:hover:not(:disabled) {
            background: #49342D;
          }

          .mark-all-button:disabled {
            background: #D7CEC2;
            border-color: #D7CEC2;
            color: #75685F;
            cursor: not-allowed;
          }

          .notifications-list {
            display: grid;
            gap: 14px;
          }

          .notification-card {
            min-width: 0;
            box-sizing: border-box;
            padding: 22px 24px;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 13px;
            box-shadow: 0 4px 14px rgba(44, 31, 29, .035);
            transition: border-color .2s ease, box-shadow .2s ease;
          }

          .notification-card.unread {
            border-color: #E3C993;
            border-left: 4px solid #C88A2E;
          }

          .notification-card:hover {
            box-shadow: 0 8px 22px rgba(44, 31, 29, .06);
          }

          .notification-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
          }

          .notification-main {
            flex: 1;
            min-width: 0;
          }

          .notification-title {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 19px;
            line-height: 1.4;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 9px;
            overflow-wrap: anywhere;
          }

          .notification-details {
            display: flex;
            flex-wrap: wrap;
            gap: 7px 14px;
            margin-bottom: 12px;
            color: #9A5B2C;
            font-size: 12px;
            line-height: 1.5;
          }

          .notification-type {
            font-weight: 700;
          }

          .notification-message {
            color: #72635B;
            font-size: 14px;
            line-height: 1.7;
            margin: 0;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
          }

          .read-badge {
            flex-shrink: 0;
            border-radius: 20px;
            padding: 6px 10px;
            background: #FAF0E6;
            color: #89531E;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
          }

          .read-badge.read {
            background: #F1F0EC;
            color: #726A61;
          }

          .notification-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 18px;
          }

          .mark-read-button {
            border: 1px solid #E2D9C8;
            border-radius: 8px;
            padding: 9px 13px;
            background: #FCFAF5;
            color: #2C1F1D;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          }

          .mark-read-button:hover:not(:disabled) {
            background: #F5EBDD;
          }

          .mark-read-button:disabled {
            opacity: .6;
            cursor: not-allowed;
          }

          .notifications-state {
            box-sizing: border-box;
            padding: 48px 24px;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 14px;
            text-align: center;
          }

          .state-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 52px;
            height: 52px;
            margin: 0 auto 16px;
            border-radius: 50%;
            background: #FAF6EE;
            color: #C88A2E;
            font-size: 25px;
          }

          .notifications-state h2 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 22px;
            font-weight: 600;
            margin: 0 0 9px;
            color: #2C1F1D;
          }

          .notifications-state p {
            max-width: 440px;
            margin: 0 auto;
            color: #72635B;
            font-size: 14px;
            line-height: 1.7;
          }

          .retry-button {
            margin-top: 18px;
            border: 1px solid #E2D7C3;
            border-radius: 8px;
            padding: 10px 16px;
            background: #FFFFFF;
            color: #2C1F1D;
            font-weight: 600;
            cursor: pointer;
          }

          .notifications-error {
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
            .notifications-page {
              padding: 26px 16px 40px;
            }

            .notifications-header h1 {
              font-size: 29px;
            }

            .notifications-header {
              align-items: stretch;
            }

            .mark-all-button {
              width: 100%;
            }

            .notification-card {
              padding: 18px;
            }

            .notification-top {
              gap: 10px;
            }

            .notification-title {
              font-size: 17px;
            }

            .notifications-state {
              padding: 36px 18px;
            }
          }
        `}</style>

        <div className="notifications-container">
          <header className="notifications-header">
            <div>
              <p className="eyebrow">STUDENT PORTAL</p>
              <h1>Notifications</h1>
              <p className="header-subtitle">
                Stay updated on your complaints and campus activity.
              </p>

              <div className="unread-summary">
                <span className="unread-dot" />
                {unreadCount} unread notification
                {unreadCount === 1 ? "" : "s"}
              </div>
            </div>

            <button
              type="button"
              className="mark-all-button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || actionLoading !== null}
            >
              {actionLoading === "all"
                ? "Updating..."
                : "Mark all as read"}
            </button>
          </header>

          {error && (
            <div className="notifications-error" role="alert">
              {error}
              <button
                type="button"
                className="retry-button"
                onClick={fetchNotifications}
                disabled={loading}
              >
                Retry loading
              </button>
            </div>
          )}

          {loading ? (
            <div className="notifications-state" role="status">
              <div className="state-icon">…</div>
              <h2>Loading notifications</h2>
              <p>Please wait while we retrieve your latest updates.</p>
            </div>
          ) : error && notifications.length === 0 ? (
            <div className="notifications-state">
              <div className="state-icon">!</div>
              <h2>Notifications unavailable</h2>
              <p>
                We couldn't retrieve your notifications. Please try again.
              </p>
              <button
                type="button"
                className="retry-button"
                onClick={fetchNotifications}
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notifications-state">
              <div className="state-icon">✓</div>
              <h2>You're all caught up!</h2>
              <p>
                You don't have any notifications yet. New campus updates
                will appear here.
              </p>
            </div>
          ) : (
            <section
              className="notifications-list"
              aria-label="Your notifications"
            >
              {notifications.map((notification, index) => {
                const unread = isUnread(notification);
                const id = notification.id;
                const createdAt = formatDate(
                  notification.createdAt ?? notification.created_at
                );

                return (
                  <article
                    key={id ?? `notification-${index}`}
                    className={`notification-card ${unread ? "unread" : ""}`}
                  >
                    <div className="notification-top">
                      <div className="notification-main">
                        <h2 className="notification-title">
                          {notification.title || "Campus notification"}
                        </h2>

                        <div className="notification-details">
                          {notification.type && (
                            <span className="notification-type">
                              {notification.type}
                            </span>
                          )}

                          {createdAt && <span>{createdAt}</span>}
                        </div>

                        <p className="notification-message">
                          {notification.message ||
                            notification.content ||
                            "No additional details provided."}
                        </p>
                      </div>

                      <span className={`read-badge ${unread ? "" : "read"}`}>
                        {unread ? "Unread" : "Read"}
                      </span>
                    </div>

                    {unread && (
                      <div className="notification-actions">
                        <button
                          type="button"
                          className="mark-read-button"
                          onClick={() => markAsRead(id)}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === id
                            ? "Updating..."
                            : "Mark as read"}
                        </button>
                      </div>
                    )}
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

export default Notifications;

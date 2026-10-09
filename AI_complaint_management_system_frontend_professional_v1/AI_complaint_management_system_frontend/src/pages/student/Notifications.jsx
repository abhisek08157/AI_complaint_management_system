
import { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setError("");
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
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
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
    }
  };

  const markAllAsRead = async () => {
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
    }
  };

  const isUnread = (notification) =>
    !(notification.read ?? notification.isRead ?? false);

  const unreadCount = notifications.filter(isUnread).length;

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
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <div>
              <p
                style={{
                  color: "#C88A2E",
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "2px",
                  margin: "0 0 8px",
                }}
              >
                CAMPUSONE
              </p>

              <h1 style={{ margin: "0 0 8px", fontSize: "30px" }}>
                Notifications
              </h1>

              <p style={{ margin: 0, color: "#72635B" }}>
                You have {unreadCount} unread notification
                {unreadCount === 1 ? "" : "s"}.
              </p>
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              style={{
                padding: "12px 18px",
                border: "none",
                borderRadius: "8px",
                background: unreadCount === 0 ? "#C4B8A9" : "#2C1F1D",
                color: "#F8F4EB",
                cursor: unreadCount === 0 ? "not-allowed" : "pointer",
                fontWeight: "600",
              }}
            >
              Mark all as read
            </button>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                padding: "14px",
                marginBottom: "20px",
                background: "#FDF2F0",
                border: "1px solid #F3C2BA",
                borderRadius: "8px",
                color: "#9C2A1B",
              }}
            >
              {error}
              <button
                type="button"
                onClick={fetchNotifications}
                style={{ marginLeft: "12px" }}
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div
              style={{
                padding: "36px",
                background: "#FFFFFF",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                background: "#FFFFFF",
                border: "1px solid #EFE8DA",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <h2 style={{ marginTop: 0 }}>You're all caught up!</h2>
              <p style={{ color: "#72635B", marginBottom: 0 }}>
                New campus updates will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  style={{
                    padding: "22px",
                    background: "#FFFFFF",
                    border: `1px solid ${
                      isUnread(notification) ? "#D9B778" : "#EFE8DA"
                    }`,
                    borderLeft: `4px solid ${
                      isUnread(notification) ? "#C88A2E" : "#D3C7B6"
                    }`,
                    borderRadius: "10px",
                    boxShadow: "0 4px 14px rgba(44, 31, 29, 0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div>
                    <h3 style={{ margin: "0 0 8px", fontSize: "17px" }}>
                        {notification.title || "Campus notification"}
                        </h3>

                        <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                            marginBottom: "10px",
                            color: "#9A5B2C",
                            fontSize: "12px",
                            fontWeight: "600",
                        }}
                        >
                        {notification.type && (
                            <span>Type: {notification.type}</span>
                        )}

                        {notification.createdAt && (
                            <span>
                            {new Date(notification.createdAt).toLocaleString()}
                            </span>
                        )}
                        </div>


                      <p
                        style={{
                          margin: 0,
                          color: "#72635B",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {notification.message ||
                          notification.content ||
                          "No additional details provided."}
                      </p>
                    </div>

                    {isUnread(notification) && (
                      <span
                        style={{
                          color: "#9A5B2C",
                          background: "#FAF0E6",
                          padding: "5px 9px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Unread
                      </span>
                    )}
                  </div>

                  {isUnread(notification) && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      style={{
                        marginTop: "16px",
                        padding: "8px 12px",
                        border: "1px solid #E2D9C8",
                        borderRadius: "7px",
                        background: "#FCFAF5",
                        color: "#2C1F1D",
                        cursor: "pointer",
                      }}
                    >
                      Mark as read
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Notifications;

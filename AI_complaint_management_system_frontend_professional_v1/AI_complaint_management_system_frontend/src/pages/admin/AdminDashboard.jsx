
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../../components/Navbar";
import ComplaintCard from "../../components/ComplaintCard";

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaintsError, setComplaintsError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/analytics/dashboard");
      setAnalytics(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load dashboard information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadComplaints = useCallback(async () => {
    setComplaintsLoading(true);
    setComplaintsError("");

    try {
      const response = await API.get("/admin/complaints");
      setComplaints(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setComplaintsError(
        err.response?.data?.message ||
          "Could not load recent complaints."
      );
    } finally {
      setComplaintsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
    loadComplaints();
  }, [loadAnalytics, loadComplaints]);

  const users = analytics?.users;
  const complaintStats = analytics?.complaints;
  const requests = analytics?.campusRequests;
  const passes = analytics?.gatePasses;
  const announcements = analytics?.announcements;

  const number = (value) =>
    typeof value === "number" ? value : "—";

  const summaryCards = [
    {
      title: "All complaints",
      value: complaintStats?.total,
      detail: `${number(complaintStats?.submitted)} submitted · ${number(
        complaintStats?.resolved
      )} resolved`,
      icon: "▤",
      color: "amber",
      href: "/admin/complaints",
    },
    {
      title: "Registered people",
      value: users?.total,
      detail: `${number(users?.students)} students · ${number(
        users?.staff
      )} staff`,
      icon: "♙",
      color: "green",
    },
    {
      title: "Campus requests",
      value: requests?.total,
      detail: `${number(requests?.pending)} waiting for review`,
      icon: "▣",
      color: "blue",
    },
    {
      title: "Gate passes",
      value: passes?.total,
      detail: `${number(passes?.pending)} waiting for approval`,
      icon: "↗",
      color: "rose",
    },
  ];

  const quickActions = [
    {
      title: "Check complaints",
      description: "Read complaints and assign them to staff.",
      href: "/admin/complaints",
      icon: "▤",
    },
    {
      title: "Manage staff",
      description: "View staff members and their work areas.",
      href: "/admin/staff",
      icon: "♙",
    },
    {
      title: "Post a notice",
      description: "Create and manage campus announcements.",
      href: "/admin/announcements",
      icon: "▣",
    },
  ];

  const detailGroups = [
    {
      title: "Complaint Details",
      description: "Track the progress of student complaints.",
      icon: "▤",
      color: "amber",
      items: [
        ["Waiting for review", complaintStats?.submitted],
        ["Assigned to staff", complaintStats?.assigned],
        ["Being worked on", complaintStats?.inProgress],
        ["Fixed / Resolved", complaintStats?.resolved],
      ],
    },
    {
      title: "Campus Request Details",
      description: "Track student requests and their decisions.",
      icon: "▣",
      color: "green",
      items: [
        ["Waiting for review", requests?.pending],
        ["Under review", requests?.underReview],
        ["Approved", requests?.approved],
        ["Rejected", requests?.rejected],
        ["Completed", requests?.completed],
      ],
    },
    {
      title: "Gate Pass & Announcement Details",
      description: "Monitor gate passes and campus notices.",
      icon: "↗",
      color: "blue",
      items: [
        ["Gate passes awaiting approval", passes?.pending],
        ["Approved gate passes", passes?.approved],
        ["Rejected gate passes", passes?.rejected],
        ["Students currently outside", passes?.outside],
        ["Completed gate passes", passes?.completed],
        ["Published announcements", announcements?.published],
        ["Draft announcements", announcements?.draft],
        ["Expired announcements", announcements?.expired],
      ],
    },
  ];

  return (
    <>
      <Navbar />

      <main className="admin-page">
        <style>{`
          .admin-page {
            min-height: calc(100vh - 68px);
            width: 100%;
            background: #F8F4EB;
            color: #2C1F1D;
            padding: 32px 36px 48px;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }

          .admin-container {
            width: 100%;
            max-width: 1280px;
            margin: 0 auto;
          }

          .welcome {
            margin-bottom: 32px;
          }

          .welcome-label {
            display: inline-block;
            background: #F1E3CB;
            color: #79501E;
            border: 1px solid #E5D2B1;
            padding: 6px 11px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.06em;
            margin-bottom: 12px;
          }

          .welcome h1 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            line-height: 1.2;
            font-weight: 600;
            letter-spacing: -0.02em;
            color: #2C1F1D;
            margin: 0 0 8px;
          }

          .welcome p {
            color: #72635B;
            font-size: 14px;
            line-height: 1.65;
            margin: 0;
          }

          .section {
            margin-bottom: 34px;
            min-width: 0;
          }

          .section-heading {
            margin-bottom: 16px;
          }

          .section-heading h2 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 23px;
            line-height: 1.3;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 6px;
          }

          .section-heading p {
            color: #72635B;
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
          }

          /* Main summary cards */
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            align-items: stretch;
            gap: 16px;
          }

          .summary-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            min-width: 0;
            min-height: 205px;
            padding: 21px;
            border: 1px solid #EFE8DA;
            border-radius: 13px;
            background: #FFFFFF;
            color: #2C1F1D;
            text-decoration: none;
            box-sizing: border-box;
            box-shadow: 0 4px 14px rgba(44, 31, 29, 0.035);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .summary-card[href]:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(44, 31, 29, 0.09);
          }

          .summary-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            flex-shrink: 0;
            margin-bottom: 17px;
            border-radius: 10px;
            font-size: 21px;
          }

          .summary-card h4 {
            font-size: 14px;
            line-height: 1.4;
            font-weight: 700;
            color: #2C1F1D;
            margin: 0 0 8px;
          }

          .summary-card h3 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            line-height: 1.15;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 9px;
          }

          .summary-card p {
            color: #72635B;
            font-size: 12px;
            line-height: 1.6;
            margin: 0;
            overflow-wrap: anywhere;
          }

          .summary-link {
            margin-top: auto;
            padding-top: 13px;
            font-size: 12px;
            line-height: 1.4;
            color: #A66C1E;
            font-weight: 700;
          }

          .amber .summary-icon {
            background: #F5E8D1;
            color: #94601C;
          }

          .green .summary-icon {
            background: #E4EDE0;
            color: #426644;
          }

          .blue .summary-icon {
            background: #E5EBF5;
            color: #365B8A;
          }

          .rose .summary-icon {
            background: #F3E4E9;
            color: #87455C;
          }

          /* Quick actions */
          .actions-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            align-items: stretch;
            gap: 16px;
          }

          .action-card {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            min-width: 0;
            min-height: 112px;
            padding: 19px;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
            background: #FFFFFF;
            color: #2C1F1D;
            text-decoration: none;
            box-sizing: border-box;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }

          .action-card:hover {
            border-color: #C88A2E;
            box-shadow: 0 5px 15px rgba(44, 31, 29, 0.06);
          }

          .action-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            flex-shrink: 0;
            border-radius: 10px;
            background: #F5E8D1;
            color: #79501E;
            font-size: 21px;
          }

          .action-card h3 {
            color: #2C1F1D;
            font-size: 14px;
            line-height: 1.4;
            font-weight: 700;
            margin: 1px 0 7px;
          }

          .action-card p {
            color: #72635B;
            font-size: 12px;
            line-height: 1.65;
            margin: 0;
          }

          /* More Details: three clearly separated groups */
          .detail-groups {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .detail-group {
            min-width: 0;
            overflow: hidden;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 13px;
            box-shadow: 0 4px 14px rgba(44, 31, 29, 0.035);
          }

          .detail-group-header {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 20px 22px;
            background: #FDFBF7;
            border-bottom: 1px solid #EFE8DA;
          }

          .detail-group-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            flex-shrink: 0;
            border-radius: 10px;
            font-size: 21px;
          }

          .detail-group-icon.amber {
            background: #F5E8D1;
            color: #94601C;
          }

          .detail-group-icon.green {
            background: #E4EDE0;
            color: #426644;
          }

          .detail-group-icon.blue {
            background: #E5EBF5;
            color: #365B8A;
          }

          .detail-group-header h3 {
            margin: 0 0 5px;
            color: #2C1F1D;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 18px;
            font-weight: 600;
            line-height: 1.35;
          }

          .detail-group-header p {
            margin: 0;
            color: #72635B;
            font-size: 12px;
            line-height: 1.6;
          }

          .detail-group-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .detail-stat {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 14px;
            min-width: 0;
            min-height: 100px;
            padding: 18px 20px;
            border-right: 1px solid #EFE8DA;
            border-bottom: 1px solid #EFE8DA;
            box-sizing: border-box;
          }

          .detail-stat:nth-child(4n) {
            border-right: none;
          }

          .detail-stat span {
            color: #72635B;
            font-size: 12px;
            line-height: 1.6;
            overflow-wrap: anywhere;
          }

          .detail-stat strong {
            color: #2C1F1D;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 25px;
            font-weight: 600;
            line-height: 1.2;
          }

          .detail-group-grid .detail-stat:last-child {
            border-bottom: none;
          }

          /* Latest Complaints: separate heading and description */
          .latest-complaints-section {
            margin-top: 8px;
            margin-bottom: 36px;
            width: 100%;
            min-width: 0;
          }

          .latest-complaints-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 20px;
          }

          .latest-complaints-heading {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            min-width: 0;
          }

          .latest-complaints-heading h2 {
            font-family: Georgia, "Source Serif 4", serif;
            color: #2C1F1D;
            font-size: 25px;
            font-weight: 600;
            line-height: 1.25;
            margin: 0;
          }

          .latest-complaints-heading p {
            color: #72635B;
            font-size: 13px;
            line-height: 1.5;
            margin: 0;
          }

          .latest-complaints-link {
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #A66C1E;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            padding: 8px 0;
          }

          .latest-complaints-link:hover {
            color: #2C1F1D;
            text-decoration: underline;
          }

          .latest-complaints-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            align-items: stretch;
            gap: 20px;
            width: 100%;
          }

          .latest-complaints-grid > * {
            min-width: 0;
            height: 100%;
          }

          .latest-complaints-message {
            padding: 24px;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
            color: #72635B;
            font-size: 14px;
            line-height: 1.6;
          }

          .latest-complaints-empty {
            padding: 40px 24px;
            text-align: center;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 13px;
          }

          .latest-complaints-empty h3 {
            color: #2C1F1D;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 20px;
            margin: 0 0 8px;
          }

          .latest-complaints-empty p {
            color: #72635B;
            font-size: 13px;
            margin: 0;
            line-height: 1.6;
          }

          .retry-button {
            margin-top: 11px;
            padding: 9px 14px;
            border: 0;
            border-radius: 7px;
            background: #2C1F1D;
            color: #FFFFFF;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          }

          .retry-button:hover {
            background: #493430;
          }

          .retry-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 1050px) {
            .admin-page {
              padding: 28px 24px 40px;
            }

            .summary-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .latest-complaints-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .detail-group-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            .detail-stat:nth-child(4n) {
              border-right: 1px solid #EFE8DA;
            }

            .detail-stat:nth-child(3n) {
              border-right: none;
            }
          }

          @media (max-width: 760px) {
            .admin-page {
              padding: 24px 18px 36px;
            }

            .actions-grid {
              grid-template-columns: 1fr;
            }

            .action-card {
              min-height: auto;
            }
          }

          @media (max-width: 650px) {
            .latest-complaints-header {
              align-items: flex-start;
              flex-direction: column;
              gap: 10px;
            }

            .latest-complaints-heading h2 {
              font-size: 23px;
            }

            .latest-complaints-grid {
              grid-template-columns: minmax(0, 1fr);
              gap: 16px;
            }

            .detail-group-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .detail-stat:nth-child(3n) {
              border-right: 1px solid #EFE8DA;
            }

            .detail-stat:nth-child(2n) {
              border-right: none;
            }

            .detail-stat:nth-child(n) {
              border-bottom: 1px solid #EFE8DA;
            }

            .detail-group-grid .detail-stat:last-child {
              border-bottom: none;
            }

            .detail-group-header {
              padding: 16px;
            }

            .detail-stat {
              padding: 15px;
            }
          }

          @media (max-width: 520px) {
            .admin-page {
              padding: 22px 14px 32px;
            }

            .welcome h1 {
              font-size: 28px;
            }

            .summary-grid {
              grid-template-columns: minmax(0, 1fr);
            }

            .summary-card {
              min-height: auto;
            }

            .detail-group-grid {
              grid-template-columns: minmax(0, 1fr);
            }

            .detail-group-grid .detail-stat:nth-child(n) {
              border-right: none;
              border-bottom: 1px solid #EFE8DA;
            }

            .detail-group-grid .detail-stat:last-child {
              border-bottom: none;
            }
          }
        `}</style>

        <div className="admin-container">
          <header className="welcome">
            <span className="welcome-label">ADMIN DASHBOARD</span>
            <h1>Good to see you!</h1>
            <p>
              Here is what is happening on your campus. Choose an action
              below to get started.
            </p>
          </header>

          {error && (
            <div className="latest-complaints-message" role="alert">
              {error}
              <br />
              <button
                className="retry-button"
                onClick={loadAnalytics}
                disabled={loading}
              >
                Try again
              </button>
            </div>
          )}

          <section className="section">
            <div className="section-heading">
              <h2>Campus at a glance</h2>
              <p>A quick summary of your campus.</p>
            </div>

            <div className="summary-grid">
              {summaryCards.map((card) => {
                const content = (
                  <>
                    <div className="summary-icon">{card.icon}</div>
                    <h4>{card.title}</h4>
                    <h3>{loading ? "—" : number(card.value)}</h3>
                    <p>
                      {loading ? "Loading information..." : card.detail}
                    </p>
                    {card.href && (
                      <span className="summary-link">
                        See complaints →
                      </span>
                    )}
                  </>
                );

                return card.href ? (
                  <Link
                    key={card.title}
                    to={card.href}
                    className={`summary-card ${card.color}`}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={card.title}
                    className={`summary-card ${card.color}`}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <h2>What would you like to do?</h2>
              <p>Choose a task to open the right page.</p>
            </div>

            <div className="actions-grid">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="action-card"
                >
                  <div className="action-icon">{action.icon}</div>
                  <div>
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <h2>More Details</h2>
              <p>
                View each campus service separately to understand its
                current status.
              </p>
            </div>

            <div className="detail-groups">
              {detailGroups.map((group) => (
                <div className="detail-group" key={group.title}>
                  <div className="detail-group-header">
                    <div
                      className={`detail-group-icon ${group.color}`}
                    >
                      {group.icon}
                    </div>

                    <div>
                      <h3>{group.title}</h3>
                      <p>{group.description}</p>
                    </div>
                  </div>

                  <div className="detail-group-grid">
                    {group.items.map(([label, value]) => (
                      <div className="detail-stat" key={label}>
                        <span>{label}</span>
                        <strong>
                          {loading ? "—" : number(value)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="latest-complaints-section">
            <div className="latest-complaints-header">
              <div className="latest-complaints-heading">
                <h2>Latest complaints</h2>
                <p>Recently reported campus problems.</p>
              </div>

              <Link
                className="latest-complaints-link"
                to="/admin/complaints"
              >
                See all complaints
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {complaintsError && (
              <div className="latest-complaints-message" role="alert">
                {complaintsError}
                <br />
                <button
                  className="retry-button"
                  onClick={loadComplaints}
                  disabled={complaintsLoading}
                >
                  Try again
                </button>
              </div>
            )}

            {complaintsLoading ? (
              <div className="latest-complaints-message">
                Loading complaints...
              </div>
            ) : complaintsError ? null : complaints.length === 0 ? (
              <div className="latest-complaints-empty">
                <h3>No complaints yet</h3>
                <p>
                  New student complaints will appear here when submitted.
                </p>
              </div>
            ) : (
              <div className="latest-complaints-grid">
                {complaints.slice(0, 6).map((complaint) => (
                  <ComplaintCard
                    key={complaint.id ?? complaint.complaintId}
                    complaint={complaint}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default AdminDashboard;

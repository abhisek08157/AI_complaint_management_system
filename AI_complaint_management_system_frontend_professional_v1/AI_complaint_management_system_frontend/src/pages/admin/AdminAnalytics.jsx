
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import API from "../../services/api";
import Navbar from "../../components/Navbar";

const COLORS = ["#A66C1E", "#426644", "#365B8A", "#87455C", "#B99A63"];

function formatNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString()
    : "—";
}

function StatCard({ label, value, detail, icon }) {
  return (
    <article className="analytics-stat-card">
      <div className="analytics-stat-top">
        <span>{label}</span>
        <span className="analytics-stat-icon" aria-hidden="true">
          {icon}
        </span>
      </div>
      <strong>{formatNumber(value)}</strong>
      <p>{detail}</p>
    </article>
  );
}

function Panel({ title, description, children, className = "" }) {
  return (
    <section className={`analytics-panel ${className}`}>
      <div className="analytics-panel-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

function AnalyticsTable({ headers, rows, emptyMessage }) {
  return (
    <div className="analytics-table-wrap">
      <table className="analytics-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="analytics-table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={`${row.join("-")}-${index}`}>
                {row.map((value, cellIndex) => (
                  <td key={cellIndex}>{value}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/analytics/dashboard");
      setAnalytics(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load analytics. Please check the server and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const users = analytics?.users ?? {};
  const complaints = analytics?.complaints ?? {};
  const requests = analytics?.campusRequests ?? {};
  const passes = analytics?.gatePasses ?? {};
  const announcements = analytics?.announcements ?? {};
  const insights = analytics?.complaintInsights ?? {};

  const complaintStatusData = [
    { name: "Submitted", value: complaints.submitted ?? 0 },
    { name: "Assigned", value: complaints.assigned ?? 0 },
    { name: "In progress", value: complaints.inProgress ?? 0 },
    { name: "Resolved", value: complaints.resolved ?? 0 },
  ];

  const complaintAgeData = [
    { name: "0–2 days", count: insights.age0To2Days ?? 0 },
    { name: "3–7 days", count: insights.age3To7Days ?? 0 },
    { name: "Over 7 days", count: insights.ageOver7Days ?? 0 },
  ];

  const staffRows = (insights.staffWorkload ?? []).map((staff) => [
    staff.staffName || "Unnamed staff",
    formatNumber(staff.totalAssigned),
    formatNumber(staff.openComplaints),
    formatNumber(staff.resolvedComplaints),
  ]);

  const locationRows = (insights.recurringLocations ?? []).map((location) => [
    location.location || "Unspecified location",
    formatNumber(location.count),
  ]);

  const resolutionHours = insights.averageResolutionHours;
  const resolutionText =
    typeof resolutionHours === "number" &&
    Number.isFinite(resolutionHours)
      ? `${resolutionHours.toFixed(1)} hours`
      : "—";

  return (
    <>
      <Navbar />

      <main className="analytics-page">
        <style>{`
          .analytics-page {
            min-height: calc(100vh - 68px);
            padding: 32px 36px 48px;
            background: #F8F4EB;
            color: #2C1F1D;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
          }

          .analytics-container {
            max-width: 1280px;
            width: 100%;
            margin: 0 auto;
          }

          .analytics-back {
            display: inline-block;
            margin-bottom: 20px;
            color: #94601C;
            text-decoration: none;
            font-size: 13px;
            font-weight: 700;
          }

          .analytics-back:hover {
            text-decoration: underline;
          }

          .analytics-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 18px;
            margin-bottom: 30px;
          }

          .analytics-eyebrow {
            display: inline-block;
            margin-bottom: 12px;
            padding: 6px 11px;
            border: 1px solid #E5D2B1;
            border-radius: 6px;
            background: #F1E3CB;
            color: #79501E;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .07em;
          }

          .analytics-header h1 {
            margin: 0 0 8px;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            line-height: 1.2;
            font-weight: 600;
          }

          .analytics-header p {
            max-width: 650px;
            margin: 0;
            color: #72635B;
            font-size: 14px;
            line-height: 1.65;
          }

          .analytics-refresh {
            padding: 11px 16px;
            border: 0;
            border-radius: 8px;
            background: #2C1F1D;
            color: white;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          }

          .analytics-refresh:hover {
            background: #493430;
          }

          .analytics-refresh:disabled {
            opacity: .6;
            cursor: not-allowed;
          }

          .analytics-section-title {
            margin: 0 0 15px;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 21px;
            font-weight: 600;
          }

          .analytics-stat-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 15px;
            margin-bottom: 30px;
          }

          .analytics-stat-card {
            min-width: 0;
            padding: 20px;
            border: 1px solid #EFE8DA;
            border-radius: 13px;
            background: #FFFFFF;
            box-shadow: 0 4px 14px rgba(44,31,29,.035);
          }

          .analytics-stat-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            color: #72635B;
            font-size: 12px;
            font-weight: 700;
          }

          .analytics-stat-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            flex-shrink: 0;
            border-radius: 9px;
            background: #F5E8D1;
            color: #94601C;
            font-size: 18px;
          }

          .analytics-stat-card > strong {
            display: block;
            margin: 15px 0 7px;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 30px;
            line-height: 1.2;
            overflow-wrap: anywhere;
          }

          .analytics-stat-card > p {
            margin: 0;
            color: #85766E;
            font-size: 12px;
            line-height: 1.5;
          }

          .analytics-panel-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
            margin-bottom: 22px;
          }

          .analytics-panel {
            min-width: 0;
            padding: 22px;
            border: 1px solid #EFE8DA;
            border-radius: 13px;
            background: #FFFFFF;
            box-shadow: 0 4px 14px rgba(44,31,29,.035);
          }

          .analytics-panel-heading {
            margin-bottom: 18px;
          }

          .analytics-panel-heading h2 {
            margin: 0 0 6px;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 19px;
            font-weight: 600;
          }

          .analytics-panel-heading p {
            margin: 0;
            color: #85766E;
            font-size: 12px;
            line-height: 1.6;
          }

          .analytics-chart {
            width: 100%;
            height: 280px;
          }

          .analytics-insight-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 22px;
          }

          .analytics-insight {
            padding: 17px;
            border: 1px solid #EFE8DA;
            border-radius: 11px;
            background: #FDFBF7;
          }

          .analytics-insight span {
            display: block;
            margin-bottom: 9px;
            color: #72635B;
            font-size: 12px;
            line-height: 1.5;
          }

          .analytics-insight strong {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 24px;
            overflow-wrap: anywhere;
          }

          .analytics-alert {
            margin-bottom: 22px;
            padding: 15px 17px;
            border: 1px solid #E8C9C0;
            border-radius: 10px;
            background: #FFF5F1;
            color: #873C2D;
            font-size: 13px;
            line-height: 1.6;
          }

          .analytics-alert button {
            display: block;
            margin-top: 10px;
            padding: 9px 13px;
            border: 0;
            border-radius: 7px;
            background: #2C1F1D;
            color: white;
            cursor: pointer;
          }

          .analytics-table-wrap {
            width: 100%;
            overflow-x: auto;
          }

          .analytics-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }

          .analytics-table th {
            padding: 12px 10px;
            background: #FDFBF7;
            color: #72635B;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
          }

          .analytics-table td {
            padding: 14px 10px;
            border-bottom: 1px solid #F0EBE2;
            color: #493A35;
            font-size: 12px;
            line-height: 1.5;
          }

          .analytics-table tr:last-child td {
            border-bottom: 0;
          }

          .analytics-table-empty {
            padding: 24px !important;
            color: #85766E !important;
            text-align: center;
          }

          .analytics-note {
            margin: 16px 0 0;
            color: #85766E;
            font-size: 11px;
            line-height: 1.6;
          }

          @media (max-width: 1000px) {
            .analytics-stat-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .analytics-insight-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 760px) {
            .analytics-page {
              padding: 24px 18px 36px;
            }

            .analytics-panel-grid {
              grid-template-columns: minmax(0, 1fr);
            }
          }

          @media (max-width: 520px) {
            .analytics-page {
              padding: 22px 14px 30px;
            }

            .analytics-header h1 {
              font-size: 27px;
            }

            .analytics-stat-grid,
            .analytics-insight-grid {
              grid-template-columns: minmax(0, 1fr);
            }

            .analytics-panel {
              padding: 16px;
            }
          }
        `}</style>

        <div className="analytics-container">
          <Link to="/admin" className="analytics-back">
            ← Back to Admin Dashboard
          </Link>

          <header className="analytics-header">
            <div>
              <span className="analytics-eyebrow">CAMPUS INTELLIGENCE</span>
              <h1>Analytics &amp; AI Insights</h1>
              <p>
                Understand campus activity, monitor complaint resolution,
                and identify recurring maintenance issues.
              </p>
            </div>

            <button
              className="analytics-refresh"
              onClick={loadAnalytics}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh analytics"}
            </button>
          </header>

          {error && (
            <div className="analytics-alert" role="alert">
              {error}
              <button onClick={loadAnalytics} disabled={loading}>
                Try again
              </button>
            </div>
          )}

          <h2 className="analytics-section-title">Campus overview</h2>

          <div className="analytics-stat-grid">
            <StatCard
              label="Registered users"
              value={users.total}
              detail={`${formatNumber(users.students)} students · ${formatNumber(users.staff)} staff`}
              icon="♙"
            />
            <StatCard
              label="Total complaints"
              value={complaints.total}
              detail={`${formatNumber(complaints.resolved)} resolved`}
              icon="▤"
            />
            <StatCard
              label="Campus requests"
              value={requests.total}
              detail={`${formatNumber(requests.pending)} pending review`}
              icon="▣"
            />
            <StatCard
              label="Gate passes"
              value={passes.total}
              detail={`${formatNumber(passes.pending)} pending approval`}
              icon="↗"
            />
          </div>

          <h2 className="analytics-section-title">Complaint analysis</h2>

          <div className="analytics-panel-grid">
            <Panel
              title="Complaint status"
              description="Distribution of complaints by their current status."
            >
              {loading ? (
                <p>Loading complaint statistics...</p>
              ) : (
                <div className="analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={complaintStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={85}
                        innerRadius={48}
                        paddingAngle={3}
                      >
                        {complaintStatusData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            <Panel
              title="Age of open complaints"
              description="How long unresolved complaints have been waiting."
            >
              {loading ? (
                <p>Loading complaint age...</p>
              ) : (
                <div className="analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={complaintAgeData}
                      margin={{ top: 10, right: 10, left: -18, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEE7DC" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        name="Complaints"
                        fill="#A66C1E"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>
          </div>

          <h2 className="analytics-section-title">Resolution insights</h2>

          <div className="analytics-insight-grid">
            <div className="analytics-insight">
              <span>Open complaints</span>
              <strong>{loading ? "—" : formatNumber(insights.openComplaints)}</strong>
            </div>
            <div className="analytics-insight">
              <span>Overdue complaints (over 7 days)</span>
              <strong>{loading ? "—" : formatNumber(insights.overdueComplaints)}</strong>
            </div>
            <div className="analytics-insight">
              <span>Possible recurring issues</span>
              <strong>{loading ? "—" : formatNumber(insights.possibleRecurringIssues)}</strong>
            </div>
            <div className="analytics-insight">
              <span>Average resolution time</span>
              <strong>{loading ? "—" : resolutionText}</strong>
            </div>
          </div>

          <div className="analytics-panel-grid">
            <Panel
              title="Staff workload"
              description="Assigned work, outstanding complaints, and resolutions."
            >
              {loading ? (
                <p>Loading staff workload...</p>
              ) : (
                <AnalyticsTable
                  headers={["Staff member", "Assigned", "Open", "Resolved"]}
                  rows={staffRows}
                  emptyMessage="No assigned staff workload is available yet."
                />
              )}
            </Panel>

            <Panel
              title="Recurring issue locations"
              description="Locations with the highest number of possible recurring issues."
            >
              {loading ? (
                <p>Loading recurring locations...</p>
              ) : (
                <AnalyticsTable
                  headers={["Location", "Issue count"]}
                  rows={locationRows}
                  emptyMessage="No recurring locations have been identified."
                />
              )}
            </Panel>
          </div>

          <Panel
            title="Other campus activity"
            description="Additional service statistics from the analytics API."
          >
            {loading ? (
              <p>Loading campus activity...</p>
            ) : (
              <AnalyticsTable
                headers={["Service", "Total", "Pending / Draft", "Approved / Published", "Other statuses"]}
                rows={[
                  [
                    "Campus requests",
                    formatNumber(requests.total),
                    formatNumber(requests.pending),
                    formatNumber(requests.approved),
                    `Review: ${formatNumber(requests.underReview)} · Rejected: ${formatNumber(requests.rejected)} · Completed: ${formatNumber(requests.completed)}`,
                  ],
                  [
                    "Gate passes",
                    formatNumber(passes.total),
                    formatNumber(passes.pending),
                    formatNumber(passes.approved),
                    `Rejected: ${formatNumber(passes.rejected)} · Outside: ${formatNumber(passes.outside)} · Completed: ${formatNumber(passes.completed)}`,
                  ],
                  [
                    "Announcements",
                    formatNumber(announcements.total),
                    formatNumber(announcements.draft),
                    formatNumber(announcements.published),
                    `Expired: ${formatNumber(announcements.expired)}`,
                  ],
                ]}
                emptyMessage="No campus activity data is available."
              />
            )}
          </Panel>

          <p className="analytics-note">
            Insights are based on the statistics returned by your CampusOne
            backend. Recurring issues are possible recurring issues detected
            by the existing complaint analysis logic.
          </p>
        </div>
      </main>
    </>
  );
}

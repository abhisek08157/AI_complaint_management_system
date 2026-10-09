import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

const FILTERS = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "OUTSIDE",
  "COMPLETED",
];

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatus(request) {
  return String(request.status || "").toUpperCase();
}

function WardenDashboard() {
  const [requests, setRequests] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decision, setDecision] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const loadRequests = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      setError("");

      // Fetch the gate-pass request list.
      const response = await API.get("/gate-passes/warden");

      if (!Array.isArray(response.data)) {
        throw new Error(
          "Unexpected response received from the server."
        );
      }

      setRequests(response.data);

      // Fetch statistics from the backend.
      try {
        const statsResponse = await API.get("/warden/dashboard");
        setDashboardStats(statsResponse.data);
      } catch (statsError) {
        console.error(
          "Failed to load warden dashboard statistics:",
          statsError
        );

        // Use request-list counts if the statistics endpoint fails.
        setDashboardStats(null);
      }

      return true;
    } catch (err) {
      console.error(
        "Failed to load gate-pass requests:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not load gate-pass requests. Check the backend and your warden access."
      );

      return false;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const counts = useMemo(() => {
    // Fallback counts calculated from the request list.
    const localCounts = {
      ALL: requests.length,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      OUTSIDE: 0,
      COMPLETED: 0,
      OTHER: 0,
    };

    requests.forEach((request) => {
      const status = getStatus(request);

      if (
        Object.prototype.hasOwnProperty.call(
          localCounts,
          status
        ) &&
        status !== "ALL"
      ) {
        localCounts[status] += 1;
      } else {
        localCounts.OTHER += 1;
      }
    });

    // Prefer backend statistics when available.
    if (!dashboardStats) return localCounts;

    return {
      ALL:
        dashboardStats.totalRequests ??
        localCounts.ALL,
      PENDING:
        dashboardStats.pending ??
        localCounts.PENDING,
      APPROVED:
        dashboardStats.approved ??
        localCounts.APPROVED,
      REJECTED:
        dashboardStats.rejected ??
        localCounts.REJECTED,
      OUTSIDE:
        dashboardStats.currentlyOutside ??
        localCounts.OUTSIDE,
      COMPLETED:
        dashboardStats.completed ??
        localCounts.COMPLETED,
      OTHER: localCounts.OTHER,
    };
  }, [requests, dashboardStats]);

  const filteredRequests = useMemo(() => {
    if (activeFilter === "ALL") return requests;

    return requests.filter(
      (request) => getStatus(request) === activeFilter
    );
  }, [requests, activeFilter]);

  const openDecisionDialog = (request, nextDecision) => {
    setSelectedRequest(request);
    setDecision(nextDecision);
    setRemarks("");
    setNotice("");
    setError("");
  };

  const closeDecisionDialog = () => {
    if (saving) return;

    setSelectedRequest(null);
    setDecision("");
    setRemarks("");
  };

  const submitDecision = async (event) => {
    event.preventDefault();

    if (!selectedRequest || !decision || saving) return;

    if (!remarks.trim()) {
      setError(
        "Please enter warden remarks before submitting your decision."
      );
      return;
    }

    const requestId = selectedRequest.id;
    const submittedDecision = decision;

    try {
      setSaving(true);
      setError("");
      setNotice("");

      await API.put(
        `/gate-passes/${requestId}/decision`,
        {
          status: submittedDecision,
          wardenRemarks: remarks.trim(),
        }
      );

      setSelectedRequest(null);
      setDecision("");
      setRemarks("");

      setNotice(
        `Gate-pass request ${submittedDecision.toLowerCase()} successfully.`
      );

      // Refresh requests and statistics after a successful decision.
      const refreshed = await loadRequests(false);

      if (!refreshed) {
        setNotice(
          `Gate-pass request ${submittedDecision.toLowerCase()} successfully, but the list could not be refreshed. Please refresh manually.`
        );
      }
    } catch (err) {
      console.error(
        "Failed to update gate-pass decision:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to submit your decision. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    {
      label: "Total Requests",
      value: counts.ALL,
      description: "All gate-pass applications",
      className: "",
    },
    {
      label: "Pending",
      value: counts.PENDING,
      description: "Awaiting warden review",
      className: "pending",
    },
    {
      label: "Approved",
      value: counts.APPROVED,
      description: "Approved gate passes",
      className: "approved",
    },
    {
      label: "Rejected",
      value: counts.REJECTED,
      description: "Declined applications",
      className: "rejected",
    },
    {
      label: "Currently Outside",
      value: counts.OUTSIDE,
      description: "Students who have exited",
      className: "outside",
    },
    {
      label: "Completed",
      value: counts.COMPLETED,
      description: "Students who have returned",
      className: "completed",
    },
  ];

  return (
    <div className="warden-dashboard">
      <Navbar />

      <main className="warden-main">
        <header className="warden-heading">
          <div>
            <p className="warden-eyebrow">
              CAMPUSONE • HOSTEL MANAGEMENT
            </p>

            <h1>Hostel Warden Dashboard</h1>

            <p className="warden-subtitle">
              Review student gate-pass applications and manage decisions.
            </p>
          </div>

          <button
            type="button"
            className="warden-refresh"
            onClick={() => loadRequests()}
            disabled={loading || saving}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </header>

        {error && (
          <div className="warden-alert error" role="alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {notice && (
          <div className="warden-alert success" role="status">
            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <section className="warden-stats">
          {statCards.map((stat) => (
            <article
              className={`warden-stat ${stat.className}`}
              key={stat.label}
            >
              <span>{stat.label}</span>
              <strong>{loading ? "—" : stat.value}</strong>
              <small>{stat.description}</small>
            </article>
          ))}
        </section>
                <section className="warden-requests">
          <div className="warden-section-heading">
            <div>
              <h2>Gate Pass Requests</h2>
              <p>Review application details and make a decision.</p>
            </div>

            <span className="warden-request-count">
              {loading
                ? "Loading..."
                : `${filteredRequests.length} shown`}
            </span>
          </div>

          <nav
            className="warden-filters"
            aria-label="Request status filters"
          >
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={activeFilter === filter ? "active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === "ALL"
                  ? "All Requests"
                  : filter.replaceAll("_", " ")}

                <span>
                  {loading ? "—" : counts[filter]}
                </span>
              </button>
            ))}
          </nav>

          {loading ? (
            <div className="warden-empty">
              <h3>Loading gate-pass requests...</h3>
              <p>
                Please wait while we retrieve the latest applications.
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="warden-empty">
              <div className="warden-empty-icon">⌕</div>

              <h3>
                {error
                  ? "Requests could not be loaded"
                  : activeFilter === "ALL"
                    ? "No gate-pass requests found"
                    : `No ${activeFilter.toLowerCase().replaceAll("_", " ")} requests`}
              </h3>

              <p>
                {error
                  ? "Check the backend response and try refreshing."
                  : "Requests matching this filter will appear here."}
              </p>
            </div>
          ) : (
            <div className="warden-request-list">
              {filteredRequests.map((request) => {
                const status = getStatus(request);
                const canDecide = status === "PENDING";

                return (
                  <article
                    className="warden-request-card"
                    key={request.id}
                  >
                    <div className="request-top">
                      <div>
                        <span className="request-id">
                          PASS #{request.passCode || request.id}
                        </span>

                        <h3>
                          {request.studentName || "Unknown student"}
                        </h3>

                        <p className="request-email">
                          {request.studentEmail || "No email provided"}
                        </p>
                      </div>

                      <span
                        className={`warden-status ${status.toLowerCase()}`}
                      >
                        {status.replaceAll("_", " ") || "UNKNOWN"}
                      </span>
                    </div>

                    <div className="request-details">
                      <div>
                        <span>Destination</span>
                        <strong>{request.destination || "—"}</strong>
                      </div>

                      <div>
                        <span>Reason</span>
                        <strong>{request.reason || "—"}</strong>
                      </div>

                      <div>
                        <span>Departure</span>
                        <strong>{formatDate(request.outTime)}</strong>
                      </div>

                      <div>
                        <span>Expected Return</span>
                        <strong>
                          {formatDate(request.expectedReturnTime)}
                        </strong>
                      </div>

                      <div>
                        <span>Submitted</span>
                        <strong>{formatDate(request.createdAt)}</strong>
                      </div>

                      {request.approvedAt && (
                        <div>
                          <span>Approved At</span>
                          <strong>{formatDate(request.approvedAt)}</strong>
                        </div>
                      )}

                      {request.wardenRemarks && (
                        <div>
                          <span>Warden Remarks</span>
                          <strong>{request.wardenRemarks}</strong>
                        </div>
                      )}
                    </div>

                    {canDecide ? (
                      <div className="request-actions">
                        <button
                          type="button"
                          className="reject-button"
                          onClick={() =>
                            openDecisionDialog(request, "REJECTED")
                          }
                          disabled={saving}
                        >
                          Reject Request
                        </button>

                        <button
                          type="button"
                          className="approve-button"
                          onClick={() =>
                            openDecisionDialog(request, "APPROVED")
                          }
                          disabled={saving}
                        >
                          Approve Request
                        </button>
                      </div>
                    ) : (
                      <p className="request-locked">
                        This request is no longer pending.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {selectedRequest && (
        <div className="warden-modal-backdrop">
          <section
            className="warden-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="decision-title"
          >
            <h2 id="decision-title">
              {decision === "APPROVED"
                ? "Approve Gate Pass"
                : "Reject Gate Pass"}
            </h2>

            <p>
              Student:{" "}
              <strong>{selectedRequest.studentName}</strong>
            </p>

            <p>
              Destination:{" "}
              <strong>{selectedRequest.destination || "—"}</strong>
            </p>

            <form onSubmit={submitDecision}>
              <label htmlFor="warden-remarks">
                Warden remarks (required)
              </label>

              <textarea
                id="warden-remarks"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder={
                  decision === "APPROVED"
                    ? "Enter approval remarks..."
                    : "Explain why this request is rejected..."
                }
                rows={4}
                required
              />

              <div className="warden-modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeDecisionDialog}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    decision === "APPROVED"
                      ? "approve-button"
                      : "reject-button"
                  }
                  disabled={saving || !remarks.trim()}
                >
                  {saving
                    ? "Submitting..."
                    : decision === "APPROVED"
                      ? "Confirm Approval"
                      : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

            <style>{`
        .warden-dashboard {
          min-height: 100vh;
          background: #FAF8F3;
          color: #14192E;
          font-family: Arial, sans-serif;
        }

        .warden-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 36px 40px 60px;
        }

        .warden-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .warden-eyebrow {
          color: #A17B2D;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin: 0 0 10px;
        }

        .warden-heading h1 {
          font-size: 30px;
          margin: 0 0 10px;
        }

        .warden-subtitle,
        .warden-section-heading p {
          color: #77766F;
          margin: 0;
          line-height: 1.6;
        }

        .warden-refresh {
          border: 1px solid #E5E0D5;
          border-radius: 9px;
          background: #FFFFFF;
          color: #14192E;
          padding: 11px 16px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .warden-refresh:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .warden-alert {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 13px;
        }

        .warden-alert button {
          background: transparent;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }

        .warden-alert.error {
          border: 1px solid #E8B8B4;
          background: #FBE8E6;
          color: #913B35;
        }

        .warden-alert.success {
          border: 1px solid #B7D9C0;
          background: #E8F5EC;
          color: #267044;
        }

        .warden-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 28px;
        }

        .warden-stat {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #FFFFFF;
          border: 1px solid #E5E0D5;
          border-radius: 14px;
          padding: 22px;
        }

        .warden-stat > span {
          color: #77766F;
          font-size: 13px;
          font-weight: 600;
        }

        .warden-stat strong {
          font-size: 32px;
          line-height: 1;
        }

        .warden-stat small {
          color: #929087;
          font-size: 12px;
        }

        .warden-stat.pending {
          border-top: 3px solid #C9A24B;
        }

        .warden-stat.approved {
          border-top: 3px solid #39845C;
        }

        .warden-stat.rejected {
          border-top: 3px solid #C45A52;
        }

        .warden-stat.outside {
          border-top: 3px solid #597BA8;
        }

        .warden-stat.completed {
          border-top: 3px solid #39845C;
        }

        .warden-requests {
          background: #FFFFFF;
          border: 1px solid #E5E0D5;
          border-radius: 16px;
          overflow: hidden;
        }

        .warden-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 25px 26px;
        }

        .warden-section-heading h2 {
          margin: 0 0 8px;
          font-size: 20px;
        }

        .warden-section-heading p {
          font-size: 13px;
        }

        .warden-request-count {
          background: #F6F0E2;
          color: #85651F;
          border-radius: 20px;
          padding: 8px 12px;
          font-size: 12px;
          white-space: nowrap;
        }

        .warden-filters {
          display: flex;
          gap: 8px;
          padding: 0 26px 20px;
          border-bottom: 1px solid #EEEAE1;
          overflow-x: auto;
        }

        .warden-filters button {
          display: flex;
          align-items: center;
          gap: 9px;
          border: 1px solid transparent;
          background: transparent;
          color: #77766F;
          border-radius: 8px;
          padding: 10px 13px;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
        }

        .warden-filters button.active {
          background: #F6F0E2;
          color: #85651F;
          border-color: #E9D9B4;
          font-weight: 700;
        }

        .warden-filters button span {
          font-size: 11px;
        }

        .warden-empty {
          text-align: center;
          padding: 58px 24px 65px;
        }

        .warden-empty-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: #F6F0E2;
          color: #A17B2D;
          font-size: 27px;
          margin-bottom: 16px;
        }

        .warden-empty h3 {
          font-size: 17px;
          margin: 0 0 10px;
        }

        .warden-empty p {
          max-width: 450px;
          margin: 0 auto;
          color: #858278;
          font-size: 13px;
          line-height: 1.7;
        }

        .warden-request-list {
          display: grid;
          gap: 16px;
          padding: 22px;
        }

        .warden-request-card {
          border: 1px solid #E8E2D6;
          border-radius: 13px;
          padding: 22px;
          background: #FFFEFC;
        }

        .request-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .request-id {
          color: #A17B2D;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .request-top h3 {
          margin: 8px 0 5px;
          font-size: 18px;
        }

        .request-email {
          color: #858278;
          font-size: 12px;
          margin: 0;
        }

        .warden-status {
          display: inline-block;
          padding: 7px 10px;
          border-radius: 16px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .warden-status.pending {
          background: #FBF0D6;
          color: #85651F;
        }

        .warden-status.approved {
          background: #E4F3E9;
          color: #267044;
        }

        .warden-status.rejected {
          background: #FBE8E6;
          color: #A13C35;
        }

        .warden-status.outside {
          background: #E8EFF9;
          color: #365E91;
        }

        .warden-status.completed {
          background: #E4F3E9;
          color: #267044;
        }

        .warden-status.expired {
          background: #ECEAE5;
          color: #69675F;
        }

        .request-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 22px;
        }

        .request-details div {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 0;
        }

        .request-details span {
          color: #858278;
          font-size: 11px;
        }

        .request-details strong {
          color: #292D3D;
          font-size: 13px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

                .request-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid #EEEAE1;
        }

        .approve-button,
        .reject-button,
        .cancel-button {
          border: none;
          border-radius: 8px;
          padding: 11px 15px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .approve-button {
          background: #267044;
          color: white;
        }

        .reject-button {
          background: #FBE8E6;
          color: #A13C35;
        }

        .cancel-button {
          background: #F1EFE9;
          color: #4B4B49;
        }

        .approve-button:disabled,
        .reject-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .request-locked {
          color: #858278;
          font-size: 12px;
          margin: 18px 0 0;
        }

        .warden-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(20, 25, 46, 0.55);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          overflow-y: auto;
        }

        .warden-modal {
          width: 100%;
          max-width: 480px;
          background: #FFFFFF;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 20px 70px rgba(0, 0, 0, 0.2);
        }

        .warden-modal h2 {
          margin: 0 0 20px;
          font-size: 22px;
        }

        .warden-modal > p {
          color: #77766F;
          font-size: 13px;
          line-height: 1.6;
        }

        .warden-modal form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 22px;
        }

        .warden-modal label {
          font-size: 13px;
          font-weight: 700;
        }

        .warden-modal textarea {
          box-sizing: border-box;
          width: 100%;
          border: 1px solid #DCD6CA;
          border-radius: 9px;
          padding: 12px;
          font: inherit;
          font-size: 13px;
          resize: vertical;
        }

        .warden-modal textarea:focus {
          outline: 2px solid #E9D9B4;
          border-color: #C9A24B;
        }

        .warden-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 14px;
        }

        @media (max-width: 900px) {
          .warden-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .warden-main {
            padding: 28px 20px 40px;
          }
        }

        @media (max-width: 560px) {
          .warden-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .warden-heading h1 {
            font-size: 25px;
          }

          .warden-stats {
            gap: 10px;
          }

          .warden-stat {
            padding: 16px;
          }

          .warden-section-heading {
            padding: 20px 16px;
            align-items: flex-start;
            flex-direction: column;
          }

          .warden-filters {
            padding: 0 16px 16px;
          }

          .warden-request-list {
            padding: 12px;
          }

          .warden-request-card {
            padding: 16px;
          }

          .request-top {
            flex-direction: column;
          }

          .request-details {
            grid-template-columns: 1fr;
          }

          .request-actions {
            flex-direction: column-reverse;
          }

          .request-actions button {
            width: 100%;
          }

          .warden-modal {
            padding: 22px;
          }

          .warden-modal-actions {
            flex-direction: column-reverse;
          }

          .warden-modal-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default WardenDashboard;

import { useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function SecurityDashboard() {
  const [qrToken, setQrToken] = useState("");
  const [action, setAction] = useState("EXIT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [verification, setVerification] = useState(null);

  // Gate pass scan history states
  const [gatePassId, setGatePassId] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Verify a student's gate pass
  const verifyGatePass = async (event) => {
    event.preventDefault();

    if (!qrToken.trim()) {
      setError("Please enter a QR token.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setNotice("");
      setVerification(null);

      const response = await API.post("/gate-passes/verify", {
        qrToken: qrToken.trim(),
        action: action,
      });

      const result = response.data;

      setVerification({
        ...(result.gatePass || result),
        success: result.success,
        message: result.message,
        action: result.action || action,
      });

      setNotice(
        result.message ||
          `${action} verification completed successfully.`
      );
    } catch (err) {
      console.error("Gate-pass verification failed:", err);

      const data = err.response?.data;

      setError(
        data?.message ||
          data?.error ||
          (typeof data === "string" ? data : "") ||
          "Verification failed. Please check the QR token and Security access."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load the scan history for a gate pass
  const loadGatePassHistory = async (event) => {
    event.preventDefault();

    if (!gatePassId.trim()) {
      setHistoryError("Please enter a gate pass ID.");
      return;
    }

    if (!/^\d+$/.test(gatePassId.trim())) {
      setHistoryError("Gate pass ID must be a valid number.");
      return;
    }

    try {
      setHistoryLoading(true);
      setHistoryError("");
      setHistory([]);
      setHistoryLoaded(false);

      const response = await API.get(
        `/gate-passes/${gatePassId.trim()}/logs`
      );

      setHistory(
        Array.isArray(response.data) ? response.data : []
      );

      setHistoryLoaded(true);
    } catch (err) {
      console.error("Failed to load gate pass history:", err);

      const data = err.response?.data;

      setHistoryError(
        data?.message ||
          data?.error ||
          (typeof data === "string" ? data : "") ||
          "Unable to load scan history. Check the gate pass ID and your access."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const statusClass = (status) =>
    String(status || "UNKNOWN").toLowerCase();

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString();
  };

  return (
    <>
      <Navbar />

      <main className="security-page">
        <style>{`
          .security-page {
            min-height: calc(100vh - 68px);
            box-sizing: border-box;
            padding: 36px 40px 60px;
            background: #FAF8F3;
            color: #14192E;
            font-family: Arial, sans-serif;
          }

          .security-container {
            max-width: 1100px;
            margin: 0 auto;
          }

          .security-eyebrow {
            margin: 0 0 8px;
            color: #8A7045;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
          }

          .security-heading h1 {
            margin: 0 0 10px;
            font-size: 30px;
          }

          .security-heading > p:last-child {
            margin: 0;
            color: #77766F;
            line-height: 1.6;
          }

          .security-panel {
            margin-top: 28px;
            padding: 28px;
            background: #FFFFFF;
            border: 1px solid #E5E0D5;
            border-radius: 16px;
          }

          .security-panel h2 {
            margin: 0 0 10px;
            font-size: 21px;
          }

          .security-description {
            margin: 0 0 24px;
            color: #77766F;
            font-size: 14px;
            line-height: 1.6;
          }

          .security-form {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .security-form label {
            margin-top: 8px;
            font-size: 13px;
            font-weight: 700;
          }

          .security-form input,
          .security-form select {
            width: 100%;
            box-sizing: border-box;
            padding: 13px;
            border: 1px solid #DCD6CA;
            border-radius: 9px;
            background: #FFFFFF;
            color: #14192E;
            font-family: inherit;
            font-size: 14px;
          }

          .security-form input:focus,
          .security-form select:focus {
            outline: 2px solid #E9D9B4;
            border-color: #C9A24B;
          }

          .security-button {
            align-self: flex-start;
            margin-top: 12px;
            padding: 13px 20px;
            border: none;
            border-radius: 9px;
            background: #14192E;
            color: #FFFFFF;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s ease;
          }

          .security-button:hover:not(:disabled) {
            background: #C9A24B;
            color: #14192E;
          }

          .security-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .security-alert {
            margin-top: 20px;
            padding: 14px 16px;
            border-radius: 9px;
            font-size: 13px;
            line-height: 1.6;
            overflow-wrap: anywhere;
          }

          .security-alert.error {
            background: #FBE8E6;
            border: 1px solid #E8B8B4;
            color: #913B35;
          }

          .security-alert.success {
            background: #E8F5EC;
            border: 1px solid #B7D9C0;
            color: #267044;
          }

          .security-result {
            margin-top: 24px;
            padding: 24px;
            background: #FFFEFC;
            border: 1px solid #E8E2D6;
            border-radius: 12px;
          }

          .security-result h3 {
            margin: 0 0 20px;
            font-size: 19px;
          }

          .security-result-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
          }

          .security-result-item {
            display: flex;
            flex-direction: column;
            gap: 7px;
            min-width: 0;
          }

          .security-result-item > span:first-child {
            color: #858278;
            font-size: 11px;
            font-weight: 600;
          }

          .security-result-item strong {
            color: #292D3D;
            font-size: 13px;
            line-height: 1.5;
            overflow-wrap: anywhere;
          }

          .security-status {
            display: inline-block;
            width: fit-content;
            padding: 7px 11px;
            border-radius: 20px;
            background: #ECEAE5;
            color: #69675F;
            font-size: 11px;
            font-weight: 700;
          }

          .security-status.approved {
            background: #E4F3E9;
            color: #267044;
          }

          .security-status.rejected,
          .security-status.expired {
            background: #FBE8E6;
            color: #A13C35;
          }

          .security-status.outside {
            background: #E8EFF9;
            color: #365E91;
          }

          .security-status.completed {
            background: #E4F3E9;
            color: #267044;
          }

          /* Gate pass scan history */

          .security-history-form {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .security-history-form label {
            margin-top: 8px;
            font-size: 13px;
            font-weight: 700;
          }

          .security-history-form input {
            width: 100%;
            box-sizing: border-box;
            padding: 13px;
            border: 1px solid #DCD6CA;
            border-radius: 9px;
            background: #FFFFFF;
            color: #14192E;
            font-family: inherit;
            font-size: 14px;
          }

          .security-history-form input:focus {
            outline: 2px solid #E9D9B4;
            border-color: #C9A24B;
          }

          .security-history-list {
            margin-top: 24px;
            display: grid;
            gap: 14px;
          }

          .security-history-card {
            padding: 18px;
            border: 1px solid #E5E0D5;
            border-radius: 12px;
            background: #FFFEFC;
          }

          .security-history-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 16px;
          }

          .security-history-card-header strong {
            font-size: 14px;
            overflow-wrap: anywhere;
          }

          .security-history-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .security-history-item {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 0;
          }

          .security-history-item span {
            color: #858278;
            font-size: 11px;
            font-weight: 600;
          }

          .security-history-item strong {
            color: #292D3D;
            font-size: 13px;
            line-height: 1.5;
            overflow-wrap: anywhere;
          }

          .security-history-action {
            display: inline-block;
            width: fit-content;
            padding: 6px 10px;
            border-radius: 20px;
            background: #E8EFF9;
            color: #365E91;
            font-size: 11px;
            font-weight: 700;
          }

          .security-history-action.entry {
            background: #E4F3E9;
            color: #267044;
          }

          .security-history-empty {
            margin-top: 20px;
            padding: 18px;
            border: 1px dashed #DCD6CA;
            border-radius: 10px;
            color: #77766F;
            text-align: center;
            font-size: 13px;
            line-height: 1.6;
          }

          @media (max-width: 650px) {
            .security-page {
              padding: 24px 16px 40px;
            }

            .security-heading h1 {
              font-size: 25px;
            }

            .security-panel {
              padding: 20px 16px;
            }

            .security-button {
              width: 100%;
            }

            .security-result-grid,
            .security-history-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <div className="security-container">
          <header className="security-heading">
            <p className="security-eyebrow">
              CAMPUSONE • CAMPUS SECURITY
            </p>

            <h1>Security Dashboard</h1>

            <p>
              Verify student gate passes and record campus exit
              and entry using approved gate passes.
            </p>
          </header>

          {/* Gate pass verification */}
          <section className="security-panel">
            <h2>Gate Pass Verification</h2>

            <p className="security-description">
              Enter the QR token and select the action you want
              to verify. The server will validate the pass and
              update its status when the action is successful.
            </p>

            <form
              className="security-form"
              onSubmit={verifyGatePass}
            >
              <label htmlFor="qrToken">
                Gate Pass QR Token
              </label>

              <input
                id="qrToken"
                type="text"
                value={qrToken}
                onChange={(event) =>
                  setQrToken(event.target.value)
                }
                placeholder="Enter or scan the QR token"
                autoComplete="off"
                required
              />

              <label htmlFor="gate-pass-action">
                Verification Action
              </label>

              <select
                id="gate-pass-action"
                value={action}
                onChange={(event) =>
                  setAction(event.target.value)
                }
              >
                <option value="EXIT">
                  EXIT — Student leaving campus
                </option>

                <option value="ENTRY">
                  ENTRY — Student returning to campus
                </option>
              </select>

              <button
                className="security-button"
                type="submit"
                disabled={loading || !qrToken.trim()}
              >
                {loading
                  ? "Verifying..."
                  : `Verify ${action}`}
              </button>
            </form>

            {error && (
              <div className="security-alert error" role="alert">
                {error}
              </div>
            )}

            {notice && (
              <div className="security-alert success" role="status">
                {notice}
              </div>
            )}

            {verification && (
              <div className="security-result">
                <h3>Verification Result</h3>

                <div className="security-result-grid">
                  <div className="security-result-item">
                    <span>Verification Action</span>
                    <strong>
                      {verification.action || action}
                    </strong>
                  </div>

                  <div className="security-result-item">
                    <span>Student Name</span>
                    <strong>
                      {verification.studentName || "—"}
                    </strong>
                  </div>

                  <div className="security-result-item">
                    <span>Student Email</span>
                    <strong>
                      {verification.studentEmail || "—"}
                    </strong>
                  </div>

                  <div className="security-result-item">
                    <span>Pass Code</span>
                    <strong>
                      {verification.passCode || "—"}
                    </strong>
                  </div>

                  <div className="security-result-item">
                    <span>Destination</span>
                    <strong>
                      {verification.destination || "—"}
                    </strong>
                  </div>

                  <div className="security-result-item">
                    <span>Reason</span>
                    <strong>
                      {verification.reason || "—"}
                    </strong>
                  </div>

                  <div className="security-result-item">
                    <span>Current Status</span>
                    <strong>
                      <span
                        className={`security-status ${statusClass(
                          verification.status
                        )}`}
                      >
                        {verification.status || "UNKNOWN"}
                      </span>
                    </strong>
                  </div>

                  <div className="security-result-item">
                    <span>Departure Time</span>
                    <strong>
                      {formatDate(verification.outTime)}
                    </strong>
                  </div>

                  <div className="security-result-item">
                    <span>Expected Return</span>
                    <strong>
                      {formatDate(
                        verification.expectedReturnTime
                      )}
                    </strong>
                  </div>

                  {verification.wardenRemarks && (
                    <div className="security-result-item">
                      <span>Warden Remarks</span>
                      <strong>
                        {verification.wardenRemarks}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Gate pass scan history */}
          <section className="security-panel">
            <h2>Gate Pass Scan History</h2>

            <p className="security-description">
              View recorded EXIT and ENTRY scans, including
              the scan time and the security officer who
              verified each action.
            </p>

            <form
              className="security-history-form"
              onSubmit={loadGatePassHistory}
            >
              <label htmlFor="historyGatePassId">
                Gate Pass ID
              </label>

              <input
                id="historyGatePassId"
                type="number"
                min="1"
                step="1"
                value={gatePassId}
                onChange={(event) =>
                  setGatePassId(event.target.value)
                }
                placeholder="Enter gate pass ID, e.g. 1"
                required
              />

              <button
                className="security-button"
                type="submit"
                disabled={
                  historyLoading || !gatePassId.trim()
                }
              >
                {historyLoading
                  ? "Loading History..."
                  : "Load History"}
              </button>
            </form>

            {historyError && (
              <div
                className="security-alert error"
                role="alert"
              >
                {historyError}
              </div>
            )}

            {historyLoaded && history.length === 0 && (
              <div className="security-history-empty">
                No scan history was found for this gate pass.
              </div>
            )}

            {history.length > 0 && (
              <div className="security-history-list">
                {history.map((item) => (
                  <article
                    className="security-history-card"
                    key={item.id}
                  >
                    <div className="security-history-card-header">
                      <strong>
                        Scan Record #{item.id}
                      </strong>

                      <span
                        className={`security-history-action ${
                          String(item.action).toUpperCase() ===
                          "ENTRY"
                            ? "entry"
                            : ""
                        }`}
                      >
                        {item.action || "UNKNOWN"}
                      </span>
                    </div>

                    <div className="security-history-grid">
                      <div className="security-history-item">
                        <span>Gate Pass Code</span>
                        <strong>
                          {item.passCode || "—"}
                        </strong>
                      </div>

                      <div className="security-history-item">
                        <span>Scan Date and Time</span>
                        <strong>
                          {formatDate(item.scannedAt)}
                        </strong>
                      </div>

                      <div className="security-history-item">
                        <span>Verified By</span>
                        <strong>
                          {item.verifiedByName || "—"}
                        </strong>
                      </div>

                      <div className="security-history-item">
                        <span>Officer Email</span>
                        <strong>
                          {item.verifiedByEmail || "—"}
                        </strong>
                      </div>
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

export default SecurityDashboard;
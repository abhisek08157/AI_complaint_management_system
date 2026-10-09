import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StudentGatePass() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    reason: "",
    destination: "",
    outTime: "",
    expectedReturnTime: "",
  });

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/gate-passes/my");

      setRequests(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to load gate passes:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your gate-pass requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setNotice("");

    const departure = new Date(form.outTime);
    const returnTime = new Date(form.expectedReturnTime);

    if (
      !form.reason.trim() ||
      !form.destination.trim() ||
      !form.outTime ||
      !form.expectedReturnTime
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (
      Number.isNaN(departure.getTime()) ||
      Number.isNaN(returnTime.getTime())
    ) {
      setError("Please enter valid departure and return times.");
      return;
    }

    if (returnTime <= departure) {
      setError(
        "Expected return time must be after the departure time."
      );
      return;
    }

    try {
      setSubmitting(true);

      await API.post("/gate-passes", {
        reason: form.reason.trim(),
        destination: form.destination.trim(),
        outTime: form.outTime,
        expectedReturnTime: form.expectedReturnTime,
      });

      setForm({
        reason: "",
        destination: "",
        outTime: "",
        expectedReturnTime: "",
      });

      setNotice("Your gate-pass request was submitted successfully.");

      await loadRequests();
    } catch (err) {
      console.error("Failed to submit gate pass:", err);

      setError(
        err.response?.data?.message ||
          "Unable to submit your gate-pass request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="student-gatepass-page">
        <style>{`
          .student-gatepass-page {
            min-height: calc(100vh - 68px);
            background: #F8F4EB;
            color: #2C1F1D;
            padding: 36px 40px 60px;
            font-family: Arial, sans-serif;
            box-sizing: border-box;
          }

          .gatepass-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .gatepass-heading {
            margin-bottom: 28px;
          }

          .gatepass-eyebrow {
            color: #C88A2E;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            margin: 0 0 8px;
          }

          .gatepass-heading h1 {
            font-family: Georgia, serif;
            font-size: 32px;
            margin: 0 0 10px;
          }

          .gatepass-heading p {
            color: #72635B;
            line-height: 1.6;
            margin: 0;
          }

          .gatepass-panel {
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 16px;
            padding: 26px;
            margin-bottom: 28px;
            box-shadow: 0 8px 24px -6px rgba(44, 31, 29, 0.04);
          }

          .gatepass-panel h2 {
            font-family: Georgia, serif;
            font-size: 22px;
            margin: 0 0 8px;
          }

          .gatepass-description {
            color: #72635B;
            font-size: 14px;
            margin: 0 0 24px;
            line-height: 1.6;
          }

          .gatepass-form {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .gatepass-field {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 0;
          }

          .gatepass-field.full-width {
            grid-column: 1 / -1;
          }

          .gatepass-field label {
            font-size: 13px;
            font-weight: 700;
          }

          .gatepass-field input,
          .gatepass-field textarea {
            width: 100%;
            box-sizing: border-box;
            padding: 12px;
            border: 1px solid #DCD2C3;
            border-radius: 9px;
            background: #FFFEFC;
            color: #2C1F1D;
            font: inherit;
            font-size: 14px;
          }

          .gatepass-field textarea {
            min-height: 90px;
            resize: vertical;
          }

          .gatepass-field input:focus,
          .gatepass-field textarea:focus {
            outline: 2px solid #E9D9B4;
            border-color: #C88A2E;
          }

          .gatepass-submit {
            border: none;
            border-radius: 9px;
            padding: 13px 20px;
            background: #2C1F1D;
            color: #FFFFFF;
            font-weight: 700;
            cursor: pointer;
            justify-self: start;
          }

          .gatepass-submit:hover {
            background: #C88A2E;
            color: #2C1F1D;
          }

          .gatepass-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .gatepass-alert {
            padding: 13px 16px;
            border-radius: 9px;
            margin-bottom: 18px;
            font-size: 14px;
            line-height: 1.5;
          }

          .gatepass-alert.error {
            color: #9C2A1B;
            background: #FDF2F0;
            border: 1px solid #F3C2BA;
          }

          .gatepass-alert.success {
            color: #267044;
            background: #E8F5EC;
            border: 1px solid #B7D9C0;
          }

          .gatepass-list {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .gatepass-request {
            background: #FFFEFC;
            border: 1px solid #E8E2D6;
            border-radius: 12px;
            padding: 20px;
            min-width: 0;
          }

          .gatepass-request-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 18px;
          }

          .gatepass-code {
            color: #A17B2D;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
          }

          .gatepass-request h3 {
            margin: 7px 0 0;
            font-size: 17px;
            overflow-wrap: anywhere;
          }

          .gatepass-status {
            display: inline-block;
            border-radius: 20px;
            padding: 7px 10px;
            font-size: 10px;
            font-weight: 700;
            white-space: nowrap;
            background: #F1EFE9;
            color: #69675F;
          }

          .gatepass-status.pending {
            background: #FBF0D6;
            color: #85651F;
          }

          .gatepass-status.approved {
            background: #E4F3E9;
            color: #267044;
          }

          .gatepass-status.rejected {
            background: #FBE8E6;
            color: #A13C35;
          }

          .gatepass-status.outside {
            background: #E8EFF9;
            color: #365E91;
          }

          .gatepass-status.completed {
            background: #E4F3E9;
            color: #267044;
          }

          .gatepass-details {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .gatepass-detail {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 0;
          }

          .gatepass-detail span {
            color: #858278;
            font-size: 11px;
          }

          .gatepass-detail strong {
            color: #292D3D;
            font-size: 13px;
            line-height: 1.5;
            overflow-wrap: anywhere;
          }

          .gatepass-remarks {
            margin-top: 16px;
            padding-top: 14px;
            border-top: 1px solid #EEEAE1;
            font-size: 13px;
            line-height: 1.6;
          }

          .gatepass-remarks span {
            color: #858278;
            display: block;
            margin-bottom: 4px;
          }

          .gatepass-empty {
            padding: 40px 20px;
            text-align: center;
            background: #FFFEFC;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
            color: #72635B;
          }

          .gatepass-empty h3 {
            color: #2C1F1D;
            margin: 0 0 8px;
          }

          .gatepass-empty p {
            margin: 0;
            font-size: 14px;
            line-height: 1.6;
          }

          .gatepass-refresh {
            float: right;
            border: 1px solid #DCD2C3;
            border-radius: 8px;
            background: #FFFFFF;
            color: #2C1F1D;
            padding: 9px 13px;
            cursor: pointer;
            font-weight: 600;
          }

          @media (max-width: 760px) {
            .student-gatepass-page {
              padding: 24px 16px 40px;
            }

            .gatepass-heading h1 {
              font-size: 27px;
            }

            .gatepass-panel {
              padding: 20px 16px;
            }

            .gatepass-form,
            .gatepass-list {
              grid-template-columns: 1fr;
            }

            .gatepass-field.full-width {
              grid-column: auto;
            }

            .gatepass-submit {
              width: 100%;
            }
          }

          @media (max-width: 420px) {
            .gatepass-details {
              grid-template-columns: 1fr;
            }

            .gatepass-request-top {
              flex-direction: column;
            }
          }
        `}</style>

        <div className="gatepass-container">
          <header className="gatepass-heading">
            <p className="gatepass-eyebrow">
              CAMPUSONE • STUDENT SERVICES
            </p>

            <h1>Student Gate Pass</h1>

            <p>
              Apply for permission to leave campus and track your
              gate-pass request status.
            </p>
          </header>

          {error && (
            <div className="gatepass-alert error" role="alert">
              {error}
            </div>
          )}

          {notice && (
            <div className="gatepass-alert success" role="status">
              {notice}
            </div>
          )}

          <section className="gatepass-panel">
            <h2>Apply for a Gate Pass</h2>

            <p className="gatepass-description">
              Enter your destination, reason for leaving, departure
              time, and expected return time.
            </p>

            <form className="gatepass-form" onSubmit={handleSubmit}>
              <div className="gatepass-field">
                <label htmlFor="destination">Destination *</label>

                <input
                  id="destination"
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  placeholder="Enter destination"
                  maxLength={200}
                  required
                />
              </div>

              <div className="gatepass-field">
                <label htmlFor="reason">Reason for Leaving *</label>

                <input
                  id="reason"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="e.g. Personal work"
                  maxLength={500}
                  required
                />
              </div>

              <div className="gatepass-field">
                <label htmlFor="outTime">Departure Date & Time *</label>

                <input
                  id="outTime"
                  name="outTime"
                  type="datetime-local"
                  value={form.outTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="gatepass-field">
                <label htmlFor="expectedReturnTime">
                  Expected Return Date & Time *
                </label>

                <input
                  id="expectedReturnTime"
                  name="expectedReturnTime"
                  type="datetime-local"
                  value={form.expectedReturnTime}
                  onChange={handleChange}
                  min={form.outTime || undefined}
                  required
                />
              </div>

              <button
                className="gatepass-submit"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Gate Pass Request"}
              </button>
            </form>
          </section>

          <section className="gatepass-panel">
            <div className="gatepass-request-top">
              <div>
                <h2>My Gate Pass Requests</h2>

                <p className="gatepass-description">
                  View your previous applications and their current status.
                </p>
              </div>

              <button
                className="gatepass-refresh"
                type="button"
                onClick={loadRequests}
                disabled={loading}
              >
                {loading ? "Loading..." : "↻ Refresh"}
              </button>
            </div>

            {loading ? (
              <div className="gatepass-empty">
                Loading your gate-pass requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="gatepass-empty">
                <h3>No gate-pass requests yet</h3>

                <p>
                  Complete the form above to submit your first application.
                </p>
              </div>
            ) : (
              <div className="gatepass-list">
                {requests.map((request) => {
                  const status = String(
                    request.status || "UNKNOWN"
                  ).toUpperCase();

                  return (
                    <article
                      className="gatepass-request"
                      key={request.id}
                    >
                      <div className="gatepass-request-top">
                        <div>
                          <span className="gatepass-code">
                            PASS #{request.passCode || request.id}
                          </span>

                          <h3>{request.destination || "Destination not provided"}</h3>
                        </div>

                        <span
                          className={`gatepass-status ${status.toLowerCase()}`}
                        >
                          {status.replaceAll("_", " ")}
                        </span>
                      </div>

                      <div className="gatepass-details">
                        <div className="gatepass-detail">
                          <span>Reason</span>
                          <strong>{request.reason || "—"}</strong>
                        </div>

                        <div className="gatepass-detail">
                          <span>Departure</span>
                          <strong>{formatDate(request.outTime)}</strong>
                        </div>

                        <div className="gatepass-detail">
                          <span>Expected Return</span>
                          <strong>
                            {formatDate(request.expectedReturnTime)}
                          </strong>
                        </div>

                        <div className="gatepass-detail">
                          <span>Submitted</span>
                          <strong>{formatDate(request.createdAt)}</strong>
                        </div>

                        {request.approvedAt && (
                          <div className="gatepass-detail">
                            <span>Approved At</span>
                            <strong>{formatDate(request.approvedAt)}</strong>
                          </div>
                        )}

                        {request.expiresAt && (
                          <div className="gatepass-detail">
                            <span>Expires At</span>
                            <strong>{formatDate(request.expiresAt)}</strong>
                          </div>
                        )}
                      </div>

                      {request.wardenRemarks && (
                        <div className="gatepass-remarks">
                          <span>Warden Remarks</span>
                          <strong>{request.wardenRemarks}</strong>
                        </div>
                      )}

                      {status === "APPROVED" && (
                        <div className="gatepass-remarks">
                          Your gate pass is approved. Follow the campus
                          security procedure when leaving and returning.
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default StudentGatePass;
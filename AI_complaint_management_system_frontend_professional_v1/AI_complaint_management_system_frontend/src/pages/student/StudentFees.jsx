
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

const COLORS = {
  cream: "#F8F4EB",
  espresso: "#2C1F1D",
  gold: "#C88A2E",
  lightGold: "#E2A855",
  muted: "#72635B",
  white: "#FFFFFF",
  border: "#E9E0D2",
  green: "#287A50",
  red: "#B84036",
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "Not specified";

  const date = new Date(
    String(value).length === 10 ? `${value}T00:00:00` : value
  );

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const getArray = (response) => {
  const body = response?.data ?? response;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.fees)) return body.fees;
  if (Array.isArray(body?.payments)) return body.payments;

  return [];
};

const getErrorMessage = (error) => {
  if (error?.response?.status === 401) {
    return "Your session may have expired. Please log in again.";
  }

  if (error?.response?.status === 403) {
    return "You do not have permission to access this information.";
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

const getRemaining = (fee) => {
  if (fee.remainingAmount != null) {
    return Math.max(0, Number(fee.remainingAmount) || 0);
  }

  return Math.max(
    0,
    (Number(fee.totalAmount) || 0) - (Number(fee.paidAmount) || 0)
  );
};

const getStatus = (value) => {
  const status = String(value || "PENDING").toUpperCase();

  if (status === "PAID" || status === "SUCCESS" || status === "COMPLETED") {
    return { label: status === "PAID" ? "Paid" : "Successful", type: "success" };
  }

  if (status === "PARTIALLY_PAID") {
    return { label: "Partially paid", type: "partial" };
  }

  if (status === "FAILED" || status === "REJECTED") {
    return { label: "Failed", type: "danger" };
  }

  if (status === "PROCESSING" || status === "PENDING") {
    return { label: status === "PENDING" ? "Pending" : "Processing", type: "pending" };
  }

  return { label: status.replaceAll("_", " "), type: "neutral" };
};

function StatusBadge({ status }) {
  const result = getStatus(status);

  return (
    <span className={`sf-badge sf-badge-${result.type}`}>
      <span className="sf-status-dot" />
      {result.label}
    </span>
  );
}

function StudentFees() {
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedFee, setSelectedFee] = useState(null);
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [activeTab, setActiveTab] = useState("fees");

  const loadData = useCallback(async (showRefresh = false) => {
    setError("");
    setNotice(null);

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const results = await Promise.allSettled([
        API.get("/fees/my"),
        API.get("/fee-payments/my"),
      ]);

      const feeResult = results[0];
      const paymentResult = results[1];

      if (feeResult.status === "fulfilled") {
        setFees(getArray(feeResult.value));
      } else {
        setFees([]);
        throw feeResult.reason;
      }

      if (paymentResult.status === "fulfilled") {
        setPayments(getArray(paymentResult.value));
      } else {
        // Fees can still be viewed if the history request fails.
        setPayments([]);
        setNotice({
          type: "warning",
          text: "Fee records loaded, but payment history could not be loaded. Try refreshing.",
        });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totals = useMemo(() => {
    return fees.reduce(
      (result, fee) => {
        result.total += Number(fee.totalAmount) || 0;
        result.paid += Number(fee.paidAmount) || 0;
        result.due += getRemaining(fee);
        return result;
      },
      { total: 0, paid: 0, due: 0 }
    );
  }, [fees]);

  const outstandingCount = useMemo(
    () => fees.filter((fee) => getRemaining(fee) > 0).length,
    [fees]
  );

  const filteredFees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return fees.filter((fee) => {
      const matchesSearch =
        !query ||
        String(fee.feeType || "").toLowerCase().includes(query) ||
        String(fee.academicYear || "").toLowerCase().includes(query) ||
        String(fee.id ?? "").includes(query);

      const remaining = getRemaining(fee);
      const status = String(fee.status || "PENDING").toUpperCase();

      let matchesStatus = true;

      if (statusFilter === "DUE") {
        matchesStatus = remaining > 0;
      } else if (statusFilter === "PAID") {
        matchesStatus = remaining <= 0 || status === "PAID";
      } else if (statusFilter === "OVERDUE") {
        matchesStatus =
          remaining > 0 &&
          fee.dueDate &&
          new Date(`${fee.dueDate}T23:59:59`) < new Date();
      }

      return matchesSearch && matchesStatus;
    });
  }, [fees, search, statusFilter]);

  const openPayment = (fee) => {
    const remaining = getRemaining(fee);

    if (remaining <= 0) return;

    setSelectedFee(fee);
    setAmount(remaining.toFixed(2));
    setNotice(null);
    setError("");
  };

  const closePayment = () => {
    if (paying) return;

    setSelectedFee(null);
    setAmount("");
  };

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!selectedFee || paying) return;

    const paymentAmount = Number(amount);
    const remaining = getRemaining(selectedFee);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setNotice({
        type: "error",
        text: "Enter a valid payment amount greater than zero.",
      });
      return;
    }

    if (paymentAmount > remaining + 0.000001) {
      setNotice({
        type: "error",
        text: `The payment cannot exceed the outstanding balance of ${money(remaining)}.`,
      });
      return;
    }

    setPaying(true);
    setNotice(null);

    try {
      const response = await API.post("/fee-payments/online-demo", {
        feeRecordId: selectedFee.id,
        amount: Number(paymentAmount.toFixed(2)),
        paymentMethod: "ONLINE",
      });

      const body = response?.data?.data ?? response?.data ?? response;
      const paymentStatus = String(
        body?.paymentStatus || body?.status || ""
      ).toUpperCase();

      setSelectedFee(null);
      setAmount("");

      if (paymentStatus === "FAILED" || paymentStatus === "REJECTED") {
        setNotice({
          type: "error",
          text:
            body?.remarks ||
            "The demo payment failed. Your outstanding balance should remain unchanged.",
        });
      } else {
        setNotice({
          type: "success",
          text:
            body?.remarks ||
            "The demo payment request was processed. Refreshing your latest fee balance and payment history.",
        });
      }

      await loadData(true);
    } catch (err) {
      setNotice({
        type: "error",
        text: getErrorMessage(err),
      });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="sf-page">
      <style>{`
        .sf-page {
          min-height: 100vh;
          padding: 30px;
          background: ${COLORS.cream};
          color: ${COLORS.espresso};
          font-family: inherit;
          box-sizing: border-box;
        }
        .sf-page * { box-sizing: border-box; }
        .sf-container { max-width: 1240px; margin: 0 auto; }
        .sf-topline {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; margin-bottom: 26px; flex-wrap: wrap;
        }
        .sf-back {
          display: inline-flex; align-items: center; gap: 8px;
          text-decoration: none; color: ${COLORS.muted}; font-size: 14px;
          font-weight: 600;
        }
        .sf-back:hover { color: ${COLORS.gold}; }
        .sf-refresh, .sf-secondary {
          border: 1px solid ${COLORS.border}; background: ${COLORS.white};
          color: ${COLORS.espresso}; border-radius: 10px; padding: 10px 15px;
          font: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
          transition: .2s ease;
        }
        .sf-refresh:hover, .sf-secondary:hover {
          border-color: ${COLORS.gold}; transform: translateY(-1px);
        }
        .sf-refresh:disabled, .sf-primary:disabled {
          opacity: .6; cursor: not-allowed; transform: none;
        }
        .sf-heading {
          display: flex; justify-content: space-between; align-items: flex-end;
          gap: 20px; flex-wrap: wrap; margin-bottom: 26px;
        }
        .sf-eyebrow {
          color: ${COLORS.gold}; text-transform: uppercase; font-size: 11px;
          font-weight: 800; letter-spacing: 2px; margin: 0 0 10px;
        }
        .sf-heading h1 {
          font-family: Georgia, 'Times New Roman', serif; font-size: clamp(30px, 4vw, 42px);
          line-height: 1.15; letter-spacing: -1px; margin: 0;
          color: ${COLORS.espresso};
        }
        .sf-subtitle {
          color: ${COLORS.muted}; font-size: 14px; line-height: 1.7;
          margin: 11px 0 0; max-width: 650px;
        }
        .sf-demo-label {
          background: #FFF2D8; color: #805418; border: 1px solid #F0D6A2;
          border-radius: 10px; padding: 11px 14px; font-size: 12px;
          font-weight: 700; line-height: 1.5; max-width: 300px;
        }
        .sf-summary {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px; margin-bottom: 26px;
        }
        .sf-stat {
          min-width: 0; background: ${COLORS.white}; border: 1px solid ${COLORS.border};
          border-radius: 16px; padding: 21px; box-shadow: 0 4px 16px rgba(44,31,29,.025);
        }
        .sf-stat-top {
          display: flex; justify-content: space-between; align-items: center;
          gap: 10px; margin-bottom: 18px;
        }
        .sf-stat-label { font-size: 12px; font-weight: 700; color: ${COLORS.muted}; }
        .sf-stat-icon {
          width: 37px; height: 37px; display: grid; place-items: center;
          border-radius: 11px; background: #FBF1DE; color: ${COLORS.gold};
          font-size: 18px; flex-shrink: 0;
        }
        .sf-stat-value {
          font-size: clamp(19px, 2vw, 26px); font-weight: 800;
          letter-spacing: -.7px; overflow-wrap: anywhere;
        }
        .sf-stat-foot { margin-top: 8px; color: ${COLORS.muted}; font-size: 11px; }
        .sf-panel {
          background: ${COLORS.white}; border: 1px solid ${COLORS.border};
          border-radius: 16px; overflow: hidden; margin-bottom: 24px;
          box-shadow: 0 4px 18px rgba(44,31,29,.025);
        }
        .sf-panel-head {
          padding: 22px 24px; display: flex; justify-content: space-between;
          align-items: center; gap: 14px; flex-wrap: wrap;
          border-bottom: 1px solid ${COLORS.border};
        }
        .sf-panel-head h2 {
          font-family: Georgia, 'Times New Roman', serif; font-size: 21px;
          margin: 0; letter-spacing: -.3px;
        }
        .sf-panel-head p { margin: 6px 0 0; color: ${COLORS.muted}; font-size: 12px; }
        .sf-filters {
          display: flex; gap: 10px; flex-wrap: wrap; padding: 18px 24px;
          border-bottom: 1px solid ${COLORS.border};
        }
        .sf-input, .sf-select {
          min-height: 42px; border: 1px solid ${COLORS.border}; border-radius: 9px;
          background: #FFFEFC; padding: 10px 12px; color: ${COLORS.espresso};
          font: inherit; font-size: 13px; outline: none;
        }
        .sf-input:focus, .sf-select:focus {
          border-color: ${COLORS.gold}; box-shadow: 0 0 0 3px rgba(200,138,46,.12);
        }
        .sf-search { flex: 1; min-width: 190px; }
        .sf-select { min-width: 150px; }
        .sf-table-wrap { width: 100%; overflow-x: auto; }
        .sf-table { width: 100%; border-collapse: collapse; text-align: left; }
        .sf-table th {
          background: #FCFAF6; color: ${COLORS.muted}; padding: 14px 20px;
          font-size: 10px; letter-spacing: .7px; text-transform: uppercase;
          white-space: nowrap; font-weight: 800;
        }
        .sf-table td {
          padding: 17px 20px; border-top: 1px solid #F0EAE1;
          font-size: 13px; vertical-align: middle;
        }
        .sf-table tbody tr:hover { background: #FFFEFC; }
        .sf-fee-title { font-weight: 800; color: ${COLORS.espresso}; }
        .sf-muted { color: ${COLORS.muted}; font-size: 11px; margin-top: 5px; }
        .sf-amount { font-weight: 800; white-space: nowrap; }
        .sf-badge {
          display: inline-flex; align-items: center; gap: 6px; border-radius: 30px;
          padding: 6px 9px; font-size: 10px; font-weight: 800; white-space: nowrap;
        }
        .sf-status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .sf-badge-success { color: #246B46; background: #E8F5EC; }
        .sf-badge-partial { color: #8A5C15; background: #FFF3D9; }
        .sf-badge-pending { color: #805418; background: #FFF2D8; }
        .sf-badge-danger { color: #A8322C; background: #FDEBE8; }
        .sf-badge-neutral { color: ${COLORS.muted}; background: #F0EDE7; }
        .sf-primary {
          border: none; border-radius: 9px; background: ${COLORS.espresso};
          color: #fff; padding: 10px 14px; font: inherit; font-size: 12px;
          font-weight: 800; cursor: pointer; white-space: nowrap;
          transition: .2s ease;
        }
        .sf-primary:hover { background: ${COLORS.gold}; color: #fff; }
        .sf-pay-link {
          border: 1px solid #E8D5B5; background: #FFF8EB; color: #805418;
          border-radius: 9px; padding: 9px 12px; font: inherit; font-size: 12px;
          font-weight: 800; cursor: pointer; white-space: nowrap;
        }
        .sf-pay-link:hover { background: #FCECCF; }
        .sf-pay-link:disabled { opacity: .5; cursor: not-allowed; }
        .sf-notice {
          padding: 13px 16px; border-radius: 10px; margin-bottom: 20px;
          font-size: 13px; line-height: 1.6; border: 1px solid transparent;
        }
        .sf-notice-success { color: #246B46; background: #EAF6ED; border-color: #CDE8D3; }
        .sf-notice-error { color: #A8322C; background: #FDEBE8; border-color: #F3CCC6; }
        .sf-notice-warning { color: #805418; background: #FFF5DF; border-color: #F1D9A6; }
        .sf-empty { text-align: center; padding: 48px 20px; }
        .sf-empty-icon {
          width: 54px; height: 54px; border-radius: 16px; background: #FBF1DE;
          color: ${COLORS.gold}; display: grid; place-items: center;
          font-size: 25px; margin: 0 auto 15px;
        }
        .sf-empty h3 { font-size: 16px; margin: 0 0 8px; }
        .sf-empty p { color: ${COLORS.muted}; font-size: 13px; margin: 0; line-height: 1.7; }
        .sf-tabs { display: flex; gap: 7px; flex-wrap: wrap; }
        .sf-tab {
          border: 1px solid transparent; background: transparent; color: ${COLORS.muted};
          padding: 9px 12px; border-radius: 8px; cursor: pointer; font: inherit;
          font-size: 12px; font-weight: 800;
        }
        .sf-tab.active { background: #FBF1DE; color: #805418; border-color: #F0DDBD; }
        .sf-demo-note {
          margin: 0 24px 22px; padding: 13px 15px; border-radius: 10px;
          background: #FCF8F0; color: ${COLORS.muted}; border: 1px solid ${COLORS.border};
          font-size: 11px; line-height: 1.7;
        }
        .sf-overlay {
          position: fixed; inset: 0; z-index: 1000; background: rgba(27,20,18,.55);
          display: flex; align-items: center; justify-content: center;
          padding: 18px; overflow-y: auto;
        }
        .sf-modal {
          background: ${COLORS.white}; width: 100%; max-width: 470px;
          border-radius: 18px; padding: 27px; box-shadow: 0 24px 80px rgba(0,0,0,.22);
          margin: auto;
        }
        .sf-modal-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 12px; margin-bottom: 20px;
        }
        .sf-modal h2 {
          font-family: Georgia, 'Times New Roman', serif; font-size: 25px;
          margin: 0 0 7px;
        }
        .sf-modal-sub { font-size: 12px; color: ${COLORS.muted}; line-height: 1.6; }
        .sf-close {
          border: 1px solid ${COLORS.border}; background: ${COLORS.cream};
          border-radius: 9px; width: 34px; height: 34px; cursor: pointer;
          font-size: 18px; color: ${COLORS.espresso}; flex-shrink: 0;
        }
        .sf-balance-box {
          background: ${COLORS.cream}; border: 1px solid ${COLORS.border};
          border-radius: 12px; padding: 16px; margin-bottom: 20px;
        }
        .sf-balance-line {
          display: flex; justify-content: space-between; gap: 12px;
          font-size: 12px; margin-bottom: 10px; color: ${COLORS.muted};
        }
        .sf-balance-line:last-child { margin-bottom: 0; padding-top: 10px; border-top: 1px solid ${COLORS.border}; }
        .sf-balance-line strong { color: ${COLORS.espresso}; }
        .sf-field-label { display: block; font-size: 12px; font-weight: 800; margin-bottom: 8px; }
        .sf-modal-input {
          width: 100%; padding: 13px 14px; border: 1px solid ${COLORS.border};
          border-radius: 10px; font: inherit; font-size: 16px; outline: none;
          color: ${COLORS.espresso}; background: #FFFEFC;
        }
        .sf-modal-input:focus { border-color: ${COLORS.gold}; }
        .sf-amount-help { font-size: 11px; color: ${COLORS.muted}; margin-top: 7px; }
        .sf-modal-actions { display: flex; gap: 10px; margin-top: 22px; }
        .sf-modal-actions button { flex: 1; min-height: 44px; }
        .sf-modal .sf-notice { margin-top: 14px; margin-bottom: 0; }
        .sf-footer {
          color: ${COLORS.muted}; font-size: 11px; text-align: center;
          line-height: 1.8; padding: 6px 10px 20px;
        }
        .sf-spinner {
          width: 18px; height: 18px; border: 2px solid #E7D9C3;
          border-top-color: ${COLORS.gold}; border-radius: 50%;
          display: inline-block; animation: sf-spin .7s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }
        @keyframes sf-spin { to { transform: rotate(360deg); } }
        @media (max-width: 1000px) {
          .sf-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 600px) {
          .sf-page { padding: 18px 12px; }
          .sf-heading { align-items: flex-start; }
          .sf-summary { gap: 10px; }
          .sf-stat { padding: 15px; }
          .sf-stat-top { align-items: flex-start; margin-bottom: 13px; }
          .sf-stat-icon { width: 31px; height: 31px; }
          .sf-panel-head { padding: 18px 16px; }
          .sf-filters { padding: 14px 16px; }
          .sf-table th, .sf-table td { padding: 14px 13px; }
          .sf-demo-note { margin: 0 14px 16px; }
          .sf-modal { padding: 21px; }
          .sf-demo-label { max-width: none; }
        }
      `}</style>

      <div className="sf-container">
        <div className="sf-topline">
          <Link to="/student" className="sf-back">
            <span aria-hidden="true">←</span> Back to Student Dashboard
          </Link>

          <button
            type="button"
            className="sf-refresh"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh data"}
          </button>
        </div>

        <header className="sf-heading">
          <div>
            <p className="sf-eyebrow">CampusOne · Student Services</p>
            <h1>Fees & Payments</h1>
            <p className="sf-subtitle">
              View your fee dues, track payments, and manage your outstanding
              balances in one place.
            </p>
          </div>

          <div className="sf-demo-label">
            DEMO PAYMENT MODE
            <br />
            No real money will be charged.
          </div>
        </header>

        {notice && (
          <div
            className={`sf-notice sf-notice-${
              notice.type === "success"
                ? "success"
                : notice.type === "error"
                  ? "error"
                  : "warning"
            }`}
            role="status"
          >
            {notice.text}
          </div>
        )}

        {error && (
          <div className="sf-notice sf-notice-error" role="alert">
            <strong>Unable to load fee records.</strong>
            <div>{error}</div>
            <button
              type="button"
              className="sf-secondary"
              style={{ marginTop: 10 }}
              onClick={() => loadData()}
            >
              Try again
            </button>
          </div>
        )}

        <section className="sf-summary" aria-label="Fee summary">
          <div className="sf-stat">
            <div className="sf-stat-top">
              <span className="sf-stat-label">Total fees</span>
              <span className="sf-stat-icon" aria-hidden="true">₹</span>
            </div>
            <div className="sf-stat-value">{money(totals.total)}</div>
            <div className="sf-stat-foot">Total amount assigned to you</div>
          </div>

          <div className="sf-stat">
            <div className="sf-stat-top">
              <span className="sf-stat-label">Amount paid</span>
              <span className="sf-stat-icon" aria-hidden="true">✓</span>
            </div>
            <div className="sf-stat-value">{money(totals.paid)}</div>
            <div className="sf-stat-foot">Payments recorded against your fees</div>
          </div>

          <div className="sf-stat">
            <div className="sf-stat-top">
              <span className="sf-stat-label">Outstanding balance</span>
              <span className="sf-stat-icon" aria-hidden="true">↗</span>
            </div>
            <div className="sf-stat-value">{money(totals.due)}</div>
            <div className="sf-stat-foot">Remaining amount to be paid</div>
          </div>

          <div className="sf-stat">
            <div className="sf-stat-top">
              <span className="sf-stat-label">Fees to settle</span>
              <span className="sf-stat-icon" aria-hidden="true">▤</span>
            </div>
            <div className="sf-stat-value">{outstandingCount}</div>
            <div className="sf-stat-foot">Fee records with an outstanding balance</div>
          </div>
        </section>

        <section className="sf-panel">
          <div className="sf-panel-head">
            <div>
              <h2>My fee records</h2>
              <p>
                {fees.length} {fees.length === 1 ? "record" : "records"} ·
                amounts and statuses from your account
              </p>
            </div>

            <div className="sf-tabs" role="tablist" aria-label="Fee information">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "fees"}
                className={`sf-tab ${activeTab === "fees" ? "active" : ""}`}
                onClick={() => setActiveTab("fees")}
              >
                Fee records
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "history"}
                className={`sf-tab ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                Payment history
              </button>
            </div>
          </div>

          {activeTab === "fees" ? (
            <>
              <div className="sf-filters">
                <input
                  className="sf-input sf-search"
                  type="search"
                  placeholder="Search fee type, year, or fee ID..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search fee records"
                />

                <select
                  className="sf-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter fee records"
                >
                  <option value="ALL">All fees</option>
                  <option value="DUE">Outstanding</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              {loading ? (
                <div className="sf-empty">
                  <span className="sf-spinner" />
                  Loading your fee records...
                </div>
              ) : error ? (
                <div className="sf-empty">
                  <div className="sf-empty-icon">!</div>
                  <h3>Fee records unavailable</h3>
                  <p>Use the Try again button above to reload your records.</p>
                </div>
              ) : filteredFees.length === 0 ? (
                <div className="sf-empty">
                  <div className="sf-empty-icon">₹</div>
                  <h3>
                    {fees.length === 0
                      ? "No fee records yet"
                      : "No matching fee records"}
                  </h3>
                  <p>
                    {fees.length === 0
                      ? "When the college assigns fees to your account, they will appear here."
                      : "Try changing your search or filter."}
                  </p>
                </div>
              ) : (
                <div className="sf-table-wrap">
                  <table className="sf-table">
                    <thead>
                      <tr>
                        <th>Fee details</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Balance</th>
                        <th>Due date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredFees.map((fee) => {
                        const remaining = getRemaining(fee);
                        const overdue =
                          remaining > 0 &&
                          fee.dueDate &&
                          new Date(`${fee.dueDate}T23:59:59`) < new Date();

                        return (
                          <tr key={fee.id}>
                            <td>
                              <div className="sf-fee-title">
                                {fee.feeType || "Fee"}
                              </div>
                              <div className="sf-muted">
                                Fee #{fee.id}
                                {fee.academicYear
                                  ? ` · ${fee.academicYear}`
                                  : ""}
                              </div>
                            </td>

                            <td className="sf-amount">
                              {money(fee.totalAmount)}
                            </td>

                            <td className="sf-amount">
                              {money(fee.paidAmount)}
                            </td>

                            <td className="sf-amount">
                              <span style={{ color: remaining > 0 ? COLORS.gold : COLORS.green }}>
                                {money(remaining)}
                              </span>
                            </td>

                            <td>
                              <div>{formatDate(fee.dueDate)}</div>
                              {overdue && (
                                <div style={{ color: COLORS.red, fontSize: 10, marginTop: 5, fontWeight: 800 }}>
                                  OVERDUE
                                </div>
                              )}
                            </td>

                            <td>
                              <StatusBadge
                                status={
                                  remaining <= 0
                                    ? "PAID"
                                    : Number(fee.paidAmount) > 0
                                      ? "PARTIALLY_PAID"
                                      : fee.status
                                }
                              />
                            </td>

                            <td>
                              {remaining > 0 ? (
                                <button
                                  type="button"
                                  className="sf-pay-link"
                                  onClick={() => openPayment(fee)}
                                >
                                  Pay now →
                                </button>
                              ) : (
                                <span className="sf-muted">Settled</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="sf-demo-note">
                <strong>Payment information:</strong> Your outstanding balance
                is calculated from the fee records provided by the backend.
                Payments are limited to that balance. Online payments currently
                use a simulated demo endpoint, not a real payment gateway.
              </div>
            </>
          ) : (
            <>
              {loading ? (
                <div className="sf-empty">
                  <span className="sf-spinner" />
                  Loading payment history...
                </div>
              ) : payments.length === 0 ? (
                <div className="sf-empty">
                  <div className="sf-empty-icon">↻</div>
                  <h3>No payment history yet</h3>
                  <p>
                    Payments recorded against your fees will appear here.
                    Failed demo attempts may also appear if recorded by the backend.
                  </p>
                </div>
              ) : (
                <div className="sf-table-wrap">
                  <table className="sf-table">
                    <thead>
                      <tr>
                        <th>Transaction</th>
                        <th>Fee</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {[...payments]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt || 0) -
                            new Date(a.createdAt || 0)
                        )
                        .map((payment, index) => (
                          <tr key={payment.id ?? index}>
                            <td>
                              <div className="sf-fee-title">
                                {payment.transactionReference ||
                                  `Payment #${payment.id ?? index + 1}`}
                              </div>
                              <div className="sf-muted">
                                {payment.id != null
                                  ? `Payment ID: ${payment.id}`
                                  : "Transaction record"}
                              </div>
                            </td>

                            <td>
                              <div>{payment.feeType || `Fee #${payment.feeRecordId ?? "—"}`}</div>
                              {payment.feeRecordId != null && (
                                <div className="sf-muted">
                                  Fee ID: {payment.feeRecordId}
                                </div>
                              )}
                            </td>

                            <td className="sf-amount">
                              {money(payment.amount)}
                            </td>

                            <td>
                              {String(payment.paymentMethod || "—").replaceAll("_", " ")}
                            </td>

                            <td>{formatDate(payment.createdAt)}</td>

                            <td>
                              <StatusBadge
                                status={
                                  payment.paymentStatus ||
                                  payment.status ||
                                  "PENDING"
                                }
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="sf-demo-note">
                <strong>Transaction reference:</strong> Use the reference shown
                in your payment history when discussing a transaction with the
                college administration.
              </div>
            </>
          )}
        </section>

        <div className="sf-footer">
          CampusOne · Student Fee Management
          <br />
          Fee information is retrieved from the college system. Online payment
          is currently in demo mode.
        </div>
      </div>

      {selectedFee && (
        <div
          className="sf-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePayment();
          }}
        >
          <section
            className="sf-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sf-payment-title"
          >
            <div className="sf-modal-head">
              <div>
                <h2 id="sf-payment-title">Make a payment</h2>
                <div className="sf-modal-sub">
                  {selectedFee.feeType || "Fee"} · Fee #{selectedFee.id}
                  <br />
                  {selectedFee.academicYear || "Academic year not specified"}
                </div>
              </div>

              <button
                type="button"
                className="sf-close"
                onClick={closePayment}
                disabled={paying}
                aria-label="Close payment dialog"
              >
                ×
              </button>
            </div>

            <div className="sf-balance-box">
              <div className="sf-balance-line">
                <span>Total fee</span>
                <strong>{money(selectedFee.totalAmount)}</strong>
              </div>

              <div className="sf-balance-line">
                <span>Already paid</span>
                <strong>{money(selectedFee.paidAmount)}</strong>
              </div>

              <div className="sf-balance-line">
                <span>Outstanding balance</span>
                <strong style={{ color: COLORS.gold }}>
                  {money(getRemaining(selectedFee))}
                </strong>
              </div>
            </div>

            <form onSubmit={handlePayment}>
              <label className="sf-field-label" htmlFor="sf-payment-amount">
                Amount to pay (₹)
              </label>

              <input
                id="sf-payment-amount"
                className="sf-modal-input"
                type="number"
                min="0.01"
                max={getRemaining(selectedFee)}
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                disabled={paying}
              />

              <div className="sf-amount-help">
                You can pay part or all of the outstanding balance.
              </div>

              <div className="sf-notice sf-notice-warning" style={{ marginTop: 18 }}>
                <strong>Demo payment only.</strong> No real money is charged.
                The backend simulates the payment result, and a failed attempt
                should not reduce your balance.
              </div>

              <div className="sf-modal-actions">
                <button
                  type="button"
                  className="sf-secondary"
                  onClick={closePayment}
                  disabled={paying}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="sf-primary"
                  disabled={
                    paying ||
                    !amount ||
                    Number(amount) <= 0 ||
                    Number(amount) > getRemaining(selectedFee) + 0.000001
                  }
                >
                  {paying ? "Processing..." : `Pay ${money(amount)}`}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default StudentFees;

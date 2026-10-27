import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const dateLabel = (value) => {
  if (!value) return "—";
  const date = new Date(String(value).length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const arrayFrom = (response) => {
  const body = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.fees)) return body.fees;
  if (Array.isArray(body?.payments)) return body.payments;
  return [];
};

const errorText = (error) => {
  if (error?.response?.status === 401) return "Your session may have expired. Please log in again.";
  if (error?.response?.status === 403) return "Your account does not have permission for this action.";
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong.";
};

const remaining = (fee) => Math.max(
  0,
  fee.remainingAmount != null
    ? Number(fee.remainingAmount) || 0
    : (Number(fee.totalAmount) || 0) - (Number(fee.paidAmount) || 0)
);

function AdminFeeManagement() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recordingId, setRecordingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [historyFor, setHistoryFor] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [offlineFee, setOfflineFee] = useState(null);
  const [offlineAmount, setOfflineAmount] = useState("");
  const [offlineSaving, setOfflineSaving] = useState(false);

  const [form, setForm] = useState({
    studentId: "",
    feeType: "TUITION",
    totalAmount: "",
    dueDate: "",
    academicYear: "",
  });

  const loadFees = useCallback(async (refresh = false) => {
    setError("");
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await API.get("/fees");
      setFees(arrayFrom(response));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadFees(); }, [loadFees]);

  const totals = useMemo(() => fees.reduce((acc, fee) => {
    acc.total += Number(fee.totalAmount) || 0;
    acc.paid += Number(fee.paidAmount) || 0;
    acc.due += remaining(fee);
    return acc;
  }, { total: 0, paid: 0, due: 0 }), [fees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fees.filter((fee) => {
      const status = String(fee.status || (remaining(fee) === 0 ? "PAID" : "PENDING")).toUpperCase();
      const textMatch = !q || [
        fee.id, fee.studentId, fee.studentName, fee.studentEmail, fee.feeType, fee.academicYear,
      ].some((value) => String(value ?? "").toLowerCase().includes(q));
      const statusMatch = statusFilter === "ALL"
        || (statusFilter === "DUE" && remaining(fee) > 0)
        || (statusFilter === "PAID" && remaining(fee) <= 0)
        || (statusFilter === "OVERDUE" && remaining(fee) > 0 && fee.dueDate && new Date(`${fee.dueDate}T23:59:59`) < new Date());
      return textMatch && statusMatch;
    });
  }, [fees, search, statusFilter]);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const createFee = async (event) => {
    event.preventDefault();
    setError("");
    setNotice(null);
    if (!Number.isInteger(Number(form.studentId)) || Number(form.studentId) <= 0) {
      setError("Enter a valid numeric student ID.");
      return;
    }
    if (!Number.isFinite(Number(form.totalAmount)) || Number(form.totalAmount) <= 0) {
      setError("Enter a fee amount greater than zero.");
      return;
    }
    setSaving(true);
    try {
      const response = await API.post("/fees", {
        studentId: Number(form.studentId),
        feeType: form.feeType.trim(),
        totalAmount: Number(Number(form.totalAmount).toFixed(2)),
        dueDate: form.dueDate,
        academicYear: form.academicYear.trim(),
      });
      const body = response?.data?.data ?? response?.data ?? response;
      setNotice({
        type: "success",
        text: `Fee assigned successfully${body?.id != null ? ` (Fee #${body.id})` : ""}. The student can view it in Fees & Payments.`,
      });
      setForm((prev) => ({ ...prev, studentId: "", totalAmount: "" }));
      await loadFees(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (fee) => {
    setHistoryFor(fee);
    setHistory([]);
    setHistoryLoading(true);
    setError("");
    try {
      const response = await API.get(`/fee-payments/fee/${fee.id}`);
      setHistory(arrayFrom(response));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setHistoryLoading(false);
    }
  };

  const recordOfflinePayment = async (event) => {
    event.preventDefault();
    if (!offlineFee) return;
    const amount = Number(offlineAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > remaining(offlineFee) + 0.000001) {
      setError(`Enter an amount greater than zero and no more than ${money(remaining(offlineFee))}.`);
      return;
    }
    setOfflineSaving(true);
    setError("");
    setNotice(null);
    try {
      await API.post("/fee-payments/offline", {
        feeRecordId: offlineFee.id,
        amount: Number(amount.toFixed(2)),
        paymentMethod: "OFFLINE",
        remarks: offlineRemarks.trim() || "Offline payment recorded by administration",
      });
      setNotice({ type: "success", text: `Offline payment recorded for fee #${offlineFee.id}.` });
      setOfflineFee(null);
      setOfflineAmount("");
      await loadFees(true);
      if (historyFor?.id === offlineFee.id) await openHistory(offlineFee);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setOfflineSaving(false);
    }
  };

  return (
    <div className="afm-page">
      <style>{`
        .afm-page{min-height:calc(100vh - 68px);padding:30px;background:#F8F4EB;color:#2C1F1D;box-sizing:border-box;font-family:inherit}
        .afm-page *{box-sizing:border-box}.afm-container{max-width:1380px;margin:0 auto}
        .afm-top,.afm-heading,.afm-panel-head,.afm-section-head{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
        .afm-top{margin-bottom:24px}.afm-back{color:#72635B;text-decoration:none;font-size:13px;font-weight:700}.afm-back:hover{color:#C88A2E}
        .afm-btn{border:1px solid #E9E0D2;border-radius:9px;padding:10px 14px;background:#fff;color:#2C1F1D;font:inherit;font-size:12px;font-weight:800;cursor:pointer}
        .afm-btn:disabled{opacity:.55;cursor:not-allowed}.afm-primary{background:#2C1F1D;color:#fff;border-color:#2C1F1D}.afm-primary:hover{background:#C88A2E;border-color:#C88A2E}
        .afm-heading{align-items:flex-end;margin-bottom:25px}.afm-eyebrow{margin:0 0 8px;color:#C88A2E;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
        .afm-heading h1{margin:0;font:600 clamp(29px,4vw,40px)/1.15 Georgia,serif;letter-spacing:-.6px}.afm-heading p:last-child{max-width:760px;margin:10px 0 0;color:#72635B;font-size:14px;line-height:1.7}
        .afm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:24px}.afm-stat{background:#fff;border:1px solid #E9E0D2;border-radius:13px;padding:19px;min-width:0}
        .afm-stat span{display:block;color:#72635B;font-size:12px;font-weight:700;margin-bottom:10px}.afm-stat strong{font:700 clamp(20px,2vw,28px) Georgia,serif;overflow-wrap:anywhere}
        .afm-stat.total{background:#2C1F1D;color:#fff;border-color:#2C1F1D}.afm-stat.total span{color:#E2A855}
        .afm-alert{padding:13px 15px;border-radius:9px;margin-bottom:17px;font-size:13px;line-height:1.6}.afm-error{background:#FDEBE8;border:1px solid #F3CCC6;color:#A8322C}.afm-success{background:#EAF6ED;border:1px solid #CDE8D3;color:#246B46}
        .afm-layout{display:grid;grid-template-columns:minmax(300px,.75fr) minmax(0,1.65fr);gap:20px;align-items:start}
        .afm-panel{background:#fff;border:1px solid #E9E0D2;border-radius:14px;overflow:hidden;box-shadow:0 4px 16px #2C1F1D08;margin-bottom:22px;min-width:0}
        .afm-panel-head{padding:20px 22px;border-bottom:1px solid #E9E0D2}.afm-panel-head h2{font:600 21px Georgia,serif;margin:0}.afm-panel-head p{font-size:12px;color:#72635B;margin:6px 0 0;line-height:1.6}
        .afm-form{padding:21px;display:grid;gap:15px}.afm-field{display:grid;gap:7px;min-width:0}.afm-field label{font-size:12px;font-weight:800;color:#584A45}
        .afm-field input,.afm-field select,.afm-field textarea,.afm-filter{width:100%;min-width:0;min-height:42px;border:1px solid #E5D9C7;border-radius:9px;background:#FFFEFC;padding:10px 12px;color:#2C1F1D;font:inherit;font-size:13px;outline:none}
        .afm-field input:focus,.afm-field select:focus,.afm-field textarea:focus,.afm-filter:focus{border-color:#C88A2E;box-shadow:0 0 0 3px #C88A2E20}
        .afm-hint{color:#72635B;font-size:11px;line-height:1.6}.afm-form .afm-btn{min-height:43px}
        .afm-tools{display:flex;gap:10px;flex-wrap:wrap;padding:16px 20px;border-bottom:1px solid #E9E0D2}.afm-search{flex:1;min-width:190px}.afm-filter{width:auto;min-width:150px}
        .afm-table-wrap{width:100%;overflow-x:auto}.afm-table{width:100%;min-width:1020px;border-collapse:collapse;text-align:left;font-size:12px}
        .afm-table th{padding:13px 14px;background:#F3EBDD;color:#72635B;border-bottom:1px solid #E8DDCC;font-size:10px;letter-spacing:.45px;text-transform:uppercase;white-space:nowrap}
        .afm-table td{padding:14px;border-bottom:1px solid #F0E9DD;vertical-align:middle;line-height:1.55}.afm-table tbody tr:last-child td{border-bottom:0}.afm-table tbody tr:hover{background:#FDFBF7}
        .afm-main{font-weight:800}.afm-muted{font-size:11px;color:#72635B;margin-top:4px;overflow-wrap:anywhere}.afm-money{font-weight:800;white-space:nowrap}
        .afm-pill{display:inline-flex;border-radius:20px;padding:6px 9px;font-size:10px;font-weight:800;background:#FFF2D8;color:#805418;white-space:nowrap}.afm-pill.paid{background:#E8F5EC;color:#246B46}.afm-pill.partial{background:#FFF3D9;color:#8A5C15}
        .afm-actions{display:flex;gap:7px;flex-wrap:wrap}.afm-small{padding:8px 10px;font-size:11px}.afm-empty{text-align:center;padding:34px 18px;color:#72635B;font-size:13px;line-height:1.7}
        .afm-note{padding:13px 16px;margin:0 20px 20px;background:#FCF8F0;border:1px solid #E9E0D2;border-radius:9px;color:#72635B;font-size:11px;line-height:1.7}
        .afm-overlay{position:fixed;inset:0;z-index:1000;background:#1B14128C;display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto}
        .afm-modal{background:#fff;width:100%;max-width:520px;border-radius:16px;padding:24px;box-shadow:0 24px 80px #0003;margin:auto}.afm-modal h2{font:600 24px Georgia,serif;margin:0 0 7px}.afm-modal p{color:#72635B;font-size:12px;line-height:1.6;margin:0 0 18px}
        .afm-modal-actions{display:flex;gap:10px;margin-top:18px}.afm-modal-actions button{flex:1;min-height:42px}
        @media(max-width:1050px){.afm-layout{grid-template-columns:1fr}.afm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:600px){.afm-page{padding:20px 12px}.afm-stats{gap:9px}.afm-stat{padding:14px}.afm-panel-head{padding:17px}.afm-form{padding:17px}.afm-tools{padding:13px;display:grid;grid-template-columns:1fr}.afm-search,.afm-filter{width:100%;min-width:0}.afm-modal{padding:19px}}
      `}</style>

      <div className="afm-container">
        <div className="afm-top">
          <Link to="/admin" className="afm-back">← Back to Admin Dashboard</Link>
          <button type="button" className="afm-btn" onClick={() => loadFees(true)} disabled={loading || refreshing}>
            {refreshing ? "Refreshing..." : "↻ Refresh data"}
          </button>
        </div>

        <header className="afm-heading">
          <div>
            <p className="afm-eyebrow">CampusOne · Administration</p>
            <h1>Fee & Payment Management</h1>
            <p>Assign fee records to students, monitor outstanding balances, and record payments received by the college.</p>
          </div>
        </header>

        {error && <div className="afm-alert afm-error" role="alert">{error}</div>}
        {notice && <div className={`afm-alert ${notice.type === "success" ? "afm-success" : "afm-error"}`} role="status">{notice.text}</div>}

        <section className="afm-stats" aria-label="Fee summary">
          <div className="afm-stat total"><span>Total assigned fees</span><strong>{loading ? "—" : money(totals.total)}</strong></div>
          <div className="afm-stat"><span>Collected / paid</span><strong>{loading ? "—" : money(totals.paid)}</strong></div>
          <div className="afm-stat"><span>Outstanding</span><strong>{loading ? "—" : money(totals.due)}</strong></div>
          <div className="afm-stat"><span>Fee records</span><strong>{loading ? "—" : fees.length}</strong></div>
        </section>

        <div className="afm-layout">
          <section className="afm-panel">
            <div className="afm-panel-head">
              <div><h2>Assign a fee</h2><p>The new record becomes visible in that student's Fees & Payments page.</p></div>
            </div>
            <form className="afm-form" onSubmit={createFee}>
              <div className="afm-field">
                <label htmlFor="afm-student-id">Student database ID *</label>
                <input id="afm-student-id" type="number" min="1" step="1" required value={form.studentId} onChange={(e) => setField("studentId", e.target.value)} placeholder="e.g. 25" />
                <div className="afm-hint">Use the student's numeric ID from your existing user records. This page does not assume an unverified student-directory API.</div>
              </div>
              <div className="afm-field">
                <label htmlFor="afm-fee-type">Fee type *</label>
                <select id="afm-fee-type" required value={form.feeType} onChange={(e) => setField("feeType", e.target.value)}>
                  <option value="TUITION">Tuition fee</option><option value="HOSTEL">Hostel fee</option><option value="EXAMINATION">Examination fee</option><option value="MESS">Mess fee</option><option value="LIBRARY">Library fee</option><option value="TRANSPORT">Transport fee</option><option value="LABORATORY">Laboratory fee</option><option value="OTHER">Other fee</option>
                </select>
              </div>
              <div className="afm-field">
                <label htmlFor="afm-amount">Total amount (₹) *</label>
                <input id="afm-amount" type="number" min="0.01" step="0.01" required value={form.totalAmount} onChange={(e) => setField("totalAmount", e.target.value)} placeholder="e.g. 15000" />
              </div>
              <div className="afm-field">
                <label htmlFor="afm-due">Payment due date *</label>
                <input id="afm-due" type="date" required value={form.dueDate} onChange={(e) => setField("dueDate", e.target.value)} />
              </div>
              <div className="afm-field">
                <label htmlFor="afm-year">Academic year *</label>
                <input id="afm-year" required maxLength="30" value={form.academicYear} onChange={(e) => setField("academicYear", e.target.value)} placeholder="2026-2027" />
              </div>
              <button className="afm-btn afm-primary" type="submit" disabled={saving}>{saving ? "Assigning fee..." : "+ Assign fee to student"}</button>
              <div className="afm-hint">Student ID, fee type, total amount, due date, and academic year match the current FeeRecordRequest DTO.</div>
            </form>
          </section>

          <section className="afm-panel">
            <div className="afm-panel-head">
              <div><h2>All fee records</h2><p>{filtered.length} matching records · balances reflect the backend fee records</p></div>
            </div>
            <div className="afm-tools">
              <input className="afm-filter afm-search" type="search" placeholder="Search fee ID, student ID/name, type, year..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search fee records" />
              <select className="afm-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter fees">
                <option value="ALL">All fees</option><option value="DUE">Outstanding</option><option value="PAID">Paid</option><option value="OVERDUE">Overdue</option>
              </select>
            </div>
            {loading ? <div className="afm-empty">Loading fee records…</div> : filtered.length === 0 ? (
              <div className="afm-empty">{fees.length ? "No records match your search or filter." : "No fee records found. Assign the first fee using the form."}</div>
            ) : (
              <div className="afm-table-wrap">
                <table className="afm-table">
                  <thead><tr><th>Fee / Student</th><th>Total</th><th>Paid</th><th>Balance</th><th>Due date</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{filtered.map((fee) => {
                    const due = remaining(fee);
                    const status = due <= 0 ? "PAID" : Number(fee.paidAmount) > 0 ? "PARTIALLY_PAID" : String(fee.status || "PENDING").toUpperCase();
                    const overdue = due > 0 && fee.dueDate && new Date(`${fee.dueDate}T23:59:59`) < new Date();
                    return <tr key={fee.id}>
                      <td><div className="afm-main">{fee.feeType || "Fee"} · #{fee.id}</div><div className="afm-muted">{fee.studentName || `Student #${fee.studentId ?? "—"}`}</div><div className="afm-muted">{fee.academicYear || "Academic year not set"}</div></td>
                      <td className="afm-money">{money(fee.totalAmount)}</td><td className="afm-money">{money(fee.paidAmount)}</td>
                      <td className="afm-money" style={{color:due > 0 ? "#A66C1E" : "#287A50"}}>{money(due)}{overdue && <div className="afm-muted" style={{color:"#B84036"}}>Overdue</div>}</td>
                      <td>{dateLabel(fee.dueDate)}</td>
                      <td><span className={`afm-pill ${status === "PAID" ? "paid" : status === "PARTIALLY_PAID" ? "partial" : ""}`}>{status.replaceAll("_"," ")}</span></td>
                      <td><div className="afm-actions">
                        <button type="button" className="afm-btn afm-small" onClick={() => openHistory(fee)}>Payment history</button>
                        {due > 0 && <button type="button" className="afm-btn afm-primary afm-small" onClick={() => {setOfflineFee(fee);setOfflineAmount(due.toFixed(2));setError("");}}>Record offline</button>}
                      </div></td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
            )}
            <div className="afm-note"><strong>Important:</strong> Offline payment recording sends the fee ID, amount, and payment method to the existing `/fee-payments/offline` endpoint. Payment balance changes only according to backend payment logic. Online student payments are simulated demo transactions, not real charges.</div>
          </section>
        </div>

        {historyFor && <div className="afm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setHistoryFor(null); }}>
          <section className="afm-modal" role="dialog" aria-modal="true" aria-labelledby="afm-history-title">
            <div className="afm-section-head"><h2 id="afm-history-title">Payment history · Fee #{historyFor.id}</h2><button className="afm-btn" type="button" onClick={() => setHistoryFor(null)}>Close</button></div>
            <p>{historyFor.studentName || `Student #${historyFor.studentId ?? "—"}`} · {historyFor.feeType} · Outstanding {money(remaining(historyFor))}</p>
            {historyLoading ? <div className="afm-empty">Loading payment history…</div> : history.length === 0 ? <div className="afm-empty">No payment records found for this fee.</div> : <div className="afm-table-wrap"><table className="afm-table" style={{minWidth:650}}><thead><tr><th>Transaction</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead><tbody>{history.map((payment, index) => <tr key={payment.id ?? index}><td><div className="afm-main">{payment.transactionReference || `Payment #${payment.id ?? index+1}`}</div><div className="afm-muted">{payment.remarks || ""}</div></td><td className="afm-money">{money(payment.amount)}</td><td>{payment.paymentMethod || "—"}</td><td>{payment.paymentStatus || "—"}</td><td>{dateLabel(payment.createdAt)}</td></tr>)}</tbody></table></div>}
          </section>
        </div>}

        {offlineFee && <div className="afm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !offlineSaving) setOfflineFee(null); }}>
          <section className="afm-modal" role="dialog" aria-modal="true" aria-labelledby="afm-offline-title">
            <h2 id="afm-offline-title">Record offline payment</h2>
            <p>Fee #{offlineFee.id} · {offlineFee.feeType} · Outstanding balance: <strong>{money(remaining(offlineFee))}</strong></p>
            <form onSubmit={recordOfflinePayment}>
              <div className="afm-field"><label htmlFor="afm-offline-amount">Amount received (₹) *</label><input id="afm-offline-amount" type="number" min="0.01" max={remaining(offlineFee)} step="0.01" required value={offlineAmount} onChange={(e) => setOfflineAmount(e.target.value)} /></div>
              <div className="afm-hint" style={{marginTop:10}}>This backend request currently accepts fee ID, amount, and payment method only. Receipt remarks are not available in the current DTO.</div>
              <div className="afm-modal-actions"><button type="button" className="afm-btn" onClick={() => setOfflineFee(null)} disabled={offlineSaving}>Cancel</button><button type="submit" className="afm-btn afm-primary" disabled={offlineSaving}>{offlineSaving ? "Recording…" : "Confirm payment"}</button></div>
            </form>
          </section>
        </div>}
      </div>
    </div>
  );
}

export default AdminFeeManagement;

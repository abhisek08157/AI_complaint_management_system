import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

const COLORS = {
  cream: "#F8F4EB",
  espresso: "#2C1F1D",
  gold: "#C88A2E",
  muted: "#72635B",
  white: "#FFFFFF",
  border: "#E9E0D2",
};

const REQUEST_TYPES = [
  { value: "BONAFIDE", label: "Bonafide Certificate" },
  { value: "CHARACTER", label: "Character Certificate" },
  { value: "STUDENT_ID", label: "Student ID Certificate" },
  { value: "HOSTEL", label: "Hostel Certificate" },
  { value: "OTHER", label: "Other Request" },
];

const getArray = (response) => {
  const body = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.requests)) return body.requests;
  return [];
};

const getErrorMessage = (error) => {
  if (error?.response?.status === 401) return "Your session may have expired. Please log in again.";
  if (error?.response?.status === 403) return "You do not have permission to access these requests.";
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong. Please try again.";
};

const formatLabel = (value) =>
  String(value || "UNKNOWN").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const statusType = (status) => {
  const value = String(status || "PENDING").toUpperCase();
  if (value === "APPROVED" || value === "COMPLETED") return "success";
  if (value === "REJECTED") return "danger";
  if (value === "UNDER_REVIEW") return "review";
  return "pending";
};

function StudentCampusRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [requestType, setRequestType] = useState("BONAFIDE");
  const [description, setDescription] = useState("");

  const loadRequests = useCallback(async (refresh = false) => {
    setError("");
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await API.get("/requests/my");
      setRequests(getArray(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch = !query || [
        request.id, request.requestType, request.description, request.status, request.adminRemarks,
      ].some((value) => String(value ?? "").toLowerCase().includes(query));
      const matchesStatus = statusFilter === "ALL" || String(request.status || "PENDING").toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const counts = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => ["PENDING", "UNDER_REVIEW"].includes(String(r.status || "").toUpperCase())).length,
    approved: requests.filter((r) => ["APPROVED", "COMPLETED"].includes(String(r.status || "").toUpperCase())).length,
    rejected: requests.filter((r) => String(r.status || "").toUpperCase() === "REJECTED").length,
  }), [requests]);

  const submitRequest = async (event) => {
    event.preventDefault();
    setError("");
    setNotice(null);
    if (!description.trim()) {
      setNotice({ type: "error", text: "Please enter a description for your request." });
      return;
    }
    setSubmitting(true);
    try {
      await API.post("/requests", { requestType, description: description.trim() });
      setDescription("");
      setNotice({ type: "success", text: "Your request was submitted successfully." });
      await loadRequests(true);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadCertificate = async (request) => {
    setError("");
    setNotice(null);
    setDownloadingId(request.id);
    try {
      const response = await API.get(`/requests/${request.id}/certificate`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `CampusOne_Certificate_${request.id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setNotice({ type: "success", text: `Certificate for request #${request.id} downloaded.` });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="scr-page">
      <style>{`
        .scr-page{min-height:100vh;padding:30px;background:${COLORS.cream};color:${COLORS.espresso};box-sizing:border-box;font-family:inherit}
        .scr-page *{box-sizing:border-box}.scr-container{max-width:1240px;margin:0 auto}
        .scr-top{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:26px}
        .scr-back{color:${COLORS.muted};text-decoration:none;font-size:13px;font-weight:700}.scr-back:hover{color:${COLORS.gold}}
        .scr-btn{border:1px solid ${COLORS.border};background:#fff;color:${COLORS.espresso};border-radius:9px;padding:10px 14px;font:inherit;font-size:12px;font-weight:800;cursor:pointer}
        .scr-btn:disabled{opacity:.6;cursor:not-allowed}.scr-primary{background:${COLORS.espresso};color:#fff;border-color:${COLORS.espresso}}.scr-primary:hover{background:${COLORS.gold};border-color:${COLORS.gold}}
        .scr-heading{margin-bottom:25px}.scr-eyebrow{margin:0 0 8px;color:${COLORS.gold};font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
        .scr-heading h1{font:600 clamp(30px,4vw,42px)/1.15 Georgia,serif;margin:0;letter-spacing:-.7px}.scr-subtitle{color:${COLORS.muted};font-size:14px;line-height:1.7;margin:10px 0 0;max-width:700px}
        .scr-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;margin-bottom:24px}.scr-stat{background:#fff;border:1px solid ${COLORS.border};border-radius:14px;padding:19px}.scr-stat span{display:block;color:${COLORS.muted};font-size:12px;font-weight:700;margin-bottom:12px}.scr-stat strong{font:700 28px Georgia,serif}.scr-stat.total{background:${COLORS.espresso};border-color:${COLORS.espresso};color:#fff}.scr-stat.total span{color:#E2A855}
        .scr-grid{display:grid;grid-template-columns:minmax(280px,.8fr) minmax(0,1.5fr);gap:20px;align-items:start}.scr-panel{background:#fff;border:1px solid ${COLORS.border};border-radius:15px;overflow:hidden;margin-bottom:22px}.scr-panel-head{padding:20px 22px;border-bottom:1px solid ${COLORS.border}}.scr-panel-head h2{font:600 21px Georgia,serif;margin:0}.scr-panel-head p{color:${COLORS.muted};font-size:12px;line-height:1.6;margin:7px 0 0}.scr-form{padding:22px}.scr-field{display:flex;flex-direction:column;gap:7px;margin-bottom:16px}.scr-field label{font-size:12px;font-weight:800;color:#584A45}.scr-field input,.scr-field select,.scr-field textarea,.scr-filter input,.scr-filter select{width:100%;border:1px solid #E5D9C7;border-radius:8px;background:#FFFEFC;color:${COLORS.espresso};font:inherit;font-size:13px;padding:11px 12px;outline:none}.scr-field textarea{resize:vertical;min-height:135px;line-height:1.6}.scr-field input:focus,.scr-field select:focus,.scr-field textarea:focus,.scr-filter input:focus,.scr-filter select:focus{border-color:${COLORS.gold};box-shadow:0 0 0 3px #C88A2E20}.scr-help{font-size:11px;color:${COLORS.muted};line-height:1.6;margin:0 0 16px}
        .scr-notice{padding:12px 15px;border-radius:9px;margin:0 0 18px;font-size:13px;line-height:1.6}.scr-notice.success{background:#EAF6ED;border:1px solid #CDE8D3;color:#246B46}.scr-notice.error{background:#FDEBE8;border:1px solid #F3CCC6;color:#A8322C}.scr-notice.warning{background:#FFF5DF;border:1px solid #F1D9A6;color:#805418}
        .scr-filter{display:flex;gap:10px;flex-wrap:wrap;padding:16px 20px;border-bottom:1px solid ${COLORS.border}}.scr-filter input{flex:1;min-width:180px}.scr-filter select{width:auto;min-width:155px}.scr-table-wrap{overflow-x:auto}.scr-table{width:100%;min-width:720px;border-collapse:collapse;text-align:left}.scr-table th{background:#FCFAF6;color:${COLORS.muted};font-size:10px;letter-spacing:.6px;text-transform:uppercase;padding:13px 15px;white-space:nowrap}.scr-table td{border-top:1px solid #F0EAE1;padding:15px;font-size:12px;vertical-align:top;line-height:1.6}.scr-table tr:hover{background:#FFFEFC}.scr-id{font-weight:800;color:#A66C1E;white-space:nowrap}.scr-muted{font-size:11px;color:${COLORS.muted};margin-top:5px;overflow-wrap:anywhere}.scr-description{min-width:180px;max-width:290px;white-space:pre-wrap;overflow-wrap:anywhere}.scr-badge{display:inline-flex;border-radius:20px;padding:6px 9px;font-size:10px;font-weight:800;white-space:nowrap}.scr-badge.success{background:#E8F5EC;color:#246B46}.scr-badge.danger{background:#FDEBE8;color:#A8322C}.scr-badge.review{background:#E5EEFF;color:#2457A7}.scr-badge.pending{background:#FFF2D8;color:#805418}.scr-empty{text-align:center;padding:35px 20px;color:${COLORS.muted};font-size:13px;line-height:1.7}.scr-empty strong{display:block;color:${COLORS.espresso};font:600 18px Georgia,serif;margin-bottom:6px}.scr-download{border:1px solid #E8D5B5;background:#FFF8EB;color:#805418;border-radius:7px;padding:8px 10px;font:inherit;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap}.scr-download:disabled{opacity:.6;cursor:wait}.scr-footer{text-align:center;color:${COLORS.muted};font-size:11px;padding:10px 10px 20px}
        @media(max-width:950px){.scr-grid{grid-template-columns:1fr}.scr-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.scr-page{padding:20px 12px}.scr-stats{gap:9px}.scr-stat{padding:14px}.scr-stat strong{font-size:24px}.scr-panel-head{padding:17px}.scr-form{padding:17px}.scr-filter{padding:13px}.scr-filter select{width:100%}}
      `}</style>
      <div className="scr-container">
        <div className="scr-top">
          <Link to="/student" className="scr-back">← Back to Student Dashboard</Link>
          <button type="button" className="scr-btn" onClick={() => loadRequests(true)} disabled={loading || refreshing}>
            {refreshing ? "Refreshing..." : "↻ Refresh data"}
          </button>
        </div>
        <header className="scr-heading">
          <p className="scr-eyebrow">CampusOne · Student Services</p>
          <h1>Campus Requests & Certificates</h1>
          <p className="scr-subtitle">Submit a campus service or certificate request, follow its progress, and download your certificate when it is approved.</p>
        </header>

        {notice && <div className={`scr-notice ${notice.type}`} role="status">{notice.text}</div>}
        {error && <div className="scr-notice error" role="alert">{error} <button className="scr-btn" type="button" onClick={() => loadRequests()} style={{marginLeft:10}}>Try again</button></div>}

        <section className="scr-stats" aria-label="Request summary">
          <div className="scr-stat total"><span>Total requests</span><strong>{loading ? "—" : counts.total}</strong></div>
          <div className="scr-stat"><span>Pending / in review</span><strong>{loading ? "—" : counts.pending}</strong></div>
          <div className="scr-stat"><span>Approved / completed</span><strong>{loading ? "—" : counts.approved}</strong></div>
          <div className="scr-stat"><span>Rejected</span><strong>{loading ? "—" : counts.rejected}</strong></div>
        </section>

        <div className="scr-grid">
          <section className="scr-panel">
            <div className="scr-panel-head"><h2>Submit a request</h2><p>Provide accurate details so the administration can process your request.</p></div>
            <form className="scr-form" onSubmit={submitRequest}>
              <div className="scr-field">
                <label htmlFor="scr-type">Request type</label>
                <select id="scr-type" value={requestType} onChange={(event) => setRequestType(event.target.value)} disabled={submitting}>
                  {REQUEST_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
              <div className="scr-field">
                <label htmlFor="scr-description">Request details</label>
                <textarea id="scr-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Explain why you need this certificate or service. Include any details the administration should know." maxLength={2000} required disabled={submitting} />
                <div className="scr-muted">{description.length}/2000 characters</div>
              </div>
              <p className="scr-help">Your request will be sent to the college administration. You can track updates in the request history.</p>
              <button type="submit" className="scr-btn scr-primary" disabled={submitting || !description.trim()}>{submitting ? "Submitting..." : "Submit request →"}</button>
            </form>
          </section>

          <section className="scr-panel">
            <div className="scr-panel-head"><h2>My request history</h2><p>{requests.length} {requests.length === 1 ? "request" : "requests"} submitted from your account.</p></div>
            <div className="scr-filter">
              <input type="search" aria-label="Search requests" placeholder="Search by ID, type, description, remarks..." value={search} onChange={(event) => setSearch(event.target.value)} />
              <select aria-label="Filter by request status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="UNDER_REVIEW">Under review</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="COMPLETED">Completed</option>
              </select>
            </div>
            {loading ? <div className="scr-empty">Loading your requests...</div> : filteredRequests.length === 0 ? (
              <div className="scr-empty"><strong>{requests.length ? "No matching requests" : "No requests yet"}</strong>{requests.length ? "Try changing your search or status filter." : "Submit your first request using the form."}</div>
            ) : (
              <div className="scr-table-wrap"><table className="scr-table">
                <thead><tr><th>Request</th><th>Details</th><th>Status</th><th>Submitted</th><th>Admin remarks</th><th>Certificate</th></tr></thead>
                <tbody>{filteredRequests.map((request) => {
                  const status = String(request.status || "PENDING").toUpperCase();
                  const available = request.certificateAvailable ?? ["APPROVED", "COMPLETED"].includes(status);
                  return <tr key={request.id}>
                    <td><div className="scr-id">#{request.id}</div><div className="scr-muted">{formatLabel(request.requestType)}</div></td>
                    <td><div className="scr-description">{request.description || "—"}</div></td>
                    <td><span className={`scr-badge ${statusType(status)}`}>{formatLabel(status)}</span></td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td><div className="scr-description">{request.adminRemarks || "No remarks yet"}</div></td>
                    <td>{available ? <button type="button" className="scr-download" onClick={() => downloadCertificate(request)} disabled={downloadingId === request.id}>{downloadingId === request.id ? "Preparing..." : "↓ Download PDF"}</button> : <span className="scr-muted">Not available</span>}</td>
                  </tr>;
                })}</tbody>
              </table></div>
            )}
          </section>
        </div>
        <div className="scr-footer">CampusOne · Campus Requests & Certificates</div>
      </div>
    </div>
  );
}

export default StudentCampusRequests;

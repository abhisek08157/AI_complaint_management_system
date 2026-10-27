import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

const STATUSES = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "COMPLETED"];

const getArray = (response) => {
  const body = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.requests)) return body.requests;
  return [];
};

const getErrorMessage = (error) => {
  if (error?.response?.status === 401) return "Your session may have expired. Please log in again.";
  if (error?.response?.status === 403) return "You do not have permission to manage campus requests.";
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

const badgeType = (status) => {
  if (["APPROVED", "COMPLETED"].includes(status)) return "success";
  if (status === "REJECTED") return "danger";
  if (status === "UNDER_REVIEW") return "review";
  return "pending";
};

function AdminCampusRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [drafts, setDrafts] = useState({});

  const fetchRequests = useCallback(async (refresh = false) => {
    setError("");
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await API.get("/requests");
      const items = getArray(response);
      setRequests(items);
      setDrafts((previous) => {
        const next = { ...previous };
        items.forEach((item) => {
          if (!next[item.id]) next[item.id] = {
            status: item.status || "PENDING",
            adminRemarks: item.adminRemarks || "",
          };
        });
        return next;
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const requestTypes = useMemo(() => [...new Set(requests.map((r) => String(r.requestType || "OTHER").toUpperCase()))].sort(), [requests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch = !query || [
        request.id, request.requestType, request.description, request.status,
        request.adminRemarks, request.userName, request.userEmail, request.userId,
      ].some((value) => String(value ?? "").toLowerCase().includes(query));
      const matchesStatus = statusFilter === "ALL" || String(request.status || "PENDING").toUpperCase() === statusFilter;
      const matchesType = typeFilter === "ALL" || String(request.requestType || "OTHER").toUpperCase() === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requests, search, statusFilter, typeFilter]);

  const counts = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => String(r.status || "PENDING").toUpperCase() === "PENDING").length,
    review: requests.filter((r) => String(r.status || "").toUpperCase() === "UNDER_REVIEW").length,
    approved: requests.filter((r) => ["APPROVED", "COMPLETED"].includes(String(r.status || "").toUpperCase())).length,
  }), [requests]);

  const updateDraft = (id, field, value) => {
    setDrafts((previous) => ({
      ...previous,
      [id]: { ...(previous[id] || {}), [field]: value },
    }));
  };

  const saveRequest = async (request) => {
    const draft = drafts[request.id] || {};
    if (!STATUSES.includes(String(draft.status || "").toUpperCase())) {
      setError("Select a valid request status.");
      return;
    }
    setSavingId(request.id);
    setError("");
    setSuccess("");
    try {
      await API.put(`/requests/${request.id}`, {
        status: String(draft.status).toUpperCase(),
        adminRemarks: draft.adminRemarks || "",
      });
      setSuccess(`Request #${request.id} was updated successfully.`);
      await fetchRequests(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  const downloadCertificate = async (request) => {
    setError("");
    setSuccess("");
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
      setSuccess(`Certificate for request #${request.id} downloaded.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="acr-page">
        <style>{`
          .acr-page{min-height:calc(100vh - 68px);padding:32px 30px 48px;background:#F8F4EB;color:#2C1F1D;box-sizing:border-box;font-family:inherit}
          .acr-page *{box-sizing:border-box}.acr-container{max-width:1360px;width:100%;margin:0 auto}
          .acr-top{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:24px}.acr-back{color:#72635B;text-decoration:none;font-size:13px;font-weight:700}.acr-back:hover{color:#C88A2E}
          .acr-button{border:1px solid #E9E0D2;border-radius:8px;background:#fff;color:#2C1F1D;padding:10px 14px;font:inherit;font-size:12px;font-weight:800;cursor:pointer}.acr-button:disabled{opacity:.6;cursor:not-allowed}.acr-primary{background:#2C1F1D;border-color:#2C1F1D;color:#fff}.acr-primary:hover{background:#C88A2E;border-color:#C88A2E}
          .acr-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;flex-wrap:wrap;margin-bottom:25px}.acr-eyebrow{margin:0 0 8px;color:#C88A2E;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase}.acr-heading h1{margin:0;font:600 clamp(29px,4vw,40px)/1.2 Georgia,serif;letter-spacing:-.6px}.acr-heading p:last-child{color:#72635B;font-size:14px;line-height:1.7;margin:9px 0 0;max-width:750px}
          .acr-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;margin-bottom:25px}.acr-stat{padding:18px 20px;border:1px solid #E9E0D2;border-radius:12px;background:#fff;box-shadow:0 4px 14px #2C1F1D08}.acr-stat span{display:block;margin-bottom:10px;color:#72635B;font-size:12px;font-weight:700}.acr-stat strong{font:700 28px Georgia,serif}.acr-stat.total{background:#2C1F1D;border-color:#2C1F1D;color:#fff}.acr-stat.total span{color:#E2A855}
          .acr-alert{padding:13px 16px;border-radius:9px;margin-bottom:18px;font-size:13px;line-height:1.6}.acr-alert.error{background:#FDF2F0;border:1px solid #F3C2BA;color:#9C2A1B}.acr-alert.success{background:#F0F7F4;border:1px solid #C2E2D3;color:#2D6A4F}
          .acr-filters{display:grid;grid-template-columns:minmax(220px,1fr) 190px 210px;gap:13px;padding:17px;margin-bottom:20px;background:#fff;border:1px solid #E9E0D2;border-radius:12px}.acr-filter{display:flex;flex-direction:column;gap:7px;min-width:0}.acr-filter label{font-size:12px;font-weight:800;color:#584A45}.acr-filter input,.acr-filter select,.acr-row select,.acr-row textarea{width:100%;min-height:40px;padding:9px 11px;border:1px solid #E5D9C7;border-radius:8px;background:#FFFEFC;color:#2C1F1D;font:inherit;font-size:12px;outline:none}.acr-filter input:focus,.acr-filter select:focus,.acr-row select:focus,.acr-row textarea:focus{border-color:#C88A2E;box-shadow:0 0 0 3px #C88A2E20}
          .acr-results{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:13px}.acr-results h2{margin:0 0 5px;font:600 22px Georgia,serif}.acr-results p{margin:0;color:#72635B;font-size:12px}.acr-count{padding:7px 11px;border-radius:20px;background:#F1E3CB;color:#79501E;font-size:12px;font-weight:800;white-space:nowrap}
          .acr-table-wrap{display:block;width:100%;max-width:100%;overflow-x:auto;overscroll-behavior-x:contain;background:#fff;border:1px solid #E9E0D2;border-radius:12px;box-shadow:0 4px 14px #2C1F1D08}.acr-table-wrap:focus{outline:2px solid #C88A2E;outline-offset:2px}.acr-table{width:100%;min-width:1280px;table-layout:fixed;border-collapse:separate;border-spacing:0;text-align:left;font-size:12px}.acr-table th{padding:14px 12px;background:#F3EBDD;color:#72635B;border-bottom:1px solid #E8DDCC;font-size:10px;letter-spacing:.45px;text-transform:uppercase;white-space:normal;overflow-wrap:anywhere;vertical-align:middle}.acr-table td{padding:14px 12px;border-bottom:1px solid #F0E9DD;vertical-align:top;line-height:1.55;overflow-wrap:anywhere;min-width:0}.acr-table th:first-child{border-top-left-radius:11px}.acr-table th:last-child{border-top-right-radius:11px}.acr-table tbody tr:last-child td{border-bottom:none}.acr-table tbody tr:hover{background:#FDFBF7}.acr-table td>*{max-width:100%}.acr-id{color:#A66C1E;font-weight:800;white-space:nowrap}.acr-sub{margin-top:4px;color:#72635B;font-size:11px;overflow-wrap:anywhere}.acr-description{min-width:180px;max-width:260px;white-space:pre-wrap;overflow-wrap:anywhere}.acr-badge{display:inline-flex;padding:6px 9px;border-radius:20px;font-size:10px;font-weight:800;white-space:nowrap}.acr-badge.success{background:#E8F5EC;color:#246B46}.acr-badge.danger{background:#FDEBE8;color:#A8322C}.acr-badge.review{background:#E5EEFF;color:#2457A7}.acr-badge.pending{background:#FFF2D8;color:#805418}.acr-row{display:flex;flex-direction:column;align-items:stretch;gap:8px;min-width:0;width:100%}.acr-row select,.acr-row textarea{display:block;width:100%;min-width:0;max-width:100%}.acr-row textarea{min-height:82px;resize:vertical;line-height:1.5;margin-top:0}.acr-row .acr-button{align-self:flex-start;margin-top:0;max-width:100%;white-space:normal}.acr-table td:nth-child(4),.acr-table td:nth-child(5),.acr-table td:nth-child(7){overflow-wrap:normal}.acr-table td:nth-child(4){font-variant-numeric:tabular-nums}.acr-empty{text-align:center;padding:38px 20px;color:#72635B;font-size:13px;line-height:1.7}.acr-empty strong{display:block;margin-bottom:6px;color:#2C1F1D;font:600 19px Georgia,serif}.acr-download{border:1px solid #E8D5B5;background:#FFF8EB;color:#805418;border-radius:7px;padding:8px 10px;font:inherit;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap}.acr-download:disabled{opacity:.6;cursor:wait}.acr-footer{text-align:center;color:#72635B;font-size:11px;padding:18px}
          @media(max-width:1000px){.acr-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.acr-filters{grid-template-columns:1fr 1fr}.acr-filter:first-child{grid-column:1/-1}}@media(max-width:600px){.acr-page{padding:22px 13px 30px}.acr-heading{align-items:flex-start;flex-direction:column}.acr-stats{gap:10px}.acr-stat{padding:14px}.acr-stat strong{font-size:25px}.acr-filters{grid-template-columns:1fr;padding:13px}.acr-filter:first-child{grid-column:auto}.acr-results{align-items:flex-start;flex-direction:column}}
        `}</style>
        <div className="acr-container">
          <div className="acr-top">
            <Link to="/admin" className="acr-back">← Back to Admin Dashboard</Link>
            <button type="button" className="acr-button acr-primary" onClick={() => fetchRequests(true)} disabled={loading || refreshing}>{refreshing ? "Refreshing..." : "↻ Refresh data"}</button>
          </div>
          <header className="acr-heading">
            <div><p className="acr-eyebrow">CampusOne · Administration</p><h1>Campus Requests & Certificates</h1><p>Review student requests, record administrative remarks, update request statuses, and download eligible certificates.</p></div>
          </header>

          {error && <div className="acr-alert error" role="alert">{error} <button type="button" className="acr-button" onClick={() => fetchRequests()} style={{marginLeft:8}}>Try again</button></div>}
          {success && <div className="acr-alert success" role="status">✓ {success}</div>}

          <section className="acr-stats" aria-label="Request summary">
            <div className="acr-stat total"><span>Total requests</span><strong>{loading ? "—" : counts.total}</strong></div>
            <div className="acr-stat"><span>Pending</span><strong>{loading ? "—" : counts.pending}</strong></div>
            <div className="acr-stat"><span>Under review</span><strong>{loading ? "—" : counts.review}</strong></div>
            <div className="acr-stat"><span>Approved / completed</span><strong>{loading ? "—" : counts.approved}</strong></div>
          </section>

          <section className="acr-filters" aria-label="Filter requests">
            <div className="acr-filter"><label htmlFor="acr-search">Search requests</label><input id="acr-search" type="search" placeholder="Search ID, student, email, type, details..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
            <div className="acr-filter"><label htmlFor="acr-status">Filter by status</label><select id="acr-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All statuses</option>{STATUSES.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}</select></div>
            <div className="acr-filter"><label htmlFor="acr-type">Filter by request type</label><select id="acr-type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="ALL">All request types</option>{requestTypes.map((type) => <option key={type} value={type}>{formatLabel(type)}</option>)}</select></div>
          </section>

          <section>
            <div className="acr-results"><div><h2>All student requests</h2><p>Save each request after changing its status or remarks.</p></div><span className="acr-count">{loading ? "Loading..." : `${filteredRequests.length} found`}</span></div>
            <div className="acr-table-wrap">
              <table className="acr-table">\n                <colgroup><col style={{ width: "7%" }} /><col style={{ width: "16%" }} /><col style={{ width: "19%" }} /><col style={{ width: "13%" }} /><col style={{ width: "13%" }} /><col style={{ width: "21%" }} /><col style={{ width: "11%" }} /></colgroup>
                <thead><tr><th>ID</th><th>Student</th><th>Request details</th><th>Submitted</th><th>Current status</th><th>Update request</th><th>Certificate</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan="7"><div className="acr-empty">Loading campus requests...</div></td></tr> : filteredRequests.length === 0 ? (
                    <tr><td colSpan="7"><div className="acr-empty"><strong>{requests.length ? "No matching requests" : "No campus requests yet"}</strong>{requests.length ? "Try changing your search or filters." : "Student requests will appear here after submission."}</div></td></tr>
                  ) : filteredRequests.map((request) => {
                    const status = String(request.status || "PENDING").toUpperCase();
                    const draft = drafts[request.id] || { status, adminRemarks: request.adminRemarks || "" };
                    const available = request.certificateAvailable ?? ["APPROVED", "COMPLETED"].includes(status);
                    return <tr key={request.id}>
                      <td><span className="acr-id">#{request.id}</span><div className="acr-sub">{formatLabel(request.requestType)}</div></td>
                      <td><strong>{request.userName || `Student #${request.userId ?? "—"}`}</strong><div className="acr-sub">{request.userEmail || "Email not available"}</div></td>
                      <td><div className="acr-description">{request.description || "—"}</div>{request.adminRemarks && <div className="acr-sub">Remarks: {request.adminRemarks}</div>}</td>
                      <td>{formatDate(request.createdAt)}</td>
                      <td><span className={`acr-badge ${badgeType(status)}`}>{formatLabel(status)}</span><div className="acr-sub">Updated: {formatDate(request.updatedAt)}</div></td>
                      <td><div className="acr-row">
                        <select aria-label={`Status for request ${request.id}`} value={draft.status || status} onChange={(event) => updateDraft(request.id, "status", event.target.value)} disabled={savingId === request.id}>
                          {STATUSES.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
                        </select>
                        <textarea aria-label={`Admin remarks for request ${request.id}`} value={draft.adminRemarks ?? ""} onChange={(event) => updateDraft(request.id, "adminRemarks", event.target.value)} placeholder="Add remarks for the student..." maxLength={2000} disabled={savingId === request.id} />
                        <button type="button" className="acr-button acr-primary" onClick={() => saveRequest(request)} disabled={savingId === request.id}>{savingId === request.id ? "Saving..." : "Save update"}</button>
                      </div></td>
                      <td>{available ? <button type="button" className="acr-download" onClick={() => downloadCertificate(request)} disabled={downloadingId === request.id}>{downloadingId === request.id ? "Preparing..." : "↓ Download PDF"}</button> : <span className="acr-sub">Available after approval</span>}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          </section>
          <div className="acr-footer">CampusOne · Campus Request Administration</div>
        </div>
      </main>
    </>
  );
}

export default AdminCampusRequests;

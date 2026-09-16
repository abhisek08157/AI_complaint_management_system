import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { getUser } from "../../utils/auth";
import Navbar from "../../components/Navbar";
import ComplaintCard from "../../components/ComplaintCard";

function MyComplaints() {
  const user = getUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await API.get(`/complaints/user/${user.userId}`);
        setComplaints(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load complaints.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user.userId]);

  const filteredComplaints = useMemo(() => complaints.filter((item) => {
    const matchesStatus = filter === "ALL" || item.status === filter;
    const text = `${item.title || ""} ${item.description || ""} ${item.location || ""}`.toLowerCase();
    return matchesStatus && text.includes(search.toLowerCase());
  }), [complaints, filter, search]);

  return (
    <>
      <Navbar />
      <main className="app-page">
        <section className="welcome-row">
          <div><p className="eyebrow">STUDENT PORTAL</p><h1>My complaints</h1><p className="page-subtitle">View updates and track every complaint you have submitted.</p></div>
        </section>

        <div className="toolbar">
          <input className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="⌕ Search complaints..." />
          <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">All statuses</option><option value="SUBMITTED">Submitted</option><option value="ASSIGNED">Assigned</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {error && <div className="alert error">{error}</div>}
        {loading ? <div className="empty-state">Loading complaints...</div> :
          filteredComplaints.length === 0 ? <div className="empty-state"><div className="empty-icon">⌕</div><h3>No matching complaints</h3><p>Try changing your search or status filter.</p></div> :
          <div className="complaint-grid">{filteredComplaints.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} />)}</div>}
      </main>
    </>
  );
}

export default MyComplaints;

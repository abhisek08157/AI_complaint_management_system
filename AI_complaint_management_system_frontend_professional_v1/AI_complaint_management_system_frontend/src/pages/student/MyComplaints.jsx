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

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const matchesStatus = filter === "ALL" || item.status === filter;
      const text = `${item.title || ""} ${item.description || ""} ${item.location || ""}`.toLowerCase();
      return matchesStatus && text.includes(search.toLowerCase());
    });
  }, [complaints, filter, search]);

  return (
    <>
      <Navbar />
      <main className="app-page">
        <style>{`
          .app-page {
            width: 100%;
            min-height: calc(100vh - 68px);
            background-color: #F8F4EB;
            padding: 40px 48px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: #2C1F1D;
            box-sizing: border-box;
          }

          .welcome-row {
            margin-bottom: 32px;
          }

          .eyebrow {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #C88A2E;
            margin: 0 0 6px;
          }

          .welcome-row h1 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 8px;
            line-height: 1.2;
          }

          .page-subtitle {
            font-size: 15px;
            color: #72635B;
            margin: 0;
          }

          .toolbar {
            display: flex;
            gap: 16px;
            margin-bottom: 32px;
            width: 100%;
          }

          .search-input {
            flex: 1;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 10px;
            padding: 12px 16px;
            font-size: 14.5px;
            color: #2C1F1D;
            outline: none;
            box-shadow: 0 4px 12px rgba(44, 31, 29, 0.02);
            transition: all 0.2s ease;
          }

          .search-input:focus {
            border-color: #C88A2E;
            box-shadow: 0 0 0 3px rgba(200, 138, 46, 0.15);
          }

          .filter-select {
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 10px;
            padding: 12px 16px;
            font-size: 14.5px;
            color: #2C1F1D;
            outline: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(44, 31, 29, 0.02);
            transition: border-color 0.2s ease;
          }

          .filter-select:focus {
            border-color: #C88A2E;
          }

          .alert.error {
            background: #FDF2F0;
            border: 1px solid #F3C2BA;
            color: #9C2A1B;
            font-size: 14px;
            padding: 14px 18px;
            border-radius: 10px;
            margin-bottom: 24px;
          }

          .complaint-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 24px;
            width: 100%;
          }

          .empty-state {
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 14px;
            padding: 48px 24px;
            text-align: center;
            color: #72635B;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            box-shadow: 0 8px 24px -6px rgba(44, 31, 29, 0.04);
          }

          .empty-icon {
            font-size: 32px;
            color: #D3C7B6;
          }

          .empty-state h3 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 20px;
            color: #2C1F1D;
            margin: 0;
          }

          .empty-state p {
            font-size: 14px;
            margin: 0;
          }

          @media (max-width: 600px) {
            .app-page {
              padding: 24px 16px;
            }

            .toolbar {
              flex-direction: column;
            }

            .filter-select {
              width: 100%;
            }
          }
        `}</style>

        <section className="welcome-row">
          <div>
            <p className="eyebrow">STUDENT PORTAL</p>
            <h1>My complaints</h1>
            <p className="page-subtitle">View updates and track every complaint you have submitted.</p>
          </div>
        </section>

        <div className="toolbar">
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="⌕ Search complaints..."
          />
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {error && <div className="alert error">{error}</div>}

        {loading ? (
          <div className="empty-state">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>
            <h3>No matching complaints</h3>
            <p>Try changing your search or status filter.</p>
          </div>
        ) : (
          <div className="complaint-grid">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default MyComplaints;

import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";
import ComplaintCard from "../../components/ComplaintCard";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/complaints/my");
      setComplaints(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return complaints.filter((item) => {
      const status = (item.status || "").toUpperCase();
      const matchesStatus = filter === "ALL" || status === filter;

      const text = [
        item.title,
        item.description,
        item.location,
        item.category,
        item.priority,
        item.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && text.includes(query);
    });
  }, [complaints, filter, search]);

  const statusCounts = useMemo(() => {
    const count = (status) =>
      complaints.filter(
        (item) => (item.status || "").toUpperCase() === status
      ).length;

    return {
      total: complaints.length,
      submitted: count("SUBMITTED"),
      assigned: count("ASSIGNED"),
      inProgress: count("IN_PROGRESS"),
      resolved: count("RESOLVED"),
      closed: count("CLOSED"),
    };
  }, [complaints]);

  return (
    <>
      <Navbar />

      <main className="my-complaints-page">
        <style>{`
          .my-complaints-page {
            width: 100%;
            min-height: calc(100vh - 68px);
            box-sizing: border-box;
            padding: 40px 24px 56px;
            background: #F8F4EB;
            color: #2C1F1D;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }

          .complaints-container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
          }
          .welcome-row {
            width: 100%;
            margin: 0 auto 28px;
          }

          .eyebrow {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #C88A2E;
            margin: 0 0 8px;
          }

          .welcome-row h1 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 34px;
            font-weight: 600;
            line-height: 1.2;
            color: #2C1F1D;
            margin: 0 0 10px;
          }

          .page-subtitle {
            font-size: 15px;
            line-height: 1.6;
            color: #72635B;
            margin: 0;
          }


          .stats-grid {
            display: grid;
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 28px;
          }

          .stat-card {
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 12px;
            padding: 18px 16px;
            min-width: 0;
          }

          .stat-label {
            display: block;
            font-size: 12px;
            color: #72635B;
            margin-bottom: 8px;
          }

          .stat-value {
            display: block;
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 26px;
            font-weight: 600;
            color: #2C1F1D;
          }

          .toolbar {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 24px;
            width: 100%;
          }

          .search-wrap {
            flex: 1;
            min-width: 0;
            position: relative;
          }

          .search-input,
          .filter-select {
            width: 100%;
            min-height: 46px;
            box-sizing: border-box;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 10px;
            padding: 12px 15px;
            font-size: 14px;
            color: #2C1F1D;
            outline: none;
            transition: border-color .2s ease, box-shadow .2s ease;
          }

          .search-input::placeholder {
            color: #A0938C;
          }

          .search-input:focus,
          .filter-select:focus {
            border-color: #C88A2E;
            box-shadow: 0 0 0 3px rgba(200, 138, 46, .13);
          }

          .filter-select {
            width: 210px;
            cursor: pointer;
          }

          .results-label {
            font-size: 13px;
            color: #72635B;
            margin: 0 0 16px;
          }

          .complaint-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            align-items: stretch;
            gap: 22px;
            width: 100%;
          }

          .empty-state {
            width: 100%;
            box-sizing: border-box;
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
          }

          .empty-icon {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            background: #FAF6EE;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 25px;
            color: #C88A2E;
          }

          .empty-state h3 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 21px;
            color: #2C1F1D;
            margin: 0;
          }

          .empty-state p {
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
          }

          .state-button {
            border: 1px solid #E2D7C3;
            border-radius: 9px;
            padding: 10px 16px;
            margin-top: 8px;
            background: #FFFFFF;
            color: #2C1F1D;
            font-weight: 600;
            cursor: pointer;
          }

          .state-button:hover {
            background: #FAF6EE;
          }

          .alert-error {
            background: #FDF2F0;
            border: 1px solid #F3C2BA;
            color: #9C2A1B;
            font-size: 14px;
            line-height: 1.5;
            padding: 14px 18px;
            border-radius: 10px;
            margin-bottom: 24px;
            overflow-wrap: anywhere;
          }

          @media (max-width: 1050px) {
            .stats-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            .complaint-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 650px) {
            .my-complaints-page {
              padding: 26px 16px 40px;
            }

            .welcome-row h1 {
              font-size: 28px;
            }

            .stats-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px;
            }

            .stat-card {
              padding: 15px 13px;
            }

            .toolbar {
              flex-direction: column;
              align-items: stretch;
              gap: 10px;
            }

            .filter-select {
              width: 100%;
            }

            .complaint-grid {
              grid-template-columns: minmax(0, 1fr);
              gap: 16px;
            }
          }
        `}</style>

        <div className="complaints-container">
          <section className="welcome-row">
            <p className="eyebrow">STUDENT PORTAL</p>
            <h1>My complaints</h1>
            <p className="page-subtitle">
              View updates and track every complaint you have submitted.
            </p>
          </section>

          {!loading && !error && (
            <section className="stats-grid" aria-label="Complaint summary">
              <div className="stat-card">
                <span className="stat-label">Total complaints</span>
                <strong className="stat-value">{statusCounts.total}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Submitted</span>
                <strong className="stat-value">{statusCounts.submitted}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Assigned</span>
                <strong className="stat-value">{statusCounts.assigned}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">In progress</span>
                <strong className="stat-value">{statusCounts.inProgress}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Resolved</span>
                <strong className="stat-value">{statusCounts.resolved}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Closed</span>
                <strong className="stat-value">{statusCounts.closed}</strong>
              </div>
            </section>
          )}

          <div className="toolbar">
            <div className="search-wrap">
              <input
                className="search-input"
                type="search"
                aria-label="Search complaints"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="⌕ Search by title, description, location..."
              />
            </div>

            <select
              className="filter-select"
              aria-label="Filter by complaint status"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {error && (
            <div className="alert-error" role="alert">
              {error}
              <button
                type="button"
                className="state-button"
                onClick={fetchComplaints}
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="empty-state" role="status">
              <div className="empty-icon">…</div>
              <h3>Loading complaints</h3>
              <p>Please wait while we retrieve your complaints.</p>
            </div>
          ) : error ? null : filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <h3>
                {complaints.length === 0
                  ? "No complaints yet"
                  : "No matching complaints"}
              </h3>
              <p>
                {complaints.length === 0
                  ? "Submit a complaint to see its progress here."
                  : "Try another search term or choose a different status."}
              </p>
            </div>
          ) : (
            <>
              <p className="results-label">
                Showing {filteredComplaints.length} of {complaints.length}{" "}
                complaints
              </p>

              <div className="complaint-grid">
                {filteredComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id ?? complaint.complaintId}
                    complaint={complaint}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default MyComplaints;

import StatusBadge from "./StatusBadge";

function ComplaintCard({ complaint, compact = false }) {
  return (
    <article className={`complaint-card ${compact ? "compact" : ""}`}>
      <style>{`
        .complaint-card {
          background: #FFFFFF;
          border: 1px solid #EFE8DA;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 6px 20px -4px rgba(44, 31, 29, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          color: #2C1F1D;
        }

        .complaint-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -4px rgba(44, 31, 29, 0.08);
          border-color: #E2D7C3;
        }

        .complaint-card.compact {
          padding: 18px;
          gap: 12px;
        }

        .complaint-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .complaint-id {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #C88A2E;
          display: block;
          margin-bottom: 4px;
        }

        .complaint-card-top h3 {
          font-family: Georgia, "Source Serif 4", serif;
          font-size: 20px;
          font-weight: 600;
          color: #2C1F1D;
          margin: 0;
          line-height: 1.3;
        }

        .complaint-card.compact .complaint-card-top h3 {
          font-size: 17px;
        }

        .complaint-description {
          font-size: 14.5px;
          color: #584A45;
          line-height: 1.5;
          margin: 0;
        }

        .complaint-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px;
          font-size: 13px;
          color: #72635B;
          padding-top: 12px;
          border-top: 1px dashed #EFE8DA;
        }

        .complaint-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .priority-text {
          font-weight: 600;
        }

        .priority-high, .priority-urgent {
          color: #B93815;
        }

        .priority-medium {
          color: #C88A2E;
        }

        .priority-low {
          color: #2D6A4F;
        }

        .complaint-extra {
          background: #FDFBF7;
          border: 1px solid #F0E8D9;
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 13.5px;
          margin-top: 4px;
        }

        .complaint-extra p {
          margin: 0;
          color: #433532;
          line-height: 1.45;
        }

        .complaint-extra strong {
          color: #2C1F1D;
          font-weight: 600;
        }
      `}</style>

      <div className="complaint-card-top">
        <div>
          <span className="complaint-id">Complaint #{complaint.id}</span>
          <h3>{complaint.title || "Untitled complaint"}</h3>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <p className="complaint-description">{complaint.description || "No description provided."}</p>

      <div className="complaint-meta">
        <span>⌖ {complaint.location || "Location not specified"}</span>
        <span>◈ {complaint.category || "OTHER"}</span>
        <span className={`priority-text priority-${String(complaint.priority || "MEDIUM").toLowerCase()}`}>
          ● {complaint.priority || "MEDIUM"} priority
        </span>
      </div>

      {!compact && (
        <div className="complaint-extra">
          {complaint.summary && (
            <p><strong>AI Summary:</strong> {complaint.summary}</p>
          )}
          {complaint.assignedStaff && (
            <p><strong>Assigned Staff:</strong> {complaint.assignedStaff}</p>
          )}
          {complaint.resolution && (
            <p><strong>Resolution:</strong> {complaint.resolution}</p>
          )}
        </div>
      )}
    </article>
  );
}

export default ComplaintCard;
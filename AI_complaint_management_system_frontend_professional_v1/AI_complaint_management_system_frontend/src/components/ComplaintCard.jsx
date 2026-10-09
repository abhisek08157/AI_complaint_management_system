
import StatusBadge from "./StatusBadge";

function ComplaintCard({ complaint = {}, compact = false }) {
  const complaintId = complaint.id ?? complaint.complaintId ?? "N/A";

  const priority = String(complaint.priority || "MEDIUM").toUpperCase();
  const priorityClass = ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority)
    ? priority.toLowerCase()
    : "medium";

  const assignedStaff =
    typeof complaint.assignedStaff === "object"
      ? complaint.assignedStaff?.name
      : complaint.assignedStaff;

  return (
    <article className={`complaint-card ${compact ? "compact" : ""}`}>
      <style>{`
        .complaint-card {
          width: 100%;
          min-width: 0;
          height: 100%;
          box-sizing: border-box;
          background: #FFFFFF;
          border: 1px solid #EFE8DA;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 6px 20px -4px rgba(44, 31, 29, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease,
            border-color 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          color: #2C1F1D;
        }

        .complaint-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -4px rgba(44, 31, 29, 0.08);
          border-color: #E2D7C3;
        }

        .complaint-card.compact {
          height: auto;
          padding: 18px;
          gap: 12px;
        }

        .complaint-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          min-width: 0;
        }

        .complaint-heading {
          flex: 1;
          min-width: 0;
        }

        .complaint-id {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #C88A2E;
          display: block;
          margin-bottom: 5px;
        }

        .complaint-card-top h3 {
          font-family: Georgia, "Source Serif 4", serif;
          font-size: 20px;
          font-weight: 600;
          color: #2C1F1D;
          margin: 0;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .complaint-card.compact .complaint-card-top h3 {
          font-size: 17px;
        }

        .complaint-card-status {
          flex-shrink: 0;
          max-width: 45%;
        }

        .complaint-description {
          font-size: 14.5px;
          color: #584A45;
          line-height: 1.6;
          margin: 0;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
        }

        .complaint-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px 16px;
          font-size: 13px;
          color: #72635B;
          padding-top: 14px;
          border-top: 1px dashed #EFE8DA;
        }

        .complaint-meta span {
          display: inline-flex;
          align-items: flex-start;
          gap: 6px;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .priority-text {
          font-weight: 600;
        }

        .priority-high,
        .priority-urgent {
          color: #B93815;
        }

        .priority-medium {
          color: #A66B14;
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
          margin-top: auto;
          min-width: 0;
        }

        .complaint-extra p {
          margin: 0;
          color: #433532;
          line-height: 1.55;
          overflow-wrap: anywhere;
        }

        .complaint-extra strong {
          color: #2C1F1D;
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .complaint-card {
            padding: 20px;
            gap: 14px;
          }

          .complaint-card-top h3 {
            font-size: 18px;
          }

          .complaint-meta {
            gap: 10px 14px;
          }

          .complaint-extra {
            padding: 12px;
          }
        }
      `}</style>

      <div className="complaint-card-top">
        <div className="complaint-heading">
          <span className="complaint-id">
            Complaint #{complaintId}
          </span>

          <h3>{complaint.title || "Untitled complaint"}</h3>
        </div>

        <div className="complaint-card-status">
          <StatusBadge status={complaint.status || "SUBMITTED"} />
        </div>
      </div>

      <p className="complaint-description">
        {complaint.description || "No description provided."}
      </p>

      <div className="complaint-meta">
        <span>
          <span aria-hidden="true">⌖</span>
          {complaint.location || "Location not specified"}
        </span>

        <span>
          <span aria-hidden="true">◈</span>
          {complaint.category || "OTHER"}
        </span>

        <span className={`priority-text priority-${priorityClass}`}>
          <span aria-hidden="true">●</span>
          {priority} priority
        </span>
      </div>

      {!compact && (
        <div className="complaint-extra">
          {complaint.summary && (
            <p>
              <strong>AI Summary:</strong> {complaint.summary}
            </p>
          )}

          {assignedStaff && (
            <p>
              <strong>Assigned Staff:</strong>{" "}
              {assignedStaff}
            </p>
          )}

          {complaint.resolution && (
            <p>
              <strong>Resolution:</strong>{" "}
              {complaint.resolution}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default ComplaintCard;

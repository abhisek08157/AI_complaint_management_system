import StatusBadge from "./StatusBadge";

function ComplaintCard({ complaint, compact = false }) {
  return (
    <article className={`complaint-card ${compact ? "compact" : ""}`}>
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

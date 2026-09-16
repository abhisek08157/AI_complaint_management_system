function StatusBadge({ status = "SUBMITTED" }) {
  const normalized = String(status).toUpperCase().replace(/\s+/g, "_");
  const label = normalized.replace(/_/g, " ");

  return <span className={`status-badge status-${normalized.toLowerCase()}`}>{label}</span>;
}

export default StatusBadge;

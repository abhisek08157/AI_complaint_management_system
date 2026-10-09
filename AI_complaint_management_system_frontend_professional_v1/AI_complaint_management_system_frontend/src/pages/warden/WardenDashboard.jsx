function WardenDashboard() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF8F3",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#14192E" }}>
        CampusOne Hostel Warden Dashboard
      </h1>

      <p style={{ color: "#555" }}>
        Welcome! You are logged in as Hostel Warden.
      </p>

      <div
        style={{
          background: "#FFFFFF",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #E5E0D5",
          maxWidth: "600px",
        }}
      >
        <h2 style={{ color: "#C9A24B" }}>
          Gate Pass Requests
        </h2>

        <p>
          Reviewing and approving gate pass requests will be added in a later step.
        </p>
      </div>
    </div>
  );
}

export default WardenDashboard;
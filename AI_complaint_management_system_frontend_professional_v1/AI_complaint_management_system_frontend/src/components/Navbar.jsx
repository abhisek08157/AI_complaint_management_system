import { NavLink, useNavigate } from "react-router-dom";
import { getUser, logout } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  if (!user) return null;

  const role = user.role?.toUpperCase();

  const links =
    role === "STUDENT"
      ? [
          { label: "Dashboard", to: "/student", icon: "⌂" },
          { label: "Submit Complaint", to: "/student/submit", icon: "＋" },
          { label: "My Complaints", to: "/student/complaints", icon: "▤" },
        ]
      : role === "ADMIN"
        ? [
            { label: "Dashboard", to: "/admin", icon: "⌂" },
            { label: "Manage Complaints", to: "/admin/complaints", icon: "▤" },
          ]
        : [{ label: "Dashboard", to: "/staff", icon: "⌂" }];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header">
      <div className="brand" onClick={() => navigate(links[0].to)}>
        <span className="brand-mark">C</span>
        <div>
          <strong>CampusCare</strong>
          <small>AI Complaint System</small>
        </div>
      </div>

      <nav className="main-nav" aria-label="Main navigation">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === links[0].to}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="user-menu">
        <div className="avatar">{user.name?.charAt(0)?.toUpperCase() || "U"}</div>
        <div className="user-details">
          <strong>{user.name}</strong>
          <small>{role}</small>
        </div>
        <button className="logout-button" onClick={handleLogout} title="Logout">
          ↪
        </button>
      </div>
    </header>
  );
}

export default Navbar;

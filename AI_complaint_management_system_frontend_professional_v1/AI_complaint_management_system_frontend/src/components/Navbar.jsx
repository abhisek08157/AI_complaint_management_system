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
      <style>{`
        .app-header {
          height: 68px;
          background: #2C1F1D; /* Warm Espresso Brown */
          color: #F8F4EB;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          border-bottom: 1px solid rgba(248, 244, 235, 0.12);
          position: sticky;
          top: 0;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          box-shadow: 0 4px 18px rgba(44, 31, 29, 0.15);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
        }

        .brand-mark {
          width: 34px;
          height: 34px;
          background: #C88A2E; /* Warm Ghee Gold */
          color: #2C1F1D;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Georgia, "Source Serif 4", serif;
          font-weight: 700;
          font-size: 18px;
          box-shadow: 0 2px 8px rgba(200, 138, 46, 0.3);
        }

        .brand strong {
          display: block;
          font-family: Georgia, "Source Serif 4", serif;
          font-size: 18px;
          color: #FAF6EE;
          line-height: 1.1;
          font-weight: 600;
        }

        .brand small {
          font-size: 11px;
          color: #D3C7B6;
          letter-spacing: 0.02em;
        }

        .main-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(248, 244, 235, 0.05);
          padding: 6px;
          border-radius: 10px;
          border: 1px solid rgba(248, 244, 235, 0.08);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 6px;
          color: #D3C7B6;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .nav-link span {
          font-size: 14px;
          line-height: 1;
        }

        .nav-link:hover {
          color: #FAF6EE;
          background: rgba(248, 244, 235, 0.08);
        }

        .nav-link.active {
          color: #2C1F1D;
          background: #E2A855;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(226, 168, 85, 0.25);
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(248, 244, 235, 0.06);
          padding: 6px 10px 6px 6px;
          border-radius: 30px;
          border: 1px solid rgba(248, 244, 235, 0.12);
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #42302D;
          color: #E2A855;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          border: 1px solid rgba(226, 168, 85, 0.3);
        }

        .user-details {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .user-details strong {
          font-size: 13px;
          color: #FAF6EE;
          font-weight: 600;
        }

        .user-details small {
          font-size: 10px;
          color: #C88A2E;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .logout-button {
          background: transparent;
          border: none;
          color: #D3C7B6;
          font-size: 16px;
          cursor: pointer;
          padding: 6px 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          margin-left: 4px;
        }

        .logout-button:hover {
          background: rgba(226, 168, 85, 0.15);
          color: #E2A855;
        }

        @media (max-width: 800px) {
          .app-header {
            padding: 0 16px;
          }
          .user-details, .brand small {
            display: none;
          }
          .main-nav {
            background: transparent;
            border: none;
          }
          .nav-link {
            padding: 8px 10px;
          }
        }
      `}</style>

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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { saveUser } from "../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", form);

      const user = response.data;

      saveUser(user);

      if (user.role === "STUDENT") {
        navigate("/student");
      } else if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "STAFF") {
        navigate("/staff");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <style>{`
        .login-screen {
          min-height: 100vh;
          display: flex;
          background-color: #F8F4EB; /* Rich Ghee / Cream background */
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          color: #2C1F1D;
        }

        /* Left Hero Panel */
        .login-panel {
          flex: 1.1;
          background: #2C1F1D; /* Warm Dark Espresso Brown */
          color: #F8F4EB;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 64px 72px;
          position: relative;
          overflow: hidden;
        }

        .login-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 15% 20%, rgba(200, 138, 46, 0.18) 0%, transparent 45%),
                      radial-gradient(circle at 85% 80%, rgba(139, 87, 42, 0.25) 0%, transparent 50%);
          pointer-events: none;
        }

        .login-panel::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(248, 244, 235, 0.08) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .panel-mark {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          letter-spacing: -0.01em;
          color: #E2A855; /* Warm Ghee-Gold */
          font-weight: 700;
        }

        .panel-mark-icon {
          width: 10px;
          height: 10px;
          background: #E2A855;
          border-radius: 50%;
          box-shadow: 0 0 12px #E2A855;
        }

        .panel-headline {
          position: relative;
          z-index: 1;
          max-width: 460px;
        }

        .panel-headline h1 {
          font-family: Georgia, "Source Serif 4", serif;
          font-size: 48px;
          line-height: 1.12;
          font-weight: 500;
          margin: 0 0 20px;
          color: #FAF6EE;
          letter-spacing: -0.02em;
        }

        .panel-headline p {
          font-size: 16px;
          line-height: 1.65;
          color: #D3C7B6;
          margin: 0;
          font-weight: 400;
        }

        .panel-footer {
          position: relative;
          z-index: 1;
          font-size: 13px;
          color: #9E8E7E;
          border-top: 1px solid rgba(248, 244, 235, 0.12);
          padding-top: 24px;
          letter-spacing: 0.02em;
        }

        /* Right Form Side */
        .login-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background: radial-gradient(circle at 50% 30%, #FCF9F2 0%, #F8F4EB 100%);
        }

        .login-form-wrap {
          width: 100%;
          max-width: 400px;
          background: #FFFFFF;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 12px 32px -8px rgba(44, 31, 29, 0.06),
                      0 4px 12px -2px rgba(44, 31, 29, 0.03);
          border: 1px solid #EFE8DA;
        }

        .login-form-wrap h2 {
          font-family: Georgia, "Source Serif 4", serif;
          font-size: 28px;
          font-weight: 600;
          color: #2C1F1D;
          margin: 0 0 8px;
          letter-spacing: -0.01em;
        }

        .login-form-wrap > p {
          font-size: 14px;
          color: #72635B;
          margin: 0 0 32px;
          line-height: 1.5;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          font-size: 13px;
          color: #4A3B36;
          margin-bottom: 8px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .field input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 16px;
          font-size: 15px;
          font-family: inherit;
          border: 1.5px solid #E2D9C8;
          border-radius: 8px;
          background: #FCFAF5;
          color: #2C1F1D;
          transition: all 0.2s ease;
        }

        .field input:focus {
          outline: none;
          border-color: #C88A2E;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(200, 138, 46, 0.12);
        }

        .field input::placeholder {
          color: #B5A899;
        }

        .form-error {
          background: #FDF2F0;
          border: 1px solid #F3C2BA;
          color: #9C2A1B;
          font-size: 13.5px;
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #2C1F1D; /* Deep Warm Brown */
          color: #F8F4EB;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(44, 31, 29, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .submit-btn:hover:not(:disabled) {
          background: #42302D;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(44, 31, 29, 0.22);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          background: #C4B8A9;
          cursor: not-allowed;
          box-shadow: none;
        }

        .register-line {
          margin-top: 28px;
          font-size: 14px;
          color: #72635B;
          text-align: center;
        }

        .register-line .link {
          color: #C88A2E;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .register-line .link:hover {
          color: #A36D1F;
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .login-panel {
            display: none;
          }
          .login-form-side {
            padding: 24px 16px;
          }
          .login-form-wrap {
            box-shadow: none;
            border: none;
            background: transparent;
            padding: 0;
          }
        }
      `}</style>

      <div className="login-panel">
        <div className="panel-mark">
          <span className="panel-mark-icon"></span>
          CampusCare
        </div>

        <div className="panel-headline">
          <h1>Report it once. We'll take it from there.</h1>
          <p>
            Submit a complaint, and CampusCare sorts, prioritizes, and routes
            it to the right team automatically — so nothing sits in an inbox.
          </p>
        </div>

        <div className="panel-footer">
          AI Campus Complaint &amp; Maintenance Management System
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-form-wrap">
          <h2>Sign in</h2>
          <p>Enter your campus account details to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@campus.edu"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="register-line">
            Don't have an account?{" "}
            <span className="link" onClick={() => navigate("/register")}>
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
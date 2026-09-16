import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
    setMessage("");
    setLoading(true);

    try {
      console.log("Sending registration:", form);

      const response = await API.post(
        "/auth/register",
        form
      );

      console.log(
        "Registration successful:",
        response.data
      );

      setMessage("Registration successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      console.log("Registration Error:", error);

      console.log(
        "Backend Response:",
        error.response?.data
      );

      console.log(
        "Status:",
        error.response?.status
      );

      setError(
        error.response?.data?.message ||
        error.message ||
        "Registration failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>Create Account</h1>

        <p>
          AI Campus Complaint System
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="STUDENT">
              Student
            </option>

            <option value="STAFF">
              Staff
            </option>
          </select>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {message && (
            <div className="success">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : "Register"}
          </button>

        </form>

        <p>
          Already have an account?{" "}

          <span
            className="link"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default Register;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { getUser } from "../../utils/auth";
import Navbar from "../../components/Navbar";

const initialForm = { title: "", description: "", location: "" };

function SubmitComplaint() {
  const navigate = useNavigate();
  const user = getUser();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.title.trim().length < 5) return setError("Title must contain at least 5 characters.");
    if (form.description.trim().length < 15) return setError("Description must contain at least 15 characters.");
    if (form.location.trim().length < 2) return setError("Please enter a valid location.");

    setLoading(true);
    try {
      const response = await API.post(`/complaints?userId=${user.userId}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
      });
      setMessage(`Complaint submitted successfully${response.data?.id ? ` · ID: ${response.data.id}` : ""}.`);
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="app-page narrow-page">
        <div className="breadcrumb"><button className="back-link" onClick={() => navigate("/student")}>← Dashboard</button></div>
        <section className="page-heading">
          <p className="eyebrow">STUDENT PORTAL</p>
          <h1>Submit a complaint</h1>
          <p className="page-subtitle">Tell us what happened. Our system will classify and prioritize your complaint.</p>
        </section>

        <div className="form-card professional-form">
          <div className="form-intro"><span className="form-icon">✎</span><div><h2>Complaint details</h2><p>Provide accurate information so the issue can be resolved faster.</p></div></div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Complaint title <span>*</span></label>
            <input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Air conditioner not working in Lab 2" maxLength={120} required />
            <div className="field-hint">{form.title.length}/120 characters</div>

            <label htmlFor="description">Description <span>*</span></label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Explain the issue, when it started, and any relevant details..." rows={6} maxLength={1000} required />
            <div className="field-hint">{form.description.length}/1000 characters</div>

            <label htmlFor="location">Location <span>*</span></label>
            <input id="location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Block 4, Lab 2" maxLength={150} required />

            {error && <div className="alert error">{error}</div>}
            {message && <div className="alert success">{message}</div>}

            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => navigate("/student")}>Cancel</button>
              <button type="submit" className="primary-button" disabled={loading}>{loading ? "Submitting..." : "Submit Complaint →"}</button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default SubmitComplaint;

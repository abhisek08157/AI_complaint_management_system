import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

const initialForm = {
  title: "",
  description: "",
  location: "",
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function SubmitComplaint() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    setError("");
    setMessage("");

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setPhoto(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setPhoto(null);
      event.target.value = "";
      setError("Choose a JPG, PNG, or WEBP image.");
      return;
    }

    if (selectedFile.size > MAX_PHOTO_SIZE) {
      setPhoto(null);
      event.target.value = "";
      setError("The photo must be 5 MB or smaller.");
      return;
    }

    setPhoto(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.title.trim().length < 5) {
      setError("Title must contain at least 5 characters.");
      return;
    }

    if (form.description.trim().length < 15) {
      setError("Description must contain at least 15 characters.");
      return;
    }

    if (form.location.trim().length < 2) {
      setError("Please enter a valid location.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/complaints", {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
      });

      const complaint = response.data;
      const complaintId = complaint?.id ?? complaint?.complaintId;

      if (photo) {
        if (complaintId == null) {
          setForm(initialForm);
          setPhoto(null);
          setMessage(
            "Complaint created, but its ID was not returned. The photo was not uploaded."
          );
          return;
        }

        const data = new FormData();
        data.append("file", photo);

        try {
          await API.post(
            `/complaints/${complaintId}/photo`,
            data
          );
        } catch {
          setForm(initialForm);
          setPhoto(null);
          setMessage(
            `Complaint #${complaintId} was created, but the photo upload failed.`
          );
          return;
        }
      }

      setMessage(
        `Complaint submitted successfully${
          complaintId != null ? ` · ID: ${complaintId}` : ""
        }.`
      );

      setForm(initialForm);
      setPhoto(null);

      const fileInput = document.getElementById("photo");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit complaint. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="app-page">
        <style>{`
          .app-page {
            width: 100%;
            min-height: calc(100vh - 68px);
            background: #F8F4EB;
            padding: 40px 24px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: #2C1F1D;
            box-sizing: border-box;
          }

          /* Align the back link and heading with the centered form */
          .breadcrumb,
          .page-heading {
            width: 100%;
            max-width: 900px;
            margin-left: auto;
            margin-right: auto;
          }

          .breadcrumb {
            margin-bottom: 24px;
          }

          .back-link {
            background: none;
            border: none;
            color: #C88A2E;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            padding: 0;
            transition: color 0.2s ease;
          }

          .back-link:hover {
            color: #2C1F1D;
          }

          .page-heading {
            margin-bottom: 32px;
          }

          .eyebrow {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #C88A2E;
            margin: 0 0 6px;
          }

          .page-heading h1 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 32px;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 8px;
          }

          .page-subtitle {
            font-size: 15px;
            color: #72635B;
            margin: 0;
            line-height: 1.6;
          }

          /* Center the form card horizontally */
          .form-card {
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
            box-sizing: border-box;
            background: #FFFFFF;
            border: 1px solid #EFE8DA;
            border-radius: 16px;
            padding: 36px;
            box-shadow: 0 8px 24px -6px rgba(44, 31, 29, 0.04);
          }

          .form-intro {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 28px;
            padding-bottom: 20px;
            border-bottom: 1px solid #EFE8DA;
          }

          .form-icon {
            width: 44px;
            height: 44px;
            background: #FAF6EE;
            border: 1px solid #E2D7C3;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #C88A2E;
            font-size: 18px;
            flex-shrink: 0;
          }

          .form-intro h2 {
            font-family: Georgia, "Source Serif 4", serif;
            font-size: 20px;
            font-weight: 600;
            color: #2C1F1D;
            margin: 0 0 4px;
          }

          .form-intro p {
            font-size: 13.5px;
            color: #72635B;
            margin: 0;
            line-height: 1.5;
          }

          form label {
            display: block;
            font-size: 13.5px;
            font-weight: 600;
            color: #2C1F1D;
            margin: 18px 0 6px;
          }

          form label span {
            color: #B93815;
          }

          form input,
          form textarea {
            width: 100%;
            background: #FAF6EE;
            border: 1px solid #EFE8DA;
            border-radius: 10px;
            padding: 12px 16px;
            font-size: 14.5px;
            color: #2C1F1D;
            box-sizing: border-box;
            outline: none;
            transition: all 0.2s ease;
            font-family: inherit;
          }

          form input:focus,
          form textarea:focus {
            border-color: #C88A2E;
            background: #FFFFFF;
            box-shadow: 0 0 0 3px rgba(200, 138, 46, 0.15);
          }

          form input[type="file"] {
            background: #FFFFFF;
          }

          form textarea {
            resize: vertical;
            min-height: 140px;
          }

          .field-hint {
            font-size: 11.5px;
            color: #A0938C;
            text-align: right;
            margin-top: 4px;
          }

          .photo-preview {
            display: block;
            max-width: 220px;
            max-height: 180px;
            object-fit: contain;
            margin-top: 12px;
            border: 1px solid #EFE8DA;
            border-radius: 10px;
          }

          .alert {
            font-size: 14px;
            padding: 14px 18px;
            border-radius: 10px;
            margin-top: 20px;
            overflow-wrap: anywhere;
            line-height: 1.5;
          }

          .alert.error {
            background: #FDF2F0;
            border: 1px solid #F3C2BA;
            color: #9C2A1B;
          }

          .alert.success {
            background: #F0F7F4;
            border: 1px solid #C2E2D3;
            color: #2D6A4F;
          }

          .form-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 32px;
            padding-top: 20px;
            border-top: 1px solid #EFE8DA;
          }

          .secondary-button,
          .primary-button {
            padding: 11px 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .secondary-button {
            background: transparent;
            border: 1px solid #E2D7C3;
            color: #72635B;
          }

          .secondary-button:hover {
            background: #FAF6EE;
            color: #2C1F1D;
          }

          .primary-button {
            background: #2C1F1D;
            border: none;
            color: #F8F4EB;
            padding: 11px 24px;
            box-shadow: 0 4px 12px rgba(44, 31, 29, 0.12);
          }

          .primary-button:hover:not(:disabled) {
            background: #C88A2E;
            color: #2C1F1D;
          }

          .primary-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 600px) {
            .app-page {
              padding: 24px 14px;
            }

            .form-card {
              padding: 20px 16px;
            }

            .page-heading h1 {
              font-size: 27px;
            }

            .form-actions > button {
              flex: 1;
            }
          }
        `}</style>

        <div className="breadcrumb">
          <button
            type="button"
            className="back-link"
            onClick={() => navigate("/student")}
          >
            ← Dashboard
          </button>
        </div>

        <section className="page-heading">
          <p className="eyebrow">STUDENT PORTAL</p>
          <h1>Submit a complaint</h1>
          <p className="page-subtitle">
            Tell us what happened. Our system will classify and prioritize
            your complaint.
          </p>
        </section>

        <div className="form-card">
          <div className="form-intro">
            <span className="form-icon">✎</span>
            <div>
              <h2>Complaint details</h2>
              <p>
                Provide accurate information so the issue can be resolved
                faster.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">
              Complaint title <span>*</span>
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Air conditioner not working in Lab 2"
              maxLength={120}
              required
            />
            <div className="field-hint">
              {form.title.length}/120 characters
            </div>

            <label htmlFor="description">
              Description <span>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Explain the issue, when it started, and any relevant details..."
              rows={6}
              maxLength={1000}
              required
            />
            <div className="field-hint">
              {form.description.length}/1000 characters
            </div>

            <label htmlFor="location">
              Location <span>*</span>
            </label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Block 4, Lab 2"
              maxLength={150}
              required
            />

            <label htmlFor="photo">Attach a photo (optional)</label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
            />
            <div className="field-hint">
              JPG, PNG, or WEBP · Maximum 5 MB
            </div>

            {photo && (
              <div>
                <p>{photo.name}</p>
                <img
                  className="photo-preview"
                  src={URL.createObjectURL(photo)}
                  alt="Selected complaint"
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setPhoto(null);
                    const input = document.getElementById("photo");
                    if (input) input.value = "";
                  }}
                >
                  Remove photo
                </button>
              </div>
            )}

            {error && (
              <div className="alert error" role="alert">
                {error}
              </div>
            )}

            {message && (
              <div className="alert success" role="status">
                {message}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/student")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Complaint →"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default SubmitComplaint;
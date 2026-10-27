import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function StaffAttendance() {
  const today = new Date().toLocaleDateString("en-CA");

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState("PRESENT");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/attendance/students");

      setStudents(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load students. Check your backend and permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    if (!subject.trim() || !date) {
      setRecords([]);
      return;
    }

    try {
      setError("");

      const response = await API.get("/attendance/by-subject", {
        params: {
          subject: subject.trim(),
          date,
        },
      });

      setRecords(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setRecords([]);
      setError(
        err.response?.data?.message ||
          "Unable to load attendance records."
      );
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!studentId || !subject.trim() || !date || !status) {
      setError("Please fill in all attendance fields.");
      return;
    }

    if (date > today) {
      setError("Attendance cannot be marked for a future date.");
      return;
    }

    try {
      setSaving(true);

      await API.post("/attendance", {
        studentId: Number(studentId),
        subject: subject.trim(),
        attendanceDate: date,
        status,
      });

      setMessage("Attendance marked successfully.");

      await loadRecords();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to mark attendance. Check whether attendance already exists for this student, subject and date."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="attendance-page">
        <style>{`
          .attendance-page {
            min-height: calc(100vh - 68px);
            background: #F8F4EB;
            padding: 36px 48px;
            color: #2C1F1D;
            font-family: Arial, sans-serif;
            box-sizing: border-box;
          }

          .attendance-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
            margin-bottom: 28px;
          }

          .attendance-header h1 {
            font-family: Georgia, serif;
            font-size: 30px;
            margin: 0 0 8px;
          }

          .attendance-header p {
            color: #72635B;
            margin: 0;
          }

          .attendance-panel {
            background: white;
            border: 1px solid #EFE8DA;
            border-radius: 14px;
            padding: 26px;
            margin-bottom: 28px;
            box-shadow: 0 8px 24px -8px rgba(44,31,29,.08);
          }

          .attendance-panel h2 {
            font-family: Georgia, serif;
            margin: 0 0 22px;
            font-size: 22px;
          }

          .attendance-form {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
          }

          .attendance-field {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .attendance-field label {
            font-size: 13px;
            font-weight: 700;
          }

          .attendance-field input,
          .attendance-field select {
            width: 100%;
            box-sizing: border-box;
            padding: 12px;
            border: 1px solid #D9CCBA;
            border-radius: 9px;
            background: white;
            color: #2C1F1D;
            font-size: 14px;
          }

          .attendance-button {
            border: none;
            background: #2C1F1D;
            color: #F8F4EB;
            padding: 12px 20px;
            border-radius: 9px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .attendance-button:hover {
            background: #C88A2E;
            color: #2C1F1D;
          }

          .attendance-button:disabled {
            opacity: .6;
            cursor: not-allowed;
          }

          .attendance-actions {
            display: flex;
            align-items: end;
          }

          .attendance-alert {
            padding: 13px 16px;
            border-radius: 9px;
            margin-bottom: 18px;
            font-size: 14px;
          }

          .attendance-error {
            background: #FDF2F0;
            color: #9C2A1B;
            border: 1px solid #F3C2BA;
          }

          .attendance-success {
            background: #F0F7F4;
            color: #2D6A4F;
            border: 1px solid #C2E2D3;
          }

          .attendance-table-wrap {
            overflow-x: auto;
          }

          .attendance-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 580px;
          }

          .attendance-table th,
          .attendance-table td {
            padding: 14px 12px;
            border-bottom: 1px solid #EFE8DA;
            text-align: left;
            font-size: 14px;
          }

          .attendance-table th {
            color: #72635B;
            background: #FCFAF5;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .04em;
          }

          .attendance-status {
            display: inline-block;
            padding: 5px 9px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
          }

          .attendance-present {
            background: #E8F5EC;
            color: #267344;
          }

          .attendance-absent {
            background: #FCEBE8;
            color: #A42D22;
          }

          .attendance-muted {
            color: #72635B;
            padding: 18px 0;
          }

          @media (max-width: 700px) {
            .attendance-page {
              padding: 24px 16px;
            }

            .attendance-form {
              grid-template-columns: 1fr;
            }

            .attendance-panel {
              padding: 18px;
            }

            .attendance-header h1 {
              font-size: 26px;
            }
          }
        `}</style>

        <header className="attendance-header">
          <div>
            <h1>Attendance Management</h1>
            <p>Mark attendance and review records by subject and date.</p>
          </div>

          <Link className="attendance-button" to="/staff">
            Back to Dashboard
          </Link>
        </header>

        {error && (
          <div className="attendance-alert attendance-error" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="attendance-alert attendance-success" role="status">
            {message}
          </div>
        )}

        <section className="attendance-panel">
          <h2>Mark Student Attendance</h2>

          {loading ? (
            <p className="attendance-muted">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="attendance-muted">
              No students were returned by the server.
            </p>
          ) : (
            <form className="attendance-form" onSubmit={handleSubmit}>
              <div className="attendance-field">
                <label htmlFor="attendance-student">Student</label>
                <select
                  id="attendance-student"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name || student.fullName || student.email}
                      {" — "}
                      {student.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="attendance-field">
                <label htmlFor="attendance-subject">Subject</label>
                <input
                  id="attendance-subject"
                  type="text"
                  placeholder="e.g. Java Programming"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="attendance-field">
                <label htmlFor="attendance-date">Attendance Date</label>
                <input
                  id="attendance-date"
                  type="date"
                  value={date}
                  max={today}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </div>

              <div className="attendance-field">
                <label htmlFor="attendance-status">Status</label>
                <select
                  id="attendance-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  required
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>

              <div className="attendance-actions">
                <button
                  className="attendance-button"
                  type="submit"
                  disabled={saving || loading || students.length === 0}
                >
                  {saving ? "Saving..." : "Mark Attendance"}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="attendance-panel">
          <h2>Attendance Records</h2>

          <p className="attendance-muted">
            Enter a subject and date above to load the corresponding records.
          </p>

          <button
            type="button"
            className="attendance-button"
            onClick={loadRecords}
            disabled={!subject.trim() || !date}
          >
            Load Records
          </button>

          <div className="attendance-table-wrap" style={{ marginTop: 20 }}>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="attendance-muted">
                      No records loaded.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.studentName || "—"}</td>
                      <td>{record.studentEmail || "—"}</td>
                      <td>{record.subject}</td>
                      <td>{record.attendanceDate}</td>
                      <td>
                        <span
                          className={`attendance-status ${
                            record.status === "PRESENT"
                              ? "attendance-present"
                              : "attendance-absent"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

export default StaffAttendance;

import React, { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import { getUser } from "../../utils/auth";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const INITIAL_FILTERS = {
  branch: "",
  year: "",
  section: "",
};

function formatDay(day) {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

function formatTime(time) {
  if (!time) return "--";

  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function StudentTimetable() {
  const user = getUser();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedDay, setSelectedDay] = useState("MONDAY");
  const [entries, setEntries] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTimetable = useCallback(async () => {
    if (
      !filters.branch.trim() ||
      !filters.year ||
      !filters.section.trim()
    ) {
      setError("Please select your branch, year, and section.");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const response = await API.get("/timetable/section", {
        params: {
          branch: filters.branch.trim(),
          year: Number(filters.year),
          section: filters.section.trim(),
        },
      });

      setEntries(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setEntries([]);
      setError(
        err.response?.data?.message ||
          "Unable to load the timetable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const savedUser = getUser();

    setFilters({
      branch:
        savedUser?.branch ||
        savedUser?.student?.branch ||
        "",
      year: String(
        savedUser?.year ||
          savedUser?.student?.year ||
          ""
      ),
      section:
        savedUser?.section ||
        savedUser?.student?.section ||
        "",
    });
  }, []);

  const visibleEntries = entries
    .filter(
      (entry) =>
        String(entry.dayOfWeek).toUpperCase() === selectedDay
    )
    .sort((a, b) =>
      String(a.startTime).localeCompare(String(b.startTime))
    );

  const updateFilter = (field, value) => {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <div className="stt-page">
      <style>{`
        .stt-page {
          min-height: 100vh;
          background: #F8F4EB;
          color: #2C1F1D;
          padding: 32px;
          box-sizing: border-box;
          font-family: inherit;
        }

        .stt-container {
          max-width: 1180px;
          margin: 0 auto;
        }

        .stt-heading {
          margin-bottom: 26px;
        }

        .stt-eyebrow {
          color: #C88A2E;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          margin: 0 0 8px;
        }

        .stt-heading h1 {
          margin: 0;
          font-size: clamp(27px, 4vw, 36px);
          line-height: 1.2;
          font-weight: 800;
        }

        .stt-heading p {
          color: #72635B;
          margin: 10px 0 0;
          line-height: 1.6;
        }

        .stt-panel {
          background: #FFFFFF;
          border: 1px solid #E8DFD0;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 5px 18px rgba(44, 31, 29, 0.04);
        }

        .stt-panel h2 {
          font-size: 18px;
          margin: 0 0 18px;
        }

        .stt-form {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr auto;
          gap: 14px;
          align-items: end;
        }

        .stt-field label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .stt-field input,
        .stt-field select {
          box-sizing: border-box;
          width: 100%;
          min-height: 44px;
          padding: 10px 12px;
          border: 1px solid #DED2C0;
          border-radius: 9px;
          background: #FFFEFC;
          color: #2C1F1D;
          font: inherit;
          outline: none;
        }

        .stt-field input:focus,
        .stt-field select:focus {
          border-color: #C88A2E;
          box-shadow: 0 0 0 3px rgba(200, 138, 46, 0.13);
        }

        .stt-button {
          min-height: 44px;
          border: none;
          border-radius: 9px;
          padding: 11px 18px;
          background: #2C1F1D;
          color: #FFFFFF;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .stt-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .stt-section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .stt-section-title h2 {
          margin: 0;
          font-size: 20px;
        }

        .stt-section-title p {
          margin: 6px 0 0;
          color: #72635B;
          font-size: 13px;
        }

        .stt-day-list {
          display: flex;
          gap: 9px;
          overflow-x: auto;
          padding: 2px 1px 10px;
          margin-bottom: 18px;
        }

        .stt-day {
          flex: 0 0 auto;
          border: 1px solid #E5D9C8;
          background: #FFFEFC;
          color: #72635B;
          border-radius: 10px;
          padding: 10px 15px;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .stt-day.active {
          color: #FFFFFF;
          background: #2C1F1D;
          border-color: #2C1F1D;
        }

        .stt-class-list {
          display: grid;
          gap: 12px;
        }

        .stt-class {
          display: grid;
          grid-template-columns: 150px 1fr auto;
          align-items: center;
          gap: 20px;
          padding: 18px;
          border: 1px solid #EAE0D1;
          border-left: 4px solid #C88A2E;
          border-radius: 12px;
          background: #FFFEFC;
        }

        .stt-time {
          font-size: 14px;
          font-weight: 800;
          line-height: 1.6;
        }

        .stt-duration {
          color: #8A7C72;
          font-size: 12px;
        }

        .stt-subject {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 7px;
        }

        .stt-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 16px;
          color: #72635B;
          font-size: 13px;
        }

        .stt-room {
          background: #F6E9D1;
          color: #76501B;
          border-radius: 8px;
          padding: 8px 11px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .stt-message {
          padding: 16px;
          border-radius: 10px;
          background: #FFF7E8;
          color: #76501B;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .stt-empty {
          text-align: center;
          padding: 42px 20px;
          color: #72635B;
          border: 1px dashed #DED2C0;
          border-radius: 12px;
          line-height: 1.7;
        }

        .stt-empty strong {
          display: block;
          color: #2C1F1D;
          font-size: 17px;
          margin-bottom: 5px;
        }

        .stt-spinner {
          display: inline-block;
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: stt-spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 7px;
        }

        @keyframes stt-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 850px) {
          .stt-form {
            grid-template-columns: 1fr 1fr;
          }

          .stt-class {
            grid-template-columns: 120px 1fr;
            gap: 12px;
          }

          .stt-room {
            grid-column: 2;
            justify-self: start;
          }
        }

        @media (max-width: 560px) {
          .stt-page {
            padding: 18px 12px;
          }

          .stt-panel {
            padding: 17px;
          }

          .stt-form {
            grid-template-columns: 1fr;
          }

          .stt-class {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .stt-room {
            grid-column: auto;
          }

          .stt-section-title {
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="stt-container">
        
            <div style={{ marginBottom: "22px" }}>
            <a
                href="/student"
                style={{
                color: "#C88A2E",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
                }}
            >
                ← Back to Student Dashboard
            </a>
            </div>

            <header className="stt-heading">

          <p className="stt-eyebrow">CampusOne Academics</p>
          <h1>My Class Timetable</h1>
          <p>
            View your weekly classes, faculty members, and classrooms.
          </p>
        </header>

        <section className="stt-panel">
          <h2>Find your timetable</h2>

          <form
            className="stt-form"
            onSubmit={(event) => {
              event.preventDefault();
              loadTimetable();
            }}
          >
            <div className="stt-field">
              <label htmlFor="stt-branch">Branch</label>
              <input
                id="stt-branch"
                value={filters.branch}
                onChange={(event) =>
                  updateFilter("branch", event.target.value)
                }
                placeholder="e.g. CSE"
                maxLength={100}
                required
              />
            </div>

            <div className="stt-field">
              <label htmlFor="stt-year">Year</label>
              <select
                id="stt-year"
                value={filters.year}
                onChange={(event) =>
                  updateFilter("year", event.target.value)
                }
                required
              >
                <option value="">Select year</option>
                {[1, 2, 3, 4, 5].map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="stt-field">
              <label htmlFor="stt-section">Section</label>
              <input
                id="stt-section"
                value={filters.section}
                onChange={(event) =>
                  updateFilter("section", event.target.value)
                }
                placeholder="e.g. A"
                maxLength={20}
                required
              />
            </div>

            <button
              className="stt-button"
              type="submit"
              disabled={loading}
            >
              {loading && <span className="stt-spinner" />}
              {loading ? "Loading..." : "View timetable"}
            </button>
          </form>
        </section>

        {error && (
          <div className="stt-message" role="alert">
            {error}
          </div>
        )}

        <section className="stt-panel">
          <div className="stt-section-title">
            <div>
              <h2>Weekly schedule</h2>
              <p>Select a day to see your classes.</p>
            </div>
          </div>

          <div className="stt-day-list">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                className={`stt-day ${
                  selectedDay === day ? "active" : ""
                }`}
                onClick={() => setSelectedDay(day)}
              >
                {formatDay(day)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="stt-empty">
              Loading your timetable...
            </div>
          ) : !hasSearched ? (
            <div className="stt-empty">
              <strong>Your timetable will appear here</strong>
              Enter your branch, year, and section, then select
              "View timetable".
            </div>
          ) : visibleEntries.length === 0 ? (
            <div className="stt-empty">
              <strong>No classes found for {formatDay(selectedDay)}</strong>
              No timetable entries were returned for this day.
              Try another day or check your section details.
            </div>
          ) : (
            <div className="stt-class-list">
              {visibleEntries.map((entry) => (
                <article className="stt-class" key={entry.id}>
                  <div>
                    <div className="stt-time">
                      {formatTime(entry.startTime)}
                      <br />
                      {formatTime(entry.endTime)}
                    </div>
                    <div className="stt-duration">
                      {formatDay(entry.dayOfWeek || selectedDay)}
                    </div>
                  </div>

                  <div>
                    <div className="stt-subject">
                      {entry.subject}
                    </div>
                    <div className="stt-meta">
                      <span>
                        Faculty: {entry.facultyName}
                      </span>
                      <span>
                        {entry.branch} · Year {entry.year} · Section{" "}
                        {entry.section}
                      </span>
                    </div>
                  </div>

                  <div className="stt-room">
                    {entry.classroom}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p
          style={{
            color: "#8A7C72",
            fontSize: 12,
            textAlign: "center",
            marginTop: 18,
          }}
        >
          Logged in as {user?.name || user?.email || "Student"}
        </p>
      </div>
    </div>
  );
}

export default StudentTimetable;

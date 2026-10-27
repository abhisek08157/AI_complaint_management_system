
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

export default function MessFeedbackReview() {
  const location = useLocation();
  const isWardenPage = location.pathname.startsWith("/warden/");

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("ALL");
  const [search, setSearch] = useState("");

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/mess-feedback");
      const data = response.data;

      setFeedbackList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load mess feedback:", err);

      setError(
        err.response?.status === 403
          ? "Access denied. Please ensure your account has the ADMIN or HOSTEL_WARDEN role and the backend security rules are updated."
          : err.response?.data?.message ||
              "Unable to load feedback. Check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((feedback) => {
      const date = feedback.feedbackDate || "";
      const meal = (feedback.mealType || "").toUpperCase();

      const matchesDate = !selectedDate || date === selectedDate;
      const matchesMeal =
        selectedMeal === "ALL" || meal === selectedMeal;

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        String(feedback.studentName || "")
          .toLowerCase()
          .includes(searchText) ||
        String(feedback.studentId || "")
          .toLowerCase()
          .includes(searchText) ||
        String(feedback.comments || "")
          .toLowerCase()
          .includes(searchText);

      return matchesDate && matchesMeal && matchesSearch;
    });
  }, [feedbackList, selectedDate, selectedMeal, search]);

  const average = (field) => {
    if (filteredFeedback.length === 0) return "—";

    const total = filteredFeedback.reduce(
      (sum, item) => sum + Number(item[field] || 0),
      0
    );

    return (total / filteredFeedback.length).toFixed(1);
  };

  const resetFilters = () => {
    setSelectedDate("");
    setSelectedMeal("ALL");
    setSearch("");
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f7f1e8",
      color: "#292522",
      fontFamily: "Arial, sans-serif",
    },
    container: {
      maxWidth: "1250px",
      margin: "0 auto",
      padding: "30px 20px",
    },
    heading: {
      fontSize: "30px",
      fontWeight: 800,
      color: "#33251f",
      marginBottom: "8px",
    },
    subtitle: {
      color: "#74675f",
      marginBottom: "25px",
      lineHeight: 1.6,
    },
    button: {
      border: "none",
      borderRadius: "8px",
      padding: "11px 16px",
      background: "#33251f",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-block",
    },
    card: {
      background: "#fffdf9",
      border: "1px solid #e8ddd0",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 3px 12px rgba(51,37,31,0.05)",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: 700,
      marginBottom: "7px",
      color: "#5e4b40",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px",
      border: "1px solid #d8cabc",
      borderRadius: "7px",
      background: "#fff",
      color: "#292522",
      fontSize: "14px",
    },
    tableWrapper: {
      overflowX: "auto",
      width: "100%",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "950px",
    },
    th: {
      background: "#eee4d8",
      color: "#49372c",
      padding: "13px 12px",
      textAlign: "left",
      fontSize: "13px",
      whiteSpace: "nowrap",
    },
    td: {
      padding: "13px 12px",
      borderBottom: "1px solid #eee5dc",
      fontSize: "13px",
      verticalAlign: "top",
    },
    message: {
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "18px",
      lineHeight: 1.6,
    },
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.container}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "10px",
          }}
        >
          <div>
            <h1 style={styles.heading}>Mess Feedback Review</h1>
            <p style={styles.subtitle}>
              Review student feedback, monitor food quality and hygiene,
              and identify areas that need improvement.
            </p>
          </div>

          <button onClick={loadFeedback} style={styles.button}>
            Refresh Feedback
          </button>
        </div>

        {error && (
          <div
            style={{
              ...styles.message,
              background: "#fff0ed",
              border: "1px solid #e6b5ac",
              color: "#8a3025",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          {[
            {
              title: "Total Feedback",
              value: filteredFeedback.length,
            },
            {
              title: "Average Overall Rating",
              value: average("overallRating"),
            },
            {
              title: "Average Food Quality",
              value: average("foodQualityRating"),
            },
            {
              title: "Average Hygiene",
              value: average("hygieneRating"),
            },
          ].map((item) => (
            <div key={item.title} style={styles.card}>
              <div
                style={{
                  color: "#78665a",
                  fontSize: "13px",
                  marginBottom: "10px",
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  fontSize: "29px",
                  fontWeight: 800,
                  color: "#9b6b24",
                }}
              >
                {item.value}
                {item.title !== "Total Feedback" &&
                item.value !== "—"
                  ? " / 5"
                  : ""}
              </div>
            </div>
          ))}
        </div>

        <section
          style={{ ...styles.card, marginBottom: "22px" }}
        >
          <h2 style={{ fontSize: "19px", marginTop: 0 }}>
            Filter Feedback
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "16px",
            }}
          >
            <div>
              <label style={styles.label}>Feedback Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Meal Type</label>
              <select
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value)}
                style={styles.input}
              >
                <option value="ALL">All Meals</option>
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="SNACKS">Snacks</option>
                <option value="DINNER">Dinner</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>
                Search Student / Comment
              </label>
              <input
                type="text"
                placeholder="Enter name, ID or comment"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <button
            onClick={resetFilters}
            style={{
              ...styles.button,
              marginTop: "16px",
              background: "#e7d7c5",
              color: "#33251f",
            }}
          >
            Clear Filters
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={{ fontSize: "19px", marginTop: 0 }}>
            Student Feedback
          </h2>

          {loading ? (
            <p>Loading feedback...</p>
          ) : filteredFeedback.length === 0 ? (
            <p style={{ color: "#74675f", padding: "20px 0" }}>
              No feedback found for the selected filters.
            </p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Meal</th>
                    <th style={styles.th}>Food Quality</th>
                    <th style={styles.th}>Hygiene</th>
                    <th style={styles.th}>Overall</th>
                    <th style={styles.th}>Comments</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFeedback.map((feedback) => (
                    <tr key={feedback.id}>
                      <td style={styles.td}>
                        <strong>
                          {feedback.studentName || "Unknown Student"}
                        </strong>

                        <div
                          style={{
                            color: "#88786c",
                            marginTop: "5px",
                          }}
                        >
                          ID: {feedback.studentId ?? "—"}
                        </div>
                      </td>

                      <td style={styles.td}>
                        {feedback.feedbackDate || "—"}
                      </td>

                      <td style={styles.td}>
                        {feedback.mealType || "—"}
                      </td>

                      <td style={styles.td}>
                        {feedback.foodQualityRating ?? "—"} / 5
                      </td>

                      <td style={styles.td}>
                        {feedback.hygieneRating ?? "—"} / 5
                      </td>

                      <td style={styles.td}>
                        <strong>
                          {feedback.overallRating ?? "—"} / 5
                        </strong>
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          minWidth: "200px",
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {feedback.comments || "No comments provided"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Show only the dashboard button matching the current page */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "22px",
          }}
        >
          {isWardenPage ? (
            <Link
              to="/warden"
              style={{
                ...styles.button,
                background: "#a77b35",
              }}
            >
              Back to Warden Dashboard
            </Link>
          ) : (
            <Link to="/admin" style={styles.button}>
              Back to Admin Dashboard
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}


import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
};

const meals = [
  { value: "BREAKFAST", label: "Breakfast", icon: "🌅" },
  { value: "LUNCH", label: "Lunch", icon: "🍛" },
  { value: "SNACKS", label: "Evening Snacks", icon: "☕" },
  { value: "DINNER", label: "Dinner", icon: "🌙" },
];

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F8F4EB",
    color: "#2C1F1D",
    padding: "32px 20px",
  },
  container: { maxWidth: 1100, margin: "0 auto" },
  back: {
    color: "#8A5A18",
    textDecoration: "none",
    fontWeight: 600,
  },
  heading: { fontSize: 30, margin: "20px 0 8px" },
  subtitle: { color: "#72635B", marginBottom: 26 },
  card: {
    background: "#FFFFFF",
    border: "1px solid #E8DED0",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    boxShadow: "0 4px 16px rgba(44,31,29,0.04)",
  },
  sectionTitle: { fontSize: 22, marginTop: 0, marginBottom: 8 },
  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #D9CBBB",
    borderRadius: 9,
    background: "#FFFEFC",
    color: "#2C1F1D",
    fontSize: 15,
  },
  button: {
    padding: "12px 20px",
    background: "#2C1F1D",
    color: "#FFFFFF",
    border: 0,
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 600,
  },
  goldButton: {
    padding: "12px 20px",
    background: "#C88A2E",
    color: "#FFFFFF",
    border: 0,
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 600,
  },
  muted: { color: "#72635B", fontSize: 14 },
  error: {
    background: "#FDECEC",
    color: "#A52828",
    padding: 12,
    borderRadius: 9,
    marginBottom: 16,
  },
  success: {
    background: "#EAF6EA",
    color: "#286B35",
    padding: 12,
    borderRadius: 9,
    marginBottom: 16,
  },
  mealCard: {
    background: "#FFFEFC",
    border: "1px solid #E8DED0",
    borderRadius: 12,
    padding: 18,
  },
  ratingRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 16,
    marginTop: 16,
  },
};

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (typeof error?.response?.data === "string"
      ? error.response.data
      : null) ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function normalizeMeal(value) {
  return String(value || "").toUpperCase();
}

function getMenuItems(menu) {
  const value =
    menu?.items ??
    menu?.menuItems ??
    menu?.foodItems ??
    menu?.description ??
    menu?.itemsDescription ??
    menu?.menu ??
    "";

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.name || item?.itemName || item?.foodName || ""
      )
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export default function StudentMessMenu() {
  const [selectedDate, setSelectedDate] = useState(today());
  const [menus, setMenus] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState("");

  const [feedbackDate, setFeedbackDate] = useState(today());
  const [mealType, setMealType] = useState("LUNCH");
  const [foodQuality, setFoodQuality] = useState(0);
  const [hygiene, setHygiene] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [comments, setComments] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadMenu = useCallback(async () => {
    setMenuLoading(true);
    setMenuError("");

    try {
      const response = await API.get("/mess-menu", {
        params: { date: selectedDate },
      });

      const data = response.data;
      setMenus(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : data
              ? [data]
              : []
      );
    } catch (error) {
      setMenus([]);
      setMenuError(getErrorMessage(error));
    } finally {
      setMenuLoading(false);
    }
  }, [selectedDate]);

  const loadFeedbackHistory = useCallback(async () => {
    setHistoryLoading(true);

    try {
      const response = await API.get("/mess-feedback/my");
      const data = response.data;

      setFeedbackList(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : []
      );
    } catch (error) {
      setFeedbackError(getErrorMessage(error));
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  useEffect(() => {
    loadFeedbackHistory();
  }, [loadFeedbackHistory]);

  const submitFeedback = async (event) => {
    event.preventDefault();
    setFeedbackError("");
    setFeedbackSuccess("");

    if (!foodQuality || !hygiene || !overallRating) {
      setFeedbackError("Please provide all three ratings before submitting.");
      return;
    }

    if (feedbackDate > today()) {
      setFeedbackError("Feedback date cannot be in the future.");
      return;
    }

    setFeedbackLoading(true);

    try {
      await API.post("/mess-feedback", {
        feedbackDate,
        mealType,
        foodQualityRating: foodQuality,
        hygieneRating: hygiene,
        overallRating,
        comments: comments.trim() || null,
        });

      setFeedbackSuccess("Your mess feedback was submitted successfully!");
      setFoodQuality(0);
      setHygiene(0);
      setOverallRating(0);
      setComments("");
      await loadFeedbackHistory();
    } catch (error) {
      setFeedbackError(getErrorMessage(error));
    } finally {
      setFeedbackLoading(false);
    }
  };

  const renderRating = (label, value, setter) => (
    <div>
      <label style={styles.label}>{label}</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            aria-label={`${label}: ${rating} out of 5`}
            aria-pressed={value === rating}
            onClick={() => setter(rating)}
            style={{
              border: "1px solid #E2A855",
              borderRadius: 8,
              padding: "8px 11px",
              background: value >= rating ? "#C88A2E" : "#FFFFFF",
              color: value >= rating ? "#FFFFFF" : "#2C1F1D",
              cursor: "pointer",
              fontSize: 17,
            }}
          >
            ★
          </button>
        ))}
      </div>
      <div style={styles.muted}>{value ? `${value} / 5` : "Select a rating"}</div>
    </div>
  );

  const getMealForMenu = (meal) =>
    menus.find(
      (menu) =>
        normalizeMeal(menu?.mealType ?? menu?.meal) === meal.value
    );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/student" style={styles.back}>
          ← Back to Dashboard
        </Link>

        <h1 style={styles.heading}>Mess Details</h1>
        <p style={styles.subtitle}>
          Check your daily mess menu and share feedback about your meals.
        </p>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>🍽️ Daily Mess Menu</h2>
          <p style={styles.muted}>
            Select a date to view the available meals.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(200px, 300px) auto",
              gap: 12,
              alignItems: "end",
              margin: "20px 0",
            }}
          >
            <div>
              <label htmlFor="menu-date" style={styles.label}>
                Menu Date
              </label>
              <input
                id="menu-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                style={styles.input}
              />
            </div>
            <button
              type="button"
              onClick={loadMenu}
              disabled={menuLoading}
              style={styles.button}
            >
              {menuLoading ? "Loading..." : "Refresh Menu"}
            </button>
          </div>

          {menuError && <div style={styles.error}>{menuError}</div>}

          {menuLoading ? (
            <p>Loading menu...</p>
          ) : menus.length === 0 ? (
            <p style={styles.muted}>
              No menu has been added for this date yet. Please check again
              later or select another date.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {meals.map((meal) => {
                const menu = getMealForMenu(meal);
                const items = menu ? getMenuItems(menu) : [];

                return (
                  <div key={meal.value} style={styles.mealCard}>
                    <h3 style={{ marginTop: 0 }}>
                      {meal.icon} {meal.label}
                    </h3>

                    {!menu ? (
                      <p style={styles.muted}>Menu not added yet.</p>
                    ) : items.length ? (
                      <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}>
                        {items.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ whiteSpace: "pre-wrap" }}>
                        {menu.description ||
                          menu.itemsDescription ||
                          menu.menu ||
                          "Menu details are not available."}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section style={styles.card} id="mess-feedback">
          <h2 style={styles.sectionTitle}>⭐ Mess Feedback</h2>
          <p style={styles.muted}>
            Your feedback helps improve food quality and mess hygiene.
          </p>

          {feedbackError && <div style={styles.error}>{feedbackError}</div>}
          {feedbackSuccess && (
            <div style={styles.success}>{feedbackSuccess}</div>
          )}

          <form onSubmit={submitFeedback}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginTop: 20,
              }}
            >
              <div>
                <label htmlFor="feedback-date" style={styles.label}>
                  Feedback Date
                </label>
                <input
                  id="feedback-date"
                  type="date"
                  max={today()}
                  value={feedbackDate}
                  onChange={(event) => setFeedbackDate(event.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div>
                <label htmlFor="meal-type" style={styles.label}>
                  Meal
                </label>
                <select
                  id="meal-type"
                  value={mealType}
                  onChange={(event) => setMealType(event.target.value)}
                  style={styles.input}
                >
                  {meals.map((meal) => (
                    <option key={meal.value} value={meal.value}>
                      {meal.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.ratingRow}>
              {renderRating("Food Quality", foodQuality, setFoodQuality)}
              {renderRating("Hygiene", hygiene, setHygiene)}
              {renderRating("Overall Satisfaction", overallRating, setOverallRating)}
            </div>

            <div style={{ marginTop: 20 }}>
              <label htmlFor="feedback-comments" style={styles.label}>
                Comments (Optional)
              </label>
              <textarea
                id="feedback-comments"
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Share your suggestions about today's meal..."
                style={{ ...styles.input, resize: "vertical" }}
              />
              <p style={styles.muted}>{comments.length}/2000 characters</p>
            </div>

            <button
              type="submit"
              disabled={feedbackLoading}
              style={{ ...styles.goldButton, marginTop: 8 }}
            >
              {feedbackLoading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>📝 My Previous Feedback</h2>

          {historyLoading ? (
            <p>Loading your feedback...</p>
          ) : feedbackList.length === 0 ? (
            <p style={styles.muted}>You haven't submitted any feedback yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr style={{ background: "#F8F4EB" }}>
                    {["Date", "Meal", "Food", "Hygiene", "Overall", "Comments"].map(
                      (heading) => (
                        <th
                          key={heading}
                          style={{
                            padding: 12,
                            borderBottom: "1px solid #E8DED0",
                          }}
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.map((feedback, index) => (
                    <tr key={feedback.id ?? index}>
                      <td style={{ padding: 12 }}>
                        {feedback.date ?? feedback.feedbackDate ?? "—"}
                      </td>
                      <td style={{ padding: 12 }}>
                        {feedback.mealType ?? "—"}
                      </td>
                      <td style={{ padding: 12 }}>
                        {feedback.foodQualityRating ?? feedback.foodQuality ?? "—"}
                      </td>
                      <td style={{ padding: 12 }}>
                        {feedback.hygieneRating ?? feedback.hygiene ?? "—"}
                      </td>
                      <td style={{ padding: 12 }}>
                        {feedback.overallRating ?? "—"}
                      </td>
                      <td style={{ padding: 12 }}>
                        {feedback.comments || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

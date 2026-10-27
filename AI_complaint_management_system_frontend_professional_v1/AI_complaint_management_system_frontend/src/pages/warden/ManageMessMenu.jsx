
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

const today = new Date().toLocaleDateString("en-CA");

const emptyForm = {
  menuDate: today,
  mealType: "BREAKFAST",
  items: "",
  specialNote: "",
};

const mealTypes = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;

  return "Something went wrong. Please try again.";
}

export default function ManageMessMenu() {
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [filterDate, setFilterDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMenus = useCallback(async (date = filterDate) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await API.get("/mess-menu", {
        params: { date },
      });

      setMenus(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    loadMenus(today);
  }, [loadMenus]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm, menuDate: filterDate });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.menuDate || !form.mealType || !form.items.trim()) {
      setError("Please provide the date, meal type, and menu items.");
      return;
    }

    setSaving(true);

    const payload = {
      menuDate: form.menuDate,
      mealType: form.mealType,
      items: form.items.trim(),
      specialNote: form.specialNote.trim() || null,
    };

    try {
      if (editingId !== null) {
        await API.put(`/mess-menu/${editingId}`, payload);
        setSuccess("Mess menu updated successfully.");
      } else {
        await API.post("/mess-menu", payload);
        setSuccess("Mess menu created successfully.");
      }

      const savedDate = payload.menuDate;
      setFilterDate(savedDate);
      setForm({ ...emptyForm, menuDate: savedDate });
      setEditingId(null);
      await loadMenus(savedDate);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (menu) => {
    setEditingId(menu.id);
    setForm({
      menuDate: menu.menuDate,
      mealType: menu.mealType,
      items: menu.items || "",
      specialNote: menu.specialNote || "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (menu) => {
    const confirmed = window.confirm(
      `Delete the ${menu.mealType} menu for ${menu.menuDate}?`
    );

    if (!confirmed) return;

    setDeletingId(menu.id);
    setError("");
    setSuccess("");

    try {
      await API.delete(`/mess-menu/${menu.id}`);
      setMenus((previous) =>
        previous.filter((item) => item.id !== menu.id)
      );
      setSuccess("Mess menu deleted successfully.");

      if (editingId === menu.id) {
        resetForm();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleRangeSearch = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!startDate || !endDate || startDate > endDate) {
      setError("Please select a valid date range.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.get("/mess-menu/range", {
        params: {
          startDate,
          endDate,
        },
      });

      setMenus(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSingleDateSearch = (event) => {
    event.preventDefault();
    setFilterDate(filterDate);
    loadMenus(filterDate);
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#FAF8F3",
      color: "#17243B",
      padding: "28px 20px 48px",
    },
    container: {
      maxWidth: "1100px",
      margin: "0 auto",
    },
    heading: {
      fontSize: "28px",
      fontWeight: 800,
      margin: "0 0 8px",
    },
    muted: {
      color: "#716D65",
      margin: "0 0 24px",
      lineHeight: 1.6,
    },
    panel: {
      background: "#FFFFFF",
      border: "1px solid #E8E0D2",
      borderRadius: "14px",
      padding: "24px",
      marginBottom: "24px",
      boxShadow: "0 4px 16px rgba(23, 36, 59, 0.04)",
    },
    sectionTitle: {
      fontSize: "19px",
      fontWeight: 750,
      margin: "0 0 20px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "18px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: 700,
      marginBottom: "8px",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px",
      border: "1px solid #D9D2C5",
      borderRadius: "8px",
      background: "#FFFEFC",
      color: "#17243B",
      font: "inherit",
    },
    textarea: {
      width: "100%",
      boxSizing: "border-box",
      minHeight: "105px",
      padding: "12px",
      border: "1px solid #D9D2C5",
      borderRadius: "8px",
      background: "#FFFEFC",
      color: "#17243B",
      font: "inherit",
      resize: "vertical",
    },
    primaryButton: {
      background: "#17243B",
      color: "#FFFFFF",
      border: "none",
      borderRadius: "8px",
      padding: "11px 18px",
      fontWeight: 700,
      cursor: "pointer",
    },
    secondaryButton: {
      background: "#E9D29A",
      color: "#17243B",
      border: "1px solid #D9BC75",
      borderRadius: "8px",
      padding: "10px 15px",
      fontWeight: 700,
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-block",
    },
    dangerButton: {
      background: "#FFF1EF",
      color: "#A52A2A",
      border: "1px solid #E8C0BB",
      borderRadius: "7px",
      padding: "8px 11px",
      fontWeight: 700,
      cursor: "pointer",
    },
    message: {
      borderRadius: "8px",
      padding: "12px 14px",
      marginBottom: "18px",
      lineHeight: 1.5,
    },
    menuCard: {
      border: "1px solid #E8E0D2",
      borderRadius: "12px",
      padding: "18px",
      background: "#FFFEFC",
    },
    badge: {
      display: "inline-block",
      background: "#F4E7C8",
      color: "#5E4616",
      padding: "5px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 800,
    },
  };

  return (
    <>
       <Navbar />

      <main style={styles.page}>
        <div style={styles.container}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              marginBottom: "26px",
            }}
          >
            <div>
              <h1 style={styles.heading}>Mess Menu Management</h1>
              <p style={styles.muted}>
                Create and maintain daily menus for the campus mess.
              </p>
            </div>

            <div
style={{
display: "flex",
gap: "10px",
flexWrap: "wrap",
alignItems: "center",
}}
>
<Link
to="/warden/mess-feedback"
style={styles.secondaryButton}
>
Review Mess Feedback
</Link>
              <Link to="/warden" style={styles.secondaryButton}>
                ← Back to Warden Dashboard
              </Link>
            </div>

          </div>

          {error && (
            <div
              role="alert"
              style={{
                ...styles.message,
                background: "#FFF1EF",
                color: "#922B21",
                border: "1px solid #E8C0BB",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              style={{
                ...styles.message,
                background: "#EDF7ED",
                color: "#236B37",
                border: "1px solid #B9DDBD",
              }}
            >
              {success}
            </div>
          )}

          <section style={styles.panel}>
            <h2 style={styles.sectionTitle}>
              {editingId !== null ? "Edit Mess Menu" : "Create Mess Menu"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={styles.grid}>
                <div>
                  <label htmlFor="menuDate" style={styles.label}>
                    Menu Date *
                  </label>
                  <input
                    id="menuDate"
                    name="menuDate"
                    type="date"
                    value={form.menuDate}
                    onChange={updateField}
                    required
                    style={styles.input}
                  />
                </div>

                <div>
                  <label htmlFor="mealType" style={styles.label}>
                    Meal Type *
                  </label>
                  <select
                    id="mealType"
                    name="mealType"
                    value={form.mealType}
                    onChange={updateField}
                    required
                    style={styles.input}
                  >
                    {mealTypes.map((meal) => (
                      <option key={meal} value={meal}>
                        {meal}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "18px" }}>
                <label htmlFor="items" style={styles.label}>
                  Menu Items *
                </label>
                <textarea
                  id="items"
                  name="items"
                  value={form.items}
                  onChange={updateField}
                  maxLength={3000}
                  placeholder="Example: Rice, Dal, Roti, Paneer Curry, Salad"
                  required
                  style={styles.textarea}
                />
                <small>{form.items.length}/3000 characters</small>
              </div>

              <div style={{ marginTop: "18px" }}>
                <label htmlFor="specialNote" style={styles.label}>
                  Special Note (optional)
                </label>
                <textarea
                  id="specialNote"
                  name="specialNote"
                  value={form.specialNote}
                  onChange={updateField}
                  maxLength={1000}
                  placeholder="Example: Special menu for a festival"
                  style={{ ...styles.textarea, minHeight: "75px" }}
                />
                <small>{form.specialNote.length}/1000 characters</small>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...styles.primaryButton,
                    opacity: saving ? 0.65 : 1,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                    ? "Update Menu"
                    : "Create Menu"}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={styles.secondaryButton}
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </form>
          </section>

          <section style={styles.panel}>
            <h2 style={styles.sectionTitle}>Find Menus</h2>

            <form
              onSubmit={handleSingleDateSearch}
              style={{ marginBottom: "24px" }}
            >
              <label htmlFor="filterDate" style={styles.label}>
                View menus for one date
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  id="filterDate"
                  type="date"
                  value={filterDate}
                  onChange={(event) => setFilterDate(event.target.value)}
                  required
                  style={{ ...styles.input, maxWidth: "250px" }}
                />

                <button
                  type="submit"
                  disabled={loading}
                  style={styles.primaryButton}
                >
                  Search Date
                </button>
              </div>
            </form>

            <form onSubmit={handleRangeSearch}>
              <label style={styles.label}>View menus by date range</label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                  alignItems: "end",
                }}
              >
                <div>
                  <label htmlFor="startDate" style={styles.label}>
                    From
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div>
                  <label htmlFor="endDate" style={styles.label}>
                    To
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={styles.primaryButton}
                >
                  Search Range
                </button>
              </div>
            </form>
          </section>

          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
                Mess Menus ({menus.length})
              </h2>

              <button
                type="button"
                onClick={() => loadMenus(filterDate)}
                disabled={loading}
                style={styles.secondaryButton}
              >
                {loading ? "Loading..." : "↻ Refresh"}
              </button>
            </div>

            {loading ? (
              <p>Loading mess menus...</p>
            ) : menus.length === 0 ? (
              <div style={styles.panel}>
                No menus found for the selected search. Try another date or
                date range.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "16px",
                }}
              >
                {menus.map((menu) => (
                  <article key={menu.id} style={styles.menuCard}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginBottom: "12px",
                      }}
                    >
                      <span style={styles.badge}>{menu.mealType}</span>
                      <strong>{menu.menuDate}</strong>
                    </div>

                    <h3
                      style={{
                        fontSize: "16px",
                        margin: "0 0 8px",
                      }}
                    >
                      Menu Items
                    </h3>

                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        lineHeight: 1.7,
                        margin: "0 0 14px",
                      }}
                    >
                      {menu.items}
                    </p>

                    {menu.specialNote && (
                      <div
                        style={{
                          background: "#F8F2E5",
                          borderRadius: "8px",
                          padding: "10px",
                          marginBottom: "14px",
                        }}
                      >
                        <strong>Special Note: </strong>
                        {menu.specialNote}
                      </div>
                    )}

                    {menu.createdByName && (
                      <p
                        style={{
                          color: "#716D65",
                          fontSize: "12px",
                          margin: "0 0 14px",
                        }}
                      >
                        Created by: {menu.createdByName}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleEdit(menu)}
                        style={styles.secondaryButton}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(menu)}
                        disabled={deletingId === menu.id}
                        style={{
                          ...styles.dangerButton,
                          opacity: deletingId === menu.id ? 0.65 : 1,
                        }}
                      >
                        {deletingId === menu.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
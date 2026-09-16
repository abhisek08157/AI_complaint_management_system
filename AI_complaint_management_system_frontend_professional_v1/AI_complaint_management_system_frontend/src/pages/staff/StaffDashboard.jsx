import { useEffect, useState } from "react";
import API from "../../services/api";
import { getUser } from "../../utils/auth";
import Navbar from "../../components/Navbar";

function StaffDashboard() {
  const user = getUser();

  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await API.get(
        `/staff/${user.userId}/complaints`
      );

      setComplaints(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load complaints"
      );
    }
  };

  const updateStatus = async (
    complaintId,
    status
  ) => {
    try {
      const body = {
        status,
      };

      if (status === "RESOLVED") {
        const resolution = prompt(
          "Enter resolution:"
        );

        if (!resolution) return;

        body.resolution = resolution;
      }

      await API.put(
        `/staff/complaints/${complaintId}/status`,
        body
      );

      fetchComplaints();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="app-page">
      <h1>Staff Dashboard</h1>

      {error && (
        <div className="error">{error}</div>
      )}

      <div className="complaint-grid">
        {complaints.map((complaint) => (
          <div
            className="complaint-card"
            key={complaint.id}
          >
            <h2>{complaint.title}</h2>

            <p>{complaint.description}</p>

            <p>
              <strong>Location:</strong>{" "}
              {complaint.location}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {complaint.category}
            </p>

            <p>
              <strong>Priority:</strong>{" "}
              {complaint.priority}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {complaint.status}
            </p>

            <div className="button-group">

              {complaint.status === "ASSIGNED" && (
                <button
                  onClick={() =>
                    updateStatus(
                      complaint.id,
                      "IN_PROGRESS"
                    )
                  }
                >
                  Start Work
                </button>
              )}

              {complaint.status === "IN_PROGRESS" && (
                <button
                  onClick={() =>
                    updateStatus(
                      complaint.id,
                      "RESOLVED"
                    )
                  }
                >
                  Resolve
                </button>
              )}

            </div>
          </div>
        ))}
      </div>
      </div>
    </>
  );
}

export default StaffDashboard;
import { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const complaintsResponse =
        await API.get("/admin/complaints");

      const staffResponse =
        await API.get("/admin/staff");

      setComplaints(complaintsResponse.data);
      setStaff(staffResponse.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load data"
      );
    }
  };

  const assignComplaint = async (
    complaintId,
    staffId
  ) => {
    if (!staffId) return;

    try {
      await API.put(
        `/admin/complaints/${complaintId}/assign`,
        {
          staffId: Number(staffId),
        }
      );

      fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to assign complaint"
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="app-page">
      <h1>Manage Complaints</h1>

      {error && (
        <div className="error">{error}</div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Student</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assign Staff</th>
            </tr>
          </thead>

          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint.id}>
                <td>{complaint.id}</td>

                <td>{complaint.title}</td>

                <td>{complaint.submittedBy}</td>

                <td>{complaint.category}</td>

                <td>
                  <span
                    className={`priority ${complaint.priority.toLowerCase()}`}
                  >
                    {complaint.priority}
                  </span>
                </td>

                <td>{complaint.status}</td>

                <td>
                  <select
                    value=""
                    onChange={(e) =>
                      assignComplaint(
                        complaint.id,
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Staff
                    </option>

                    {staff.map((person) => (
                      <option
                        key={person.id}
                        value={person.id}
                      >
                        {person.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}

export default ManageComplaints;
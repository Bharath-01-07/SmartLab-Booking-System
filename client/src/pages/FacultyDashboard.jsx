
import { useEffect, useState } from "react";
import {
  FlaskConical,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  CalendarDays
} from "lucide-react";
import API from "../api";
import "./FacultyDashboard.css";

function FacultyDashboard() {
  const [bookings, setBookings] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [bookingRes, labRes] = await Promise.all([
        API.get("/bookings"),
        API.get("/labs")
      ]);

      setBookings(
        Array.isArray(bookingRes.data)
          ? bookingRes.data
          : bookingRes.data.bookings || []
      );

      setLabs(
        Array.isArray(labRes.data)
          ? labRes.data
          : labRes.data.labs || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load faculty dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pending = bookings.filter(b => b.status === "Pending").length;
  const approved = bookings.filter(b => b.status === "Approved").length;
  const rejected = bookings.filter(b => b.status === "Rejected").length;

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const stats = [
    {
      label: "Total Requests",
      value: bookings.length,
      icon: CalendarDays,
      color: "purple"
    },
    {
      label: "Pending Requests",
      value: pending,
      icon: Clock,
      color: "orange"
    },
    {
      label: "Approved",
      value: approved,
      icon: CheckCircle,
      color: "green"
    },
    {
      label: "Rejected",
      value: rejected,
      icon: XCircle,
      color: "red"
    }
  ];

  if (loading) {
    return <div className="faculty-loading">Loading faculty dashboard...</div>;
  }

  return (
    <div className="faculty-dashboard">
      <div className="faculty-heading">
        <div>
          <span>FACULTY WORKSPACE</span>
          <h1>Faculty Dashboard</h1>
          <p>Monitor laboratory bookings and campus resources.</p>
        </div>

        <button onClick={loadData}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      {error && <div className="faculty-error">{error}</div>}

      <div className="faculty-stats">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div className="faculty-stat-card" key={item.label}>
              <div className={`faculty-stat-icon ${item.color}`}>
                <Icon size={21} />
              </div>
              <span>{item.label}</span>
              <h2>{item.value}</h2>
            </div>
          );
        })}
      </div>

      <div className="faculty-resource-card">
        <div className="resource-icon">
          <FlaskConical size={24} />
        </div>

        <div>
          <span>LABORATORY RESOURCES</span>
          <h2>{labs.length} Laboratories</h2>
          <p>
            {labs.filter(l => l.status === "Available").length} available
            {" · "}
            {labs.filter(l => l.status !== "Available").length} unavailable
          </p>
        </div>
      </div>

      <section className="faculty-recent">
        <div className="faculty-section-heading">
          <div>
            <h2>Recent Booking Requests</h2>
            <p>Latest student laboratory requests.</p>
          </div>
        </div>

        {recentBookings.length === 0 ? (
          <div className="faculty-empty">
            No booking requests available.
          </div>
        ) : (
          <div className="faculty-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Laboratory</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentBookings.map(booking => (
                  <tr key={booking._id}>
                    <td>
                      <b>{booking.user?.name || "Unknown"}</b>
                      <small>{booking.user?.email || "—"}</small>
                    </td>
                    <td>{booking.lab?.name || "Laboratory"}</td>
                    <td>
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </td>
                    <td>
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td>
                      <span className={`faculty-status ${booking.status?.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default FacultyDashboard;

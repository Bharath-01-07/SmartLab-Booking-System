
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  CalendarDays,
  User,
  FlaskConical
} from "lucide-react";

import API from "../api";
import "./Approvals.css";

function Approvals() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Pending");

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/bookings");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.bookings || [];

      setBookings(data);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load booking requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function updateStatus(id, status) {
    const action = status === "Approved" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this booking?`)) {
      return;
    }

    try {
      setUpdatingId(id);
      setError("");
      setMessage("");

      const res = await API.patch(
        `/bookings/${id}/status`,
        { status }
      );

      setMessage(
        res.data?.message ||
        `Booking ${status.toLowerCase()} successfully.`
      );

      await loadBookings();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update booking."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const counts = useMemo(() => ({
    All: bookings.length,
    Pending: bookings.filter(b => b.status === "Pending").length,
    Approved: bookings.filter(b => b.status === "Approved").length,
    Rejected: bookings.filter(b => b.status === "Rejected").length,
    Cancelled: bookings.filter(b => b.status === "Cancelled").length
  }), [bookings]);

  const filteredBookings = bookings.filter(booking => {
    const student = booking.user?.name || "";
    const email = booking.user?.email || "";
    const lab = booking.lab?.name || "";
    const code = booking.lab?.labCode || "";
    const purpose = booking.purpose || "";

    const searchText =
      `${student} ${email} ${lab} ${code} ${purpose}`.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || booking.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="approval-page">

      {/* HEADER */}

      <div className="approval-header">
        <div>
          <span>ADMINISTRATION WORKSPACE</span>
          <h1>Booking Approvals</h1>
          <p>Review student laboratory booking requests.</p>
        </div>

        <button onClick={loadBookings} disabled={loading}>
          <RefreshCw size={17} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* SUMMARY */}

      <div className="approval-stats">

        <div>
          <span>Total Requests</span>
          <h2>{counts.All}</h2>
        </div>

        <div>
          <span>Pending</span>
          <h2>{counts.Pending}</h2>
        </div>

        <div>
          <span>Approved</span>
          <h2>{counts.Approved}</h2>
        </div>

        <div>
          <span>Rejected</span>
          <h2>{counts.Rejected}</h2>
        </div>

      </div>

      {/* SEARCH AND FILTER */}

      <div className="approval-toolbar">

        <div className="approval-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search student, email or laboratory..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="Pending">Pending Requests</option>
          <option value="All">All Requests</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>

      </div>

      {/* MESSAGES */}

      {message && (
        <div className="approval-success">
          <CheckCircle size={17} />
          {message}
        </div>
      )}

      {error && (
        <div className="approval-error">
          {error}
        </div>
      )}

      {/* REQUESTS */}

      {loading ? (

        <div className="approval-empty">
          Loading booking requests...
        </div>

      ) : filteredBookings.length === 0 ? (

        <div className="approval-empty">
          <Clock size={38} />
          <h3>No requests found</h3>
          <p>
            No bookings match your selected filter.
          </p>
        </div>

      ) : (

        <div className="approval-list">

          {filteredBookings.map(booking => (

            <div className="approval-card" key={booking._id}>

              <div className="approval-card-top">

                <div>
                  <h3>
                    {booking.lab?.name || "Laboratory"}
                  </h3>

                  <p>
                    {booking.lab?.labCode || "Lab code unavailable"}
                  </p>
                </div>

                <span
                  className={`booking-status ${booking.status?.toLowerCase()}`}
                >
                  {booking.status}
                </span>

              </div>

              <div className="approval-details">

                <p>
                  <User size={15} />
                  <b>Student:</b>
                  {booking.user?.name || "Unknown"}
                </p>

                <p>
                  <b>Email:</b>
                  {booking.user?.email || "—"}
                </p>

                <p>
                  <CalendarDays size={15} />
                  <b>Date:</b>
                  {booking.bookingDate
                    ? new Date(booking.bookingDate).toLocaleDateString("en-IN")
                    : "—"}
                </p>

                <p>
                  <Clock size={15} />
                  <b>Time:</b>
                  {booking.startTime} – {booking.endTime}
                </p>

                <p>
                  <FlaskConical size={15} />
                  <b>Purpose:</b>
                  {booking.purpose || "Not specified"}
                </p>

              </div>

              {booking.status === "Pending" && (

                <div className="approval-actions">

                  <button
                    className="approve-btn"
                    disabled={updatingId === booking._id}
                    onClick={() =>
                      updateStatus(booking._id, "Approved")
                    }
                  >
                    <CheckCircle size={16} />

                    {updatingId === booking._id
                      ? "Updating..."
                      : "Approve"}
                  </button>

                  <button
                    className="reject-btn"
                    disabled={updatingId === booking._id}
                    onClick={() =>
                      updateStatus(booking._id, "Rejected")
                    }
                  >
                    <XCircle size={16} />
                    Reject
                  </button>

                </div>

              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Approvals;


import { useEffect, useState, useCallback } from "react";
import {
  CalendarDays,
  Clock,
  RefreshCw,
  Search,
  XCircle,
  CheckCircle,
  Hourglass,
  Filter
} from "lucide-react";

import API from "../api";
import "./MyBookings.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

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
        "Unable to load bookings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function cancelBooking(id) {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      setMessage("");
      await API.patch(`/bookings/${id}/cancel`);

      setMessage("Booking cancelled successfully.");

      await loadBookings();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to cancel booking."
      );
    }
  }

  const counts = {
    All: bookings.length,
    Pending: bookings.filter(
      b => b.status === "Pending"
    ).length,
    Approved: bookings.filter(
      b => b.status === "Approved"
    ).length,
    Rejected: bookings.filter(
      b => b.status === "Rejected"
    ).length,
    Cancelled: bookings.filter(
      b => b.status === "Cancelled"
    ).length
  };

  const filteredBookings = bookings.filter(booking => {
    const labName = booking.lab?.name || "Laboratory";
    const labCode = booking.lab?.labCode || "";
    const purpose = booking.purpose || "";

    const matchesSearch =
      `${labName} ${labCode} ${purpose}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      filter === "All" || booking.status === filter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="my-bookings">

      <div className="my-bookings-header">

        <div>
          <span>STUDENT WORKSPACE</span>
          <h1>My Bookings</h1>
          <p>
            Manage and track your laboratory booking requests.
          </p>
        </div>

        <button
          onClick={loadBookings}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Loading..." : "Refresh"}
        </button>

      </div>

      {/* SUMMARY */}

      <div className="booking-summary">

        <div className="booking-summary-card">
          <CalendarDays size={20} />
          <span>Total Requests</span>
          <h2>{counts.All}</h2>
        </div>

        <div className="booking-summary-card">
          <Hourglass size={20} />
          <span>Pending</span>
          <h2>{counts.Pending}</h2>
        </div>

        <div className="booking-summary-card">
          <CheckCircle size={20} />
          <span>Approved</span>
          <h2>{counts.Approved}</h2>
        </div>

        <div className="booking-summary-card">
          <XCircle size={20} />
          <span>Rejected</span>
          <h2>{counts.Rejected}</h2>
        </div>

      </div>

      {/* SEARCH AND FILTER */}

      <div className="booking-toolbar">

        <div className="booking-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search laboratory or purpose..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="booking-filter">
          <Filter size={17} />

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="All">All Requests</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

      </div>

      {message && (
        <div className="booking-success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="booking-error">
          {error}
        </div>
      )}

      {/* BOOKING LIST */}

      {loading ? (

        <div className="booking-empty">
          Loading bookings...
        </div>

      ) : filteredBookings.length === 0 ? (

        <div className="no-bookings">
          <CalendarDays size={42} />

          <h3>No bookings found</h3>

          <p>
            {bookings.length === 0
              ? "Your laboratory requests will appear here."
              : "Try changing your search or filter."}
          </p>

        </div>

      ) : (

        <div className="my-booking-list">

          {filteredBookings.map(booking => (

            <div
              className="my-booking-card"
              key={booking._id}
            >

              <div className="my-booking-top">

                <div>
                  <h3>
                    {booking.lab?.name || "Laboratory"}
                  </h3>

                  <span>
                    {booking.lab?.labCode || "Lab code unavailable"}
                  </span>
                </div>

                <span
                  className={`status ${booking.status?.toLowerCase()}`}
                >
                  {booking.status}
                </span>

              </div>

              <div className="my-booking-info">

                <p>
                  <CalendarDays size={16} />

                  {new Date(
                    booking.bookingDate
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}
                </p>

                <p>
                  <Clock size={16} />

                  {booking.startTime} – {booking.endTime}
                </p>

              </div>

              <div className="booking-purpose">
                <b>Purpose:</b>
                {" "}{booking.purpose}
              </div>

              {booking.user?.name && (
                <div className="booking-purpose">
                  <b>Requested by:</b>
                  {" "}{booking.user.name}
                </div>
              )}

              {booking.status === "Pending" && (

                <button
                  className="cancel-booking-button"
                  onClick={() => cancelBooking(booking._id)}
                >
                  <XCircle size={16} />
                  Cancel Booking
                </button>

              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default MyBookings;

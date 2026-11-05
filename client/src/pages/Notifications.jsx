import { useEffect, useState } from "react";
import { Bell, CheckCircle, XCircle, Clock } from "lucide-react";
import API from "../api";
import "./Notifications.css";

function Notifications({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await API.get("/bookings");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Notification error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const notifications = bookings.map((booking) => {
    const status = booking.status || "Pending";

    return {
      id: booking._id,
      status,
      lab: booking.lab?.name || "Laboratory",
      date: booking.bookingDate
        ? new Date(booking.bookingDate).toLocaleDateString()
        : "Date unavailable",
      message:
        status === "Approved"
          ? "Your laboratory booking has been approved."
          : status === "Rejected"
          ? "Your laboratory booking was rejected."
          : "Your laboratory booking is waiting for approval."
    };
  });

  const icons = {
    Approved: CheckCircle,
    Rejected: XCircle,
    Pending: Clock
  };

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>
      <p>Stay updated on laboratory booking activity.</p>

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        notifications.map((item) => {
          const Icon = icons[item.status] || Bell;

          return (
            <div className="notification-card" key={item.id}>
              <Icon size={24} />

              <div>
                <h3>{item.status} Booking</h3>
                <p>{item.message}</p>
                <small>
                  {item.lab} · {item.date}
                </small>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default Notifications;

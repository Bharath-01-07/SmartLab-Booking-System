import { useEffect, useState } from "react";
import {
  FlaskConical,
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import API from "../api";
import "./Analytics.css";

function Analytics() {
  const [bookings, setBookings] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
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
        err.response?.data?.message || "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const pending = bookings.filter(b => b.status === "Pending").length;
  const approved = bookings.filter(b => b.status === "Approved").length;
  const rejected = bookings.filter(b => b.status === "Rejected").length;

  const approvalRate = bookings.length
    ? Math.round((approved / bookings.length) * 100)
    : 0;

  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: CalendarDays,
      color: "purple"
    },
    {
      title: "Approved",
      value: approved,
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock,
      color: "orange"
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      color: "red"
    }
  ];

  const labUsage = labs.map(lab => ({
    name: lab.name,
    code: lab.labCode,
    count: bookings.filter(
      b => b.lab?._id === lab._id || b.lab === lab._id
    ).length
  }));

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <span>ADMIN WORKSPACE</span>
          <h1>Analytics Overview</h1>
          <p>Monitor laboratory bookings and campus performance.</p>
        </div>

        <button onClick={loadAnalytics}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      {error && <div className="analytics-error">{error}</div>}

      <div className="analytics-stats">
        {stats.map(item => {
          const Icon = item.icon;

          return (
            <div className="analytics-card" key={item.title}>
              <div className={`analytics-icon ${item.color}`}>
                <Icon size={21} />
              </div>
              <span>{item.title}</span>
              <h2>{item.value}</h2>
            </div>
          );
        })}
      </div>

      <div className="analytics-content">
        <section className="analytics-panel">
          <div className="analytics-panel-heading">
            <TrendingUp size={21} />
            <h2>Booking Approval Rate</h2>
          </div>

          <div className="approval-rate">
            {approvalRate}%
          </div>

          <div className="analytics-progress">
            <div style={{ width: `${approvalRate}%` }} />
          </div>

          <p>
            {approved} approved out of {bookings.length} total bookings.
          </p>
        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-heading">
            <FlaskConical size={21} />
            <h2>Laboratory Overview</h2>
          </div>

          <div className="lab-analytics">
            <div>
              <span>Total Laboratories</span>
              <b>{labs.length}</b>
            </div>
            <div>
              <span>Available</span>
              <b>{labs.filter(l => l.status === "Available").length}</b>
            </div>
            <div>
              <span>Unavailable</span>
              <b>{labs.filter(l => l.status !== "Available").length}</b>
            </div>
          </div>
        </section>
      </div>

      <section className="analytics-panel usage-panel">
        <div className="analytics-panel-heading">
          <CalendarDays size={21} />
          <h2>Laboratory Booking Usage</h2>
        </div>

        {labUsage.length === 0 ? (
          <p>No laboratories found.</p>
        ) : (
          labUsage.map(lab => (
            <div className="usage-row" key={lab.code}>
              <div className="usage-info">
                <b>{lab.name}</b>
                <span>{lab.code}</span>
              </div>

              <div className="usage-count">
                {lab.count} bookings
              </div>

              <div className="usage-track">
                <div
                  style={{
                    width: `${bookings.length
                      ? (lab.count / bookings.length) * 100
                      : 0}%`
                  }}
                />
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default Analytics;

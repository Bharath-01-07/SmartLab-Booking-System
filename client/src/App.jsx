import { useEffect, useMemo, useState } from "react";
import Auth from "./pages/Auth";
import Approvals from "./pages/Approvals";
import MyBookings from "./pages/MyBookings";
import ManageLabs from "./pages/ManageLabs";
import ManageUsers from "./pages/ManageUsers";
import FacultyDashboard from "./pages/FacultyDashboard";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import ChangePassword from "./pages/ChangePassword";
import Analytics from "./pages/Analytics";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FlaskConical,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPin,
  Monitor,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  UserRound,
  X
} from "lucide-react";

import API from "./api";
import timetableData from "./data/timetableData";
import "./App.css";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

function App() {
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const role = loggedInUser?.role?.toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedInUser(null);
    setActiveNav("Overview");
    setShowBooking(false);
    setSelectedLab(null);
  };

  const navigation = [
    ["Overview", LayoutDashboard],
    ["Timetable", CalendarDays],
    ["Laboratories", FlaskConical],
    ["Bookings", Clock3],
    ["Notifications", Bell],

    ...(role === "faculty" || role === "lab_incharge"
      ? [["Approvals", CheckCircle2]]
      : []),

    ...(role === "lab_incharge"
      ? [
          ["Manage Users", Users],
          ["Manage Labs", FlaskConical],
          ["Analytics", Activity]
        ]
      : []),

    ["Profile", UserRound],
    ["Change Password", Lock]
  ];

  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [section, setSection] = useState("sec1");
  const [activeDay, setActiveDay] = useState("Monday");
  const [activeNav, setActiveNav] = useState("Overview");
  const [query, setQuery] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);

  const [booking, setBooking] = useState({
    date: "",
    startTime: "",
    endTime: "",
    purpose: ""
  });

  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    API.get("/labs")
      .then((res) => {
        setLabs(
          Array.isArray(res.data)
            ? res.data
            : res.data.labs || []
        );
      })
      .catch(() => {
        setError(
          "Could not connect to the lab server. Check your backend."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const current = timetableData[section] || timetableData.sec1;

  const todaySlots = current.days[activeDay] || [];

  const availableLabs = labs.filter(
    (lab) => lab.status === "Available"
  );

  const occupiedLabs = labs.filter(
    (lab) => lab.status !== "Available"
  );

  const filteredLabs = labs.filter((lab) =>
    `${lab.name} ${lab.labCode} ${lab.location} ${lab.labType}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const scheduleStats = useMemo(() => {
    const total = Object.values(current.days).reduce(
      (sum, slots) => sum + slots.length,
      0
    );

    const practical = Object.values(current.days)
      .flat()
      .filter((x) => /\(P\)|LAB/i.test(x.subject)).length;

    return { total, practical };
  }, [current]);

  async function submitBooking(e) {
    e.preventDefault();
    setBookingMessage("");

    if (!selectedLab) return;

    try {
      await API.post("/bookings", {
        lab: selectedLab._id,
        bookingDate: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        purpose: booking.purpose
      });

      setBookingMessage(
        "Booking request submitted successfully."
      );

      setShowBooking(false);
    } catch (err) {
      setBookingMessage(
        err.response?.data?.message ||
        "Booking could not be submitted."
      );
    }
  }

  function openBooking(lab) {
    setSelectedLab(lab);

    setBooking({
      date: "",
      startTime: "",
      endTime: "",
      purpose: ""
    });

    setBookingMessage("");
    setShowBooking(true);
  }

  const currentHour = new Date().getHours();

  const greeting =
    currentHour >= 5 && currentHour < 12
      ? "Good morning"
      : currentHour >= 12 && currentHour < 17
      ? "Good afternoon"
      : currentHour >= 17 && currentHour < 21
      ? "Good evening"
      : "Good night";

  if (!loggedInUser) {
    return <Auth onLogin={setLoggedInUser} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <FlaskConical size={23} />
          </div>

          <div>
            <strong>SmartLab</strong>
            <span>Campus workspace</span>
          </div>
        </div>

        <div className="workspace-label">
          WORKSPACE
        </div>

        <nav className="nav-list">
          {navigation.map(([label, Icon]) => (
            <button
              key={label}
              className={`nav-item ${
                activeNav === label ? "active" : ""
              }`}
              onClick={() => setActiveNav(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="quick-access-card">
            <div className="quick-access-heading">
              <span>QUICK ACCESS</span>
              <span className="quick-access-dot">●</span>
            </div>

            <button onClick={() => setActiveNav("Timetable")}>
              <CalendarDays size={17} />
              <span>View Timetable</span>
              <ChevronRight size={15} />
            </button>

            <button onClick={() => setActiveNav("Laboratories")}>
              <FlaskConical size={17} />
              <span>Explore Laboratories</span>
              <ChevronRight size={15} />
            </button>

            <button onClick={() => setActiveNav("Bookings")}>
              <ClipboardList size={17} />
              <span>My Bookings</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <button
            className="nav-item"
            onClick={() => setActiveNav("Settings")}
          >
            <Settings2 size={18} />
            <span>Settings</span>
          </button>

          <div className="profile">
            <div className="avatar">
              {loggedInUser.name?.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">
              <b>{loggedInUser.name}</b>
              <span>
                {role === "lab_incharge"
                  ? "Lab Incharge"
                  : role === "faculty"
                  ? "Faculty"
                  : "Student"}
              </span>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-mark">
              <FlaskConical size={20} />
            </div>
            <b>SmartLab</b>
          </div>

          <div className="crumb">
            Workspace <span>/</span> <b>{activeNav}</b>
          </div>

          <div className="top-actions">
            <label className="search-box">
              <Search size={17} />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search laboratories..."
              />
            </label>

            <button className="icon-button">
              <Bell size={18} />
            </button>

            <div className="top-avatar">SA</div>
          </div>
        </header>

        <section className="page">
          {activeNav === "Manage Users" ? (
            <ManageUsers />
          ) : activeNav === "Manage Labs" ? (
            <ManageLabs />
          ) : activeNav === "Analytics" ? (
            <Analytics />
          ) : activeNav === "Approvals" ? (
            <Approvals />
          ) : activeNav === "Bookings" ? (
            <MyBookings />
          ) : activeNav === "Timetable" ? (
            <TimetablePage
              timetableData={timetableData}
              days={days}
            />
          ) : activeNav === "Laboratories" ? (
            <LaboratoriesPage
              labs={filteredLabs}
              loading={loading}
              openBooking={openBooking}
            />
          ) : activeNav === "Notifications" ? (
            <Notifications user={loggedInUser} />
          ) : activeNav === "Profile" ? (
            <Profile
              user={loggedInUser}
              onUpdate={setLoggedInUser}
            />
          ) : activeNav === "Change Password" ? (
            <ChangePassword />
          ) : activeNav === "Settings" ? (
            <SystemSettingsPage user={loggedInUser} />
          ) : (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow">
                    <span className="live-dot" />
                    CAMPUS LABORATORY PORTAL
                  </div>

                  <h1>
                    {activeNav === "Overview"
                      ? `${greeting}, ${loggedInUser?.name}`
                      : activeNav}
                  </h1>

                  <p>
                    Welcome to your SmartLab campus workspace.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() =>
                    availableLabs[0] &&
                    openBooking(availableLabs[0])
                  }
                >
                  <CalendarDays size={17} />
                  Book a laboratory
                </button>
              </div>

              {error && (
                <div className="alert">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              {bookingMessage && (
                <div className="success-alert">
                  <CheckCircle2 size={18} />
                  {bookingMessage}
                </div>
              )}

              <div className="stats-grid">
                <StatCard
                  label="Total laboratories"
                  value={labs.length}
                  note="Registered campus labs"
                  icon={FlaskConical}
                  tone="purple"
                />

                <StatCard
                  label="Available now"
                  value={availableLabs.length}
                  note="Ready for booking"
                  icon={CheckCircle2}
                  tone="green"
                />

                <StatCard
                  label="Currently unavailable"
                  value={occupiedLabs.length}
                  note="Occupied or offline"
                  icon={Activity}
                  tone="orange"
                />

                <StatCard
                  label="Sections connected"
                  value="22"
                  note="Academic timetable loaded"
                  icon={Users}
                  tone="blue"
                />
              </div>

              <div className="content-grid">
                <section className="panel timetable-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="eyebrow">
                        ACADEMIC SCHEDULE
                      </div>

                      <h2>Section timetable</h2>

                      <p>
                        View the weekly schedule from the uploaded
                        university timetable.
                      </p>
                    </div>

                    <select
                      className="select-control"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                    >
                      {Object.keys(timetableData).map((key) => (
                        <option key={key} value={key}>
                          Section {key.replace("sec", "")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="section-meta">
                    <span>
                      <MapPin size={15} />
                      {current.homeRoom || "Room not specified"}
                    </span>

                    <span>
                      <CalendarDays size={15} />
                      {scheduleStats.total} scheduled entries / week
                    </span>

                    <span>
                      <Activity size={15} />
                      {scheduleStats.practical} practical entries
                    </span>
                  </div>

                  <div className="day-tabs">
                    {days.map((day) => (
                      <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={
                          activeDay === day ? "selected" : ""
                        }
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>

                  <div className="schedule-list">
                    {todaySlots.length ? (
                      todaySlots.map((slot, i) => {
                        const isBreak = /break/i.test(
                          slot.subject
                        );

                        return (
                          <div
                            className={`schedule-item ${
                              isBreak ? "break-item" : ""
                            }`}
                            key={`${slot.period}-${i}`}
                          >
                            <div className="schedule-time">
                              {slot.period}
                            </div>

                            <div className="schedule-line" />

                            <div className="schedule-detail">
                              <b>{slot.subject}</b>

                              <span>
                                {isBreak
                                  ? "Break time"
                                  : "Academic session"}
                              </span>
                            </div>

                            <span
                              className={`schedule-tag ${
                                isBreak
                                  ? "tag-break"
                                  : /\(P\)|LAB/i.test(slot.subject)
                                  ? "tag-practical"
                                  : "tag-class"
                              }`}
                            >
                              {isBreak
                                ? "BREAK"
                                : /\(P\)|LAB/i.test(slot.subject)
                                ? "PRACTICAL"
                                : "CLASS"}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-state">
                        No timetable entries found for {activeDay}.
                      </div>
                    )}
                  </div>
                </section>

                <section className="panel insights-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="eyebrow">
                        QUICK INSIGHTS
                      </div>

                      <h2>Section snapshot</h2>
                    </div>

                    <span className="soft-icon">
                      <Sparkles size={18} />
                    </span>
                  </div>

                  <div className="snapshot-number">
                    {scheduleStats.total}
                    <span> entries this week</span>
                  </div>

                  <div className="progress-track">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          (scheduleStats.total / 40) * 100
                        )}%`
                      }}
                    />
                  </div>

                  <div className="insight-row">
                    <span>Practical / lab entries</span>
                    <b>{scheduleStats.practical}</b>
                  </div>

                  <div className="insight-row">
                    <span>Home classroom</span>
                    <b>{current.homeRoom || "—"}</b>
                  </div>

                  <div className="insight-row">
                    <span>Selected section</span>
                    <b>{current.name.split("[")[0].trim()}</b>
                  </div>

                  <div className="tip-box">
                    <Sparkles size={17} />

                    <p>
                      Check the selected section's timetable before
                      requesting a lab. A free classroom period does
                      not automatically mean a lab is available.
                    </p>
                  </div>
                </section>
              </div>

              <section className="panel labs-panel">
                <div className="panel-heading">
                  <div>
                    <div className="eyebrow">
                      CAMPUS RESOURCES
                    </div>

                    <h2>Laboratories</h2>

                    <p>
                      Live laboratory information retrieved from
                      your backend.
                    </p>
                  </div>

                  <span className="count-pill">
                    {labs.length} labs
                  </span>
                </div>

                {loading ? (
                  <div className="empty-state">
                    Loading laboratories...
                  </div>
                ) : filteredLabs.length ? (
                  <div className="lab-grid">
                    {filteredLabs.map((lab) => (
                      <article
                        className="lab-card"
                        key={lab._id || lab.labCode}
                      >
                        <div className="lab-card-top">
                          <div className="lab-icon">
                            <Monitor size={21} />
                          </div>

                          <span
                            className={`status ${
                              lab.status === "Available"
                                ? "status-available"
                                : "status-busy"
                            }`}
                          >
                            <i />
                            {lab.status || "Unknown"}
                          </span>
                        </div>

                        <h3>{lab.name}</h3>

                        <p className="lab-code">
                          {lab.labCode}
                        </p>

                        <div className="lab-details">
                          <span>
                            <MapPin size={15} />
                            {lab.location}
                          </span>

                          <span>
                            <Users size={15} />
                            Capacity {lab.capacity}
                          </span>
                        </div>

                        <div className="lab-card-bottom">
                          <span>{lab.labType}</span>

                          <button
                            disabled={lab.status !== "Available"}
                            onClick={() => openBooking(lab)}
                          >
                            Request booking
                            <ArrowUpRight size={15} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    No laboratories found.
                  </div>
                )}
              </section>

              <footer className="footer">
                <span>
                  ©️ 2026 SmartLab · Campus Laboratory Management
                </span>

                <span>
                  Powered by React · Express · MongoDB Atlas
                </span>
              </footer>
            </>
          )}
        </section>
      </main>

      {showBooking && selectedLab && (
        <div
          className="modal-backdrop"
          onClick={() => setShowBooking(false)}
        >
          <form
            className="booking-modal"
            onSubmit={submitBooking}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <div className="eyebrow">
                  NEW REQUEST
                </div>

                <h2>Book a laboratory</h2>

                <p>
                  {selectedLab.name} · {selectedLab.labCode}
                </p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setShowBooking(false)}
              >
                <X size={19} />
              </button>
            </div>

            <label>
              Section

              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
              >
                {Object.keys(timetableData).map((key) => (
                  <option key={key} value={key}>
                    Section {key.replace("sec", "")}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date

              <input
                type="date"
                required
                value={booking.date}
                onChange={(e) =>
                  setBooking({
                    ...booking,
                    date: e.target.value
                  })
                }
              />
            </label>

            <div className="form-two">
              <label>
                Start time

                <input
                  type="time"
                  required
                  value={booking.startTime}
                  onChange={(e) =>
                    setBooking({
                      ...booking,
                      startTime: e.target.value
                    })
                  }
                />
              </label>

              <label>
                End time

                <input
                  type="time"
                  required
                  value={booking.endTime}
                  onChange={(e) =>
                    setBooking({
                      ...booking,
                      endTime: e.target.value
                    })
                  }
                />
              </label>
            </div>

            <label>
              Purpose

              <input
                required
                placeholder="e.g. Project practical session"
                value={booking.purpose}
                onChange={(e) =>
                  setBooking({
                    ...booking,
                    purpose: e.target.value
                  })
                }
              />
            </label>

            <div className="modal-note">
              <AlertCircle size={16} />

              Your backend must validate lab availability
              and timetable conflicts before confirming.
            </div>

            <button
              className="primary-button full-button"
              type="submit"
            >
              Submit booking request
              <ArrowUpRight size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function TimetablePage({ timetableData, days }) {
  const [section, setSection] = useState("sec1");
  const [activeDay, setActiveDay] = useState("Monday");

  const current = timetableData[section] || timetableData.sec1;
  const slots = current?.days?.[activeDay] || [];

  return (
    <section className="panel">
      <div className="eyebrow">ACADEMIC SCHEDULE</div>
      <h2>Weekly Timetable</h2>
      <p className="page-description">
        View the timetable for your selected section.
      </p>

      <label className="page-field">
        Select Section
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
        >
          {Object.keys(timetableData).map((key) => (
            <option key={key} value={key}>
              Section {key.replace("sec", "")}
            </option>
          ))}
        </select>
      </label>

      <div className="day-tabs page-day-tabs">
        {days.map((day) => (
          <button
            key={day}
            className={activeDay === day ? "selected" : ""}
            onClick={() => setActiveDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="schedule-list">
        {slots.length ? (
          slots.map((slot, index) => (
            <div className="schedule-item" key={index}>
              <div className="schedule-time">{slot.period}</div>
              <div className="schedule-line" />
              <div className="schedule-detail">
                <b>{slot.subject}</b>
                <span>Academic schedule</span>
              </div>
              <span className="schedule-tag tag-class">
                {/\(P\)|LAB/i.test(slot.subject)
                  ? "PRACTICAL"
                  : "CLASS"}
              </span>
            </div>
          ))
        ) : (
          <div className="empty-state">
            No timetable entries for {activeDay}.
          </div>
        )}
      </div>
    </section>
  );
}

function LaboratoriesPage({
  labs,
  loading,
  openBooking
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">CAMPUS RESOURCES</div>
          <h2>Laboratory Directory</h2>
          <p>Explore available campus laboratories.</p>
        </div>

        <span className="count-pill">
          {labs.length} laboratories
        </span>
      </div>

      {loading ? (
        <div className="empty-state">
          Loading laboratories...
        </div>
      ) : labs.length ? (
        <div className="lab-grid">
          {labs.map((lab) => (
            <article
              className="lab-card"
              key={lab._id || lab.labCode}
            >
              <div className="lab-card-top">
                <div className="lab-icon">
                  <Monitor size={21} />
                </div>

                <span
                  className={`status ${
                    lab.status === "Available"
                      ? "status-available"
                      : "status-busy"
                  }`}
                >
                  <i />
                  {lab.status || "Unknown"}
                </span>
              </div>

              <h3>{lab.name}</h3>
              <p className="lab-code">{lab.labCode}</p>

              <div className="lab-details">
                <span>
                  <MapPin size={15} />
                  {lab.location}
                </span>

                <span>
                  <Users size={15} />
                  Capacity {lab.capacity}
                </span>
              </div>

              <div className="lab-card-bottom">
                <span>{lab.labType}</span>

                <button
                  disabled={lab.status !== "Available"}
                  onClick={() => openBooking(lab)}
                >
                  Request booking
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No laboratories available.
        </div>
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={20} />
      </div>

      <div className="stat-label">
        {label}
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-note">
        {note}
      </div>
    </article>
  );
}

function SystemSettingsPage({ user }) {
  const [compact, setCompact] = useState(
    () => localStorage.getItem("compactLayout") === "true"
  );

  const [reminders, setReminders] = useState(
    () => localStorage.getItem("bookingReminders") !== "false"
  );

  const [confirmActions, setConfirmActions] = useState(
    () => localStorage.getItem("confirmActions") !== "false"
  );

  function savePreference(key, value) {
    localStorage.setItem(key, String(value));
  }

  return (
    <section className="panel smartlab-page-panel">
      <div className="eyebrow">PREFERENCES</div>

      <h2>System Settings</h2>

      <p className="smartlab-page-intro">
        Personalise your SmartLab workspace.
      </p>

      <div className="smartlab-settings-list">
        <div>
          <div>
            <b>Compact Layout</b>
            <span>Use a compact dashboard layout.</span>
          </div>

          <input
            type="checkbox"
            checked={compact}
            onChange={e => {
              setCompact(e.target.checked);
              savePreference("compactLayout", e.target.checked);
            }}
          />
        </div>

        <div>
          <div>
            <b>Booking Reminders</b>
            <span>Enable booking reminder preferences.</span>
          </div>

          <input
            type="checkbox"
            checked={reminders}
            onChange={e => {
              setReminders(e.target.checked);
              savePreference("bookingReminders", e.target.checked);
            }}
          />
        </div>

        <div>
          <div>
            <b>Confirm Important Actions</b>
            <span>Confirm before sensitive actions.</span>
          </div>

          <input
            type="checkbox"
            checked={confirmActions}
            onChange={e => {
              setConfirmActions(e.target.checked);
              savePreference("confirmActions", e.target.checked);
            }}
          />
        </div>
      </div>

      <div className="smartlab-note">
        Your preferences are saved in this browser.
      </div>

      <div className="smartlab-account-summary">
        <b>Current Account</b>
        <span>
          {user?.name} · {user?.role}
        </span>
      </div>
    </section>
  );
}

export default App;

import { useState } from "react";
import { UserRound, Mail, Building2, ShieldCheck, Save } from "lucide-react";
import API from "../api";
import "./Profile.css";

function Profile({ user, onUpdate }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: user?.department || "CSE"
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await API.put("/auth/profile", {
        name: form.name,
        department: form.department
      });

      const updatedUser = {
        ...user,
        ...res.data.user
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      onUpdate(updatedUser);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <span>ACCOUNT SETTINGS</span>
        <h1>My Profile</h1>
        <p>Manage your SmartLab account information.</p>
      </div>

      <div className="profile-card">
        <div className="profile-banner">
          <div className="profile-large-avatar">
            {form.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{form.name}</h2>
            <span>{user?.role || "Student"}</span>
          </div>
        </div>

        <form className="profile-form" onSubmit={saveProfile}>
          <label>
            <span><UserRound size={16} /> Full Name</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span><Mail size={16} /> Email Address</span>
            <input
              value={form.email}
              disabled
            />
          </label>

          <label>
            <span><Building2 size={16} /> Department</span>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
            >
              {["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>

          <div className="profile-role">
            <ShieldCheck size={19} />
            Account role: <b>{user?.role || "student"}</b>
          </div>

          {message && <p className="profile-message">{message}</p>}

          <button type="submit" disabled={loading}>
            <Save size={17} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;

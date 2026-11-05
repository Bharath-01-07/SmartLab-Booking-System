import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import API from "../api";
import "./ChangePassword.css";

function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (form.newPassword !== form.confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      setSuccess(true);
      setMessage(res.data.message);

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="password-heading">
        <span>ACCOUNT SECURITY</span>
        <h1>Change Password</h1>
        <p>Keep your SmartLab account secure.</p>
      </div>

      <form className="password-card" onSubmit={submitPassword}>
        <div className="password-icon">
          <ShieldCheck size={28} />
        </div>

        <h2>Update your password</h2>
        <p>Enter your current password and choose a new one.</p>

        {[
          ["currentPassword", "Current Password"],
          ["newPassword", "New Password"],
          ["confirmPassword", "Confirm New Password"]
        ].map(([name, label]) => (
          <label key={name}>
            {label}
            <div className="password-input">
              <Lock size={17} />
              <input
                type={show ? "text" : "password"}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={label}
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label="Toggle password visibility"
              >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>
        ))}

        <small>New password must contain at least 6 characters.</small>

        {message && (
          <div className={success ? "password-success" : "password-error"}>
            {message}
          </div>
        )}

        <button className="password-submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;

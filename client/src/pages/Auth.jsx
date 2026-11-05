
import { useState } from "react";
import {
  Eye,
  EyeOff,
  FlaskConical,
  GraduationCap,
  Users,
  ShieldCheck
} from "lucide-react";

import API from "../api";
import "./Auth.css";

function Auth({ onLogin }) {
  const [role, setRole] = useState("student");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "CSE"
  });

  const roles = [
    {
      id: "student",
      label: "Student",
      Icon: GraduationCap
    },
    {
      id: "faculty",
      label: "Faculty",
      Icon: Users
    },
    {
      id: "lab_incharge",
      label: "Lab Incharge",
      Icon: ShieldCheck
    }
  ];

  function update(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function chooseRole(nextRole) {
    setRole(nextRole);
    setIsLogin(true);
    setShowPassword(false);
    setMessage("");

    setForm({
      name: "",
      email: "",
      password: "",
      department: "CSE"
    });
  }

  function toggleAuthMode() {
    setIsLogin((prev) => !prev);
    setShowPassword(false);
    setMessage("");

    setForm((prev) => ({
      ...prev,
      name: "",
      password: ""
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const email = form.email.trim().toLowerCase();

    if (!email || !form.password) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (!isLogin) {
      if (role !== "student") {
        setMessage("Only students can register here.");
        return;
      }

      if (!form.name.trim()) {
        setMessage("Please enter your full name.");
        return;
      }

      if (form.password.length < 6) {
        setMessage("Password must contain at least 6 characters.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const res = await API.post("/auth/login", {
          email,
          password: form.password
        });

        const user = res.data.user;
        const token = res.data.token;

        if (!token || !user) {
          throw new Error("Invalid login response from server.");
        }

        if (user.role !== role) {
          throw new Error(
            `This account is not registered as ${
              roles.find((r) => r.id === role)?.label
            }.`
          );
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        onLogin(user);
      } else {
        await API.post("/auth/register", {
          name: form.name.trim(),
          email,
          password: form.password,
          department: form.department
        });

        setMessage(
          "Student registration successful! Please sign in."
        );

        setIsLogin(true);
        setShowPassword(false);

        setForm({
          name: "",
          email,
          password: "",
          department: "CSE"
        });
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        err.message ||
        "Unable to continue. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedRole = roles.find((r) => r.id === role);

  return (
    <div className="auth-page">

      {/* LEFT SECTION */}

      <div className="auth-left">

        <div className="auth-brand">
          <span className="auth-logo">
            <FlaskConical size={24} />
          </span>

          <span>SmartLab</span>
        </div>

        <div className="auth-content">

          <span className="auth-tag">
            CAMPUS LABORATORY PORTAL
          </span>

          <h1>
            Smarter spaces.
            <br />
            Better learning.
          </h1>

          <p>
            Discover laboratories, manage schedules and
            coordinate campus bookings from one workspace.
          </p>

          <div className="auth-features">
            <div>✓ Laboratory availability</div>
            <div>✓ Timetable management</div>
            <div>✓ Booking and approval workflow</div>
          </div>

        </div>

        <span className="auth-footer">
          SmartLab · Campus Workspace
        </span>

      </div>

      {/* RIGHT SECTION */}

      <div className="auth-right">

        <form
          className="auth-card"
          onSubmit={handleSubmit}
        >

          <span className="auth-welcome">
            SECURE CAMPUS ACCESS
          </span>

          <h2>
            {isLogin
              ? "Welcome to SmartLab"
              : "Create Student Account"}
          </h2>

          <p className="auth-subtitle">
            {isLogin
              ? "Select your account type and sign in."
              : "Register as a student to access SmartLab."}
          </p>

          {/* ROLE SELECTION */}

          <div className="auth-role-switch auth-role-three">

            {roles.map(({ id, label, Icon }) => (
              <button
                type="button"
                key={id}
                className={role === id ? "selected" : ""}
                onClick={() => chooseRole(id)}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}

          </div>

          {/* ROLE INFORMATION */}

          {role !== "student" && (
            <p className="auth-role-note">
              {role === "faculty"
                ? "Faculty accounts are created by the Lab Incharge."
                : "Authorised Lab Incharge account only."}
            </p>
          )}

          {/* STUDENT NAME */}

          {!isLogin && role === "student" && (
            <label>
              Full Name

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={update}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </label>
          )}

          {/* EMAIL */}

          <label>
            Email Address

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          {/* PASSWORD */}

          <label>
            Password

            <div className="auth-password-box">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={update}
                placeholder="Enter your password"
                autoComplete={
                  isLogin
                    ? "current-password"
                    : "new-password"
                }
                minLength={6}
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? <EyeOff size={17} />
                  : <Eye size={17} />}
              </button>

            </div>
          </label>

          {/* DEPARTMENT */}

          {!isLogin && role === "student" && (
            <label>
              Department

              <select
                name="department"
                value={form.department}
                onChange={update}
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
            </label>
          )}

          {/* MESSAGE */}

          {message && (
            <div
              className="auth-message"
              role="alert"
            >
              {message}
            </div>
          )}

          {/* SUBMIT BUTTON */}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? `Sign In as ${selectedRole.label}`
                : "Create Student Account"}
          </button>

          {/* REGISTER / LOGIN SWITCH */}

          {role === "student" && (
            <div className="auth-switch">

              {isLogin
                ? "New to SmartLab?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={toggleAuthMode}
              >
                {isLogin
                  ? " Register"
                  : " Sign in"}
              </button>

            </div>
          )}

        </form>

      </div>

    </div>
  );
}

export default Auth;

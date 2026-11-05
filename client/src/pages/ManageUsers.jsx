
import { useEffect, useState } from "react";
import { Search, RefreshCw, Users, ShieldCheck } from "lucide-react";
import API from "../api";
import "./ManageUsers.css";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await API.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Unable to load users. Check the backend route."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const changeRole = async (id, role) => {
    try {
      await API.patch(`/users/${id}/role`, { role });
      setMessage("User role updated successfully.");
      loadUsers();
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Unable to update user role."
      );
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.name} ${user.email} ${user.department}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="manage-users">
      <div className="users-header">
        <div>
          <span>ADMIN WORKSPACE</span>
          <h1>Manage Users</h1>
          <p>Manage student and faculty accounts.</p>
        </div>

        <button onClick={loadUsers}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <div className="user-stats">
        <div>
          <Users size={22} />
          <span>Total Users</span>
          <h2>{users.length}</h2>
        </div>

        <div>
          <Users size={22} />
          <span>Students</span>
          <h2>{users.filter(u => u.role === "student").length}</h2>
        </div>

        <div>
          <ShieldCheck size={22} />
          <span>Faculty</span>
          <h2>{users.filter(u => u.role === "faculty").length}</h2>
        </div>
      </div>

      <div className="users-toolbar">
        <Search size={18} />
        <input
          placeholder="Search by name, email or department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {message && <div className="users-message">{message}</div>}

      {loading ? (
        <p>Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <div className="users-empty">
          <Users size={35} />
          <h3>No users found</h3>
          <p>Registered accounts will appear here.</p>
        </div>
      ) : (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Department</th>
                <th>Role</th>
                <th>Change Role</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <b>{user.name}</b>
                    <small>{user.email}</small>
                  </td>

                  <td>{user.department || "CSE"}</td>

                  <td>
                    <span className={`role-label ${user.role}`}>
                      {user.role}
                    </span>
                  </td>

                  <td>
                    <select
                      value={user.role}
                      onChange={e => changeRole(user._id, e.target.value)}
                      disabled={user.role === "admin"}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;

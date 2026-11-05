
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, RefreshCw } from "lucide-react";
import API from "../api";
import "./ManageLabs.css";

const emptyLab = {
  name: "",
  labCode: "",
  location: "",
  capacity: "",
  labType: "",
  facilities: "",
  status: "Available"
};

function ManageLabs() {
  const [labs, setLabs] = useState([]);
  const [form, setForm] = useState(emptyLab);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLabs = async () => {
    try {
      const res = await API.get("/labs");
      setLabs(Array.isArray(res.data) ? res.data : res.data.labs || []);
    } catch (err) {
      setMessage("Unable to load laboratories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabs();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveLab = async (e) => {
    e.preventDefault();
    setMessage("");

    const data = {
      ...form,
      capacity: Number(form.capacity),
      facilities: form.facilities
        .split(",")
        .map(item => item.trim())
        .filter(Boolean)
    };

    try {
      if (editingId) {
        await API.put(`/labs/${editingId}`, data);
        setMessage("Laboratory updated successfully.");
      } else {
        await API.post("/labs", data);
        setMessage("Laboratory added successfully.");
      }

      setForm(emptyLab);
      setEditingId(null);
      setShowForm(false);
      loadLabs();
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Unable to save laboratory."
      );
    }
  };

  const editLab = (lab) => {
    setForm({
      ...lab,
      capacity: String(lab.capacity),
      facilities: (lab.facilities || []).join(", ")
    });
    setEditingId(lab._id);
    setShowForm(true);
  };

  const deleteLab = async (id) => {
    if (!window.confirm("Are you sure you want to delete this laboratory?")) {
      return;
    }

    try {
      await API.delete(`/labs/${id}`);
      setMessage("Laboratory deleted successfully.");
      loadLabs();
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Unable to delete laboratory."
      );
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyLab);
  };

  return (
    <div className="manage-labs">
      <div className="manage-labs-header">
        <div>
          <span>ADMIN WORKSPACE</span>
          <h1>Laboratory Management</h1>
          <p>Add and manage campus laboratory resources.</p>
        </div>

        <div className="manage-labs-actions">
          <button onClick={loadLabs}>
            <RefreshCw size={16} /> Refresh
          </button>

          <button className="add-lab-btn" onClick={() => {
            setForm(emptyLab);
            setEditingId(null);
            setShowForm(true);
          }}>
            <Plus size={17} /> Add Laboratory
          </button>
        </div>
      </div>

      {message && <div className="lab-message">{message}</div>}

      <div className="manage-lab-stats">
        <div>
          <span>Total Laboratories</span>
          <h2>{labs.length}</h2>
        </div>
        <div>
          <span>Available</span>
          <h2>{labs.filter(l => l.status === "Available").length}</h2>
        </div>
        <div>
          <span>Unavailable</span>
          <h2>{labs.filter(l => l.status !== "Available").length}</h2>
        </div>
      </div>

      {showForm && (
        <div className="lab-form-overlay">
          <form className="lab-form" onSubmit={saveLab}>
            <div className="lab-form-heading">
              <h2>{editingId ? "Edit Laboratory" : "Add Laboratory"}</h2>
              <button type="button" onClick={closeForm}>
                <X size={20} />
              </button>
            </div>

            <label>Laboratory Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>

            <label>Lab Code
              <input name="labCode" value={form.labCode} onChange={handleChange} required />
            </label>

            <label>Location
              <input name="location" value={form.location} onChange={handleChange} required />
            </label>

            <label>Capacity
              <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required />
            </label>

            <label>Lab Type
              <input name="labType" value={form.labType} onChange={handleChange} required />
            </label>

            <label>Facilities (comma separated)
              <input
                name="facilities"
                value={form.facilities}
                onChange={handleChange}
                placeholder="Computers, Projector, Wi-Fi"
              />
            </label>

            <label>Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Available</option>
                <option>Unavailable</option>
              </select>
            </label>

            <button className="save-lab-btn" type="submit">
              {editingId ? "Update Laboratory" : "Save Laboratory"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading laboratories...</p>
      ) : (
        <div className="manage-lab-grid">
          {labs.map(lab => (
            <div className="manage-lab-card" key={lab._id}>
              <div className="manage-lab-top">
                <div>
                  <h3>{lab.name}</h3>
                  <span>{lab.labCode}</span>
                </div>
                <span className={`manage-lab-status ${
                  lab.status === "Available" ? "available" : "unavailable"
                }`}>
                  {lab.status}
                </span>
              </div>

              <p>Location: {lab.location}</p>
              <p>Capacity: {lab.capacity}</p>
              <p>Type: {lab.labType}</p>
              <p>Facilities: {(lab.facilities || []).join(", ") || "—"}</p>

              <div className="manage-lab-buttons">
                <button onClick={() => editLab(lab)}>
                  <Pencil size={15} /> Edit
                </button>
                <button className="delete-lab-btn" onClick={() => deleteLab(lab._id)}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageLabs;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import api from "../api/api";
import { useUser } from "../context/UserContext";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;
  const changePassword = async () => {
    try {
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword
      });

      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to update password"
      );
    }
  };

  /* =========================
     DELETE ACCOUNT
  ========================= */
  const deleteAccount = async () => {
    if (deleting) return;

    const confirmDelete = window.confirm(
      "Your account will be scheduled for deletion and permanently removed after 30 days. You can restore it by logging in again. Continue?"
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);

      // ⚠️ Change this if your backend is mounted under /auth
      await api.delete("/auth/delete-account");

      alert("Account scheduled for deletion");
      logout();
      navigate("/");
    } catch (err) {
      setDeleting(false);
      alert(
        err.response?.data?.message || "Failed to delete account"
      );
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <h2>👤 Profile</h2>

        {/* USER INFO */}
        <section>
          <h4>You</h4>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </section>

        <section>
          <h4>Your Partner</h4>
          {user.partnerJoined ? (
            <p><strong>Name:</strong> {user.partnerName}</p>
          ) : (
            <p>No partner yet</p>
          )}
        </section>

        <section>
          <h4>Change Password</h4>

          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button onClick={changePassword}>
            Update Password
          </button>

          {message && <p className="message">{message}</p>}
        </section>
        <section className="danger">
          <button onClick={logout}>
            Logout
          </button>

          <button
            className="delete"
            onClick={deleteAccount}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </section>
      </div>
    </div>
  );
}

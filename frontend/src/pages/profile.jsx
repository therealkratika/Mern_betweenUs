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

  if (!user) return null;

  /* =========================
     CHANGE PASSWORD
  ========================= */
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
    const confirmDelete = window.confirm(
      "This will permanently delete your account and shared space. Continue?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete("/auth/delete-account");
      logout();
      navigate("/");
    } catch (err) {
      alert("Failed to delete account");
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <h2>👤 Profile</h2>

        {/* YOU */}
        <section>
          <h4>You</h4>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </section>

        {/* PARTNER */}
        <section>
          <h4>Your Partner</h4>
          {user.partnerJoined ? (
            <p><strong>Name:</strong> {user.partnerName}</p>
          ) : (
            <p>No partner yet</p>
          )}
        </section>

        {/* CHANGE PASSWORD */}
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
        </section>

        {message && <p className="message">{message}</p>}

        {/* ACTIONS */}
        <section className="danger">
          <button onClick={logout}>Logout</button>

          <button className="delete" onClick={deleteAccount}>
            Delete Account
          </button>
        </section>
      </div>
    </div>
  );
}

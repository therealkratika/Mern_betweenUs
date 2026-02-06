import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post(`/auth/reset-password/${token}`, { password });
    setMsg("Password reset successfully");

    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div className="auth-wrapper">
      <h2>Set New Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Update Password</button>
      </form>

      {msg && <p className="success">{msg}</p>}
    </div>
  );
}

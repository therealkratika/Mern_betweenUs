import { useState } from "react";
import api from "../api/api";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/auth/forgot-password", { email });
    setMsg(res.data.message);
  };

  return (
    <div className="auth-wrapper">
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Send Reset Link</button>
      </form>

      {msg && <p className="success">{msg}</p>}
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import "./Login.css";
import api from "../api/api";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Login user
      await onLogin(email, password);

      // 2️⃣ Accept invite IF coming from invite link
      if (inviteToken) {
        await api.post(`/spaces/accept/${inviteToken}`);
      }

      // 3️⃣ Go to shared timeline
      navigate("/timeline", { replace: true });

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Invalid email or password"
      );
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome back</h2>
          <p>
            {inviteToken
              ? "Sign in to join your shared space"
              : "Sign in to your private space"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <p
            className="forgot-link"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </p>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="switch-text">
          Don’t have an account?{" "}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

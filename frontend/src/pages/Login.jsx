import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { loginUser, signInWithGoogle } from "../api/auth";
import api from "../api/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     EMAIL / PASSWORD LOGIN
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);

      if (inviteToken) {
        await api.post(`/spaces/accept/${inviteToken}`);
      }

      navigate("/timeline", { replace: true });
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GOOGLE LOGIN / SIGNUP
  ========================= */
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();

      if (inviteToken) {
        await api.post(`/spaces/accept/${inviteToken}`);
      }

      navigate("/timeline", { replace: true });
    } catch (err) {
      setError("Google sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

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

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Continue with Google
          </button>
        </form>

        <p className="switch-text">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { forgotPassword } from "../api/auth";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMsg("");
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(trimmedEmail);
      setMsg("If this email exists, a reset link has been sent.");
    } catch (err) {
      console.error("FORGOT PASSWORD ERROR", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
          autoComplete="email"
          disabled={loading || !!msg}
        />

        <button
          type="submit"
          disabled={loading || !!msg || !email.trim()}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <p className="link" onClick={() => navigate("/login")}>
          Go to Sign in
        </p>
      </form>

      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
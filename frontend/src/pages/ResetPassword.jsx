import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  confirmPasswordReset,
  verifyPasswordResetCode
} from "firebase/auth";
import { auth } from "../firebase";
import "./Auth.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 Guard against invalid link
  useEffect(() => {
    if (!oobCode) {
      setError("Invalid or missing reset link");
    }
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!oobCode) {
      setError("Invalid reset link");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // 🔍 Verify reset code
      await verifyPasswordResetCode(auth, oobCode);

      // 🔁 Set new password
      await confirmPasswordReset(auth, oobCode, password);

      setMsg("Password reset successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("RESET ERROR ❌", err);
      setError("Invalid or expired reset link");
    } finally {
      setLoading(false);
    }
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
          autoComplete="new-password"
        />

        <button type="submit" disabled={loading || !!msg}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

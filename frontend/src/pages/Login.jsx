import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { loginUser, signInWithGoogle, getGoogleRedirectResult } from "../api/auth";
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
     HANDLE GOOGLE REDIRECT RESULT
  ========================= */
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getGoogleRedirectResult();
        if (!result?.user) return;

        if (inviteToken) {
          await api.post(`/spaces/accept/${inviteToken}`);
        }
navigate("/timeline", { replace: true });

      } catch {
        setError("Google sign-in failed. Try again.");
      }
    };

    handleRedirect();
  }, [inviteToken, navigate]);

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

    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GOOGLE LOGIN
  ========================= */
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle(); 
      navigate("/timeline", { replace: true });

    } catch {
      setError("Google sign-in failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Welcome back</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Continue with Google
          </button>
        </form>

        <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}

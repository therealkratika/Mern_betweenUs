import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, getGoogleRedirectResult, googlePopup} from "../api/auth";
import "./Login.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /* =========================
     HANDLE GOOGLE REDIRECT
  ========================= */
  useEffect(() => {
    let mounted = true;

    const handleRedirect = async () => {
      try {
        const result = await getGoogleRedirectResult();
        if (!result?.user) return;

        if (mounted) {
          navigate("/login", { replace: true });

        }
      } catch (err) {
        if (mounted) {
          console.error(err);
          setError("Google sign-in failed");
        }
      }
    };

    handleRedirect();
    return () => (mounted = false);
  }, [navigate]);
/* =========================
    GOOGLE SIGNUP (HYBRID)
========================= */
const handleGoogleLogin = async () => {
  setError("");
  setLoading(true);

  try {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      await googleRedirect();
    } else {
      // Desktop: Use Popup for a better user experience
      const result = await googlePopup();
      if (result.user) {
        // Since there's no redirect, we handle the navigation immediately
        navigate("/login", { replace: true });
      }
    }
  } catch (err) {
    console.error(err);
    setError("Google sign-in failed. Try again.");
    setLoading(false);
  }
};
  /* =========================
     EMAIL SIGNUP
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(name, email, password);
      navigate("/login", { replace: true });

    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Begin your journey</h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Continue with Google
          </button>
        </form>

        <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import api from "../api/api";
import "./InviteSignup.css";

export default function InviteSignup() {
  const { token } = useParams(); // ✅ FIXED
  const navigate = useNavigate();
  const { login } = useUser();

  const [step, setStep] = useState("invite");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     VALIDATION
  ========================= */
  const validate = () => {
    if (!name || !email || !password) return "All fields required";
    if (password.length < 6)
      return "Password must be at least 6 characters";
    if (password !== confirmPassword)
      return "Passwords do not match";
    return null;
  };

  /* =========================
     NEW USER FLOW
  ========================= */
  const handleCreateAccount = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1️⃣ Register
      const registerRes = await api.post("/auth/register", {
        name,
        email,
        password
      });

      const authToken = registerRes.data.token;
      localStorage.setItem("token", authToken);

      // 2️⃣ Accept invite
      const acceptRes = await api.post(`/spaces/accept/${token}`);

      // 3️⃣ Login with final state
      login({
        token: authToken,
        user: {
          ...registerRes.data.user,
          spaceId: acceptRes.data.spaceId,
          partnerJoined: true
        }
      });

      // 4️⃣ Go to shared timeline
      navigate("/timeline", { replace: true });

    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to join space"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     EXISTING USER FLOW
  ========================= */
  const goToLogin = () => {
    // pass invite token to login page
    navigate(`/login?invite=${token}`);
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="invite-signup-wrapper">
      <div className="invite-card">
        {step === "invite" ? (
          <>
            <h2>You’ve been invited 💜</h2>
            <p>You’re about to join a private shared space.</p>

            <button
              className="primary-btn"
              onClick={() => setStep("signup")}
            >
              Create New Account
            </button>

            <button
              className="secondary-btn"
              onClick={goToLogin}
            >
              I already have an account
            </button>

            <button
              className="link-btn"
              onClick={() => navigate("/", { replace: true })}
            >
              Decline
            </button>
          </>
        ) : (
          <>
            <h2>Create your account</h2>

            <input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="error">{error}</p>}

            <button
              className="primary-btn"
              onClick={handleCreateAccount}
              disabled={loading}
            >
              {loading ? "Joining..." : "Join Space"}
            </button>

            <p className="switch-text">
              Already have an account?{" "}
              <span onClick={goToLogin}>Sign in</span>
            </p>

            <button
              className="secondary-btn"
              onClick={() => setStep("invite")}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

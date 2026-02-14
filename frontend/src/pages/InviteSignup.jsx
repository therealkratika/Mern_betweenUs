import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import { auth } from "../firebase";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";

import "./InviteSignup.css";

export default function InviteSignup() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState("invite");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  /* ---------------- EMAIL SIGNUP ---------------- */
  const handleCreateAccount = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setError("");

      const userCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, {
        displayName: name
      });

      const tokenId = await userCredential.user.getIdToken();

      await api.post(`/spaces/accept/${token}`, {}, {
        headers: { Authorization: `Bearer ${tokenId}` }
      });

      navigate("/timeline", { replace: true });

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to join space");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GOOGLE SIGNUP (MOBILE SAFE) ---------------- */
  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError("");

      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);

    } catch (err) {
      console.error(err);
      setError("Google signup failed");
      setLoading(false);
    }
  };

  /* ---------------- HANDLE REDIRECT RESULT ---------------- */
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result) return;

        const firebaseUser = result.user;

        if (!firebaseUser.displayName) {
          await updateProfile(firebaseUser, { displayName: "User" });
        }

        const tokenId = await firebaseUser.getIdToken();

        await api.post(`/spaces/accept/${token}`, {}, {
          headers: { Authorization: `Bearer ${tokenId}` }
        });

        navigate("/timeline", { replace: true });

      } catch (err) {
        console.error(err);
        setError("Google signup failed");
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, [navigate, token]);

  /* ---------------- LOGIN REDIRECT ---------------- */
  const goToLogin = () => {
    navigate(`/login?invite=${token}`);
  };

  /* ---------------- UI ---------------- */
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

            <button
              className="google-btn"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              Continue with Google
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

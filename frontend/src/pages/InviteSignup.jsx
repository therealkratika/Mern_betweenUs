import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import { useUser } from "../context/UserContext";
import { auth } from "../firebase";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
    signInWithPopup
} from "firebase/auth";

import "./InviteSignup.css";

export default function InviteSignup() {
 const { token } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useUser();

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

  const handleCreateAccount = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      setError("");

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      const tokenId = await userCredential.user.getIdToken();

      // Accept the space
      await api.post(`/spaces/accept/${token}`, {}, {
        headers: { Authorization: `Bearer ${tokenId}` }
      });

      // 3. CRITICAL: Update the Global Context so spaceId is recognized
      await refreshUser(); 

      navigate("/timeline", { replace: true });
    }catch (err) {
      console.error(err);
      setError(err.message || "Failed to join space");
    } finally {
      setLoading(false);
    }
  };
const handleGoogleSignup = async () => {
  setError("");
  setLoading(true);

  try {
    const provider = new GoogleAuthProvider();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: Uses redirect (standard for mobile browsers)
      await signInWithRedirect(auth, provider);
    } else {
      // Desktop: Uses popup (better UX)
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        // If this is InviteSignup, call your acceptance logic here
        await handleSuccessfulAuth(result.user);
      }
    }
  } catch (err) {
    setError("Google login failed");
    setLoading(false);
  }
};
const handleSuccessfulAuth = async (firebaseUser) => {
  try {
    const tokenId = await firebaseUser.getIdToken();
    
    // Pass the token DIRECTLY in the headers to avoid 401
    await api.post(`/spaces/accept/${token}`, {}, {
      headers: { Authorization: `Bearer ${tokenId}` }
    });

    // Now sync the context
    await refreshUser(); 
    navigate("/timeline", { replace: true });
  } catch (err) {
    console.error("Join Error:", err);
    setError(err.response?.data?.message || "Failed to join space");
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

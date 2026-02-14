import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
// 1. IMPORT YOUR AUTH INSTANCE
import { auth } from "../firebase"; 
// 2. IMPORT THE FIREBASE METHOD
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider,signInWithPopup } from "firebase/auth"; 
import "./InviteSignup.css";

export default function InviteSignup() {
  const { token } = useParams(); // ✅ FIXED
  const navigate = useNavigate();

  const [step, setStep] = useState("invite");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const handleGoogleSignup = async () => {
  try {
    setLoading(true);
    setError("");

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const firebaseUser = result.user;

    // Ensure displayName exists (important for backend)
    if (!firebaseUser.displayName) {
      await updateProfile(firebaseUser, { displayName: "User" });
    }

    const tokenId = await firebaseUser.getIdToken();

    // Accept invite
    await api.post(`/spaces/accept/${token}`, {}, {
      headers: { Authorization: `Bearer ${tokenId}` }
    });

    navigate("/timeline", { replace: true });

  } catch (err) {
    console.error(err);
    setError("Google signup failed. Try again.");
  } finally {
    setLoading(false);
  }
};


  const handleCreateAccount = async () => {
    const validationError = validate();
    if (validationError) return setError(validationError);

    try {
      setLoading(true);
      setError("");

      // 3. ACTUAL FIREBASE CREATION
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the Firebase profile so 'name' isn't null in your backend
      await updateProfile(userCredential.user, { displayName: name });

      // 4. GET TOKEN (Using the user object directly is safer)
      const tokenId = await userCredential.user.getIdToken();

      // 5. ACCEPT INVITE
      await api.post(`/spaces/accept/${token}`, {}, {
        headers: { Authorization: `Bearer ${tokenId}` }
      });

      // Navigate
      navigate("/timeline", { replace: true });

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to join space");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    // pass invite token to login page
    navigate(`/login?invite=${token}`);
  };
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

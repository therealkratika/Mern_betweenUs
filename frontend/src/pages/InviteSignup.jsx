import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../api/api";
import { useUser } from "../context/UserContext";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import "./InviteSignup.css";

export default function InviteSignup() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const [step, setStep] = useState("invite");

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleSuccessfulAuth = async (firebaseUser) => {
    const tokenId = await firebaseUser.getIdToken();

    await api.post(
      `/spaces/accept/${token}`,
      {},
      { headers: { Authorization: `Bearer ${tokenId}` } }
    );

    await refreshUser();
    navigate("/timeline", { replace: true });
  };
  const onSubmit = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await updateProfile(userCredential.user, {
        displayName: data.name,
      });

      await handleSuccessfulAuth(userCredential.user);
    } catch (err) {
      console.error(err);
      setError("root", {
        message: err.message || "Failed to join space",
      });
    }
  };
  const goToLogin = () => {
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

            <button className="secondary-btn" onClick={goToLogin}>
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

            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                placeholder="Your name"
                {...register("name", {
                  required: "Name is required",
                })}
              />
              {errors.name && (
                <p className="error">{errors.name.message}</p>
              )}

              <input
                placeholder="Email"
                {...register("email", {
                  required: "Email is required",
                })}
              />
              {errors.email && (
                <p className="error">{errors.email.message}</p>
              )}

              <input
                type="password"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="error">{errors.password.message}</p>
              )}

              <input
                type="password"
                placeholder="Confirm password"
                {...register("confirmPassword", {
                  validate: (value) =>
                    value === getValues("password") ||
                    "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="error">
                  {errors.confirmPassword.message}
                </p>
              )}

              {errors.root && (
                <p className="error">{errors.root.message}</p>
              )}

              <button
                className="primary-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Joining..." : "Join Space"}
              </button>
            </form>

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
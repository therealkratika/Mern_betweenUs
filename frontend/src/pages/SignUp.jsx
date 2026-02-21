
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  registerUser
} from "../api/auth";
import "./Login.css";

export default function Signup() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data.name, data.email, data.password);
      navigate("/login", { replace: true });
    } catch (err) {
      setError("root", {
        message: err.message || "Signup failed",
      });
    }
  };


  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Begin your journey</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            placeholder="Name"
            {...register("name", {
              required: "Name is required",
            })}
          />
          {errors.name && (
            <p className="auth-error">{errors.name.message}</p>
          )}

          <input
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
            })}
          />
          {errors.email && (
            <p className="auth-error">{errors.email.message}</p>
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
            <p className="auth-error">{errors.password.message}</p>
          )}

          {/* Global / backend error */}
          {errors.root && (
            <p className="auth-error">{errors.root.message}</p>
          )}

          <button disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
}
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  loginUser,
} from "../api/auth";
import api from "../api/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await loginUser(data.email, data.password);

      if (inviteToken) {
        await api.post(`/spaces/accept/${inviteToken}`);
      }

      navigate("/timeline", { replace: true });
    } catch {
      setError("root", {
        message: "Invalid email or password",
      });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Welcome back</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="email"
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
            })}
          />
          {errors.password && (
            <p className="auth-error">{errors.password.message}</p>
          )}

          {/* Backend / global error */}
          {errors.root && (
            <p className="auth-error">{errors.root.message}</p>
          )}

          <button disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}
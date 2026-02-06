import { useNavigate } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Background blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      <div className="landing-content fade-up">
        {/* Logo */}
        <div className="logo pop-in">
          ❤️
        </div>

        {/* Heading */}
        <h1 className="title">
          <span className="gradient-text">Some memories</span>
          <span className="subtitle">are meant for only two hearts.</span>
        </h1>

        {/* Description */}
        <p className="description">
          A private space to collect and cherish moments with the one person
          who matters most.
        </p>

        {/* CTA buttons */}
        <div className="cta-group">
          <button
            className="primary-btn"
            onClick={() => navigate("/signup")}
          >
            Create My Space
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </div>

        <p className="tagline">
          One space. Two people. Forever.
        </p>
      </div>
    </div>
  );
}

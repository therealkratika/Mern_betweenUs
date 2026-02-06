import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { createSpace } from "../api/spaces";
import "./createSpace.css";

export default function CreateSpace() {
  const navigate = useNavigate();
  const { user, login } = useUser();
  const [loading, setLoading] = useState(false);

  const handleCreateSpace = async () => {


    try {
      setLoading(true);

      const data = await createSpace();
      login({
        token: localStorage.getItem("token"),
        user: {
          ...user,
          spaceId: data.spaceId,
          partnerJoined: false
        }
      });

      navigate("/invite");

    } catch (err) {
      alert(
        err?.response?.data?.message ||
        "Failed to create space"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-wrapper">
      <div className="space-blob blob-a"></div>
      <div className="space-blob blob-b"></div>

      <div className="space-card fade-scale">
        <div className="heart-wrapper pop-in">
          <div className="heart-circle">❤️</div>
          <span className="sparkle">✨</span>
        </div>

        <h1 className="space-title">Create Your Space</h1>

      
        <div className="space-text">
          <p className="highlight">
            You can create <span>only one space</span>.
          </p>
          <p className="description">
            This is your private sanctuary to share memories with one special
            person. Choose wisely — this decision is permanent.
          </p>
        </div>

        <div className="steps">
          <h3>What happens next?</h3>
          <ul>
            <li><span>1</span>Your private space will be created</li>
            <li><span>2</span>You’ll invite one person to join</li>
            <li><span>3</span>Once accepted, the space locks forever</li>
            <li><span>4</span>Start collecting memories together</li>
          </ul>
        </div>

        <button
          className="primary-btn"
          onClick={handleCreateSpace}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create My Space"}
        </button>

        <p className="note">
          This is a sacred moment. Take your time.
        </p>
      </div>
    </div>
  );
}

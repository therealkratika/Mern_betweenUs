import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import api from "../api/api";
import "./InvitationAcceptance.css";

export default function InvitationAcceptance() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, login } = useUser();

  const inviterName = "Your Partner"; // later fetch from backend if you want

  const handleAccept = async () => {
    try {
      // ✅ If already logged in → accept directly
      if (user) {
        const res = await api.post(`/spaces/accept/${token}`);

        login({
          token: localStorage.getItem("token"),
          user: {
            ...user,
            partnerJoined: true
          }
        });

        navigate("/timeline", { replace: true });
        return;
      }

      // ❌ Not logged in → go to invite signup
      navigate(`/invite/${token}/signup`);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Failed to accept invitation"
      );
    }
  };

  const handleDecline = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="invite-accept-wrapper">
      <div className="invite-card">
        <div className="invite-icon">❤️</div>

        <h2>You’ve been invited</h2>

        <p className="invite-text">
          <span>{inviterName}</span> has invited you into their private space —
          a place for shared memories, just the two of you.
        </p>

        <div className="invite-info">
          <p>By accepting:</p>
          <ul>
            <li>🔒 Space locks forever</li>
            <li>👫 Only two people</li>
            <li>🕊 Completely private</li>
          </ul>
        </div>

        <div className="invite-actions">
          <button className="secondary-btn" onClick={handleDecline}>
            Decline
          </button>

          <button className="primary-btn" onClick={handleAccept}>
            Accept Invitation
          </button>
        </div>
      </div>
    </div>
  );
}

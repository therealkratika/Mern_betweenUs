import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendInvite } from "../api/spaces";
import "./InvitePartner.css";

export default function InvitePartner() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSendClick = () => {
    if (!email) return;
    setConfirm(true);
  };

  const handleConfirmInvite = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ send email correctly
      await sendInvite(email);

      setSent(true);
      setLoading(false);

      // ✅ go to waiting page
      navigate("/waiting", { replace: true });

    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to send invitation"
      );
      setLoading(false);
    }
  };

  return (
    <div className="invite-wrapper">
      <div className="invite-card fade-up">
        <div className="invite-header pop-in">
          <div className="invite-icon">✉️</div>
          <h1>Invite Your Person</h1>
          <p>Choose the one person you want to share this space with</p>
        </div>

        <div className="warning-box">
          <h3>Important</h3>
          <p>
            You can invite <strong>only one person</strong>. Once they accept,
            this space will be locked forever.
          </p>
        </div>

        {sent ? (
          <div className="success-box fade-scale">
            <h3>Invitation Sent 💌</h3>
            <p>
              We’ve sent an invitation to:
              <br />
              <strong>{email}</strong>
            </p>
            <p className="small-text">
              Waiting for your partner to accept…
            </p>
          </div>
        ) : !confirm ? (
          <>
            <div className="field">
              <label>Partner’s Email Address</label>
              <input
                type="email"
                placeholder="their@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              className="primary-btn"
              onClick={handleSendClick}
              disabled={!email}
            >
              Send Invitation
            </button>
          </>
        ) : (
          <>
            <div className="confirm-box fade-scale">
              <h3>Are you absolutely sure?</h3>
              <p>You’re about to invite:</p>
              <span className="invite-email">{email}</span>
              <p className="small-text">
                This action is permanent and cannot be undone.
              </p>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="confirm-actions">
              <button
                className="secondary-btn"
                onClick={() => setConfirm(false)}
              >
                Go Back
              </button>
              <button
                className="primary-btn"
                onClick={handleConfirmInvite}
                disabled={loading}
              >
                {loading ? "Sending..." : "Yes, Send Invitation"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

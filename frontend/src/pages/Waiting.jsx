import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSpaceStatus, resendInvite, cancelInvite } from "../api/spaces";
import "./Waiting.css";

export default function Waiting() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD SPACE STATE ================= */
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await getSpaceStatus();

        if (status.state === "NO_SPACE") return navigate("/create-space");
        if (status.state === "NO_INVITE") return navigate("/invite");
        if (status.state === "PARTNER_JOINED") return navigate("/timeline");

        if (status.state === "INVITE_SENT") {
          setEmail(status.inviteEmail);
          setInviteLink(status.inviteLink);
          setLoading(false);
        }
      } catch {
        navigate("/login");
      }
    };

    loadStatus();
  }, [navigate]);

  if (loading) return null;

  /* ================= ACTIONS ================= */
  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResend = async () => {
    await resendInvite();
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  const handleCancel = async () => {
    await cancelInvite();
    navigate("/invite");
  };

  /* ================= UI ================= */
  return (
    <div className="waiting-wrapper">
      <div className="waiting-card">
        {/* ICON */}
        <div className="waiting-icon">
          ❤️
          <span className="mail-badge">✉️</span>
        </div>

        <h2>Invitation Sent</h2>

        <p className="subtitle">
          We’ve sent an invitation to <strong>{email}</strong>
        </p>

        <p className="muted">
          Waiting for them to accept and join your shared space…
        </p>

        {/* STATUS */}
        <div className="status-box">
          <p>✅ Email sent successfully</p>
          <p className="pulse">⏳ Waiting for acceptance</p>
        </div>

        {/* LINK */}
        <div className="link-box">
          <input value={inviteLink} readOnly />
          <button onClick={handleCopy}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>

        {/* ACTIONS */}
        <button
          className="outline-btn"
          onClick={handleResend}
          disabled={resent}
        >
          {resent ? "Invitation Resent ✓" : "Resend Invitation"}
        </button>

        <button className="ghost-btn" onClick={handleCancel}>
          ← Cancel Invitation
        </button>

        <p className="footer-text">
          Once your partner accepts, this space will be locked forever for just the two of you.
        </p>
      </div>
    </div>
  );
}

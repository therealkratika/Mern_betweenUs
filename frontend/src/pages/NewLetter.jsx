import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Letters.css";
import { createLetter } from "../api/letters";

export default function NewLetter() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !unlockDate) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createLetter({
        title,
        content,
        unlockDate
      });

      navigate("/letters");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
        "Failed to save letter"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="letters-wrapper">
      <div className="letter-card">
        <h2 className="letter-title">✍️ Write a Letter</h2>
        <p className="letter-subtitle">
          This letter will unlock on a future date 💌
        </p>

        <form onSubmit={handleSubmit} className="letter-form">
          <input
            type="text"
            placeholder="Letter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Write from your heart…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <label className="date-label">
            Unlock date
          </label>
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={unlockDate}
            onChange={(e) => setUnlockDate(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <div className="letter-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/letters")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading ? "Saving…" : "Save Letter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

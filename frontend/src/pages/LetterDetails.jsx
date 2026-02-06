import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LetterDetail.css";
import { getLetterById } from "../api/letters";

export default function LetterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [letter, setLetter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLetterById(id)
      .then(setLetter)
      .catch(() =>
        setError("This letter is still locked or unavailable")
      );
  }, [id]);

  if (error) {
    return (
      <div className="letter-error">
        <p>{error}</p>
        <button onClick={() => navigate("/letters")}>Go back</button>
      </div>
    );
  }

  if (!letter) return <div className="loading">Opening letter…</div>;

  const unlockDate = new Date(letter.unlockDate);
  const daysAgo = Math.floor(
    (Date.now() - unlockDate.getTime()) / 86400000
  );

  return (
    <div className="letter-detail-wrapper">
      <div className="letter-card">
        <button className="close-btn" onClick={() => navigate("/letters")}>
          ✖
        </button>

        <h2 className="letter-title">{letter.title}</h2>

        <p className="letter-meta">
          Unlocked on {unlockDate.toDateString()}
          {daysAgo >= 0 && ` • ${daysAgo} days ago`}
        </p>

        <div className="divider" />

        <div className="letter-content">{letter.content}</div>

        <div className="signature">
          <p>With love,</p>
          <span>From your shared space ❤️</span>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Letters.css";

import { getLetters } from "../api/letters";

export default function Letters() {
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    getLetters().then(setLetters);
  }, []);

  return (
    <div className="letters-wrapper">
      <div className="letters-header">
        <h2>💌 Time-Locked Letters</h2>
        <button onClick={() => navigate("/letters/new")}>✍️</button>
      </div>

      {letters.length === 0 ? (
        <p className="empty">No letters yet</p>
      ) : (
        letters.map((l) => (
          <div
            key={l.id}
            className={`letter-card ${l.isUnlocked ? "open" : "locked"}`}
            onClick={() =>
              l.isUnlocked && navigate(`/letters/${l.id}`)
            }
          >
            <h4>{l.title}</h4>
            <p>
              {l.isUnlocked
                ? "Unlocked • Tap to read"
                : `Unlocks on ${new Date(l.unlockDate).toDateString()}`}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

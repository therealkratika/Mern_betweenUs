import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DayDetails.css";

import {
  getMemoryById,
  reactToMemory,
  deleteMemory
} from "../api/memories";
import { useUser } from "../context/UserContext";

const EMOTION_MAP = {
  love: "❤️",
  joy: "✨",
  peaceful: "🌸",
  together: "🫂",
  nostalgic: "💭"
};

export default function DayDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [memory, setMemory] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reactionEmojis = ["❤️", "🌸", "🫂", "✨", "💫"];

  /* =========================
     LOAD MEMORY
  ========================= */
  useEffect(() => {
    const loadMemory = async () => {
      try {
        const data = await getMemoryById(id);

        setMemory({
          date: data.date,
          caption: data.caption || "",
          emotion: data.emotion,
          photos: data.photos?.map((p) => p.url) || [],
          reactions: data.reactions || []
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load memory");
      } finally {
        setLoading(false);
      }
    };

    loadMemory();
  }, [id]);

  /* =========================
     PHOTO NAVIGATION
  ========================= */
  const nextPhoto = () => {
    if (!memory?.photos.length) return;
    setCurrentPhotoIndex(
      (i) => (i + 1) % memory.photos.length
    );
  };

  const prevPhoto = () => {
    if (!memory?.photos.length) return;
    setCurrentPhotoIndex(
      (i) => (i - 1 + memory.photos.length) % memory.photos.length
    );
  };

  /* =========================
     REACTIONS (TOGGLE)
  ========================= */
  const userReacted = (emoji) =>
    memory.reactions.some(
      (r) => r.emoji === emoji && r.userId === user.id
    );

  const reactionCount = (emoji) =>
    memory.reactions.filter((r) => r.emoji === emoji).length;

  const handleReact = async (emoji) => {
    try {
      const res = await reactToMemory(id, emoji);
      setMemory((prev) => ({
        ...prev,
        reactions: res.reactions
      }));
    } catch (err) {
      console.error("Reaction failed", err);
    }
  };

  /* =========================
     DELETE MEMORY (NEW)
  ========================= */
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this memory?\nThis action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await deleteMemory(id);
      navigate("/timeline", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Failed to delete memory");
    }
  };

  if (loading) return <div className="status">Loading memory…</div>;
  if (error) return <div className="status error">{error}</div>;
  if (!memory) return null;

  return (
    <div className="daydetail-overlay">
      <div className="daydetail-container">
        {/* HEADER */}
        <div className="daydetail-header">
          <div>
            <p className="daydetail-date">
              {new Date(memory.date).toDateString()}
            </p>
            <span className="daydetail-emotion">
              {EMOTION_MAP[memory.emotion] || "💭"}
            </span>
          </div>

          <div className="header-actions">
            <button
              className="delete-btn"
              title="Delete memory"
              onClick={handleDelete}
            >
              🗑
            </button>

            <button
              className="close-btn"
              title="Close"
              onClick={() => navigate("/timeline")}
            >
              ✖
            </button>
          </div>
        </div>

        {/* GALLERY */}
        <div className="gallery">
          {memory.photos.length > 0 ? (
            <img
              src={memory.photos[currentPhotoIndex]}
              alt="memory"
            />
          ) : (
            <div className="image-placeholder">📷</div>
          )}

          {memory.photos.length > 1 && (
            <>
              <button className="nav-btn left" onClick={prevPhoto}>
                ‹
              </button>
              <button className="nav-btn right" onClick={nextPhoto}>
                ›
              </button>

              <div className="photo-count">
                {currentPhotoIndex + 1} / {memory.photos.length}
              </div>
            </>
          )}
        </div>

        {/* THUMBNAILS */}
        {memory.photos.length > 1 && (
          <div className="thumbnails">
            {memory.photos.map((photo, index) => (
              <button
                key={index}
                className={
                  index === currentPhotoIndex
                    ? "thumb active"
                    : "thumb"
                }
                onClick={() => setCurrentPhotoIndex(index)}
              >
                <img src={photo} alt="thumb" />
              </button>
            ))}
          </div>
        )}

        <div className="section">
          <h4>This moment</h4>
          <p>{memory.caption}</p>
        </div>

        <div className="section">
          <h4>React together</h4>
          <div className="reactions">
            {reactionEmojis.map((emoji) => (
              <button
                key={emoji}
                className={
                  userReacted(emoji)
                    ? "reaction-btn active"
                    : "reaction-btn"
                }
                onClick={() => handleReact(emoji)}
              >
                <span>{emoji}</span>
                {reactionCount(emoji) > 0 && (
                  <small>{reactionCount(emoji)}</small>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="private-note">
          <p className="note-title">✨ Private note</p>
          <p className="note-text">
            Visible only to you and your partner.
          </p>
        </div>
      </div>
    </div>
  );
}

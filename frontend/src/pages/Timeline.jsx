import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Timeline.css";

import { EMOTIONS } from "../../utils/Emotion";
import { useUser } from "../context/UserContext";
import { getTimeline } from "../api/memories";

export default function Timeline() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterEmotion, setFilterEmotion] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const data = await getTimeline();

        const formatted = data.map((day) => ({
          id: day._id,
          date: day.date,
          caption: day.caption || "",
          emotion: day.emotion,
          photoCount: day.photos?.length || 0,
          coverPhoto:
            day.photos?.[day.coverPhotoIndex]?.url || null
        }));

        setMemories(formatted);
      } catch (err) {
        console.error(err);
        setError("Failed to load memories");
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, []);
  const years = [
    "all",
    ...Array.from(
      new Set(
        memories.map((m) =>
          new Date(m.date).getFullYear().toString()
        )
      )
    ).sort((a, b) => b - a)
  ];
  const filteredMemories = memories.filter((memory) => {
    const emotionMatch =
      filterEmotion === "all" ||
      memory.emotion === filterEmotion;

    const yearMatch =
      filterYear === "all" ||
      new Date(memory.date).getFullYear().toString() === filterYear;

    return emotionMatch && yearMatch;
  });

  if (loading) return <div className="status">Loading memories…</div>;
  if (error) return <div className="status error">{error}</div>;

  return (
    <div className="timeline-wrapper">
      {/* Header */}
      <header className="timeline-header">
        <div className="header-left">
          <div className="lock-circle">🔒</div>
          <div>
            <h3>Your Space</h3>
            <p>{user?.name}, {user?.partnerName
    ? ` & ${user.partnerName}`
    : " ❤️"}</p>
          </div>
        </div>

        <button className="icon-btn" onClick={() => navigate("/profile")}>
  👤
</button>

      </header>

      <main className="timeline-content">
        {/* Quick Actions */}
       <div className="quick-actions">
  <div
    className="quick-card"
    onClick={() => navigate("/letters")}
    role="button"
    tabIndex={0}
  >
    💌 <span>Letters</span>
  </div>
<div
  className="quick-card"
  onClick={() => navigate("/on-this-day")}
>
  📅 <span>On This Day</span>
</div>

</div>


        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <button
              className={filterEmotion === "all" ? "filter active" : "filter"}
              onClick={() => setFilterEmotion("all")}
            >
              All
            </button>

            {Object.entries(EMOTIONS).map(([key, value]) => (
              <button
                key={key}
                className={filterEmotion === key ? "filter active" : "filter"}
                onClick={() => setFilterEmotion(key)}
                title={value.label}
              >
                {value.emoji}
              </button>
            ))}
          </div>

          <div className="divider" />

          <div className="filter-group">
            {years.map((year) => (
              <button
                key={year}
                className={filterYear === year ? "filter active" : "filter"}
                onClick={() => setFilterYear(year)}
              >
                {year === "all" ? "All" : year}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline-list">
          {filteredMemories.length === 0 ? (
            <div className="empty-state">
              ✨
              <h3>Start capturing moments</h3>
              <p>Your timeline is empty. Add your first memory.</p>
              <button
                className="primary-btn"
                onClick={() => navigate("/add")}
              >
                + Add First Memory
              </button>
            </div>
          ) : (
            filteredMemories.map((memory, index) => (
              <div key={memory.id} className="timeline-item">
                <div className="dot" />
                {index < filteredMemories.length - 1 && <div className="line" />}

                <div
                  className="memory-card"
                  onClick={() =>
                    navigate(`/day/${memory.id}`, { state: memory })
                  }
                >
                  {memory.coverPhoto ? (
                    <img src={memory.coverPhoto} alt="cover" />
                  ) : (
                    <div className="image-placeholder">📷</div>
                  )}

                  <div className="memory-body">
                    <div className="memory-top">
                      <span className="date">
                        {new Date(memory.date).toDateString()}
                      </span>
                      <span className="emotion">
                        {EMOTIONS[memory.emotion]?.emoji || "💭"}
                      </span>
                    </div>

                    <p className="caption">{memory.caption}</p>

                    <span className="count">
                      {memory.photoCount} photos
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Floating Add Button */}
      <button className="fab" onClick={() => navigate("/add")}>
        +
      </button>
    </div>
  );
}

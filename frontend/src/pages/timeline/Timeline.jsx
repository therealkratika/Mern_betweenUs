import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Timeline.css";

import { EMOTIONS } from "../../../utils/Emotion";
import { useUser } from "../../context/UserContext";
import { useTimeline } from "../../context/TimelineContext";

import TimelineHeader from "./TimelineHeader";
import QuickActions from "./QuickActions";
import TimelineFilters from "./TimelineFilters";
import TimelineList from "./TimelineList";
import EmptyState from "./EmptyState";

export default function Timeline() {
  const navigate = useNavigate();
  const { user } = useUser();

  const {
    memories = [],
    loadTimeline,
    loading,
  } = useTimeline();

  const [filterEmotion, setFilterEmotion] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  if (loading && memories.length === 0) {
    return <div className="status">Loading memories…</div>;
  }

  const years = [
    "all",
    ...Array.from(
      new Set(
        memories
          .filter(m => m?.date)
          .map(m => new Date(m.date).getFullYear())
          .filter(y => !isNaN(y))
      )
    ).sort((a, b) => b - a),
  ];

  const filteredMemories = memories.filter((memory) => {
    const emotionMatch =
  filterEmotion === "all" ||
  memory.emotion?.toLowerCase() === filterEmotion.toLowerCase();


    const yearMatch =
      filterYear === "all" ||
      new Date(memory.date).getFullYear().toString() === filterYear;

    return emotionMatch && yearMatch;
  });

  return (
    <div className="timeline-wrapper">
      <TimelineHeader user={user} onProfile={() => navigate("/profile")} />

      <main className="timeline-content">
        <QuickActions navigate={navigate} />

        <TimelineFilters
          emotions={EMOTIONS}
          years={years}
          filterEmotion={filterEmotion}
          filterYear={filterYear}
          setFilterEmotion={setFilterEmotion}
          setFilterYear={setFilterYear}
        />

        {filteredMemories.length === 0 ? (
          <EmptyState onAdd={() => navigate("/add")} />
        ) : (
          <TimelineList
            memories={filteredMemories}
            onOpen={(memory) =>
              navigate(`/day/${memory.id}`, { state: memory })
            }
          />
        )}
      </main>

      <button className="fab" onClick={() => navigate("/add")}>
        +
      </button>
    </div>
  );
}

import { createContext, useContext, useState } from "react";
import { getTimeline } from "../api/memories";

const TimelineContext = createContext();

export function TimelineProvider({ children }) {
  const [memories, setMemories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadTimeline = async () => {
  if (loaded || loading) return;

  try {
    setLoading(true);
    const data = await getTimeline();

    const formatted = (data || []).map((day) => ({
      id: day._id,
      date: day.date,
      caption: day.caption || "",
      emotion: day.emotion,
      photos: day.photos || [],
      photoCount: day.photos?.length || 0,
      coverPhotoIndex: day.coverPhotoIndex || 0,
      coverPhoto:
        day.photos?.[day.coverPhotoIndex]?.url || null,
    }));

    setMemories(formatted);
    setLoaded(true);
  } catch (err) {
    console.error("Failed to load timeline", err);
  } finally {
    setLoading(false);
  }
};


  const addMemory = (memory) => {
    setMemories((prev) => [memory, ...prev]);
  };

  const removeMemory = (id) => {
    setMemories((prev) => prev.filter((m) => m._id !== id));
  };
   return (
  <TimelineContext.Provider
    value={{
      memories,          // ✅ rename
      loadTimeline,
      addMemory,
      removeMemory,
      loading,
    }}
  >
    {children}
  </TimelineContext.Provider>
);

}

export const useTimeline = () => useContext(TimelineContext);

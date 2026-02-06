import api from "./api";

/**
 * ✅ Get timeline for current space
 * (JWT decides which space)
 */
export const getTimeline = async () => {
  const res = await api.get("/memories/timeline");
  return res.data;
};

/**
 * ✅ Add a new day memory
 */
export const addDayMemory = async (payload) => {
  const res = await api.post("/memories/add", payload);
  return res.data;
};

/**
 * ✅ Get single memory
 */
export const getMemoryById = async (memoryId) => {
  const res = await api.get(`/memories/${memoryId}`);
  return res.data;
};

/**
 * ✅ React to memory
 */
export const reactToMemory = async (memoryId, emoji) => {
  const res = await api.post(`/memories/${memoryId}/react`, {
    emoji
  });
  return res.data;
};
export const deleteMemory = async (memoryId) => {
  const res = await api.delete(`/memories/${memoryId}`);
  return res.data;
};
export const getOnThisDay = async () => {
  const res = await api.get("/memories/on-this-day");
  return res.data;
};


import api from "./api";

export const getLetters = async () => {
  const res = await api.get("/letters");
  return res.data;
};

export const createLetter = async (payload) => {
  const res = await api.post("/letters", payload);
  return res.data;
};

export const getLetterById = async (id) => {
  const res = await api.get(`/letters/${id}`);
  return res.data;
};

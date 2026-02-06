import api from "./api";

export const registerUser = async (name, email, password) => {
  const res = await api.post("/auth/register", {
    name,       // ✅ MUST be `name`
    email,
    password
  });

  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", {
    email,
    password
  });

  return res.data;
};

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (token, password) =>
  api.post(`/auth/reset-password/${token}`, { password });
export const deleteAccount = async () => {
  const res = await api.delete("/auth/delete-account");
  return res.data;
};

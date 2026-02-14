import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: "https://mern-betweenus-clc7.onrender.com", 
});

// 🔑 Attach token to every request
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

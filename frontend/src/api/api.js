import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: "http://localhost:5000", // Change to your backend URL
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

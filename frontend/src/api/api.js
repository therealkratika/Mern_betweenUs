import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: "https://mern-betweenus-c1c7.onrender.com",
});

// api.js
api.interceptors.request.use(async (config) => {
  // Instead of just checking auth.currentUser, 
  // ensure we wait for the auth object to initialize if it's null
  await auth.authStateReady(); 
  const user = auth.currentUser;

  if (user) {
    const idToken = await user.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
});
export default api;

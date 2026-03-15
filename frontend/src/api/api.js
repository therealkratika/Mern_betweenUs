import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: "https://mern-betweenus-c1c7.onrender.com",
});

api.interceptors.request.use(async (config) => {
  await auth.authStateReady(); 
  const user = auth.currentUser;

  if (user) {
    const idToken = await user.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
});
export default api;

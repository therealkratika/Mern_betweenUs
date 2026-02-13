import api from "./api";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "../firebase";

/* =========================
   REGISTER
========================= */
export const registerUser = async (name, email, password) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(res.user, {
    displayName: name
  });

  // 🔐 attach token for backend calls
  const token = await res.user.getIdToken();
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  return res.user;
};

/* =========================
   LOGIN
========================= */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    await user.reload();


    // 🔑 Firebase ID token
    const token = await user.getIdToken(true);

    // 🔗 Attach token for backend requests
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return user;
  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
};

/* =========================
   FORGOT PASSWORD
========================= */
export const forgotPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
  return true;
};

/* =========================
   DELETE ACCOUNT (backend)
========================= */
export const deleteAccount = async () => {
  const res = await api.delete("/auth/delete-account");
  return res.data;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  const res = await signInWithPopup(auth, provider);

  const token = await res.user.getIdToken();
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  return res.user;
};

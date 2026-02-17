import api from "./api";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendEmailVerification,
  deleteUser,
  signInWithPopup
} from "firebase/auth";
import { auth } from "../firebase";

const googleProvider = new GoogleAuthProvider();
export const googlePopup = () => signInWithPopup(auth, googleProvider);
export const googleRedirect = () => signInWithRedirect(auth, googleProvider);
/* =========================
   EMAIL / PASSWORD SIGNUP
========================= */
export const registerUser = async (name, email, password) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(res.user, { displayName: name });
  await sendEmailVerification(res.user);
  await signOut(auth);

  return {
    message: "Verification email sent. Please verify before login.",
  };
};

/* =========================
   EMAIL / PASSWORD LOGIN
========================= */
export const loginUser = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.log("FIREBASE LOGIN ERROR:", err.code, err.message);
    throw err;
  }
};


export const signInWithGoogle = async () => {

  return signInWithRedirect(auth, googleProvider);
};

export const getGoogleRedirectResult = async () => {
  const result = await getRedirectResult(auth);

  if (!result) return null;

  const token = await result.user.getIdToken(true);
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  return result.user;
};


export const forgotPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
  return true;
};

export const deleteAccount = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No user logged in");
  }
  await api.delete("/users/me");
  await deleteUser(user);

  return true;
};

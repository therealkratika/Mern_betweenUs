import api from "./api";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "../firebase";

export const registerUser = async (name, email, password) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(res.user, { displayName: name });
  await sendEmailVerification(res.user);
  await signOut(auth);

  return {
    message: "Verification email sent. Please verify before login."
  };
};

export const loginUser = async (email, password) => {
  try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (err) {
  console.log("FIREBASE LOGIN ERROR:", err.code, err.message);
}

};
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  return res.user;
};


export const forgotPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
  return true;
};

export const deleteAccount = async () => {
  const res = await api.delete("/auth/delete-account");
  return res.data;
};

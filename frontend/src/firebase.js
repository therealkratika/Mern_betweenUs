// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvwK1qjj0PJOazsuNn6qqzXfZN4knB5uE",
  authDomain: "betweenus-45513.firebaseapp.com",
  projectId: "betweenus-45513",
  storageBucket: "betweenus-45513.firebasestorage.app",
  messagingSenderId: "581150307859",
  appId: "1:581150307859:web:6c061dca5e3e9a59f2b1e6",
  measurementId: "G-RC1FD01XQL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
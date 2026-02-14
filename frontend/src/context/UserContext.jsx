import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import  {auth } from "../firebase";
import api from "../api/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (firebaseUser) => {

    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const token = await firebaseUser.getIdToken();
      console.log("Token:", token);
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      console.log("AUTH CHECK FAILED (safe)");
      setUser(null);
    } finally {
      setLoading(false);
    }
  });

  return () => unsub();
}, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

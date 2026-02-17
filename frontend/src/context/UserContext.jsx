import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import api from "../api/api";
const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (currentUser) => {
    // Keep loading TRUE until we are completely done with everything
    setLoading(true); 

    if (currentUser) {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
        });
      }
    } else {
      setUser(null);
    }
    
    // ONLY set loading to false AFTER the await api.get is finished
    setLoading(false); 
  });

  return unsub;
}, []);
  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };
const refreshUser = async () => {
  try {
    // Get fresh token from Firebase
    const token = await auth.currentUser?.getIdToken();
    
    const res = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const updatedUser = res.data.user; 
    setUser(updatedUser); 
    return updatedUser;
  } catch (err) {
    console.error("Failed to refresh user:", err);
    throw err;
  }
};

  return (
    <UserContext.Provider value={{ user, loading, logout, refreshUser }}>
      {!loading && children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

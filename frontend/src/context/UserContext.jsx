import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import api from "../api/api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken(true);
          api.defaults.headers.common.Authorization = `Bearer ${token}`;

          if (isMounted) {
            setAuthUser(firebaseUser);

            const res = await api.get("/auth/me");
            setUser(res.data.user);
          }
        } else {
          if (isMounted) {
            setAuthUser(null);
            setUser(null);
            delete api.defaults.headers.common.Authorization;
          }
        }
      } catch (err) {
        console.error("AUTH STATE ERROR ❌", err);
        if (isMounted) {
          setAuthUser(null);
          setUser(null);
          delete api.defaults.headers.common.Authorization;
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
    setAuthUser(null);
    setUser(null);
    delete api.defaults.headers.common.Authorization;
  };

  return (
    <UserContext.Provider value={{ authUser, user, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

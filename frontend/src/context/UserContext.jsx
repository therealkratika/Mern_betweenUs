import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import api from "../api/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔒 Prevent race condition
  const hasManuallyRefreshed = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (currentUser) {
        try {
          // ⚠️ Do NOT overwrite fresh user data
          if (!hasManuallyRefreshed.current) {
            const res = await api.get("/auth/me");
            setUser(res.data.user);
          }
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

      setLoading(false);
    });

    return unsub;
  }, []);

  const refreshUser = async () => {
    try {
      hasManuallyRefreshed.current = true;

      const token = await auth.currentUser?.getIdToken();
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      console.error("Failed to refresh user:", err);
      throw err;
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{ user, loading, logout, refreshUser }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);
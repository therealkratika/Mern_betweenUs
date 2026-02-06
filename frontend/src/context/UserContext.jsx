import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = ({ token, user }) => {
    if (token) {
      localStorage.setItem("token", token);
    }

    setUser((prev) => ({
      ...prev,
      ...user,
      partnerName: user.partnerName ?? prev?.partnerName ?? null
    }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

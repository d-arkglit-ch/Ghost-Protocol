/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { loginUser as apiLoginUser, logoutUser as apiLogoutUser, registerUser as apiRegisterUser, loginGuest as apiLoginGuest, getProfile as apiGetProfile } from '../api/userApi';
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const restoreSession = async () => {
    try {
      const { parsed } = await apiGetProfile();
      setUser(parsed.data);
      return parsed.data;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Rehydrate session from cookie on mount/refresh
  useEffect(() => {
    restoreSession();

    // Cross-tab synchronization listener
    const handleStorageChange = (e) => {
      if (e.key === "ghost_session_sync" && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload.action === "LOGIN") {
            restoreSession();
          } else if (payload.action === "LOGOUT") {
            setUser(null);
            navigate("/login");
          }
        } catch {
          // ignore parsing error
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  const broadcastSync = (action) => {
    localStorage.setItem(
      "ghost_session_sync",
      JSON.stringify({ action, timestamp: Date.now() })
    );
  };

  // LOGIN
  const loginUser = async (credentials) => {
    const { parsed } = await apiLoginUser(credentials);
    setUser(parsed.data);
    broadcastSync("LOGIN");
    navigate("/rooms");
  };

  // LOGIN AS GUEST
  const loginAsGuest = async () => {
    try {
      setLoading(true);
      const { parsed } = await apiLoginGuest();
      setUser(parsed.data);
      broadcastSync("LOGIN");
      navigate("/rooms");
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = async () => {
    await apiLogoutUser();
    setUser(null);
    broadcastSync("LOGOUT");
    navigate("/login");
  };

  // REGISTER
  const register = async (credentials) => {
    const { parsed } = await apiRegisterUser(credentials);
    setUser(parsed.data);
    broadcastSync("LOGIN");
    navigate("/rooms");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginUser, login: loginUser, logout, register, registerUser: register, signupUser: register, loginAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

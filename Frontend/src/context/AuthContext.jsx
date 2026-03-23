/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { loginUser as apiLoginUser, logoutUser as apiLogoutUser, registerUser as apiRegisterUser, loginGuest as apiLoginGuest, getProfile as apiGetProfile } from '../api/userApi';
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Rehydrate session from cookie on mount/refresh
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { parsed } = await apiGetProfile();
        setUser(parsed.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // LOGIN
  const loginUser = async (credentials) => {
    const { parsed } = await apiLoginUser(credentials);
    setUser(parsed.data);
    navigate("/rooms");
  };

  // LOGIN AS GUEST
  const loginAsGuest = async () => {
    try {
      setLoading(true);
      const { parsed } = await apiLoginGuest();
      setUser(parsed.data);
      navigate("/rooms");
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = async () => {
    await apiLogoutUser();
    setUser(null);
    navigate("/login");
  };

  // REGISTER
  const register = async (credentials) => {
    const { parsed } = await apiRegisterUser(credentials);
    setUser(parsed.data);
    navigate("/rooms");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginUser, logout, register, loginAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

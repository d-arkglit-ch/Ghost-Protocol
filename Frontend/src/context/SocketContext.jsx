/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user?._id) {
      setSocket((prev) => {
        if (prev) prev.disconnect();
        return null;
      });
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const newSocket = io(backendUrl, {
      withCredentials: true,
      query: { userId: user._id }
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("⚡ Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    // Matchmaking liveness probe response
    newSocket.on("pingCheck", (callback) => {
      if (typeof callback === "function") {
        callback({ status: "alive" });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

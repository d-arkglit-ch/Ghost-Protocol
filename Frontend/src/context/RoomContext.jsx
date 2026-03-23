/* eslint-disable react-refresh/only-export-components */
import { useContext, createContext, useEffect, useState } from "react";
import {
  deleteRoom,
  getRooms,
  createRoom,
  joinRoom,
  removeMember,
} from "../api/roomApi";
import { useAuth } from "./AuthContext";

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch rooms when user logs in
  useEffect(() => {
    if (user) fetchRooms();
  }, [user]);

  // ✅ fetch rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { parsed } = await getRooms();
      setRooms(parsed.data || []);
    } catch (error) {
      console.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ create room
  const handleCreateRoom = async (timerMinutes) => {
    const { parsed } = await createRoom(timerMinutes);
    setRooms((prev) => [...prev, parsed.data]);
    return parsed.data;
  };

  // ✅ join room
  const handleJoinRoom = async (code) => {
    const { parsed } = await joinRoom(code);
    setRooms((prev) => {
      const exists = prev.find((r) => r._id === parsed.data._id);
      return exists ? prev : [...prev, parsed.data];
    });
    return parsed.data;
  };

  // ✅ delete room
  const handleDeleteRoom = async (roomCode) => {
    await deleteRoom(roomCode);
    setRooms((prev) => prev.filter((r) => r.code !== roomCode));
    if (selectedRoom?.code === roomCode) setSelectedRoom(null);
  };

  // ✅ remove member
  const handleRemoveMember = async (roomCode, memberId) => {
    const { parsed } = await removeMember(roomCode, memberId);
    setRooms((prev) =>
      prev.map((r) => (r.code === roomCode ? parsed.data : r))
    );
  };

  // ✅ context value
  return (
    <RoomContext.Provider
      value={{
        rooms,
        selectedRoom,
        setSelectedRoom,
        loading,
        fetchRooms,
        handleCreateRoom,
        handleJoinRoom,
        handleDeleteRoom,
        handleRemoveMember,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

// ✅ correct hook name
export const useRoom = () => useContext(RoomContext);

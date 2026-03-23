import { useRoom } from "../context/RoomContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";

const HomePage = () => {
  const { rooms, loading, fetchRooms, handleDeleteRoom } = useRoom();
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  useEffect(() => {
    if (!socket) return;

    // Listeners for Omegle Mode
    socket.on("waitingForStranger", (data) => {
      setSearchMessage(data.message);
    });

    socket.on("strangerMatched", async (data) => {
      setIsSearching(false);
      // Refresh rooms so the new stranger room is in state before navigating
      await fetchRooms();
      navigate(`/room/${data.roomCode}`);
    });

    return () => {
      socket.off("waitingForStranger");
      socket.off("strangerMatched");
    };
  }, [socket, navigate, fetchRooms]);

  const handleFindStranger = () => {
    if (!socket) return;
    setIsSearching(true);
    setSearchMessage("INITIALIZING_SEARCH_PROTOCOL...");
    socket.emit("findStranger");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl terminal-box mb-8">
        <header className="flex justify-between items-center border-b border-[var(--border-color)] pb-4 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold uppercase">
              {'>'} AUTHENTICATED_AS: <span className="text-[var(--accent-color)]">{user?.username}</span>
            </h1>
            <p className="text-xs opacity-50 mt-1">STATUS: SECURED_CONNECTION</p>
          </div>
          <button onClick={logout} className="btn-terminal text-xs">
            [ LOGOUT ]
          </button>
        </header>

        {/* Action Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/create-room" className="btn-terminal text-center py-4">
            [+] CREATE_BURNER_ROOM
          </Link>
          <Link to="/join-room" className="btn-terminal text-center py-4">
            [&gt;] ENTER_ROOM_CODE
          </Link>
          <button 
            onClick={handleFindStranger} 
            disabled={isSearching}
            className={`btn-terminal text-center py-4 ${isSearching ? 'glitch-anim border-[var(--accent-color)]' : ''}`}
          >
            {isSearching ? searchMessage : "[?] OMEGLE_MODE (FIND_STRANGER)"}
          </button>
        </div>

        {/* Room List */}
        <div>
          <h2 className="text-lg mb-4 border-b border-dashed border-[var(--border-color)] pb-2 inline-block">
            {'>'} ACTIVE_BURNER_ROOMS_DETECTED:
          </h2>

          {loading ? (
            <p className="animate-pulse">SCANNING_DATABASE...</p>
          ) : rooms.length === 0 ? (
            <p className="opacity-50">
              {'>'} NO_ACTIVE_ROOMS_FOUND. GHOST TOWN.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {rooms.map((room) => (
                <div key={room._id} className="border border-[var(--border-color)] p-4 flex justify-between items-center hover:bg-[var(--border-color)] hover:text-[var(--bg-color)] transition-colors group">
                  <div>
                    <h3 className="font-bold text-lg">
                      ROOM_ID: {room.code}
                      {room.type === "omegle" && <span className="text-xs ml-2 text-[var(--accent-color)]">[OMEGLE]</span>}
                    </h3>
                    <p className="text-xs opacity-70 group-hover:opacity-100">
                      PARTICIPANTS: {room.members.length}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {(room.created_by === user?._id || room.created_by?._id === user?._id) && (
                      <button
                        onClick={(e) => { e.preventDefault(); handleDeleteRoom(room.code); }}
                        className="font-bold tracking-widest text-[var(--accent-color)] hover:underline text-sm"
                      >
                        [X] DELETE
                      </button>
                    )}
                    <Link to={`/room/${room.code}`} className="font-bold tracking-widest">
                      {'>'} CONNECT
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

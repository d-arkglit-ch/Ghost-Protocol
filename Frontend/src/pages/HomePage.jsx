import { useRoom } from "../context/RoomContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import {
  Radio,
  PlusCircle,
  Hash,
  Users,
  Trash2,
  ArrowRight,
  MessageSquare,
  X
} from "lucide-react";
import { getAvatarColor } from "../utils/avatar";

const HomePage = () => {
  const { rooms, loading, fetchRooms, handleDeleteRoom } = useRoom();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  useEffect(() => {
    if (!socket) return;

    socket.on("waitingForStranger", (data) => {
      setSearchMessage(data?.message || "Searching for an active stranger...");
    });

    socket.on("strangerMatched", async (data) => {
      setIsSearching(false);
      await fetchRooms();
      navigate(`/room/${data.roomCode}`);
    });

    return () => {
      socket.off("waitingForStranger");
      socket.off("strangerMatched");
      socket.emit("cancelFindStranger");
    };
  }, [socket, navigate, fetchRooms]);

  const handleFindStranger = () => {
    if (!socket) return;
    if (isSearching) {
      socket.emit("cancelFindStranger");
      setIsSearching(false);
      setSearchMessage("");
      return;
    }
    setIsSearching(true);
    setSearchMessage("Connecting to stranger matching queue...");
    socket.emit("findStranger");
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 flex flex-col bg-[#F6F8F6] text-[#111827]">
      <div className="max-w-4xl mx-auto w-full space-y-5">

        {/* HERO SECTION: WELCOME & STRANGER RADAR BANNER */}
        <div className="relative overflow-hidden rounded-xl p-6 md:p-8 bg-white border border-[#D5E0D7] shadow-2xs">
          
          {/* Gentle Mountain Mist Vector Landscape in Background */}
          <div className="absolute bottom-0 right-0 left-0 h-28 pointer-events-none overflow-hidden select-none opacity-85">
            <svg viewBox="0 0 900 120" className="w-full h-full" preserveAspectRatio="none">
              {/* Soft Golden Sun */}
              <circle cx="780" cy="52" r="30" fill="#FDE68A" opacity="0.65" />
              {/* Distant Hills Layer (Pale Sage) */}
              <path d="M0,120 L0,85 Q150,55 350,75 Q550,95 720,60 Q820,40 900,65 L900,120 Z" fill="#E4EDE6" opacity="0.6" />
              {/* Middle Layer (Sage Green) */}
              <path d="M0,120 L0,92 Q200,68 450,85 Q680,102 820,75 L900,82 L900,120 Z" fill="#C5D7C8" opacity="0.5" />
              {/* Foreground Layer (Pine Silhouette along bottom right) */}
              <path d="M500,120 Q650,95 760,82 Q840,70 900,75 L900,120 Z" fill="#2E5A3D" opacity="0.7" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              {/* Status Pill: Ready to Connect */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F3EE] text-[#1C4A2E] text-xs font-semibold mb-3 border border-[#D5E0D7]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Ready to Connect</span>
              </div>

              {/* Headline with Vertical Green Accent Bar */}
              <div className="border-l-3 border-[#1C4A2E] pl-3 py-0.5">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#111827]">
                  Hello, <span className="text-[#1C4A2E]">{user?.username || "Guest"}</span> 👋
                </h1>
                <p className="text-xs md:text-sm text-[#526056] mt-1 max-w-lg">
                  Jump into an anonymous 1-on-1 stranger conversation or create a burner room for your crew.
                </p>
              </div>
            </div>

            {/* Match Stranger Button */}
            <div className="w-full md:w-auto shrink-0">
              <button
                onClick={handleFindStranger}
                className={`w-full md:w-auto px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-xs active:translate-y-px ${
                  isSearching
                    ? "bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-200"
                    : "bg-[#1C4A2E] hover:bg-[#163B25] text-white"
                }`}
              >
                {isSearching ? (
                  <>
                    <X className="w-4 h-4 text-rose-700" />
                    <span>Cancel Matching</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4 text-white" />
                    <span>Match a Stranger Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Searching Status Telemetry Banner */}
          {isSearching && (
            <div className="relative z-10 mt-5 pt-4 border-t border-[#D5E0D7] flex items-center justify-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs font-medium text-[#1C4A2E]">
                {searchMessage}
              </p>
            </div>
          )}
        </div>

        {/* QUICK ACTION TILES (2 COLUMNS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Create Burner Room */}
          <Link
            to="/create-room"
            className="group p-4 rounded-xl bg-white hover:bg-[#F0F4F1] border border-[#D5E0D7] hover:border-[#1C4A2E] transition-all duration-150 flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E4EDE6] text-[#1C4A2E] flex items-center justify-center shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#111827]">Create Burner Room</h3>
                <p className="text-xs text-[#526056]">Self-destruct timer & private code</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#526056] group-hover:text-[#1C4A2E] group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Join with Code */}
          <Link
            to="/join-room"
            className="group p-4 rounded-xl bg-white hover:bg-[#F0F4F1] border border-[#D5E0D7] hover:border-[#1C4A2E] transition-all duration-150 flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E4EDE6] text-[#1C4A2E] flex items-center justify-center shrink-0">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#111827]">Join with Code</h3>
                <p className="text-xs text-[#526056]">Enter an existing room key</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#526056] group-hover:text-[#1C4A2E] group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* AVAILABLE CHAT ROOMS LIST */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1C4A2E]" />
              <span>Available Chat Rooms</span>
            </h2>
            <span className="text-xs text-[#526056]">
              {rooms.length} active room{rooms.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#869684] animate-pulse">
              Syncing active rooms...
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 md:p-12 rounded-xl bg-white border border-[#D5E0D7] text-center flex flex-col items-center justify-center shadow-2xs">
              {/* Line-art Chat Bubble Illustration */}
              <div className="w-14 h-14 rounded-2xl bg-[#E4EDE6]/60 border border-[#D5E0D7] flex items-center justify-center mb-3 text-[#1C4A2E]">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#111827]">No active rooms found</h3>
              <p className="text-xs text-[#526056] mt-1 mb-4">
                Be the first to open a room or match a random stranger!
              </p>
              <Link
                to="/create-room"
                className="px-4 py-2 rounded-lg bg-[#1C4A2E] hover:bg-[#163B25] text-white text-xs font-semibold shadow-xs transition-all active:translate-y-px"
              >
                Create First Room
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.map((room) => {
                const isOmegle = room.type === "omegle";
                const isCreator = room.created_by === user?._id || room.created_by?._id === user?._id;
                const rAvatar = getAvatarColor(room.code);

                return (
                  <div
                    key={room._id || room.code}
                    className="p-4 rounded-xl bg-white hover:bg-[#F0F4F1] border border-[#D5E0D7] hover:border-[#1C4A2E] transition-all duration-150 flex flex-col justify-between shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg ${rAvatar.bg} ${rAvatar.text} flex items-center justify-center text-xs font-bold shrink-0 border border-[#D5E0D7]`}>
                          {isOmegle ? "🎲" : "#"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-xs text-[#111827] flex items-center gap-1.5">
                            {isOmegle ? "Stranger Chat" : `Room ${room.code}`}
                            {isOmegle && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E4EDE6] text-[#1C4A2E] font-medium">
                                1:1
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[#526056] mt-0.5">
                            <Users className="w-3 h-3 text-[#1C4A2E]" />
                            <span>{room.members?.length || 1} participant{room.members?.length !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </div>

                      {isCreator && (
                        <button
                          onClick={() => handleDeleteRoom(room.code)}
                          title="Delete Room"
                          className="p-1 rounded text-[#869684] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <Link
                      to={`/room/${room.code}`}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[#E4EDE6] hover:bg-[#1C4A2E] text-[#1C4A2E] hover:text-white border border-[#D5E0D7] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <span>Join Room</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HomePage;

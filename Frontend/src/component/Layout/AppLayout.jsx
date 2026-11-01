import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRoom } from "../../context/RoomContext";
import { useSocket } from "../../context/SocketContext";
import { getAvatarColor, getInitials } from "../../utils/avatar";
import { 
  PlusCircle, 
  Hash, 
  LogOut, 
  Search, 
  Radio, 
  Users, 
  ChevronRight,
  MessageSquare,
  X
} from "lucide-react";

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { rooms, fetchRooms, loading } = useRoom();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const { roomCode } = useParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingStranger, setIsSearchingStranger] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");

  const avatarStyle = getAvatarColor(user?.username);
  const initials = getInitials(user?.username);

  useEffect(() => {
    if (!socket) return;

    const handleWaiting = (data) => {
      setSearchStatus(data?.message || "Finding someone to chat with...");
    };

    const handleMatched = async (data) => {
      setIsSearchingStranger(false);
      setSearchStatus("");
      await fetchRooms();
      navigate(`/room/${data.roomCode}`);
    };

    socket.on("waitingForStranger", handleWaiting);
    socket.on("strangerMatched", handleMatched);

    return () => {
      socket.off("waitingForStranger", handleWaiting);
      socket.off("strangerMatched", handleMatched);
    };
  }, [socket, fetchRooms, navigate]);

  const handleToggleStrangerMatch = () => {
    if (!socket) return;
    if (isSearchingStranger) {
      socket.emit("cancelFindStranger");
      setIsSearchingStranger(false);
      setSearchStatus("");
    } else {
      setIsSearchingStranger(true);
      setSearchStatus("Connecting to stranger radar...");
      socket.emit("findStranger");
    }
  };

  const filteredRooms = rooms?.filter((r) => 
    r.code?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isRoomOrActionOpen = Boolean(roomCode) || location.pathname === "/create-room" || location.pathname === "/join-room";

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex bg-[#F6F8F6] text-[#111827] font-sans selection:bg-[#E4EDE6] selection:text-[#1C4A2E]">
      
      {/* SIDEBAR: Always visible on desktop (md:flex), hidden on mobile when a chat or action is open */}
      <aside 
        className={`
          w-full md:w-80 flex-shrink-0 flex flex-col 
          bg-[#F6F8F6] border-r border-[#D5E0D7]
          h-full z-20 transition-all duration-300 relative
          ${isRoomOrActionOpen ? "hidden md:flex" : "flex"}
        `}
      >
        {/* Top Header / App Brand */}
        <div className="p-4 border-b border-[#D5E0D7] flex items-center justify-between gap-3 bg-[#F6F8F6]">
          <Link to="/rooms" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#1C4A2E] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#111827] block leading-tight">
                Connect
              </span>
              <span className="text-xs text-[#869684] block font-normal">
                Social Chat
              </span>
            </div>
          </Link>
        </div>

        {/* User Profile Bar */}
        <div className="px-4 py-3 border-b border-[#D5E0D7] flex items-center justify-between gap-2 bg-[#F6F8F6]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-full ${avatarStyle.bg} ${avatarStyle.text} border border-[#D5E0D7] flex items-center justify-center text-xs font-bold shrink-0`}>
              {initials}
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm font-semibold text-[#111827] truncate">
                {user?.username || "Guest"}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg border border-[#D5E0D7] text-[#526056] hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stranger Match Card */}
        <div className="p-3 border-b border-[#D5E0D7]">
          <div className="bg-[#EBF2ED] border border-[#D5E0D7] rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#E4EDE6] text-[#1C4A2E] flex items-center justify-center shrink-0">
                <Radio className={`w-4 h-4 ${isSearchingStranger ? "animate-spin text-emerald-600" : ""}`} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-xs text-[#111827] truncate leading-tight">
                  Meet Random Strangers
                </h3>
                <p className="text-[11px] text-[#526056] truncate mt-0.5">
                  {isSearchingStranger ? searchStatus : "One-click instant match"}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleStrangerMatch}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:translate-y-px ${
                isSearchingStranger
                  ? "bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-200"
                  : "bg-[#1C4A2E] text-white hover:bg-[#163B25] shadow-xs"
              }`}
            >
              {isSearchingStranger ? "Cancel" : "Match"}
            </button>
          </div>
        </div>

        {/* Quick Nav Actions (New Room & Join Code) */}
        <div className="grid grid-cols-2 gap-2 p-3 border-b border-[#D5E0D7]">
          <Link
            to="/create-room"
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg bg-[#1C4A2E] hover:bg-[#163B25] text-white shadow-xs transition-all active:translate-y-px"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Room</span>
          </Link>
          <Link
            to="/join-room"
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg bg-white hover:bg-[#F0F4F1] border border-[#D5E0D7] text-[#1C4A2E] shadow-2xs transition-all active:translate-y-px"
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Join Code</span>
          </Link>
        </div>

        {/* Search Rooms Bar */}
        <div className="p-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#869684] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter active rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#D5E0D7] focus:border-[#1C4A2E] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#111827] placeholder-[#869684] transition-all outline-none"
            />
          </div>
        </div>

        {/* Rooms List / Empty State */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-20 relative z-10">
          <div className="px-1 py-1 flex items-center justify-between text-[11px] font-bold text-[#869684] uppercase tracking-wider">
            <span>ACTIVE ROOMS</span>
            <span className="bg-[#E4EDE6] text-[#1C4A2E] px-1.5 py-0.2 rounded text-[10px] font-bold">
              {filteredRooms.length}
            </span>
          </div>

          {loading ? (
            <div className="p-4 text-center text-xs text-[#869684] animate-pulse">
              Loading rooms...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
              {/* Line-art Chat Bubble Illustration */}
              <div className="w-14 h-14 rounded-2xl bg-[#E4EDE6]/60 border border-[#D5E0D7] flex items-center justify-center mb-3 text-[#1C4A2E]">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-[#526056]">
                No rooms found. Start one!
              </p>
            </div>
          ) : (
            filteredRooms.map((r) => {
              const isActive = r.code?.toUpperCase() === roomCode?.toUpperCase();
              const isOmegle = r.type === "omegle";

              return (
                <div
                  key={r._id || r.code}
                  onClick={() => navigate(`/room/${r.code}`)}
                  className={`
                    group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 border
                    ${isActive 
                      ? "bg-[#E4EDE6] border-[#1C4A2E] text-[#1C4A2E] shadow-2xs font-semibold" 
                      : "bg-white hover:bg-[#F0F4F1] border-[#D5E0D7] text-[#111827]"
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#E4EDE6] text-[#1C4A2E] flex items-center justify-center text-xs font-bold shrink-0">
                      {isOmegle ? "🎲" : "#"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs truncate">
                          {isOmegle ? `Stranger Chat` : `Room ${r.code}`}
                        </span>
                        {isOmegle && (
                          <span className="text-[10px] px-1 rounded bg-[#E4EDE6] text-[#1C4A2E] font-medium">
                            1:1
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#526056] truncate flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-[#1C4A2E]" />
                        {r.members?.length || 1} online
                      </p>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 text-[#869684] group-hover:text-[#1C4A2E] group-hover:translate-x-0.5 transition-all ${isActive ? "text-[#1C4A2E]" : ""}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Misty Mountains Vector Art at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden h-24 select-none opacity-80">
          <svg viewBox="0 0 320 90" className="w-full h-full" preserveAspectRatio="none">
            {/* Background Layer (Soft Sage) */}
            <path d="M0,90 L0,55 Q50,30 110,45 Q170,60 230,35 Q280,15 320,38 L320,90 Z" fill="#D5E0D7" opacity="0.45" />
            {/* Middle Layer (Sage Green) */}
            <path d="M0,90 L0,65 Q70,45 140,58 Q200,68 260,50 Q290,40 320,55 L320,90 Z" fill="#C5D7C8" opacity="0.65" />
            {/* Foreground Layer (Warm Ivory Tint) */}
            <path d="M0,90 L0,75 Q80,62 160,72 Q230,80 300,68 L320,70 L320,90 Z" fill="#E4EDE6" opacity="0.85" />
          </svg>
        </div>
      </aside>

      {/* MAIN CHAT / CONTENT AREA */}
      <main className={`flex-1 flex flex-col h-full overflow-hidden bg-[#F6F8F6] relative ${!isRoomOrActionOpen ? "hidden md:flex" : "flex"}`}>
        {children}
      </main>

    </div>
  );
};

export default AppLayout;

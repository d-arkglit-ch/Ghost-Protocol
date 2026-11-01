import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Shuffle, 
  LogOut, 
  ShieldCheck, 
  History,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { useMessages } from "../context/MessageContext";
import { useRoom } from "../context/RoomContext";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "../component/Chat/MessageBubble";
import MessageInput from "../component/Chat/MessageInput";

const ChatRoom = () => {
  const { roomCode } = useParams();
  const normalizedRoomCode = roomCode ? String(roomCode).trim().toUpperCase() : "";

  const { messages, fetchMessages, loadingOlder, hasMore, handleSendMessage } = useMessages();
  const { rooms, fetchRooms } = useRoom();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const bottomRef = useRef();
  const [copied, setCopied] = useState(false);
  const [roomError, setRoomError] = useState("");

  // Typing indicator state
  const [typingUser, setTypingUser] = useState("");
  const typingTimeoutRef = useRef(null);

  // Omegle reconnection grace period status
  const [reconnectingStatus, setReconnectingStatus] = useState("");

  const room = rooms?.find((r) => r.code?.toUpperCase() === normalizedRoomCode);
  const isOmegle = room ? room.type === "omegle" : true;

  // Hydrate rooms in background if not present, but NEVER block rendering
  useEffect(() => {
    if (!room) {
      fetchRooms().catch(() => { });
    }
  }, [room, fetchRooms]);

  useEffect(() => {
    if (!normalizedRoomCode) return;

    fetchMessages(normalizedRoomCode).catch((err) => {
      if (err?.statusCode === 404 || err?.message?.includes("not found")) {
        setRoomError("This room has expired or does not exist.");
      }
    });

    if (socket) {
      socket.emit("joinRoom", normalizedRoomCode);

      const handleConnect = () => {
        socket.emit("joinRoom", normalizedRoomCode);
      };
      socket.on("connect", handleConnect);

      socket.on("roomNotFound", () => {
        setRoomError("This room has expired or does not exist.");
      });

      // Typing event listeners
      const handleUserTyping = (data) => {
        if (data.username && data.username !== user?.username) {
          setTypingUser(data.username);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUser("");
          }, 2000);
        }
      };
      socket.on("userTyping", handleUserTyping);

      // Stranger left / matched next listeners
      const handleStrangerReconnecting = (data) => {
        setReconnectingStatus(data?.message || "Stranger temporarily lost connection. Waiting 30s...");
      };
      const handleStrangerReconnected = () => {
        setReconnectingStatus("");
      };
      const handleStrangerLeft = (data) => {
        setReconnectingStatus(data?.message || "Stranger disconnected.");
      };

      socket.on("strangerReconnecting", handleStrangerReconnecting);
      socket.on("strangerReconnected", handleStrangerReconnected);
      socket.on("strangerLeft", handleStrangerLeft);
      socket.on("roomClosed", handleStrangerLeft);

      return () => {
        socket.off("connect", handleConnect);
        socket.off("roomNotFound");
        socket.off("userTyping", handleUserTyping);
        socket.off("strangerReconnecting", handleStrangerReconnecting);
        socket.off("strangerReconnected", handleStrangerReconnected);
        socket.off("strangerLeft", handleStrangerLeft);
        socket.off("roomClosed", handleStrangerLeft);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }
  }, [normalizedRoomCode, socket, fetchMessages, user?.username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const handleCopyCode = () => {
    const code = room?.code || normalizedRoomCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveOmegle = () => {
    if (socket) {
      socket.emit("leaveOmegleRoom", normalizedRoomCode);
      socket.emit("leaveOmegle", { roomCode: normalizedRoomCode });
      socket.emit("findStranger");
    }
    navigate("/rooms");
  };

  const handleSendIcebreaker = async (text) => {
    await handleSendMessage(normalizedRoomCode, text);
  };

  if (roomError) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#F6F8F6] text-[#111827]">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#111827] mb-2">Room Expired or Inactive</h2>
        <p className="text-xs text-[#526056] max-w-sm mb-6">
          {roomError} Burner rooms self-destruct once their timer expires or the participants leave.
        </p>
        <button
          onClick={() => navigate("/rooms")}
          className="btn-primary-social text-xs"
        >
          Return to Dashboard
        </button>
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-2">Session Expired or Missing</h2>
        <p className="text-xs text-[#94A3B8] max-w-sm mb-6">
          {roomError}
        </p>
        <button
          onClick={() => navigate('/rooms')}
          className="btn-primary-social text-xs"
        >
          Return to Transmissions
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F6F8F6] relative overflow-hidden">

      {/* TOP HEADER */}
      <header className="h-14 px-4 md:px-6 border-b border-[#D5E0D7] bg-white flex items-center justify-between shrink-0 z-10 shadow-2xs">
        
        {/* Left: Mobile back button + Room Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/rooms')}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-[#526056] hover:text-[#111827] hover:bg-[#E4EDE6] transition-colors"
            title="Back to rooms"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm md:text-base text-[#111827] flex items-center gap-2">
                {isOmegle ? "Stranger Conversation" : `Room ${room?.code || normalizedRoomCode}`}
              </h2>

              {!isOmegle && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-[#F6F8F6] border border-[#D5E0D7] text-[#1C4A2E] hover:bg-[#E4EDE6] transition-all"
                  title="Copy room code"
                >
                  {copied ? <Check className="w-3 h-3 text-[#1C4A2E]" /> : <Copy className="w-3 h-3" />}
                  <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#526056] mt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {room?.members?.length || 2} participant{room?.members?.length !== 1 ? "s" : ""}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[11px] text-[#1C4A2E] font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Zero Log Retention</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {isOmegle ? (
            <button
              onClick={handleLeaveOmegle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1C4A2E] hover:bg-[#163B25] text-white shadow-xs transition-all active:translate-y-px"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Next Stranger</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/rooms')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#526056] hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave Room</span>
            </button>
          )}
        </div>
      </header>

      {/* RECONNECTING NOTICE BANNER */}
      {reconnectingStatus && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-center gap-2 animate-pulse">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>{reconnectingStatus}</span>
        </div>
      )}

      {/* CHAT MESSAGES SCROLL AREA */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 space-y-1">
        
        {/* Load older messages button */}
        {hasMore && (
          <div className="text-center mb-4">
            <button
              onClick={() => {
                if (messages.length > 0) {
                  fetchMessages(normalizedRoomCode, messages[0]._id);
                }
              }}
              disabled={loadingOlder}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white hover:bg-[#F0F4F1] border border-[#D5E0D7] text-[#1C4A2E] shadow-2xs transition-all"
            >
              <History className="w-3.5 h-3.5 text-[#1C4A2E]" />
              <span>{loadingOlder ? "Loading older messages..." : "Load earlier conversation"}</span>
            </button>
          </div>
        )}

        {/* Empty state / Welcome Icebreakers */}
        {messages.length === 0 && (
          <div className="py-10 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#E4EDE6] border border-[#D5E0D7] flex items-center justify-center text-[#1C4A2E] mb-3 shadow-2xs">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-[#111827] mb-1">
              {isOmegle ? "You're connected with a stranger!" : `Welcome to Room ${room?.code || normalizedRoomCode}`}
            </h3>
            <p className="text-xs text-[#526056] mb-5">
              Say hello or pick a friendly icebreaker to start the conversation:
            </p>

            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "👋 Hey there! How's your day going?",
                "🎵 What's your current favorite song?",
                "🎬 Seen any good movies lately?",
                "🌍 Where in the world are you from?"
              ].map((icebreaker) => (
                <button
                  key={icebreaker}
                  onClick={() => handleSendIcebreaker(icebreaker)}
                  className="px-3 py-1.5 rounded-full text-xs bg-white hover:bg-[#E4EDE6] border border-[#D5E0D7] hover:border-[#1C4A2E] text-[#111827] shadow-2xs transition-all hover:scale-102 active:scale-98"
                >
                  {icebreaker}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages List */}
        {messages.map((msg, index) => {
          const senderId = msg.user_id?._id || msg.user_id;
          const isOwn = senderId && user?._id && senderId.toString() === user._id.toString();
          return (
            <MessageBubble
              key={msg._id || index}
              msg={msg}
              isOwn={Boolean(isOwn)}
            />
          );
        })}

        {/* Minimal Typing Indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D5E0D7] w-fit text-xs text-[#1C4A2E] shadow-2xs mb-2">
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C4A2E] animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C4A2E] animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C4A2E] animate-bounce"></span>
            </div>
            <span className="font-medium">{typingUser} is typing...</span>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* BOTTOM INPUT DOCK */}
      <div className="p-3 md:p-4 bg-[#F6F8F6] border-t border-[#D5E0D7]">
        <div className="max-w-4xl mx-auto">
          <MessageInput roomCode={normalizedRoomCode} />
        </div>
      </div>

    </div>
  );
};

export default ChatRoom;

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "../context/MessagContext";
import { useRoom } from "../context/RoomContext";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "../component/Chat/MessageBubble";
import MessageInput from "../component/Chat/MessageInput";

const ChatRoom = () => {
  const { roomCode } = useParams();
  const { messages, fetchMessages, loadingOlder, hasMore } = useMessages();
  const { rooms, fetchRooms } = useRoom();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const bottomRef = useRef();
  const [roomNotFound, setRoomNotFound] = useState(false);
  
  // Typing indicator state
  const [typingUser, setTypingUser] = useState("");
  const typingTimeoutRef = useRef(null);

  // If rooms isn't loaded yet, it might be undefined.
  const room = rooms?.find((r) => r.code === roomCode);
  const isOmegle = room?.type === "omegle";

  // If room isn't in local state, try fetching from backend (handles stranger matches, direct URL access)
  useEffect(() => {
    if (!room && !roomNotFound) {
      fetchRooms().then(() => {
        setTimeout(() => setRoomNotFound(true), 1000);
      });
    }
  }, [room, roomNotFound, fetchRooms]);

  useEffect(() => {
    fetchMessages(roomCode);
    
    if (socket) {
      // Connect to Socket Room Channel
      socket.emit("joinRoom", roomCode);

      // Re-join if the socket reconnects
      const handleConnect = () => {
        socket.emit("joinRoom", roomCode);
      };
      socket.on("connect", handleConnect);

      socket.on("userTyping", (data) => {
        setTypingUser(data.username);
        
        // Clear the typing indicator if they stop typing for 2 seconds
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser("");
        }, 2000);
      });

      // Handle omegle room being closed by the other user
      socket.on("roomClosed", (data) => {
        alert(data?.message || "The stranger has left the chat.");
        fetchRooms();
        navigate("/rooms");
      });

      // Handle standard room being deleted by the admin
      socket.on("roomDeleted", () => {
        alert("ERROR: The creator has deleted this room. It no longer exists.");
        fetchRooms();
        navigate("/rooms");
      });
    }

    return () => {
      if (socket) {
        socket.off("userTyping");
        socket.off("connect");
        socket.off("roomClosed");
        socket.off("roomDeleted");
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, socket]);

  // Only scroll to bottom when a NEW message arrives at the end.
  // Loading older messages at the top will not trigger this scroll.
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1]._id : null;
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lastMessageId]);

  // Leave omegle room and go find a new stranger
  const handleLeaveOmegle = () => {
    if (socket) {
      socket.emit("leaveOmegleRoom", roomCode);
    }
    fetchRooms();
    navigate("/rooms");
  };

  if (!room) {
    if (!roomNotFound) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <p className="animate-pulse uppercase tracking-widest">ESTABLISHING_SECURE_CONNECTION...</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="terminal-box text-center">
          <p className="text-[var(--accent-color)] glitch-anim uppercase mb-4">
            ERROR: ROOM DOES NOT EXIST OR ACCESS DENIED
          </p>
          <button className="btn-terminal" onClick={() => navigate('/rooms')}>
            [ ABORT_AND_RETURN ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-2 md:p-4 max-w-5xl mx-auto w-full">

      {/* HEADER */}
      <div className="border border-[var(--border-color)] p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-color)]">
        <div>
          <h2 className="text-xl font-bold tracking-widest uppercase">
            {'>'} ROOM_HASH: <span className="text-[var(--accent-color)]">{room.code}</span>
            {isOmegle && <span className="text-xs ml-2 text-[var(--accent-color)]">[OMEGLE]</span>}
          </h2>
          <p className="text-xs opacity-70 mt-1 uppercase">
            // ACTIVE_PARTICIPANTS: {room.members.length} | ENCRYPTION: ACTIVE
          </p>
        </div>

        <div className="flex gap-2">
          {isOmegle ? (
            <button
              className="btn-terminal text-xs text-[var(--accent-color)] border-[var(--accent-color)] hover:bg-[var(--accent-color)]"
              onClick={handleLeaveOmegle}
            >
              [ NEXT_STRANGER ]
            </button>
          ) : (
            <button
              className="btn-terminal text-xs text-[var(--accent-color)] border-[var(--accent-color)] hover:bg-[var(--accent-color)]"
              onClick={() => navigate('/rooms')}
            >
              [ DISCONNECT ]
            </button>
          )}
        </div>
      </div>

      {/* CHAT CONTAINER */}
      <div className="flex-1 overflow-y-auto border border-[var(--border-color)] p-4 mb-4 flex flex-col gap-2 bg-[var(--bg-color)]">
        
        <div className="text-center opacity-30 text-xs mb-4 border-b border-dashed border-[var(--border-color)] pb-2 uppercase">
          {isOmegle ? "--- STRANGER_CONNECTION_ESTABLISHED ---" : "--- CONNECTION_ESTABLISHED ---"}
        </div>

        {hasMore && (
          <div className="text-center mb-4">
            <button 
              onClick={() => {
                if (messages.length > 0) {
                  fetchMessages(roomCode, messages[0]._id);
                }
              }}
              disabled={loadingOlder}
              className="btn-terminal text-xs py-1"
            >
              {loadingOlder ? "[ LOADING_FRAGMENTS... ]" : "[ LOAD_PREVIOUS_MESSAGES ]"}
            </button>
          </div>
        )}

        {messages.map((msg, index) => (
          <MessageBubble key={msg._id || index} msg={msg} isOwn={msg.user_id?._id === user?._id} />
        ))}

        {/* Typing Indicator */}
        {typingUser && (
          <div className="text-xs opacity-50 mb-1 uppercase tracking-wider text-[var(--accent-color)] animate-pulse">
            {`> ${typingUser} is typing...`}
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* INPUT BOX */}
      <MessageInput roomCode={roomCode} />
      
      <div className="text-center mt-2 opacity-30 text-[10px] uppercase">
        // DO NOT SHARE SENSITIVE INFORMATION. THIS ROOM CAN SELF DESTRUCT.
      </div>
    </div>
  );
};

export default ChatRoom;

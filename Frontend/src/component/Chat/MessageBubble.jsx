import { memo, useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { CheckCheck, Check, SmilePlus } from "lucide-react";
import { useParams } from "react-router-dom";
import { useMessages } from "../../context/MessageContext";
import { useAuth } from "../../context/AuthContext";
import { getAvatarColor, getInitials } from "../../utils/avatar";

const QUICK_EMOJIS = ["❤️", "🔥", "😂", "👍", "✨", "😮"];

const MessageBubble = memo(({ msg, isOwn }) => {
  const { roomCode } = useParams();
  const { handleReactMessage } = useMessages();
  const { user } = useAuth();

  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  const dateObj = msg?.createdAt ? new Date(msg.createdAt) : new Date();
  const timeString = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const username = msg?.user_id?.username || "Stranger";
  const text = msg?.content || msg?.message || msg?.text || "";

  const avatar = getAvatarColor(username);
  const initials = getInitials(username);

  const currentUserId = user?._id?.toString() || "me";
  const reactions = msg?.reactions || {};

  // Close reaction picker on click outside
  useEffect(() => {
    if (!showPicker) return;
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showPicker]);

  const handleSelectEmoji = (emoji) => {
    if (handleReactMessage && roomCode && msg?._id) {
      handleReactMessage(roomCode, msg._id, emoji);
    }
    setShowPicker(false);
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`group relative flex w-full mb-3 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div className={`flex gap-2.5 max-w-[85%] md:max-w-[70%] items-end ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar for Stranger/Other user */}
        {!isOwn && (
          <div 
            title={username}
            className={`w-7 h-7 rounded-full ${avatar.bg} ${avatar.text} border ${avatar.border} flex items-center justify-center text-[11px] font-bold shrink-0 mb-1 shadow-2xs`}
          >
            {initials}
          </div>
        )}

        {/* Message Content Container */}
        <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} min-w-0`}>
          
          {/* Sender Name for incoming messages */}
          {!isOwn && (
            <span className="text-[11px] font-bold text-[#1C4A2E] mb-1 px-1">
              {username}
            </span>
          )}

          {/* Speech Bubble Container with Reaction Trigger */}
          <div className="relative group/bubble flex items-center gap-1.5">

            {/* Bubble itself */}
            <div
              className={`px-3.5 py-2.5 rounded-2xl break-words text-sm leading-relaxed border ${
                isOwn
                  ? "bg-[#E4EDE6] border-[#C5D7C8] text-[#111827] rounded-br-xs shadow-2xs"
                  : "bg-white border-[#D5E0D7] text-[#111827] rounded-bl-xs shadow-2xs"
              }`}
            >
              {text}

              {/* Time & Receipt meta */}
              <div
                className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${
                  isOwn ? "text-[#526056]" : "text-[#869684]"
                }`}
              >
                <span>{timeString}</span>
                {isOwn && (
                  msg.isOptimistic ? (
                    <Check className="w-3.5 h-3.5 text-[#1C4A2E] animate-pulse" title="Sending..." />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5 text-[#1C4A2E]" title="Delivered" />
                  )
                )}
              </div>
            </div>

            {/* Reaction Trigger Button (Hover on Desktop, Tap on Mobile) */}
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className={`
                p-1.5 rounded-full text-[#869684] hover:text-[#1C4A2E] hover:bg-[#E4EDE6] transition-all shrink-0
                ${showPicker ? "opacity-100 bg-[#E4EDE6] text-[#1C4A2E]" : "opacity-0 group-hover/bubble:opacity-100 md:opacity-0 max-md:opacity-60"}
              `}
              title="Add reaction"
            >
              <SmilePlus className="w-3.5 h-3.5" />
            </button>

            {/* Floating Quick Emoji Picker Popover */}
            <AnimatePresence>
              {showPicker && (
                <Motion.div
                  ref={pickerRef}
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className={`
                    absolute bottom-full mb-1.5 z-30 flex items-center gap-1 bg-white border border-[#D5E0D7] px-2 py-1 rounded-full shadow-md
                    ${isOwn ? "right-0" : "left-0"}
                  `}
                >
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSelectEmoji(emoji)}
                      className="hover:scale-125 transition-transform text-sm p-1 rounded-full hover:bg-[#F0F4F1] active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </Motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Active Reaction Pills Container */}
          {Object.keys(reactions).length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 px-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
              {Object.entries(reactions).map(([emoji, usersList]) => {
                const count = Array.isArray(usersList) ? usersList.length : Number(usersList) || 1;
                const hasReacted = Array.isArray(usersList) && usersList.includes(currentUserId);

                if (count <= 0) return null;

                return (
                  <Motion.button
                    key={emoji}
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleSelectEmoji(emoji)}
                    className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-150 border
                      ${hasReacted
                        ? "bg-[#E8F3EE] border-[#1C4A2E] text-[#1C4A2E] font-semibold"
                        : "bg-white border-[#D5E0D7] text-[#111827] hover:border-[#1C4A2E]"
                      }
                    `}
                    title={hasReacted ? "Click to remove reaction" : "Click to react"}
                  >
                    <span>{emoji}</span>
                    <span className={`text-[10px] ${hasReacted ? "text-[#1C4A2E]" : "text-[#526056]"}`}>
                      {count}
                    </span>
                  </Motion.button>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </Motion.div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;

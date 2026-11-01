import { useState, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Send, Smile } from "lucide-react";
import { useMessages } from "../../context/MessageContext";
import { useSocket } from "../../context/SocketContext";

const EMOJI_PALETTE = ["😊", "😂", "🔥", "❤️", "👍", "✨", "🎉", "👀", "🍕", "☕", "🚀", "💯"];

const MessageInput = ({ roomCode }) => {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { handleSendMessage } = useMessages();
  const { socket } = useSocket();
  const lastTypingTime = useRef(0);
  const inputRef = useRef(null);

  const send = async () => {
    if (!text.trim()) return;
    const msgToSend = text.trim();
    setText("");
    setShowEmojiPicker(false);
    await handleSendMessage(roomCode, msgToSend);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    } else if (socket && e.key.length === 1) {
      if (Date.now() - lastTypingTime.current > 1500) {
        lastTypingTime.current = Date.now();
        socket.emit("typing", { roomCode, key: e.key });
      }
    }
  };

  const handleInsertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      
      {/* Emoji Picker Popover */}
      <AnimatePresence>
        {showEmojiPicker && (
          <Motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full mb-2 left-0 sm:left-2 p-2.5 bg-white border border-[#D5E0D7] rounded-xl shadow-lg z-30 max-w-xs"
          >
            <div className="grid grid-cols-6 gap-1.5 text-lg">
              {EMOJI_PALETTE.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleInsertEmoji(emoji)}
                  className="hover:scale-125 transition-transform p-1.5 rounded-lg hover:bg-[#E4EDE6] active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Bar */}
      <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-white border border-[#D5E0D7] focus-within:border-[#1C4A2E] rounded-xl shadow-2xs transition-all">
        
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2 rounded-lg transition-colors ${
            showEmojiPicker 
              ? "text-[#1C4A2E] bg-[#E4EDE6]" 
              : "text-[#526056] hover:text-[#1C4A2E] hover:bg-[#F0F4F1]"
          }`}
          title="Add Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a friendly message..."
          className="flex-1 bg-transparent text-sm text-[#111827] focus:outline-none placeholder-[#869684] px-1 py-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Send Button */}
        <Motion.button
          whileTap={{ scale: 0.94 }}
          onClick={send}
          disabled={!text.trim()}
          className={`
            w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 shrink-0
            ${text.trim()
              ? "bg-[#1C4A2E] text-white hover:bg-[#163B25] shadow-xs active:translate-y-px"
              : "bg-[#E4EDE6] text-[#869684] cursor-not-allowed"
            }
          `}
          title="Send"
        >
          <Send className="w-4 h-4 translate-x-0.2" />
        </Motion.button>
      </div>

    </div>
  );
};

export default MessageInput;

import { useState } from "react";
import { useMessages } from "../../context/MessagContext";
import { useSocket } from "../../context/SocketContext";

const MessageInput = ({ roomCode }) => {
  const [text, setText] = useState("");
  const { handleSendMessage } = useMessages();
  const { socket } = useSocket();

  const send = async () => {
    if (!text.trim()) return;
    await handleSendMessage(roomCode, text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      send();
    } else if (socket && e.key.length === 1) { // Only emit printable characters
      socket.emit("typing", { roomCode, key: e.key });
    }
  };

  return (
    <div className="flex gap-2 p-2 border border-[var(--border-color)] bg-[var(--bg-color)]">
      <div className="flex items-center text-[var(--accent-color)] pl-2">
        {'>'}
      </div>
      <input
        type="text"
        placeholder="INPUT_COMMAND_OR_MESSAGE..."
        className="w-full bg-transparent text-[var(--text-color)] focus:outline-none focus:ring-0 placeholder-[var(--text-color)]/30 font-mono tracking-wider ml-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        className="btn-terminal border-l border-[var(--border-color)] border-y-0 border-r-0 hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] px-6"
        onClick={send}
      >
        [TRANSMIT]
      </button>
    </div>
  );
};

export default MessageInput;

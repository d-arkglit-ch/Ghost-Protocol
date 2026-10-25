import { memo } from "react";

const MessageBubble = memo(({ msg, isOwn }) => {
  const dateObj = msg?.createdAt ? new Date(msg.createdAt) : new Date();
  const timeString = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const username = msg?.user_id?.username || "ANON";
  const text = msg?.content || msg?.message || msg?.text || "";

  return (
    <div className={`flex flex-col w-full mb-4 ${isOwn ? "items-end" : "items-start"}`}>
      <div className="text-xs opacity-50 mb-1 uppercase tracking-wider">
        {isOwn ? "YOU" : `> ${username}`} [{timeString}]
      </div>

      <div 
        className={`px-4 py-2 max-w-[85%] md:max-w-[70%] break-words border border-[var(--border-color)] ${
          isOwn 
            ? "bg-[var(--text-color)] text-[var(--bg-color)]" 
            : "bg-[var(--bg-color)] text-[var(--text-color)]"
        }`}
      >
        {text}
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;

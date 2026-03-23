const MessageBubble = ({ msg, isOwn }) => {
  const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex flex-col w-full mb-4 ${isOwn ? "items-end" : "items-start"}`}>
      <div className="text-xs opacity-50 mb-1 uppercase tracking-wider">
        {isOwn ? "YOU" : `> ${msg.user_id?.username || "ANON"}`} [{timeString}]
      </div>

      <div 
        className={`px-4 py-2 max-w-[85%] md:max-w-[70%] break-words border border-[var(--border-color)] ${
          isOwn 
            ? "bg-[var(--text-color)] text-[var(--bg-color)]" 
            : "bg-[var(--bg-color)] text-[var(--text-color)]"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
};

export default MessageBubble;

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { getMessage, deleteMessage, sendMessage } from "../api/messageApi";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();

  const fetchMessages = async (roomCode, cursor = null) => {
    try {
      if (cursor) setLoadingOlder(true);
      else setLoading(true);

      const { parsed } = await getMessage(roomCode, cursor);
      const { messages: newMsgs, hasMore: more } = parsed.data || {};

      setHasMore(more || false);

      setMessages((prev) => {
        if (cursor) return [...(newMsgs || []), ...prev];
        return newMsgs || [];
      });
    } catch (error) {
      console.error("fetchMessages error:", error);
    } finally {
      setLoading(false);
      setLoadingOlder(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (error) {
      console.error("handleDeleteMessage error:", error);
    }
  };

  const handleSendMessage = async (roomCode, content, mediaUrl = null) => {
    try {
      const normalizedCode = String(roomCode).trim().toUpperCase();
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      const optimisticMessage = {
        _id: tempId,
        content,
        media_url: mediaUrl,
        createdAt: new Date().toISOString(),
        user_id: user ? { _id: user._id, username: user.username, avatar_url: user.avatar_url } : { username: "YOU" },
        isOptimistic: true,
        reactions: {},
      };

      // 1. Immediately show message in sender's chat UI (0ms latency!)
      setMessages((prev) => [...prev, optimisticMessage]);

      // 2. Dispatch via socket if connected
      if (socket && socket.connected) {
        socket.emit("newMessage", { roomCode: normalizedCode, content, mediaUrl });
        return;
      }

      // 3. Fallback to REST API if socket is temporarily offline
      const messageData = {
        roomCode: normalizedCode,
        message: content,
      };
      const { parsed } = await sendMessage(messageData);
      if (parsed?.data) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...parsed.data, reactions: {} } : m))
        );
      }
    } catch (error) {
      console.error("handleSendMessage error:", error);
    }
  };

  // Toggle reaction on a message & broadcast
  const handleReactMessage = (roomCode, messageId, emoji) => {
    if (!roomCode || !messageId || !emoji) return;
    const currentUserId = user?._id?.toString() || "me";

    // 1. Optimistically toggle locally in message state
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg._id !== messageId) return msg;

        const currentReactions = { ...(msg.reactions || {}) };
        const usersForEmoji = [...(currentReactions[emoji] || [])];

        const userIdx = usersForEmoji.indexOf(currentUserId);
        if (userIdx !== -1) {
          // Already reacted -> remove reaction (toggle off)
          usersForEmoji.splice(userIdx, 1);
        } else {
          // Not reacted yet -> add reaction (toggle on)
          usersForEmoji.push(currentUserId);
        }

        if (usersForEmoji.length > 0) {
          currentReactions[emoji] = usersForEmoji;
        } else {
          delete currentReactions[emoji];
        }

        return { ...msg, reactions: currentReactions };
      })
    );

    // 2. Emit over socket to other chatters
    if (socket && socket.connected) {
      socket.emit("reactMessage", {
        roomCode: String(roomCode).trim().toUpperCase(),
        messageId,
        emoji,
      });
    }
  };

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      setMessages((prev) => {
        // If this matches an optimistic message from us, replace it with the persisted one
        const tempIndex = prev.findIndex(
          (m) => m.isOptimistic && m.content === newMessage.content && (
            m.user_id?._id === newMessage.user_id?._id || 
            m.user_id?._id === newMessage.user_id ||
            m.user_id?.username === newMessage.user_id?.username
          )
        );

        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = {
            ...newMessage,
            reactions: updated[tempIndex].reactions || {},
          };
          return updated;
        }

        // Avoid adding duplicate messages
        if (prev.find((m) => m._id === newMessage._id)) return prev;
        return [...prev, { ...newMessage, reactions: newMessage.reactions || {} }];
      });
    };

    const handleMessageDeleted = (deletedId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== deletedId));
    };

    // Live incoming emoji reaction from stranger
    const handleMessageReaction = ({ messageId, emoji, userId }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id !== messageId) return msg;

          const currentReactions = { ...(msg.reactions || {}) };
          const usersForEmoji = [...(currentReactions[emoji] || [])];

          const userIdx = usersForEmoji.indexOf(userId);
          if (userIdx !== -1) {
            usersForEmoji.splice(userIdx, 1);
          } else {
            usersForEmoji.push(userId);
          }

          if (usersForEmoji.length > 0) {
            currentReactions[emoji] = usersForEmoji;
          } else {
            delete currentReactions[emoji];
          }

          return { ...msg, reactions: currentReactions };
        })
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageReaction", handleMessageReaction);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageReaction", handleMessageReaction);
    };
  }, [socket]);

  return (
    <MessageContext.Provider
      value={{
        messages,
        loading,
        loadingOlder,
        hasMore,
        fetchMessages,
        handleSendMessage,
        handleDeleteMessage,
        handleReactMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);

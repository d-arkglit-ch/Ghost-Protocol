/* eslint-disable react-refresh/only-export-components */
import { createContext , useContext , useState , useEffect } from "react";
import { getMessage , deleteMessage  , sendMessage } from "../api/messageApi";
import { useSocket } from "./SocketContext";

const MessageContext  = createContext();

export const  MessageProvider = ({children})=>{
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const {socket}= useSocket();

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
        console.error(`${error}`);
      } finally {
        setLoading(false);
        setLoadingOlder(false);
      }
    };

    const handleDeleteMessage = async (messageId) => {
      try {
        await deleteMessage(messageId);
        setMessages((prev) => prev.filter((m) => m._id != messageId));
      } catch (error) {
        console.error(`${error}`);
      }
    };
 
    const handleSendMessage = async (roomCode, content, mediaUrl = null) => {
      try {
        if (socket && socket.connected) {
          // Native socket communication ensures absolute identity integrity
          // and avoids REST API vs WebSocket race conditions
          socket.emit("newMessage", { roomCode, content, mediaUrl });
          return;
        }

        const messageData = {
          roomCode,
          message: content,
        };
        const { parsed } = await sendMessage(messageData);
        setMessages((prev) => {
          // Prevent duplicates if socket already added it
          if (prev.find((m) => m._id === parsed.data._id)) return prev;
          return [...prev, parsed.data];
        });
      } catch (error) {
        console.error(`${error}`);
      }
    };

     // Real-time socket updates
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => {
        if (prev.find(m => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    });

    socket.on("messageDeleted", (deletedId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== deletedId));
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageDeleted");
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
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);

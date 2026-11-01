import { Message } from "../models/messageModel.js";
import { Room } from "../models/roomModel.js";
import { Server } from "socket.io";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/userModels.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import cookie from "cookie"; // You'll need to install this: npm install cookie

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.use(async(socket , next)=>{
    try{
      let token = socket.handshake.auth.token;
      
      // Fallback to checking cookies if not explicitly passed in auth
      if (!token && socket.handshake.headers.cookie) {
        const parsedCookies = cookie.parse(socket.handshake.headers.cookie);
        token = parsedCookies.accessToken;
      }

      if(!token){
        throw new ApiError(401 , "Unauthorized")
      }
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded._id);
      if(!user){
        throw new ApiError(401 , "Unauthorized")
      }
      socket.user = user;
      next();
    }catch(error){
      next(new Error("Unauthorized"));
    }
  })

  let waitingQueue = [];

  // Liveness safeguard probe with timeout
  const isSocketAlive = async (candSocket) => {
    try {
      if (!candSocket || !candSocket.connected || candSocket.disconnected) return false;
      if (!io.sockets.sockets.has(candSocket.id)) return false;
      if (candSocket.conn?.readyState !== "open") return false;

      const res = await candSocket.timeout(1200).emitWithAck("pingCheck");
      return res?.status === "alive";
    } catch {
      return false;
    }
  };

  // Omegle Disconnect Grace Period Tracker (roomCode -> timeoutId)
  const pendingOmegleDisconnects = new Map();

  // Helper function to generate an uppercase room code
  const generateSecureRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  io.on("connection", async (socket) => {
    if (socket.user?._id) {
      await User.findByIdAndUpdate(socket.user._id, { lastActive: Date.now() });
    }
    console.log("⚡ socket connected:", socket.id);

    socket.on("joinRoom", async(rawRoomCode) => {
      try {
        if (!rawRoomCode) return;
        const roomCode = String(rawRoomCode).trim().toUpperCase();
        const userId = socket.user._id;

        const room = await Room.findOne({ 
          $or: [{ code: roomCode }, { code: roomCode.toLowerCase() }] 
        });

        if(!room){
          socket.emit("roomNotFound", { roomCode });
          throw new ApiError(404 , "Room not found")
        }

        const isMember = room.members?.some((m) => m.toString() === userId.toString());
        if(!isMember){
          room.members.push(userId);
          await room.save();
        }

        socket.join(room.code);
        if (room.code !== roomCode) {
          socket.join(roomCode);
        }
        
        // Cache verified room IDs in socket memory to bypass DB later
        if (!socket.verifiedRooms) socket.verifiedRooms = new Map();
        socket.verifiedRooms.set(room.code, room._id);
        socket.verifiedRooms.set(roomCode, room._id);

        // Cancel pending grace period if reconnecting
        if (pendingOmegleDisconnects.has(room.code) || pendingOmegleDisconnects.has(roomCode)) {
          const timerId = pendingOmegleDisconnects.get(room.code) || pendingOmegleDisconnects.get(roomCode);
          clearTimeout(timerId);
          pendingOmegleDisconnects.delete(room.code);
          pendingOmegleDisconnects.delete(roomCode);

          socket.to(room.code).emit("strangerReconnected", {
            message: "Stranger reconnected.",
          });
          if (room.code !== roomCode) {
            socket.to(roomCode).emit("strangerReconnected", {
              message: "Stranger reconnected.",
            });
          }
          console.log(`⚡ Cancelled grace period for Omegle room ${room.code} (user reconnected)`);
        }

        console.log(`✅ socket ${socket.id} joined room ${room.code}`);
      } catch (error) {
        socket.emit("error", { message: error?.message || "Failed to join room" });
      }
    });

    socket.on("newMessage", async (message) => {
      try {
        const rawRoomCode = message?.roomCode;
        if(!rawRoomCode){
          throw new ApiError(400 , "Room code is required")
        }
        const roomCode = String(rawRoomCode).trim().toUpperCase();
        const content = message?.content ?? message?.message ?? message?.text;

        if(!content){
          throw new ApiError(400 , "Message content is required")
        }

        // Check memory cache first, or self-heal fallback to DB
        let roomId = socket.verifiedRooms?.get(roomCode);
        let actualRoomCode = roomCode;

        if(!roomId){
          const room = await Room.findOne({ 
            $or: [{ code: roomCode }, { code: roomCode.toLowerCase() }] 
          });
          if(!room){
            throw new ApiError(404 , "Room not found");
          }
          if(!room.members?.some((m) => m.toString() === socket.user._id.toString())){
            room.members.push(socket.user._id);
            await room.save();
          }
          actualRoomCode = room.code;
          if (!socket.verifiedRooms) socket.verifiedRooms = new Map();
          socket.verifiedRooms.set(actualRoomCode, room._id);
          socket.verifiedRooms.set(roomCode, room._id);
          roomId = room._id;
        }

        // Always ensure sender socket is joined to the room channel
        socket.join(actualRoomCode);

        const newMessage = await Message.create({
          room_id: roomId,
          user_id: socket.user._id,
          content,
          media_url: message?.mediaUrl || null,
        });

        // Zero-DB-overhead payload assembly with clean string IDs
        const populatedMessage = {
          _id: newMessage._id.toString(),
          room_id: roomId.toString(),
          content: newMessage.content,
          media_url: newMessage.media_url || null,
          createdAt: newMessage.createdAt || new Date().toISOString(),
          user_id: {
            _id: socket.user._id.toString(),
            username: socket.user.username,
            avatar_url: socket.user.avatar_url || null,
          },
        };

        io.to(actualRoomCode).emit("receiveMessage", populatedMessage);
        if (actualRoomCode !== roomCode) {
          io.to(roomCode).emit("receiveMessage", populatedMessage);
        }

        // Fire and forget updating the room's last_active
        Room.findByIdAndUpdate(roomId, { last_active: Date.now() }).exec();
      } catch (error) {
        socket.emit("error", { message: error?.message || "Failed to send message" });
      }
    });

    socket.on("cancelFindStranger", () => {
      waitingQueue = waitingQueue.filter(
        (item) => item.socketId !== socket.id && item.userId !== socket.user?._id?.toString()
      );
      console.log(`User ${socket.user.username} cancelled search`);
    });

    socket.on("findStranger", async () => {
      try {
        console.log(`User ${socket.user.username} is looking for a stranger`);
        
        // Remove self from queue if already in it (prevent duplicates and self-pairing)
        waitingQueue = waitingQueue.filter(
          (item) => item.socketId !== socket.id && item.userId !== socket.user?._id?.toString()
        );

        // Find the first valid alive waiting user using lightweight descriptor
        let matchedSocket = null;
        while (waitingQueue.length > 0) {
          const candidateItem = waitingQueue.shift();

          // Skip self or invalid candidate
          if (
            !candidateItem ||
            candidateItem.socketId === socket.id ||
            candidateItem.userId === socket.user?._id?.toString()
          ) {
            continue;
          }

          // Retrieve live socket instance on demand
          const candidateSocket = io.sockets.sockets.get(candidateItem.socketId);
          if (!candidateSocket || !candidateSocket.connected) {
            console.log(`⚠️ Pruned disconnected socket descriptor: ${candidateItem.socketId}`);
            continue;
          }

          // Active ping/pong safeguard verification
          const alive = await isSocketAlive(candidateSocket);
          if (alive) {
            matchedSocket = candidateSocket;
            break;
          } else {
            console.log(`⚠️ Pruned inactive/zombie socket: ${candidateItem.socketId}`);
          }
        }

        if (matchedSocket) {
          console.log(`Matched! Creating room for ${matchedSocket.user.username} and ${socket.user.username}`);
          
          const roomCode = generateSecureRandomString(8);
          
          // Create the room in the DB as omegle type
          const room = await Room.create({
            code: roomCode,
            created_by: matchedSocket.user._id,
            members: [matchedSocket.user._id, socket.user._id],
            type: "omegle",
          });

          // Cache it for both users instantly
          if (!matchedSocket.verifiedRooms) matchedSocket.verifiedRooms = new Map();
          matchedSocket.verifiedRooms.set(room.code, room._id);
          
          if (!socket.verifiedRooms) socket.verifiedRooms = new Map();
          socket.verifiedRooms.set(room.code, room._id);

          // Immediately join both sockets to the room channel on the server
          matchedSocket.join(room.code);
          socket.join(room.code);

          // Tell both sockets to join the newly created room
          matchedSocket.emit("strangerMatched", { roomCode: room.code });
          socket.emit("strangerMatched", { roomCode: room.code });
        } else {
          // No one is waiting, push lightweight descriptor instead of full socket
          waitingQueue.push({
            socketId: socket.id,
            userId: socket.user._id.toString(),
            username: socket.user.username,
          });
          socket.emit("waitingForStranger", { message: "Looking for someone..." });
        }

      } catch (error) {
        socket.emit("error", { message: error?.message || "Matchmaking failed" });
      }
    });

    // Leave omegle room — deletes room & notifies the other user immediately (no grace period when manually leaving)
    const handleOmegleLeave = async (data) => {
      try {
        const rawRoomCode = (typeof data === "object" && data !== null) ? data.roomCode : data;
        if (!rawRoomCode) return;
        const roomCode = String(rawRoomCode).trim().toUpperCase();

        if (pendingOmegleDisconnects.has(roomCode)) {
          clearTimeout(pendingOmegleDisconnects.get(roomCode));
          pendingOmegleDisconnects.delete(roomCode);
        }

        const room = await Room.findOne({ 
          $or: [{ code: roomCode }, { code: roomCode.toLowerCase() }] 
        });
        if (!room) return;

        if (pendingOmegleDisconnects.has(room.code)) {
          clearTimeout(pendingOmegleDisconnects.get(room.code));
          pendingOmegleDisconnects.delete(room.code);
        }

        // Delete all messages in this room
        await Message.deleteMany({ room_id: room._id });
        // Delete the room
        await Room.findByIdAndDelete(room._id);

        // Notify everyone else in the room that it's closed
        socket.to(room.code).emit("roomClosed", { message: "Stranger has disconnected." });
        if (room.code !== roomCode) {
          socket.to(roomCode).emit("roomClosed", { message: "Stranger has disconnected." });
        }
        
        // Leave the socket.io room
        socket.leave(room.code);
        socket.leave(roomCode);

        console.log(`🗑️ Omegle room ${room.code} deleted by ${socket.user.username}`);
      } catch (error) {
        socket.emit("error", { message: error?.message || "Failed to leave room" });
      }
    };

    socket.on("leaveOmegleRoom", handleOmegleLeave);
    socket.on("leaveOmegle", handleOmegleLeave);

    // Also handle live typewriter events
    socket.on("typing", (data) => {
        const roomCode = data?.roomCode ? String(data.roomCode).trim().toUpperCase() : null;
        if (!roomCode) return;
        socket.to(roomCode).emit("userTyping", { userId: socket.user._id, username: socket.user.username, key: data.key });
        if (data.roomCode && data.roomCode !== roomCode) {
          socket.to(data.roomCode).emit("userTyping", { userId: socket.user._id, username: socket.user.username, key: data.key });
        }
    });

    // Real-time message reaction event
    socket.on("reactMessage", (data) => {
      try {
        const { roomCode, messageId, emoji } = data || {};
        if (!roomCode || !messageId || !emoji) return;
        const normalizedCode = String(roomCode).trim().toUpperCase();

        io.to(normalizedCode).emit("messageReaction", {
          messageId,
          emoji,
          userId: socket.user._id.toString(),
          username: socket.user.username,
        });

        if (data.roomCode && data.roomCode !== normalizedCode) {
          io.to(data.roomCode).emit("messageReaction", {
            messageId,
            emoji,
            userId: socket.user._id.toString(),
            username: socket.user.username,
          });
        }
      } catch (err) {
        console.error("Error broadcasting reaction:", err);
      }
    });

    socket.on("disconnect", async () => {
      if (socket.user?._id) {
        await User.findByIdAndUpdate(socket.user._id, { lastActive: Date.now() });
      }
      console.log("❌ User disconnected:", socket.id);
      // Remove from queue if they disconnect while waiting
      waitingQueue = waitingQueue.filter(
        (item) => item.socketId !== socket.id && item.userId !== socket.user?._id?.toString()
      );

      // Clean up any omegle rooms this user was in (with a 10s grace period for brief refreshes/reconnects)
      try {
        const omegleRooms = await Room.find({ 
          members: socket.user._id, 
          type: "omegle" 
        });
        
        for (const room of omegleRooms) {
          if (pendingOmegleDisconnects.has(room.code)) continue;

          // Alert other user that peer is reconnecting
          socket.to(room.code).emit("strangerReconnecting", {
            countdown: 10,
            message: "Stranger connection lost. Waiting 10s to reconnect...",
          });

          console.log(`⏳ [OMEGLE] Started 10s grace period for room ${room.code}`);

          const graceTimer = setTimeout(async () => {
            try {
              pendingOmegleDisconnects.delete(room.code);
              io.to(room.code).emit("roomClosed", { message: "Stranger disconnected." });
              await Message.deleteMany({ room_id: room._id });
              await Room.findByIdAndDelete(room._id);
              console.log(`🗑️ [OMEGLE] Grace period expired: Purged room ${room.code}`);
            } catch (err) {
              console.error("Error purging omegle room after grace period:", err);
            }
          }, 10000);

          pendingOmegleDisconnects.set(room.code, graceTimer);
        }
      } catch (err) {
        console.error("Error managing omegle disconnect grace period:", err);
      }
    });
  });

  return io;
};

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

  // Helper function to generate a room code (copied from room controller concept)
  const generateSecureRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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

    socket.on("joinRoom", async(roomCode) => {
      try {
        const userId = socket.user._id;
        const room = await Room.findOne({ code: roomCode });
        if(!room){
          throw new ApiError(404 , "Room not found")
        }
        const isMember = room.members?.some((m) => m.toString() === userId.toString());
        if(!isMember){
          throw new ApiError(403 , "You are not a member of this room")
        }
        socket.join(roomCode);
        
        // Cache verified room IDs in socket memory to bypass DB later
        if (!socket.verifiedRooms) socket.verifiedRooms = new Map();
        socket.verifiedRooms.set(roomCode, room._id);

        console.log(`✅ socket ${socket.id} joined room ${roomCode}`);
      } catch (error) {
        socket.emit("error", { message: error?.message || "Failed to join room" });
      }
    });

    socket.on("newMessage", async (message) => {
      try {
        const roomCode = message?.roomCode;
        const content = message?.content ?? message?.message ?? message?.text;

        if(!roomCode){
          throw new ApiError(400 , "Room code is required")
        }
        if(!content){
          throw new ApiError(400 , "Message content is required")
        }

        // Memory Check! (Zero DB calls)
        const roomId = socket.verifiedRooms?.get(roomCode);
        if(!roomId){
          throw new ApiError(403 , "You are not a verified member of this room")
        }

        const newMessage = await Message.create({
          room_id: roomId,
          user_id: socket.user._id,
          content,
          media_url: message?.mediaUrl || null,
        });

        const populatedMessage = await Message.findById(newMessage._id).populate(
          "user_id",
          "username avatar_url"
        );

        io.to(roomCode).emit("receiveMessage" , populatedMessage);

        // Fire and forget updating the room's last_active
        Room.findByIdAndUpdate(roomId, { last_active: Date.now() }).exec();
      } catch (error) {
        socket.emit("error", { message: error?.message || "Failed to send message" });
      }
    });

    socket.on("findStranger", async () => {
      try {
        console.log(`User ${socket.user.username} is looking for a stranger`);
        
        // Remove self from queue if already in it (prevent duplicates)
        waitingQueue = waitingQueue.filter(s => s.id !== socket.id && s.connected);

        // Find the first valid waiting user
        let matchedSocket = null;
        while (waitingQueue.length > 0) {
          const candidate = waitingQueue.shift();
          if (candidate.connected && candidate.id !== socket.id) {
            matchedSocket = candidate;
            break;
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

          // Tell both sockets to join the newly created room
          matchedSocket.emit("strangerMatched", { roomCode: room.code });
          socket.emit("strangerMatched", { roomCode: room.code });
        } else {
          // No one is waiting, so this user joins the queue
          waitingQueue.push(socket);
          socket.emit("waitingForStranger", { message: "Looking for someone..." });
        }

      } catch (error) {
        socket.emit("error", { message: error?.message || "Matchmaking failed" });
      }
    });

    // Leave omegle room — deletes room & notifies the other user
    socket.on("leaveOmegleRoom", async (roomCode) => {
      try {
        const room = await Room.findOne({ code: roomCode });
        if (!room) return;

        // Delete all messages in this room
        await Message.deleteMany({ room_id: room._id });
        // Delete the room
        await Room.findByIdAndDelete(room._id);

        // Notify everyone else in the room that it's closed
        socket.to(roomCode).emit("roomClosed", { message: "Stranger has disconnected." });
        
        // Leave the socket.io room
        socket.leave(roomCode);

        console.log(`🗑️ Omegle room ${roomCode} deleted by ${socket.user.username}`);
      } catch (error) {
        socket.emit("error", { message: error?.message || "Failed to leave room" });
      }
    });

    // Also handle live typewriter events
    socket.on("typing", (data) => {
        // data should contain { roomCode, key } or just { roomCode }
        socket.to(data.roomCode).emit("userTyping", { userId: socket.user._id, username: socket.user.username, key: data.key });
    });

    socket.on("disconnect", async () => {
      if (socket.user?._id) {
        await User.findByIdAndUpdate(socket.user._id, { lastActive: Date.now() });
      }
      console.log("❌ User disconnected:", socket.id);
      // Remove from queue if they disconnect while waiting
      waitingQueue = waitingQueue.filter(s => s.id !== socket.id);

      // Clean up any omegle rooms this user was in
      try {
        const omegleRooms = await Room.find({ 
          members: socket.user._id, 
          type: "omegle" 
        });
        
        for (const room of omegleRooms) {
          // Notify other users in the room
          socket.to(room.code).emit("roomClosed", { message: "Stranger has disconnected." });
          // Delete messages and room
          await Message.deleteMany({ room_id: room._id });
          await Room.findByIdAndDelete(room._id);
          console.log(`🗑️ Auto-deleted omegle room ${room.code} on disconnect`);
        }
      } catch (err) {
        console.error("Error cleaning up omegle rooms on disconnect:", err);
      }
    });
  });

  return io;
};

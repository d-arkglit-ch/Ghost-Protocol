import { Message } from "../models/messageModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Room } from "../models/roomModel.js";

const getMessages = asyncHandler(async(req , res)=>{
    const { roomCode } = req.params;
    if (!roomCode) {
        throw new ApiError(400, "Room code is required");
    }

    const normalizedCode = roomCode.trim().toUpperCase();
    const room = await Room.findOne({ 
        $or: [{ code: normalizedCode }, { code: normalizedCode.toLowerCase() }] 
    }).select("_id members code").lean();

    if(!room){
        throw new ApiError(404 , "Room Not Found");
    }

    const userId = req.user._id;
    const isMember = room.members?.some((m) => m.toString() === userId.toString());
    if(!isMember){
      await Room.findByIdAndUpdate(room._id, { $addToSet: { members: userId } });
    }
    
    const limit = 50;
    const query = { room_id: room._id };
    
    if (req.query.cursor) {
      query._id = { $lt: req.query.cursor };
    }

    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .populate("user_id" , "username avatar_url")
      .lean();

    messages.reverse();
    const hasMore = messages.length === limit;

    res.status(200).json(new ApiResponse(200 , { messages, hasMore }, "Messages Fetched"));
});

const deleteMessage = asyncHandler(async(req , res)=>{
    const { messageId } = req.params;
    const userId = req.user._id;
    const message = await Message.findById(messageId);
    if(!message) throw new ApiError(404 , "Message not found");

    const room = await Room.findById(message.room_id);
    if(!room) { throw new ApiError(404 , "Room not found"); }
  
    if(message.user_id.toString() !== userId.toString()){
        throw new ApiError(403 , "Not Authorized to delete this message");
    }
    await Message.findByIdAndDelete(messageId);
    req.app.get("io").to(room.code).emit("messageDeleted", messageId);
    res.status(200).json(
        new ApiResponse(200 , null , "Message deleted successfully")
    );
});

const sendMessage = asyncHandler(async (req, res) => {
  const { roomCode, message } = req.body;
  const userId = req.user._id;

  if (!roomCode || !message || !userId) {
    throw new ApiError(400, "roomCode, message and userId are required");
  }

  const normalizedCode = roomCode.trim().toUpperCase();
  const room = await Room.findOne({ 
    $or: [{ code: normalizedCode }, { code: normalizedCode.toLowerCase() }] 
  });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const isMember = room.members?.some((m) => m.toString() === userId.toString());
  if (!isMember) {
    throw new ApiError(403, "You are not a member of this room");
  }

  const newMessage = await Message.create({
    room_id: room._id,
    user_id: userId,
    content: message,
  });

  const populatedMessage = await Message.findById(newMessage._id)
    .populate("user_id", "username avatar_url");

  room.last_active = Date.now();
  await room.save();

  req.app.get("io").to(room.code).emit("receiveMessage", populatedMessage);
  if (room.code !== normalizedCode) {
    req.app.get("io").to(normalizedCode).emit("receiveMessage", populatedMessage);
  }

  res.status(200).json(new ApiResponse(200, populatedMessage, "Message sent successfully"));
});

export {
    getMessages,
    deleteMessage,
    sendMessage
};

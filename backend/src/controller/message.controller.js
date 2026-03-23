import { Message } from "../models/messageModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Room } from "../models/roomModel.js";
const getMessages = asyncHandler(async(req , res)=>{
    const {roomCode}= req.params;
    const room =await Room.findOne({code:roomCode});
    if(!room){
        throw new ApiError(404 , "Room Not Found");
    }
    const userId = req.user._id;
    const isMember = room.members?.some((m) => m.toString() === userId.toString());
    if(!isMember){
      throw new ApiError(403 , "You are not a member of this room");
    }
    
    const limit = 50;
    const query = { room_id: room._id };
    
    // If a cursor is provided, fetch messages older than the cursor ID
    if (req.query.cursor) {
      query._id = { $lt: req.query.cursor };
    }

    // Sort descending (_id: -1) gets the newest ones first. Then we limit to 50.
    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .populate("user_id" , "username avatar_url");

    // Reverse them to restore chronological order (oldest -> newest) for the frontend
    messages.reverse();

    // Tell the frontend if there are probably more messages
    const hasMore = messages.length === limit;

    res.status(200).json(new ApiResponse(200 , { messages, hasMore }, "Messages Fetched"));
})
const deleteMessage = asyncHandler(async(req , res)=>{
    const {messageId}=req.params;
    const userId = req.user._id;
    const message  = await Message.findById(messageId);
    if(!message)throw new ApiError(404 , "message not found")
        const room = await Room.findById(message.room_id)
      if(!room){throw new ApiError(404 , "Room not found")}
  
    if(message.user_id.toString()!==userId.toString()){
        throw new ApiError(403 , "Not Authorized to delete the message ")
    }
    await Message.findByIdAndDelete(messageId);
    req.app.get("io").to(room.code).emit("messageDeleted", messageId);
    res.status(200).json(
        new ApiResponse(200 , null ,"message deleted" )
    )
})

// sendMessage — read from req.body and defensive checks
const sendMessage = asyncHandler(async (req, res) => {
  const { roomCode, message } = req.body; // <- use req.body
const userId = req.user._id;
  if (!roomCode || !message || !userId) {
    throw new ApiError(400, "roomCode, message and userId are required");
  }

  const room = await Room.findOne({ code: roomCode });
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

  // update last active
  room.last_active = Date.now();
  await room.save();
  req.app.get("io").to(roomCode).emit("receiveMessage", populatedMessage);
  res.status(200).json(new ApiResponse(200, populatedMessage, "message sent successfully"));
});


export {
    getMessages,
    deleteMessage,
    sendMessage
}
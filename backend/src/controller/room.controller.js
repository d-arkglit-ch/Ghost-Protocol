import { Room } from "../models/roomModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";
import { Message } from "../models/messageModel.js";

function generateSecureRandomString(length) {
  const byteLength = Math.ceil(length / 2);
  return crypto.randomBytes(byteLength).toString("hex").substring(0, length).toUpperCase();
}

const createRoom = asyncHandler(async (req, res) => {
  const { timerMinutes } = req.body; // e.g. 5 for 5 minutes
  const code = generateSecureRandomString(8);
  const userId = req.user._id;

  if (!code) {
    throw new ApiError(400, "code is not present");
  }

  const roomPresent = await Room.findOne({ 
    $or: [{ code }, { code: code.toLowerCase() }] 
  }).select("_id").lean();

  if (roomPresent) {
    throw new ApiError(
      400,
      "Room already exists for this code. Please try again."
    );
  }

  let expires_at = null;
  if(timerMinutes && typeof timerMinutes === 'number') {
      expires_at = new Date(Date.now() + timerMinutes * 60000); // converting minutes to ms
  }

  const room = await Room.create({
    code,
    created_by: userId,
    members: [userId],
    expires_at
  });
  return res
    .status(201)
    .json(new ApiResponse(201, room, "Room successfully created"));
});

const joinRoom = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user._id;

  if (!code) {
    throw new ApiError(400, "Room code is required");
  }

  const normalizedCode = code.trim().toUpperCase();
  const room = await Room.findOne({ 
    $or: [{ code: normalizedCode }, { code: normalizedCode.toLowerCase() }] 
  });

  if (!room) {
    throw new ApiError(404, "Room doesn't exist or has expired");
  }

  if (!room.members.some(m => m.toString() === userId.toString())) {
    room.members.push(userId);
    await room.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, room, "Joined room successfully"));
});

const getRoom = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const rooms = await Room.find({ members: userId })
    .populate("members", "avatar_url username")
    .lean();

  return res.status(200).json(new ApiResponse(200, rooms, "Fetched user rooms"));
});

const deleteRoom = asyncHandler(async(req, res)=>{
  const { roomCode } = req.params;
  const userId = req.user._id;

  if (!roomCode) {
    throw new ApiError(400, "Room code is required");
  }

  const normalizedCode = roomCode.trim().toUpperCase();
  const room = await Room.findOne({ 
    $or: [{ code: normalizedCode }, { code: normalizedCode.toLowerCase() }] 
  }).select("_id created_by code").lean();

  if(!room){
    throw new ApiError(404, "Room not found");
  }

  if(room.created_by.toString() !== userId.toString()){
    throw new ApiError(403, "Only the room owner can delete this room");
  }

  await Message.deleteMany({ room_id: room._id });
  await Room.findByIdAndDelete(room._id);

  // Notify anyone currently in the room using both potential identifiers
  req.app.get("io").to(room.code).emit("roomDeleted", { roomCode: room.code });
  if (room.code !== normalizedCode) {
    req.app.get("io").to(normalizedCode).emit("roomDeleted", { roomCode: normalizedCode });
  }

  res.status(200).json(new ApiResponse(200, null, "Room deleted successfully"));
});

const removeMember = asyncHandler(async(req, res)=>{
  const { roomCode, memberId } = req.params;
  const userId = req.user._id;

  if (!roomCode || !memberId) {
    throw new ApiError(400, "Room code and member ID are required");
  }

  const normalizedCode = roomCode.trim().toUpperCase();
  const room = await Room.findOne({ 
    $or: [{ code: normalizedCode }, { code: normalizedCode.toLowerCase() }] 
  });

  if(!room){
    throw new ApiError(404, "Room not found");
  }

  if(room.created_by.toString() !== userId.toString()){
    throw new ApiError(403, "Only room owner can remove members");
  }

  room.members = room.members.filter(
    (m) => m.toString() !== memberId.toString()
  );

  await room.save();
  res.status(200).json(new ApiResponse(200, room, "Member removed successfully"));
});

export {
  createRoom,
  joinRoom,
  getRoom,
  deleteRoom,
  removeMember,
};

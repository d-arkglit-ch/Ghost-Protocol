import { Room } from "../models/roomModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto"
import { Message } from "../models/messageModel.js";
function generateSecureRandomString(length) {
  // Calculate the byte length needed for the desired string length (e.g., 2 hex chars per byte)
  const byteLength = Math.ceil(length / 2);
  return crypto.randomBytes(byteLength).toString("hex").substring(0, length);
}
const createRoom = asyncHandler(async (req, res) => {
  const { timerMinutes } = req.body; // e.g. 5 for 5 minutes
  const code = generateSecureRandomString(8);
  const userId = req.user._id;

  if (!code) {
    throw new ApiError(400, "code is not present");
  }

  const roomPresent = await Room.findOne({ code });
  if (roomPresent) {
    throw new ApiError(
      400,
      "Room already exist for this code use a differnt code"
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
    .json(new ApiResponse(201, room, "Room SuccesFully created "));
});

const joinRoom = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user._id;

  const room = await Room.findOne({ code });
  if (!room) {
    throw new ApiError(400, "room doesn't exist");
  }
  if (!room.members.some(m => m.toString() === userId.toString())) {  // here we are checking if the user is already in the room and we are not using includes because includes is not a good practice because it checks for reference not for value  
    room.members.push(userId);
    await room.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, room, "joined Room Successfully"));
});

const getRoom = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const rooms = await Room.find({ members: userId }).populate("members", "avatar_url username");

  return res.status(200).json(new ApiResponse(200, rooms, "fetched user room"));
});


const deleteRoom =asyncHandler(async(req, res)=>{
  const {roomCode}= req.params;
  const userId = req.user._id;
  const room  = await Room.findOne({code:roomCode});
  if(!room){
    throw new ApiError(404 , "room not found");
  }

  if(room.created_by.toString()!== userId.toString()){
    throw new ApiError(403 , "Only Room owner can delete the room")
  }

  await Message.deleteMany({room_id:room._id});
  await Room.findByIdAndDelete(room._id);

  // Notify anyone currently looking at the room that it's gone
  req.app.get("io").to(roomCode).emit("roomDeleted", { roomCode });

  res.status(200).json(new ApiResponse(200 , null , "room deleted"))
})
//removing the memberss
const removeMember  =asyncHandler(async(req, res)=>{
  const {roomCode, memberId}= req.params;
  const userId = req.user._id;
//check if the room is there or not 
  const room = await Room.findOne({code:roomCode});
  if(!room){
    throw new ApiError(404 , "Room not found");
  }
//checking if the current user is the admin
  if(room.created_by.toString()!==userId.toString()){
    throw new ApiError(403 , "Only room owner can remove any member")
  }
  //remaking the member list which does not include the selected user id which we want to delete 
room.members= room.members.filter(
  (m)=>m.toString()!==memberId.toString()
)

//saving the room using await as it is databas eoperation
await room.save();
res.status(200).json(new ApiResponse(200, room, "Member removed successfully"));

})
export  {
  createRoom,
  joinRoom,
  getRoom,
  deleteRoom,
  removeMember,
};

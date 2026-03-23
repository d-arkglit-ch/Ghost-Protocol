import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/userModels.js";
import { Room } from "../models/roomModel.js";
import { Message } from "../models/messageModel.js";
import bcrypt from "bcrypt";


const generateAccessAndRefreshToken = async (user) => {
  try {
    const dbuser = await User.findById(user._id); //finding user in the databae with the id of the user
    if (!dbuser) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = dbuser.generateAccessToken();
    const refreshToken = dbuser.generateRefreshToken();
    dbuser.refreshToken = refreshToken; //setting the refresh token in the database
    await dbuser.save({ validateBeforeSave: false }); //saving the user in the database
    return { accessToken, refreshToken }; //returning the access and refresh tokens
  } catch (error) {
    throw new ApiError(500, "something went wrong"); //throwing an error if something goes wrong
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get password and username from the request body
  const {username,password} = req.body;

  if ([username].some((feild) => feild?.trim() == "")) {
    throw new ApiError(400, "username is required");
  }
  //find if the user exist or not
  const existingUser = await User.findOne({ username });
  // if yes
  const hasUpper = /[A-Z]/.test(password || "");
  const hasLower = /[a-z]/.test(password || "");
  const hasNumber = /[0-9]/.test(password || "");
  const hasSpecial = /[^A-Za-z0-9]/.test(password || "");
  if (!password || password.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    throw new ApiError(
      400,
      "password must be at least 8 characters long and must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    );
  }
  if (existingUser) {
    return res.status(400).json(new ApiResponse(400,null, "Username already exist "));
  }

  // now if user does not exist hash the password
  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: username.toLowerCase(),
    password_hash,
  });

  // Auto-login: generate tokens so user is immediately authenticated
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user);

  const createdUser = await User.findById(user._id).select(
    "-password_hash -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(new ApiResponse(201, createdUser, "User registered and logged in successfully"));
});



const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ApiError(400, "username or password is not there ");
  }

  const user = await User.findOne({ username });
  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const passCorrect = await  user.isPasswordCorrect(password);

  if (!passCorrect) {
    throw new ApiError(401, "password is inccorrect");
  }
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user);

  await User.findByIdAndUpdate(user._id, { lastActive: Date.now() });

  //removing the password and referesh token
  const loggedUser = await User.findById(user._id).select(
    "-refreshToken -password_hash"
  );

  const option = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(new ApiResponse(200,loggedUser, "user logged in succesfully"));
});


const logoutUser = asyncHandler(async(req, res)=>{
  const userId   = req.user._id;

  const user = await User.findById(userId);
  if (user && user.isGuest) {
    // Cascade delete for guest users on explicit logout
    await Message.deleteMany({ user_id: userId });
    await Room.deleteMany({ created_by: userId });
    await Room.updateMany({ members: userId }, { $pull: { members: userId } });
    await User.findByIdAndDelete(userId);
  } else {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

const option={
httpOnly:true,
secure: true,
sameSite: "none",
}

res
.clearCookie("accessToken" , option)
.clearCookie("refreshToken" , option)
.status(200)
.json(new ApiResponse(200 , {} , "user logged out successfully"))
})

const loginGuest = asyncHandler(async (req, res) => {
  // Generate a random guest username
  const guestNumber = Math.floor(1000 + Math.random() * 9000); // 4 digit number
  const username = `Guest_${guestNumber}`;
  
  // Use a completely random dummy password that they will never use to log in again
  const password = await bcrypt.hash(Math.random().toString(36).substring(7), 10);

  // Create the temporary user in the database
  const user = await User.create({
    username,
    password_hash: password, // Already hashed
    isGuest: true,
  });

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user);

  const loggedUser = await User.findById(user._id).select(
    "-refreshToken -password_hash"
  );

  const option = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(new ApiResponse(200, loggedUser, "Guest logged in successfully"));
});

const getProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Not authorized");
  }
  
  const user = await User.findById(req.user._id).select("-password_hash -refreshToken");
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  return res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    loginGuest,
    getProfile
}
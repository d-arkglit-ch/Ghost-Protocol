import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/userModels.js"
import {asyncHandler} from "../utils/asyncHandler.js"
// export token 
// verify it 
// then decode it
// then find the user 
// and then pu the user in req.user
// and then next
export const verifyJWT =asyncHandler(async(req, res ,next)=>{
    try {
        const accessToken = req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ", "").trim();
        if(!accessToken){
            throw new ApiError(401 , "unauthorizzed access");
        }
const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decoded._id).select("-password_hash -refreshToken")
        if(!user){
            throw new ApiError(401 , "user not found")
        }

        req.user=user;
        next();
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid token")
    }
})
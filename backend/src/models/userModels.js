import mongoose , {Schema} from 'mongoose';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
const userSchema  = new Schema({
username:{
    type:String,
    required:true,
    unique:true,
    trim:true,
},
password_hash:{
type:String,
required:true,
},
avatar_url:{
    type:String,
    default:null,
},
refreshToken:{
    type:String,
},
isGuest: {
    type: Boolean,
    default: false,
},
lastActive: {
    type: Date,
    default: Date.now,
}

},{timestamps:true})

userSchema.index({ lastActive: 1, isGuest: 1 });

userSchema.methods.isPasswordCorrect = async function(password){
return await bcrypt.compare(password , this.password_hash)
}
//to create the  the generateAccesToken
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id:this._id,
        username:this.username,
    },
process.env.ACCESS_TOKEN_SECRET,
{
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
})
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id
    },
process.env.REFRESH_TOKEN_SECRET,
{
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
})
}

export const User   = mongoose.model("User" , userSchema);
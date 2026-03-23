import mongoose , {Schema} from 'mongoose';
import { User } from './userModels.js';
const roomSchema = new Schema({
    code:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    created_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,

},
members:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
}]
,
type:{
    type:String,
    enum:["burner","omegle"],
    default:"burner",
},
last_active:{
    type:Date,
    default:Date.now,
},
expires_at: {
    type: Date,
    default: null,
}
},{timestamps:true})

// This tells MongoDB to automatically delete the document when the current time hits expires_at
roomSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
export const Room  = mongoose.model("Room" , roomSchema);


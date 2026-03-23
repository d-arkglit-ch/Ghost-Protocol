import mongoose , {Schema} from "mongoose"
const messageSchema = new Schema({
room_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Room",
    required:true,
    index:true,
},
user_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
},
content:{
    type:String,
    default:null,
},
media_url:{
    type:String,
    default:null
}
},{
    timestamps:true,
})

export const Message =  mongoose.model("Message" , messageSchema)
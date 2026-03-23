import { Router   } from "express";
import { verifyJWT } from "../middleware/auth.middle.js";
import { deleteMessage, getMessages, sendMessage } from "../controller/message.controller.js";

const router = Router() ;
router.route("/:roomCode").get(verifyJWT , getMessages)
router.route("/deleteMessage/:messageId").delete(verifyJWT , deleteMessage)
router.route("/sendMessage").post(verifyJWT , sendMessage)
export default router;
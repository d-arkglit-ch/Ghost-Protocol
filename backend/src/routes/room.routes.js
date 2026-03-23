import { Router } from "express";
import {createRoom , joinRoom ,getRoom , deleteRoom , removeMember} from "../controller/room.controller.js"
import { verifyJWT } from "../middleware/auth.middle.js";

const router =Router();
router.route("/createRoom").post(verifyJWT , createRoom)
router.route("/joinRoom").post(verifyJWT , joinRoom)
router.route("/getRoom").get(verifyJWT , getRoom)
router.route("/deleteRoom/:roomCode").delete(verifyJWT , deleteRoom);
router.route("/:roomCode/deleteMember/:memberId").delete(verifyJWT , removeMember)
export default router;
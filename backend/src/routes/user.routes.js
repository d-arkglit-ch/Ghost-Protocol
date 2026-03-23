import {Router} from "express"
import { registerUser , loginUser, logoutUser, loginGuest, getProfile } from "../controller/user.controller.js"
import { verifyJWT } from "../middleware/auth.middle.js"
const router  = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/login-guest").post(loginGuest)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/profile").get(verifyJWT, getProfile)
export default router
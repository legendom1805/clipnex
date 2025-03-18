import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getChannelStats, getChannelVideosGlobal, getChannelVideosOur } from "../controllers/dashboard.controller.js";
const router = Router()

router.route("/s/:channelName").get(verifyJWT,getChannelVideosGlobal)
router.route("/get-channel-stats").get(verifyJWT,getChannelStats)

router.route("/get-channel-videos-our").get(verifyJWT,getChannelVideosOur)

export default router
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscribe,
  findSubscribers,
  findSubscribedTo,
} from "../controllers/subscription.controller.js";
const router = Router();

router.route("/toggle-subscribe/:channelId").post(verifyJWT, toggleSubscribe);
router.route("/find-subscribers/:channelId").get(findSubscribers);
router.route("/find-subscribed-channels/:subscriberId").get(findSubscribedTo);
export default router;

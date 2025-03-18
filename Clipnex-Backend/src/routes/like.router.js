import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLikedVideos,
  toggleCommentLike,
  togglePostLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = Router();

router.route("/toggle-like-v/:videoId").post(verifyJWT, toggleVideoLike);
router.route("/toggle-like-c/:commentId").post(verifyJWT, toggleCommentLike);
router.route("/toggle-like-p/:postId").post(verifyJWT, togglePostLike);
router.route("/get-liked-v").get(verifyJWT, getLikedVideos);

export default router;

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPost,
  getUserPosts,
  updatePost,
} from "../controllers/post.controller.js";
const router = Router();

router.route("/create-post").post(verifyJWT, createPost);
router.route("/get-posts/:userId").get(verifyJWT, getUserPosts);
router.route("/update-post/:postId").patch(verifyJWT, updatePost);
export default router;

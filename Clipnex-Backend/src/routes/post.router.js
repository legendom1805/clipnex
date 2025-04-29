import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPost,
  getUserPosts,
  updatePost,
  deletePost,
  getAllPosts,
} from "../controllers/post.controller.js";
const router = Router();

router.route("/create-post").post(verifyJWT, createPost);
router.route("/get-posts/:userId").get(verifyJWT, getUserPosts);
router.route("/update-post/:postId").patch(verifyJWT, updatePost);
router.route("/delete-post/:postId").delete(verifyJWT, deletePost);
router.route("/get-all-posts").get(verifyJWT, getAllPosts);

export default router;

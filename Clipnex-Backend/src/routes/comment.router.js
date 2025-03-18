import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getVideoComments,
    createVideoComment,
    createPostComment,
    updateComment,
    deleteComment, } from "../controllers/comment.controller.js";
const router = Router()

router.route("/video-comments/:videoId").get(verifyJWT,getVideoComments)
router.route("/add-comment-video/:videoId").post(verifyJWT,createVideoComment)
router.route("/add-comment-post/:postId").post(verifyJWT,createPostComment)
router.route("/update-comment/:commentId").patch(verifyJWT,updateComment)
router.route("/delete-comment/:commentId").delete(verifyJWT,deleteComment)


export default router
import { Router } from "express";
import {
  uploadVideo,
  deleteVideo,
  getVideobyId,
  updateVideo,
  togglePublishStatus,
  getAllvideos,
  updateVideoViews,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/upload-video").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);

router.route("/").get(getAllvideos);

router.route("/delete-video/:videoId").post(verifyJWT, deleteVideo);

router.route("/get-video/:videoId").get(getVideobyId);

router.route("/update-video/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

router.route("/views/:videoId").patch(updateVideoViews);

export default router;

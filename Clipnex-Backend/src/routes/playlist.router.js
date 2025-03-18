import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideofromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
const router = Router();

router.route("/create-playlist").post(verifyJWT, createPlaylist);
router.route("/get-user-playlists/:userId").get(verifyJWT, getUserPlaylist);
router.route("/get-playlist/:playlistId").get(verifyJWT, getPlaylistById);
router
  .route("/add-video/:playlistId/:videoId")
  .patch(verifyJWT, addVideoToPlaylist);
router
  .route("/remove-video/:playlistId/:videoId")
  .patch(verifyJWT, removeVideofromPlaylist);
router.route("/update-playlist/:playlistId").patch(verifyJWT, updatePlaylist);
export default router;

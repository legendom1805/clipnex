import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

//Router

import UserRouter from "./routes/user.router.js";
import VideoRouter from "./routes/video.router.js";
import PlaylistRouter from "./routes/playlist.router.js";
import SubscriptionRouter from "./routes/subscription.router.js";
import PostRouter from "./routes/post.router.js";
import CommentRouter from "./routes/comment.router.js";
import LikeRouter from "./routes/like.router.js";
import DashboardRouter from "./routes/dashboard.router.js";
import HealthRouter from "./routes/healthcheck.router.js";

app.use("/api/v1/users", UserRouter);

app.use("/api/v1/videos", VideoRouter);

app.use("/api/v1/playlist", PlaylistRouter);

app.use("/api/v1/subscription", SubscriptionRouter);

app.use("/api/v1/posts", PostRouter);

app.use("/api/v1/comments", CommentRouter);

app.use("/api/v1/likes", LikeRouter);

app.use("/api/v1/dashboard", DashboardRouter);

app.use("/api/v1/health", HealthRouter);

export { app };

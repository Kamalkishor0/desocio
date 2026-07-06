import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes";
import feedRouter from "./routes/feed.routes";
import postRouter from "./routes/post.routes";
import friendsRouter from "./routes/friends.routes";
import thoughtsRouter from "./routes/thought.routes";
import { authMiddleware } from "./middlewares/auth.middleware";
import profileRouter from "./routes/profile.routes";
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.get("/", (_req, res) => {
	res.json({ message: "Server is running" });
});
app.use("/auth",authRouter);
app.use("/feed", authMiddleware, feedRouter);
app.use("/posts", authMiddleware, postRouter);
app.use("/friends", authMiddleware, friendsRouter);
app.use("/thoughts", authMiddleware, thoughtsRouter);
app.use("/profile", authMiddleware, profileRouter);
export default app;

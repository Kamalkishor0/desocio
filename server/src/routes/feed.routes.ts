import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getPrivateFeed } from "../controllers/feed.controller";

const router = Router();

router.get("/posts", authMiddleware, getPrivateFeed);
// router.get("/thoughts", authMiddleware, getThoughtFeed);

export default router;

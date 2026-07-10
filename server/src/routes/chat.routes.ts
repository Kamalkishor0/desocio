import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import * as chatController from "../controllers/chat.controller";

const router = Router();

router.post("/:userId", authMiddleware, chatController.openConversation);

export default router;
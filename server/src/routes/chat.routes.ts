import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import * as chatController from "../controllers/chat.controller";

const router = Router();

router.post("/conversations/:userId", authMiddleware, chatController.openConversation);
router.get("/conversations",authMiddleware,chatController.getConversations);
router.get("/conversations/:conversationId/messages",authMiddleware,chatController.getMessages);
export default router;
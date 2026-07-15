import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
	getConversations,
	getMessages,
	openConversation,
	sendMessage,
} from "../controllers/chat.controller";
const router = Router();

router.post("/conversations/:userId", authMiddleware, openConversation);
router.get("/conversations", authMiddleware, getConversations);
router.get("/conversations/:conversationId/messages", authMiddleware, getMessages);
router.post("/conversations/:conversationId/messages", authMiddleware, sendMessage);
export default router;
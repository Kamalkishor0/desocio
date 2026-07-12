import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import * as chatController from "../controllers/chat.controller";
import {asyncHandler} from "../utils/asyncHandler";
const router = Router();

router.post("/conversations/:userId", authMiddleware, asyncHandler(chatController.openConversation));
router.get("/conversations",authMiddleware,chatController.getConversations);
router.get("/conversations/:conversationId/messages",authMiddleware,chatController.getMessages);
router.post("/conversations/:conversationId/messages",authMiddleware,asyncHandler(chatController.sendMessage));
export default router;
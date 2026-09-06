import {getNotifications, updateNotificationAsRead} from "../controllers/notifications.controller";
import { Router } from "express";

const router = Router();
router.get("/",getNotifications);
router.patch("/:notificationId/read",updateNotificationAsRead);
export default router;
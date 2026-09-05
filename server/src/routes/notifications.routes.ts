import {getNotifications} from "../controllers/notifications.controller";
import { Router } from "express";

const router = Router();
router.get("/",getNotifications);
export default router;
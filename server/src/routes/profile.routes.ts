import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getProfileByUsername } from "../controllers/profile.controller";

export const profileRouter = Router();

profileRouter.get("/:username", authMiddleware, getProfileByUsername);
export default profileRouter;
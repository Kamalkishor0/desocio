import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getProfileByUsername, getSearchResult } from "../controllers/profile.controller";

export const profileRouter = Router();

profileRouter.get("/:username", authMiddleware, getProfileByUsername);
profileRouter.get("/search/:username", authMiddleware, getSearchResult);
export default profileRouter;
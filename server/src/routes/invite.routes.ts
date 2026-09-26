import { Router } from "express";
import { getInvite } from "../controllers/invite.controller";

const inviteRouter = Router();

inviteRouter.get("/:code", getInvite);

export default inviteRouter;
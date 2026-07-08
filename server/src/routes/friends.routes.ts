import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
	getFriends,
	getReceivedFriendRequests,
	getSentFriendRequests,
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	removeFriend,
	cancelFriendRequest
} from "../controllers/friends.controller";

const friendsRouter = Router();

friendsRouter.use(authMiddleware);

friendsRouter.get("/", getFriends);
friendsRouter.get("/friend-requests/received", getReceivedFriendRequests);
friendsRouter.get("/friend-requests/sent", getSentFriendRequests);
friendsRouter.post("/request", sendFriendRequest);
friendsRouter.post("/accept", acceptFriendRequest);
friendsRouter.post("/reject", rejectFriendRequest);
friendsRouter.post("/cancel", cancelFriendRequest);
friendsRouter.delete("/remove", removeFriend);

export default friendsRouter;
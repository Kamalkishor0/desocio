import {Login, Register} from "../controllers/auth.controller";
import {Router} from "express";

const authRouter = Router();

authRouter.post("/login",Login);
authRouter.post("/register",Register);

export default authRouter;
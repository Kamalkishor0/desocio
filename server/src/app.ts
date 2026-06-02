import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes";
import feedRouter from "./routes/feed";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.get("/", (_req, res) => {
	res.json({ message: "Server is running" });
});
app.use("/auth",authRouter);
app.use("/feed", feedRouter);
export default app;

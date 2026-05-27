import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (_req, res) => {
	res.json({ message: "Server is running" });
});
app.use("/auth",authRouter);
export default app;

import "dotenv/config";
const PORT = Number(process.env.PORT) || 3000;

import http from "http";
import app from "./src/app";
import { initializeSocket } from "./src/socket";

const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
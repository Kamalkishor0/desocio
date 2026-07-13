import { JwtPayload } from "../types/auth";

declare module "socket.io" {
    interface SocketData {
        user: JwtPayload;
    }
}
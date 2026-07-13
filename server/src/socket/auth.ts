import type { Socket } from "socket.io";
import { parse } from "cookie";
import { verifyAccessToken } from "../utils/jwt";

export function authenticateSocket(socket: Socket) {
    const rawCookie = socket.handshake.headers.cookie;

    if (!rawCookie) {
        throw new Error("Authentication required");
    }

    const cookies = parse(rawCookie);

    const accessToken =
        cookies[process.env.ACCESS_COOKIE_NAME || "access_token"];

    if (!accessToken) {
        throw new Error("Authentication required");
    }

    const payload = verifyAccessToken(accessToken);

    if (!payload) {
        throw new Error("Invalid access token");
    }

    socket.data.user = payload;

    return payload;
}
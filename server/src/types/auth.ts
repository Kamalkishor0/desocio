import type { Request } from "express";

export type JwtPayload = {
    id: string;
    username: string;
    email: string;
}
export type AuthenticatedRequest = Request & {
    auth?: JwtPayload;
}
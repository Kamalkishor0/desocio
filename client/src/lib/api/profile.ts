import { request } from "./client";
import type { AuthUser } from "../../types/auth";

export const profileApi = {
    async getProfileByUsername (username: string){
        return request<AuthUser>(`profile/${username}`);
    }
};

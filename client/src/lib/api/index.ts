import { authApi } from "./auth";
import { feedApi } from "./feed";
import {postApi} from "./post";
import { friendsApi } from "./friends";
import { thoughtApi } from "./thought";
import { profileApi } from "./profile";
import {notificationsApi} from "./notifications";
import { inviteApi } from "./invite";
// Combine individual APIs into a single object for backwards compatibility
export const api = {
  ...profileApi,
  ...authApi,
  ...feedApi,
  ...postApi,
  ...friendsApi,
  ...thoughtApi,
  ...notificationsApi,
  ...inviteApi,
};

// Re-export type definitions and methods for individual imports
export * from "./profile";
export * from "./client";
export * from "./auth";
export * from "./feed";
export * from "./post";
export * from "./friends";
export * from "./thought";
export * from "./notifications";
export * from "./invite";

import { authApi } from "./auth";
import { feedApi } from "./feed";
import {postApi} from "./post";
import { friendsApi } from "./friends";
import { thoughtApi } from "./thought";
// Combine individual APIs into a single object for backwards compatibility
export const api = {
  ...authApi,
  ...feedApi,
  ...postApi,
  ...friendsApi,
  ...thoughtApi,
};

// Re-export type definitions and methods for individual imports
export * from "./client";
export * from "./auth";
export * from "./feed";
export * from "./post";
export * from "./friends";
export * from "./thought";

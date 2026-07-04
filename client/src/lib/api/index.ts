import { authApi } from "./auth";
import { feedApi } from "./feed";
import {postApi} from "./post";
// Combine individual APIs into a single object for backwards compatibility
export const api = {
  ...authApi,
  ...feedApi,
  ...postApi,
};

// Re-export type definitions and methods for individual imports
export * from "./client";
export * from "./auth";
export * from "./feed";
export * from "./post";
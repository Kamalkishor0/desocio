import { authApi } from "./auth";
import { feedApi } from "./feed";

// Combine individual APIs into a single object for backwards compatibility
export const api = {
  ...authApi,
  ...feedApi,
};

// Re-export type definitions and methods for individual imports
export * from "./client";
export * from "./auth";
export * from "./feed";
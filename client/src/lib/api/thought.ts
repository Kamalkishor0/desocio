import { request } from "./client";

export type ThoughtType =
  | "thoughts"
  | "recommendations"
  | "ideas"
  | "discussions";

export type ThoughtVisibility = "public" | "private";

export type Thought = {
  id: string;
  authorId: string;
  text: string;
  type: ThoughtType;
  visibility: ThoughtVisibility;
  createdAt: string;
  updatedAt: string;
};

export const thoughtApi = {
  list: (userId?: string) => {
    const url = userId
      ? `/thoughts?userId=${encodeURIComponent(userId)}`
      : "/thoughts";
    return request<Thought[]>(url);
  }
};

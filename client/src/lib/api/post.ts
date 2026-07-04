import { request } from "./client";
import type { PostReactionType } from "@/types/post";
const POSTS = {
  CREATE: "/posts",
  LIST: "/posts",
  GET: (id: string) => `/posts/${id}`,
  DELETE: (id: string) => `/posts/${id}`,
  REACT: (id: string) => `/posts/${id}/react`,
  REACTIONS: (id: string) => `/posts/${id}/react`,
  COMMENT: (id: string) => `/posts/${id}/comment`,
  COMMENTS: (id: string) => `/posts/${id}/comments`,
  DELETE_COMMENT: (commentId: string) => `/posts/comment/${commentId}`,
};

export interface CreatePostRequest {
  text?: string;
  photos?: File[];
}

export interface CreateCommentRequest {
  text: string;
}

export interface ReactToPostRequest {
  type: PostReactionType;
}

export const postApi = {
  async create(data: CreatePostRequest) {
    console.log("postApi.create called", data);
    const formData = new FormData();
    if (data.text) {
      formData.append("text", data.text);
    }

    data.photos?.forEach((photo) => {
      formData.append("photos", photo);
    });

    return request(POSTS.CREATE, {
      method: "POST",
      body: formData,
    });
  },

  async getAll(userId?: string) {
    const url = userId
      ? `${POSTS.LIST}?userId=${encodeURIComponent(userId)}`
      : POSTS.LIST;

    return request(url);
  },

  async getById(id: string) {
    return request(POSTS.GET(id));
  },

  async delete(id: string) {
    return request(POSTS.DELETE(id), {
      method: "DELETE",
    });
  },

  async react(postId: string, type: PostReactionType) {
    return request(POSTS.REACT(postId), {
      method: "POST",
      body: { type },
    });
  },

  async getReaction(postId: string) {
    return request(POSTS.REACTIONS(postId));
  },

  async comment(postId: string, text: string) {
    return request(POSTS.COMMENT(postId), {
      method: "POST",
      body: { text },
    });
  },

  async getComments(postId: string) {
    return request(POSTS.COMMENTS(postId));
  },

  async deleteComment(commentId: string) {
    return request(POSTS.DELETE_COMMENT(commentId), {
      method: "DELETE",
    });
  },
};
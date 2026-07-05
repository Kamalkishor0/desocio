import { request } from "./client";
import type { PostReactionType } from "@/types/post";

export type PostCommentAuthor = {
  id: string;
  username: string;
  profilePictureUrl: string | null;
};

export type PostComment = {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  text: string;
  createdAt: string;
  updatedAt: string;
  author: PostCommentAuthor;
  replies?: PostComment[];
};

export type PostReactionState = {
  reaction: PostReactionType | null;
};
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
    return request<{ message: string }>(POSTS.REACT(postId), {
      method: "POST",
      body: { type },
    });
  },

  async getReaction(postId: string) {
    return request<PostReactionState>(POSTS.REACTIONS(postId));
  },

  async comment(postId: string, text: string, parentId?: string) {
    return request<PostComment>(POSTS.COMMENT(postId), {
      method: "POST",
      body: parentId ? { text, parentId } : { text },
    });
  },

  async getComments(postId: string) {
    return request<PostComment[]>(POSTS.COMMENTS(postId));
  },

  async deleteComment(commentId: string) {
    return request(POSTS.DELETE_COMMENT(commentId), {
      method: "DELETE",
    });
  },
};
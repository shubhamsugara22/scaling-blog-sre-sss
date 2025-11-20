import { z } from 'zod';

// Database Types
export interface Like {
  id: number;
  postSlug: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postSlug: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Subscriber {
  id: number;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

export interface PostFormData {
  title: string;
  content: string;
  tags: string[];
  summary: string;
}

// Zod Validation Schemas

// Like schemas
export const likeRequestSchema = z.object({
  postSlug: z.string().min(1, 'Post slug is required'),
});

export const likeResponseSchema = z.object({
  postSlug: z.string(),
  count: z.number().int().min(0),
  liked: z.boolean(),
});

// Comment schemas
export const commentRequestSchema = z.object({
  postSlug: z.string().min(1, 'Post slug is required'),
  authorName: z.string().min(1, 'Author name is required').max(100, 'Author name too long'),
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment too long'),
});

export const commentResponseSchema = z.object({
  id: z.number().int(),
  postSlug: z.string(),
  authorName: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

export const commentsListResponseSchema = z.object({
  comments: z.array(commentResponseSchema),
});

// Subscribe schemas
export const subscribeRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const subscribeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Post creation schemas
export const postFormDataSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).max(10, 'Too many tags'),
  summary: z.string().max(500, 'Summary too long'),
});

export const postCreationResponseSchema = z.object({
  success: z.boolean(),
  slug: z.string().optional(),
  message: z.string(),
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int(),
});

// Type exports from schemas
export type LikeRequest = z.infer<typeof likeRequestSchema>;
export type LikeResponse = z.infer<typeof likeResponseSchema>;
export type CommentRequest = z.infer<typeof commentRequestSchema>;
export type CommentResponse = z.infer<typeof commentResponseSchema>;
export type CommentsListResponse = z.infer<typeof commentsListResponseSchema>;
export type SubscribeRequest = z.infer<typeof subscribeRequestSchema>;
export type SubscribeResponse = z.infer<typeof subscribeResponseSchema>;
export type PostCreationResponse = z.infer<typeof postCreationResponseSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

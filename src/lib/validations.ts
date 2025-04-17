import { z } from "zod";

// User schemas
export const userSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string().min(3).max(30),
    handle: z.string().min(3).max(30),
    profileImage: z.string().url().optional(),
    bio: z.string().max(160).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const userCreateSchema = userSchema
    .omit({ id: true, createdAt: true, updatedAt: true })
    .extend({
        password: z.string().min(8).optional(),
    });

export const userUpdateSchema = userSchema
    .omit({ id: true, email: true, createdAt: true, updatedAt: true })
    .partial();

// Post schemas
export const postSchema = z.object({
    id: z.string(),
    text: z.string().max(300), // 300 chars max as specified
    images: z.string().optional(), // JSON string of image URLs
    authorId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    impressions: z.number().nonnegative(),
    communityId: z.string().optional(),
});

export const postCreateSchema = postSchema
    .omit({ id: true, createdAt: true, updatedAt: true, impressions: true })
    .extend({
        text: z.string().min(1).max(300),
    });

export const postUpdateSchema = postSchema
    .omit({ id: true, authorId: true, createdAt: true, updatedAt: true })
    .partial();

// Comment schemas
export const commentSchema = z.object({
    id: z.string(),
    text: z.string().max(300),
    postId: z.string(),
    authorId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const commentCreateSchema = commentSchema
    .omit({ id: true, createdAt: true, updatedAt: true })
    .extend({
        text: z.string().min(1).max(300),
    });

// Like schema
export const likeSchema = z.object({
    id: z.string(),
    postId: z.string(),
    userId: z.string(),
    createdAt: z.date(),
});

export const likeCreateSchema = likeSchema.omit({ id: true, createdAt: true });

// Bookmark schema
export const bookmarkSchema = z.object({
    id: z.string(),
    postId: z.string(),
    userId: z.string(),
    createdAt: z.date(),
});

export const bookmarkCreateSchema = bookmarkSchema.omit({ id: true, createdAt: true });

// Follow schema
export const followSchema = z.object({
    id: z.string(),
    followerId: z.string(),
    followingId: z.string(),
    createdAt: z.date(),
});

export const followCreateSchema = followSchema.omit({ id: true, createdAt: true });

// Community schemas
export const communitySchema = z.object({
    id: z.string(),
    name: z.string().min(3).max(50),
    description: z.string().max(300).optional(),
    image: z.string().url().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const communityCreateSchema = communitySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

// Message schemas
export const messageSchema = z.object({
    id: z.string(),
    content: z.string().max(1000),
    senderId: z.string(),
    recipientId: z.string(),
    read: z.boolean(),
    createdAt: z.date(),
});

export const messageCreateSchema = messageSchema.omit({
    id: true,
    read: true,
    createdAt: true,
});

// Notification schema
export const notificationSchema = z.object({
    id: z.string(),
    type: z.enum(["follow", "like", "comment", "mention", "message"]),
    read: z.boolean(),
    userId: z.string(),
    sourceId: z.string().optional(),
    postId: z.string().optional(),
    message: z.string().optional(),
    createdAt: z.date(),
});

// Advertisement schema
export const advertisementSchema = z.object({
    id: z.string(),
    title: z.string().max(100),
    content: z.string().max(300),
    imageUrl: z.string().url().optional(),
    link: z.string().url().optional(),
    active: z.boolean(),
    priority: z.number().int(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const advertisementCreateSchema = advertisementSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    active: true,
    priority: true,
});

// Authentication schemas
export const signUpSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(30),
    handle: z.string().min(3).max(30),
    password: z.string().min(8),
});

export const signInSchema = z.object({
    emailOrUsername: z.string(),
    password: z.string(),
});

// Feed configuration schema
export const feedPreferencesSchema = z.object({
    showFollowing: z.boolean().default(true),
    showForYou: z.boolean().default(true),
    communityIds: z.array(z.string()).default([]),
});

// Optional type helpers
export type User = z.infer<typeof userSchema>;
export type Post = z.infer<typeof postSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type Like = z.infer<typeof likeSchema>;
export type Bookmark = z.infer<typeof bookmarkSchema>;
export type Follow = z.infer<typeof followSchema>;
export type Community = z.infer<typeof communitySchema>;
export type Message = z.infer<typeof messageSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type Advertisement = z.infer<typeof advertisementSchema>;
import { z } from 'zod';

/**
 * Zod validation schemas for database models
 * Provides runtime type safety and validation for user inputs
 */

// Slug validation helper
const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(255, 'Slug must be 255 characters or less')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase alphanumeric with hyphens only'
  );

/**
 * Post validation schemas
 */

// Schema for creating a new post
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less')
    .trim(),

  slug: slugSchema,

  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be 50,000 characters or less'),

  excerpt: z
    .string()
    .max(500, 'Excerpt must be 500 characters or less')
    .optional()
    .nullable(),

  authorId: z.string().min(1, 'Author ID is required'),

  authorName: z
    .string()
    .max(255, 'Author name must be 255 characters or less')
    .optional()
    .nullable(),

  published: z.boolean().default(false),

  featured: z.boolean().default(false),

  metaTitle: z
    .string()
    .max(255, 'Meta title must be 255 characters or less')
    .optional()
    .nullable(),

  metaDescription: z
    .string()
    .max(500, 'Meta description must be 500 characters or less')
    .optional()
    .nullable(),
});

// Schema for updating an existing post
export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().length(21, 'Invalid post ID'),
});

// Schema for publishing/unpublishing a post
export const publishPostSchema = z.object({
  id: z.string().length(21, 'Invalid post ID'),
  published: z.boolean(),
});

// Schema for post query parameters
export const postQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  published: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  featured: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  authorId: z.string().optional(),
  search: z.string().optional(),
});

/**
 * Comment validation schemas
 */

// Schema for creating a new comment
export const createCommentSchema = z.object({
  postId: z.string().length(21, 'Invalid post ID'),

  content: z
    .string()
    .min(1, 'Comment content is required')
    .max(2000, 'Comment must be 2,000 characters or less')
    .trim(),

  authorId: z.string().min(1, 'Author ID is required'),

  authorName: z
    .string()
    .max(255, 'Author name must be 255 characters or less')
    .optional()
    .nullable(),
});

// Schema for updating a comment
export const updateCommentSchema = z.object({
  id: z.string().length(21, 'Invalid comment ID'),
  content: z
    .string()
    .min(1, 'Comment content is required')
    .max(2000, 'Comment must be 2,000 characters or less')
    .trim(),
});

// Schema for moderating a comment
export const moderateCommentSchema = z.object({
  id: z.string().length(21, 'Invalid comment ID'),
  approved: z.boolean().optional(),
  flagged: z.boolean().optional(),
});

// Schema for comment query parameters
export const commentQuerySchema = z.object({
  postId: z.string().length(21, 'Invalid post ID').optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  approved: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  authorId: z.string().optional(),
});

/**
 * Type exports for use in application
 */
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PublishPostInput = z.infer<typeof publishPostSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type ModerateCommentInput = z.infer<typeof moderateCommentSchema>;
export type CommentQueryInput = z.infer<typeof commentQuerySchema>;

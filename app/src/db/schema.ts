import { pgTable, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

/**
 * Posts table schema
 * Uses NanoID for primary keys for better URL-safe unique identifiers
 */
export const posts = pgTable('posts', {
    // Primary key using NanoID (21 characters, URL-safe)
    id: varchar('id', { length: 21 })
        .primaryKey()
        .$defaultFn(() => nanoid()),

    // Post content fields
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    content: text('content').notNull(),
    excerpt: text('excerpt'),

    // Author information (Clerk user ID)
    authorId: varchar('author_id', { length: 255 }).notNull(),
    authorName: varchar('author_name', { length: 255 }),

    // Post metadata
    published: boolean('published').default(false).notNull(),
    featured: boolean('featured').default(false).notNull(),

    // SEO fields
    metaTitle: varchar('meta_title', { length: 255 }),
    metaDescription: text('meta_description'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
});

/**
 * Comments table schema
 * Demonstrates relationship with posts using NanoID
 */
export const comments = pgTable('comments', {
    id: varchar('id', { length: 21 })
        .primaryKey()
        .$defaultFn(() => nanoid()),

    // Foreign key to posts table
    postId: varchar('post_id', { length: 21 })
        .notNull()
        .references(() => posts.id, { onDelete: 'cascade' }),

    // Comment content
    content: text('content').notNull(),

    // Author information (Clerk user ID)
    authorId: varchar('author_id', { length: 255 }).notNull(),
    authorName: varchar('author_name', { length: 255 }),

    // Moderation
    approved: boolean('approved').default(false).notNull(),
    flagged: boolean('flagged').default(false).notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Type exports for use in application
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

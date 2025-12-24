import type { APIRoute } from 'astro';
import { db } from '@/db/client';
import { posts } from '@/db/schema';
import {
  createPostSchema,
  updatePostSchema,
  postQuerySchema,
  type CreatePostInput,
  type UpdatePostInput,
} from '@/db/validations';
import { eq, desc, and, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Posts API Routes
 * Demonstrates CRUD operations with Drizzle ORM, Zod validation, and NanoID
 */

// GET /api/posts - List posts with pagination and filtering
export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Parse and validate query parameters
    const queryParams = {
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      published: url.searchParams.get('published'),
      featured: url.searchParams.get('featured'),
      authorId: url.searchParams.get('authorId'),
      search: url.searchParams.get('search'),
    };

    const validated = postQuerySchema.parse(queryParams);
    const offset = (validated.page - 1) * validated.limit;

    // Build query conditions
    const conditions = [];

    if (validated.published !== undefined) {
      conditions.push(eq(posts.published, validated.published));
    }

    if (validated.featured !== undefined) {
      conditions.push(eq(posts.featured, validated.featured));
    }

    if (validated.authorId) {
      conditions.push(eq(posts.authorId, validated.authorId));
    }

    if (validated.search) {
      conditions.push(
        or(
          ilike(posts.title, `%${validated.search}%`),
          ilike(posts.content, `%${validated.search}%`)
        )!
      );
    }

    // Fetch posts with filtering and pagination
    const results = await db
      .select()
      .from(posts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(posts.createdAt))
      .limit(validated.limit)
      .offset(offset);

    return new Response(
      JSON.stringify({
        data: results,
        meta: {
          page: validated.page,
          limit: validated.limit,
          total: results.length,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Validation error',
          details: error.errors,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.error('GET /api/posts error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// POST /api/posts - Create a new post
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validated: CreatePostInput = createPostSchema.parse(body);

    // Insert post into database (NanoID is auto-generated)
    const [newPost] = await db
      .insert(posts)
      .values({
        ...validated,
        publishedAt: validated.published ? new Date() : null,
      })
      .returning();

    return new Response(
      JSON.stringify({
        data: newPost,
        message: 'Post created successfully',
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Validation error',
          details: error.errors,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.error('POST /api/posts error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// PUT /api/posts - Update an existing post
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validated: UpdatePostInput = updatePostSchema.parse(body);
    const { id, ...updateData } = validated;

    if (!id) {
      return new Response(
        JSON.stringify({
          error: 'Post ID is required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Update post in database
    const [updatedPost] = await db
      .update(posts)
      .set({
        ...updateData,
        updatedAt: new Date(),
        publishedAt:
          updateData.published !== undefined
            ? updateData.published
              ? new Date()
              : null
            : undefined,
      })
      .where(eq(posts.id, id))
      .returning();

    if (!updatedPost) {
      return new Response(
        JSON.stringify({
          error: 'Post not found',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        data: updatedPost,
        message: 'Post updated successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Validation error',
          details: error.errors,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.error('PUT /api/posts error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// DELETE /api/posts - Delete a post
export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({
          error: 'Post ID is required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Validate ID format (NanoID is 21 characters)
    if (id.length !== 21) {
      return new Response(
        JSON.stringify({
          error: 'Invalid post ID format',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Delete post from database
    const [deletedPost] = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning();

    if (!deletedPost) {
      return new Response(
        JSON.stringify({
          error: 'Post not found',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Post deleted successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('DELETE /api/posts error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

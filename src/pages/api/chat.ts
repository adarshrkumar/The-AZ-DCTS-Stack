import type { APIRoute } from 'astro';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

/**
 * Vercel AI SDK Chat API Route
 * Demonstrates streaming text generation with OpenAI
 *
 * Environment variables required:
 * - OPENAI_API_KEY: Your OpenAI API key
 */

// Validate request schema
const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
  model: z.string().optional().default('gpt-4-turbo-preview'),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().positive().optional().default(1000),
});

// Initialize OpenAI client
const openai = createOpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validate API key
    if (!import.meta.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'OPENAI_API_KEY is not configured',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Stream the response using Vercel AI SDK
    const result = streamText({
      model: openai(validatedData.model),
      messages: validatedData.messages,
      temperature: validatedData.temperature,
      maxTokens: validatedData.maxTokens,
    });

    // Return the stream response
    return result.toDataStreamResponse();
  } catch (error) {
    // Handle Zod validation errors
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

    // Handle other errors
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
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

import type { APIRoute } from 'astro';
import { streamText } from 'ai';
import { z } from 'zod';

/**
 * Vercel AI SDK Chat API Route
 * Uses AI Gateway pattern - no provider-specific packages needed!
 * Just pass model strings like 'openai/gpt-4o' or 'anthropic/claude-3-5-sonnet-20241022'
 *
 * Environment variables required:
 * - OPENAI_API_KEY: Your OpenAI API key (or other provider keys)
 */

// Validate request schema
const requestSchema = z.object({
    messages: z.array(
        z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
        })
    ),
    model: z.string().optional().default('openai/gpt-4o'),
    temperature: z.number().min(0).max(2).optional().default(0.7),
    maxTokens: z.number().positive().optional().default(1000),
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

        // Stream the response using Vercel AI SDK with AI Gateway
        const result = streamText({
            model: validatedData.model, // Use model string directly (e.g., 'openai/gpt-4o')
            messages: validatedData.messages,
            temperature: validatedData.temperature,
            maxTokens: validatedData.maxTokens,
            apiKey: import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
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

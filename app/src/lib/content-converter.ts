/**
 * Content Converter Utilities
 * Provides functions for converting between HTML and Markdown using marked and turndown
 */

import { marked } from 'marked';
import TurndownService from 'turndown';

// Configure marked for markdown to HTML conversion
marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert \n to <br>
    headerIds: true, // Add IDs to headings
    mangle: false, // Don't escape email addresses
});

// Configure turndown for HTML to markdown conversion
const turndownService = new TurndownService({
    headingStyle: 'atx', // Use # for headings
    hr: '---', // Use --- for horizontal rules
    bulletListMarker: '-', // Use - for bullet lists
    codeBlockStyle: 'fenced', // Use ``` for code blocks
    fence: '```', // Code fence marker
    emDelimiter: '*', // Use * for emphasis
    strongDelimiter: '**', // Use ** for strong
    linkStyle: 'inlined', // Use [text](url) for links
});

/**
 * Convert Markdown to HTML
 * @param markdown - The markdown string to convert
 * @returns HTML string
 */
export async function markdownToHtml(markdown: string): Promise<string> {
    try {
        const html = await marked.parse(markdown);
        return html;
    } catch (error) {
        console.error('Error converting markdown to HTML:', error);
        throw new Error('Failed to convert markdown to HTML');
    }
}

/**
 * Convert Markdown to HTML synchronously
 * @param markdown - The markdown string to convert
 * @returns HTML string
 */
export function markdownToHtmlSync(markdown: string): string {
    try {
        const html = marked.parse(markdown) as string;
        return html;
    } catch (error) {
        console.error('Error converting markdown to HTML:', error);
        throw new Error('Failed to convert markdown to HTML');
    }
}

/**
 * Convert HTML to Markdown
 * @param html - The HTML string to convert
 * @returns Markdown string
 */
export function htmlToMarkdown(html: string): string {
    try {
        const markdown = turndownService.turndown(html);
        return markdown;
    } catch (error) {
        console.error('Error converting HTML to markdown:', error);
        throw new Error('Failed to convert HTML to markdown');
    }
}

/**
 * Sanitize and convert Markdown to HTML
 * Useful for user-generated content
 * @param markdown - The markdown string to convert
 * @returns Sanitized HTML string
 */
export async function sanitizeMarkdown(markdown: string): Promise<string> {
    try {
        // Basic sanitization - remove script tags and dangerous attributes
        const sanitized = markdown
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
            .replace(/on\w+='[^']*'/g, '');

        const html = await marked.parse(sanitized);
        return html;
    } catch (error) {
        console.error('Error sanitizing markdown:', error);
        throw new Error('Failed to sanitize markdown');
    }
}

/**
 * Extract plain text from markdown
 * @param markdown - The markdown string
 * @returns Plain text string
 */
export function markdownToPlainText(markdown: string): string {
    try {
        const html = marked.parse(markdown) as string;
        const text = html
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp;
            .replace(/&amp;/g, '&') // Replace &amp;
            .replace(/&lt;/g, '<') // Replace &lt;
            .replace(/&gt;/g, '>') // Replace &gt;
            .replace(/&quot;/g, '"') // Replace &quot;
            .trim();
        return text;
    } catch (error) {
        console.error('Error extracting plain text:', error);
        throw new Error('Failed to extract plain text');
    }
}

/**
 * Generate excerpt from markdown
 * @param markdown - The markdown string
 * @param maxLength - Maximum length of the excerpt (default: 200)
 * @returns Excerpt string
 */
export function generateExcerpt(markdown: string, maxLength: number = 200): string {
    const plainText = markdownToPlainText(markdown);

    if (plainText.length <= maxLength) {
        return plainText;
    }

    // Truncate at word boundary
    const truncated = plainText.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 0) {
        return truncated.slice(0, lastSpace) + '...';
    }

    return truncated + '...';
}

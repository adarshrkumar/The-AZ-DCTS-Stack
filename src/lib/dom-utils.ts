/**
 * DOM Manipulation Utilities
 * Provides functions for manipulating HTML content using Cheerio
 */

import * as cheerio from 'cheerio';

/**
 * Extract metadata from HTML content
 * @param html - The HTML string to parse
 * @returns Metadata object
 */
export function extractMetadata(html: string) {
    const $ = cheerio.load(html);

    return {
        title: $('title').text() || $('h1').first().text() || '',
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        ogTitle: $('meta[property="og:title"]').attr('content') || '',
        ogDescription: $('meta[property="og:description"]').attr('content') || '',
        ogImage: $('meta[property="og:image"]').attr('content') || '',
        twitterCard: $('meta[name="twitter:card"]').attr('content') || '',
        canonical: $('link[rel="canonical"]').attr('href') || '',
    };
}

/**
 * Extract all links from HTML
 * @param html - The HTML string to parse
 * @returns Array of link objects
 */
export function extractLinks(html: string) {
    const $ = cheerio.load(html);
    const links: Array<{ text: string; href: string; title?: string }> = [];

    $('a').each((_, element) => {
        const $el = $(element);
        const href = $el.attr('href');
        if (href) {
            links.push({
                text: $el.text().trim(),
                href,
                title: $el.attr('title'),
            });
        }
    });

    return links;
}

/**
 * Extract all images from HTML
 * @param html - The HTML string to parse
 * @returns Array of image objects
 */
export function extractImages(html: string) {
    const $ = cheerio.load(html);
    const images: Array<{ src: string; alt?: string; title?: string }> = [];

    $('img').each((_, element) => {
        const $el = $(element);
        const src = $el.attr('src');
        if (src) {
            images.push({
                src,
                alt: $el.attr('alt'),
                title: $el.attr('title'),
            });
        }
    });

    return images;
}

/**
 * Extract headings from HTML
 * @param html - The HTML string to parse
 * @returns Array of heading objects
 */
export function extractHeadings(html: string) {
    const $ = cheerio.load(html);
    const headings: Array<{ level: number; text: string; id?: string }> = [];

    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
        const $el = $(element);
        const tagName = $el.prop('tagName')?.toLowerCase();
        const level = parseInt(tagName?.replace('h', '') || '1');

        headings.push({
            level,
            text: $el.text().trim(),
            id: $el.attr('id'),
        });
    });

    return headings;
}

/**
 * Generate table of contents from HTML
 * @param html - The HTML string to parse
 * @param maxLevel - Maximum heading level to include (default: 3)
 * @returns Array of TOC items
 */
export function generateTableOfContents(html: string, maxLevel: number = 3) {
    const headings = extractHeadings(html);
    return headings
        .filter((h) => h.level <= maxLevel)
        .map((h) => ({
            ...h,
            slug: h.id || h.text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        }));
}

/**
 * Clean HTML content
 * Removes scripts, styles, and other potentially dangerous elements
 * @param html - The HTML string to clean
 * @returns Cleaned HTML string
 */
export function cleanHtml(html: string): string {
    const $ = cheerio.load(html);

    // Remove dangerous elements
    $('script, style, iframe, object, embed').remove();

    // Remove event handlers
    $('*').each((_, element) => {
        const $el = $(element);
        const attrs = $el.attr();

        if (attrs) {
            Object.keys(attrs).forEach((attr) => {
                if (attr.startsWith('on')) {
                    $el.removeAttr(attr);
                }
            });
        }
    });

    return $.html();
}

/**
 * Extract text content from HTML
 * @param html - The HTML string to parse
 * @returns Plain text string
 */
export function extractTextContent(html: string): string {
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style').remove();

    return $('body').text().replace(/\s+/g, ' ').trim();
}

/**
 * Add IDs to headings for anchor linking
 * @param html - The HTML string to process
 * @returns HTML with IDs added to headings
 */
export function addHeadingIds(html: string): string {
    const $ = cheerio.load(html);

    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
        const $el = $(element);

        if (!$el.attr('id')) {
            const text = $el.text().trim();
            const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            $el.attr('id', id);
        }
    });

    return $.html();
}

/**
 * Add target="_blank" to external links
 * @param html - The HTML string to process
 * @param domain - The current domain (optional)
 * @returns HTML with external links updated
 */
export function addExternalLinkTargets(html: string, domain?: string): string {
    const $ = cheerio.load(html);

    $('a').each((_, element) => {
        const $el = $(element);
        const href = $el.attr('href');

        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
            if (!domain || !href.includes(domain)) {
                $el.attr('target', '_blank');
                $el.attr('rel', 'noopener noreferrer');
            }
        }
    });

    return $.html();
}

/**
 * Calculate reading time for HTML content
 * @param html - The HTML string to analyze
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(html: string, wordsPerMinute: number = 200): number {
    const text = extractTextContent(html);
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Wrap tables in a responsive container
 * @param html - The HTML string to process
 * @returns HTML with tables wrapped
 */
export function wrapTables(html: string): string {
    const $ = cheerio.load(html);

    $('table').each((_, element) => {
        const $el = $(element);
        $el.wrap('<div class="table-wrapper" style="overflow-x: auto;"></div>');
    });

    return $.html();
}

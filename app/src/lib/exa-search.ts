/**
 * Exa Search Integration
 * Provides AI-powered search capabilities using Exa
 * Documentation: https://docs.exa.ai
 */

import Exa from 'exa-js';

/**
 * Initialize Exa client
 * Requires EXA_API_KEY environment variable
 */
function getExaClient(): Exa {
    const apiKey = import.meta.env.EXA_API_KEY || process.env.EXA_API_KEY;

    if (!apiKey) {
        throw new Error('EXA_API_KEY environment variable is not set');
    }

    return new Exa(apiKey);
}

/**
 * Search options for Exa
 */
export interface ExaSearchOptions {
    /** Number of results to return (1-10, default: 10) */
    numResults?: number;

    /** Type of search: 'neural', 'keyword', or 'auto' (default: 'auto') */
    type?: 'neural' | 'keyword' | 'auto';

    /** Whether to use autoprompt to expand query (default: false) */
    useAutoprompt?: boolean;

    /** Category of content to search */
    category?: 'company' | 'research paper' | 'news' | 'github' | 'tweet' | 'movie' | 'song' | 'personal site' | 'pdf';

    /** Start crawl date (YYYY-MM-DD) */
    startCrawlDate?: string;

    /** End crawl date (YYYY-MM-DD) */
    endCrawlDate?: string;

    /** Start published date (YYYY-MM-DD) */
    startPublishedDate?: string;

    /** End published date (YYYY-MM-DD) */
    endPublishedDate?: string;

    /** Include domains (whitelist) */
    includeDomains?: string[];

    /** Exclude domains (blacklist) */
    excludeDomains?: string[];

    /** Whether to include page content */
    contents?: {
        text?: boolean | { maxCharacters?: number };
        highlights?: boolean | { numSentences?: number; highlightsPerUrl?: number };
        summary?: boolean | { query?: string };
    };
}

/**
 * Exa search result
 */
export interface ExaResult {
    url: string;
    title: string;
    publishedDate?: string;
    author?: string;
    score?: number;
    id: string;
    text?: string;
    highlights?: string[];
    summary?: string;
}

/**
 * Search the web using Exa
 * @param query - The search query
 * @param options - Search options
 * @returns Array of search results
 */
export async function searchWeb(
    query: string,
    options: ExaSearchOptions = {}
): Promise<ExaResult[]> {
    try {
        const exa = getExaClient();

        const response = await exa.searchAndContents(query, {
            numResults: options.numResults || 10,
            type: options.type || 'auto',
            useAutoprompt: options.useAutoprompt || false,
            category: options.category,
            startCrawlDate: options.startCrawlDate,
            endCrawlDate: options.endCrawlDate,
            startPublishedDate: options.startPublishedDate,
            endPublishedDate: options.endPublishedDate,
            includeDomains: options.includeDomains,
            excludeDomains: options.excludeDomains,
            text: options.contents?.text,
            highlights: options.contents?.highlights,
            summary: options.contents?.summary,
        });

        return response.results.map((result: any) => ({
            url: result.url,
            title: result.title,
            publishedDate: result.publishedDate,
            author: result.author,
            score: result.score,
            id: result.id,
            text: result.text,
            highlights: result.highlights,
            summary: result.summary,
        }));
    } catch (error) {
        console.error('Exa search error:', error);
        throw new Error('Failed to perform search');
    }
}

/**
 * Find similar content to a given URL
 * @param url - The URL to find similar content for
 * @param options - Search options
 * @returns Array of similar results
 */
export async function findSimilar(
    url: string,
    options: Omit<ExaSearchOptions, 'type' | 'useAutoprompt'> = {}
): Promise<ExaResult[]> {
    try {
        const exa = getExaClient();

        const response = await exa.findSimilarAndContents(url, {
            numResults: options.numResults || 10,
            category: options.category,
            startCrawlDate: options.startCrawlDate,
            endCrawlDate: options.endCrawlDate,
            startPublishedDate: options.startPublishedDate,
            endPublishedDate: options.endPublishedDate,
            includeDomains: options.includeDomains,
            excludeDomains: options.excludeDomains,
            text: options.contents?.text,
            highlights: options.contents?.highlights,
            summary: options.contents?.summary,
        });

        return response.results.map((result: any) => ({
            url: result.url,
            title: result.title,
            publishedDate: result.publishedDate,
            author: result.author,
            score: result.score,
            id: result.id,
            text: result.text,
            highlights: result.highlights,
            summary: result.summary,
        }));
    } catch (error) {
        console.error('Exa find similar error:', error);
        throw new Error('Failed to find similar content');
    }
}

/**
 * Get full page content for a list of URLs
 * @param urls - Array of URLs to get content for
 * @param options - Content options
 * @returns Array of results with content
 */
export async function getContents(
    urls: string[],
    options: ExaSearchOptions['contents'] = {}
): Promise<ExaResult[]> {
    try {
        const exa = getExaClient();

        const response = await exa.getContents(urls, {
            text: options.text,
            highlights: options.highlights,
            summary: options.summary,
        });

        return response.results.map((result: any) => ({
            url: result.url,
            title: result.title,
            publishedDate: result.publishedDate,
            author: result.author,
            id: result.id,
            text: result.text,
            highlights: result.highlights,
            summary: result.summary,
        }));
    } catch (error) {
        console.error('Exa get contents error:', error);
        throw new Error('Failed to get contents');
    }
}

/**
 * Search for recent news articles
 * @param query - The search query
 * @param daysBack - Number of days to look back (default: 7)
 * @returns Array of news results
 */
export async function searchNews(query: string, daysBack: number = 7): Promise<ExaResult[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    return searchWeb(query, {
        category: 'news',
        startPublishedDate: startDate.toISOString().split('T')[0],
        endPublishedDate: endDate.toISOString().split('T')[0],
        numResults: 10,
        contents: {
            text: { maxCharacters: 1000 },
            highlights: { numSentences: 3 },
        },
    });
}

/**
 * Search for research papers
 * @param query - The search query
 * @param options - Additional search options
 * @returns Array of research paper results
 */
export async function searchResearch(
    query: string,
    options: ExaSearchOptions = {}
): Promise<ExaResult[]> {
    return searchWeb(query, {
        ...options,
        category: 'research paper',
        contents: {
            text: { maxCharacters: 2000 },
            summary: true,
            ...options.contents,
        },
    });
}

/**
 * Search GitHub repositories
 * @param query - The search query
 * @param options - Additional search options
 * @returns Array of GitHub results
 */
export async function searchGitHub(
    query: string,
    options: ExaSearchOptions = {}
): Promise<ExaResult[]> {
    return searchWeb(query, {
        ...options,
        category: 'github',
        includeDomains: ['github.com'],
        contents: {
            text: { maxCharacters: 1500 },
            highlights: { numSentences: 5 },
            ...options.contents,
        },
    });
}

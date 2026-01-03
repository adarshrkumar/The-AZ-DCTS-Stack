/**
 * Site Configuration
 * Central configuration for the application that will be rendered on screen
 */

/**
 * The core stack identifier - change this in ONE place to update everywhere
 */
const STACK_SHORT_NAME = 'ATSDC';

export const siteConfig = {
    /**
     * Short name for the stack (used in PWA and compact displays)
     */
    stackShortName: STACK_SHORT_NAME,

    /**
     * The full name of the stack/framework (derived from stackShortName)
     */
    stackName: `${STACK_SHORT_NAME} Stack`,

    /**
     * Full description of the stack
     */
    stackDescription:
        'Full-stack application built with Astro, TypeScript, Drizzle, Clerk, and SCSS',

    /**
     * Docs URL
     */
    docsUrl: 'https://github.com/adarshrkumar/The-ATSDC-Stack',
    /**
     * GitHub repository URL
     */
    githubUrl: 'https://github.com/adarshrkumar/The-ATSDC-Stack',
} as const;

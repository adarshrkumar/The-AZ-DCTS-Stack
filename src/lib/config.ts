/**
 * Site Configuration
 * Central configuration for the application that will be rendered on screen
 */

export const siteConfig = {
  /**
   * The name of the stack/framework
   */
  stackName: 'A-DCTS Stack',

  /**
   * Short name for the stack (used in PWA and compact displays)
   */
  stackShortName: 'A-DCTS',

  /**
   * Full description of the stack
   */
  stackDescription:
    'Full-stack application built with Astro, TypeScript, Drizzle, Clerk, and SCSS',

  /**
   * GitHub repository URL
   */
  githubUrl: 'https://github.com/yourusername/a-dcts-stack',
} as const;

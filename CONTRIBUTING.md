# Contributing to ATSDC Stack

Thank you for your interest in contributing to the ATSDC Stack! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Your environment (OS, Node version, etc.)
6. Screenshots (if applicable)

### Suggesting Enhancements

We welcome feature requests! Please create an issue with:

1. A clear, descriptive title
2. Detailed description of the proposed feature
3. Use cases and benefits
4. Possible implementation approach (optional)

### Pull Requests

1. **Fork the repository**

   ```bash
   git clone https://github.com/yourusername/atsdc-stack.git
   cd atsdc-stack
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Write clear, concise commit messages
   - Add tests if applicable
   - Update documentation as needed

4. **Test your changes**

   ```bash
   npm run build
   npm run preview
   ```

5. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```

6. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe your changes in detail
   - Include screenshots for UI changes

## Development Guidelines

### Code Style

#### TypeScript

- Use TypeScript for all new code
- Prefer interfaces over types for object shapes
- Use strict mode
- Avoid `any` - use `unknown` if necessary

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

// Avoid
type User = {
  id: any;
  name: any;
};
```

#### SCSS Architecture

**Critical Rule**: Never use inline `<style>` tags in `.astro` files unless the component is completely self-standing and not part of the main layout.

```astro
<!-- GOOD: External styles with data attributes (preferred) -->
---
import '@/styles/components/button.scss';
---
<button class="btn" data-variant="primary" data-size="lg">Click Me</button>
```

```astro
<!-- GOOD: External styles with class chaining (alternative) -->
---
import '@/styles/components/button.scss';
---
<button class="btn primary lg">Click Me</button>
```

```astro
<!-- BAD: Inline styles (avoid this) -->
<button class="btn">Click Me</button>
<style>
  .btn { /* styles */ }
</style>
```

**SCSS File Organization:**

- **Variables**: `src/styles/variables/globals.scss`
- **Mixins**: `src/styles/variables/mixins.scss`
- **Global styles**: `src/styles/global.scss`
- **Component styles**: `src/styles/components/[component-name].scss`
- **Page styles**: `src/styles/pages/[page-name].scss`

**Naming Conventions & Modifier Strategy:**

- Use **data attributes** for modifiers by default (preferred for state and variants)
- Use **class chaining** when data attributes aren't appropriate
- Use kebab-case for file names
- Prefix component-specific classes with component name
- Use BEM for elements only (not modifiers)

```scss
// Component: Button
.btn {
  @include button-base;

  // Preferred: Data attribute modifiers
  &[data-variant='primary'] { /* state/variant */ }
  &[data-size='lg'] { /* size modifier */ }
  &[data-state='loading'] { /* dynamic state */ }

  // Alternative: Class chaining
  &.primary { /* variant */ }
  &.lg { /* size modifier */ }
  &.loading { /* dynamic state */ }

  // BEM for elements (still valid)
  &__icon { /* element */ }
}
```

**When to use data attributes vs. class chaining:**

- **Data attributes (preferred):**
    - Dynamic states (loading, active, disabled)
    - Variants (primary, secondary, success, danger)
    - Configuration (size, padding, alignment)
    - Semantic modifiers that describe state

- **Class chaining (when appropriate):**
    - CSS-only solutions without JavaScript
    - When data attributes feel verbose
    - Simple utility classes
    - When working with third-party libraries

#### Database Schema

- Use NanoID for primary keys
- Always define Zod schemas for validation
- Include timestamps (createdAt, updatedAt)
- Use descriptive column names

```typescript
// Good
export const posts = pgTable('posts', {
  id: varchar('id', { length: 21 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: varchar('title', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Corresponding Zod schema
export const createPostSchema = z.object({
  title: z.string().min(1).max(255),
});
```

#### API Routes

- Always validate input with Zod
- Use proper HTTP status codes
- Return consistent response formats
- Handle errors gracefully

```typescript
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = schema.parse(body);

    // ... process request

    return new Response(
      JSON.stringify({ data: result }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Validation error', details: error.errors }),
        { status: 400 }
      );
    }
    // ... handle other errors
  }
};
```

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
type(scope): subject

body

footer
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```text
feat(auth): add OAuth integration with Google
fix(db): resolve connection pool timeout issue
docs(readme): update installation instructions
style(scss): reorganize component styles
refactor(api): simplify error handling
```

### Testing

- Test your changes locally before submitting
- Ensure the build passes: `npm run build`
- Check TypeScript types: `npx astro check`
- Test database migrations if applicable

### Documentation

- Update README.md if you change functionality
- Add JSDoc comments to functions and components
- Update INSTALLATION.md for setup changes
- Include inline comments for complex logic

## Project Structure Conventions

```text
src/
├── components/        # Reusable Astro components
│   └── ComponentName.astro
├── db/               # Database layer
│   ├── client.ts     # Database client
│   ├── schema.ts     # Drizzle schemas
│   └── validations.ts # Zod schemas
├── layouts/          # Layout components
│   └── BaseLayout.astro
├── pages/            # Routes and pages
│   ├── api/          # API routes
│   │   └── endpoint.ts
│   └── index.astro
└── styles/           # SCSS files
    ├── components/   # Component styles
    ├── pages/        # Page styles
    ├── variables/
    │   ├── globals.scss
    │   └── mixins.scss
    └── global.scss
```

## Adding New Dependencies

When adding a new dependency:

1. Justify the need - avoid dependency bloat
2. Check license compatibility (MIT preferred)
3. Verify it's actively maintained
4. Consider bundle size impact
5. Update package.json and documentation

## Release Process

Maintainers will handle releases:

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a git tag
4. Publish to npm

## Questions?

If you have questions:

1. Check existing issues and discussions
2. Review the documentation
3. Create a new issue with the `question` label

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to ATSDC Stack!

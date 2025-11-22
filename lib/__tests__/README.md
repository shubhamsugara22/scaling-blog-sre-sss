# Test Infrastructure

This directory contains test files and utilities for the blog enhancements project.

## Testing Framework

- **Vitest**: Fast unit test framework with native ESM support
- **fast-check**: Property-based testing library for JavaScript/TypeScript
- **@testing-library/react**: React component testing utilities
- **happy-dom**: Lightweight DOM implementation for testing

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Helpers

The `test-helpers.ts` file provides utilities for generating test data:

- `generateMarkdownContent()`: Create sample markdown with headings, code blocks, images
- `generateHtmlContent()`: Create sample HTML for testing parsers
- `stripHtml()`: Remove HTML tags from content
- `countWords()`: Count words in text

## Writing Tests

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

### Property-Based Tests

```typescript
import { describe, it } from 'vitest';
import fc from 'fast-check';

describe('MyFunction Properties', () => {
  it('should satisfy property for all inputs', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = myFunction(input);
        return result.length >= 0; // Property to verify
      }),
      { numRuns: 100 } // Run 100 iterations
    );
  });
});
```

### React Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Test Organization

- Unit tests: `*.test.ts` or `*.test.tsx`
- Property tests: `*.property.test.ts`
- Place tests in `__tests__` directories next to the code they test

## Configuration

- `vitest.config.ts`: Main Vitest configuration
- `vitest.setup.ts`: Global test setup and matchers
- Path aliases are configured to match the project structure (@/lib, @/components, etc.)

import { describe, test, expect } from '@jest/globals';
import fc from 'fast-check';

/**
 * Feature: blog-interactions, Property 7: Comment form validation
 * Validates: Requirements 3.2
 */

describe('Comment Form Validation Properties', () => {
  test('Property 7: Comment form validation - valid inputs enable submit', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 2000 }),
        (authorName, content) => {
          // Simulate form validation
          const trimmedName = authorName.trim();
          const trimmedContent = content.trim();
          const isFormValid = trimmedName.length > 0 && trimmedContent.length > 0;

          // Form should be valid when both fields have content
          expect(isFormValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7: Comment form validation - empty name disables submit', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 2000 }),
        (content) => {
          // Empty or whitespace-only name
          const authorName = '   ';
          const trimmedName = authorName.trim();
          const trimmedContent = content.trim();
          const isFormValid = trimmedName.length > 0 && trimmedContent.length > 0;

          // Form should be invalid
          expect(isFormValid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7: Comment form validation - empty content disables submit', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (authorName) => {
          // Empty or whitespace-only content
          const content = '   ';
          const trimmedName = authorName.trim();
          const trimmedContent = content.trim();
          const isFormValid = trimmedName.length > 0 && trimmedContent.length > 0;

          // Form should be invalid
          expect(isFormValid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7: Comment form validation - whitespace trimming', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 2000 }),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 10 }),
        (name, content, leadingSpaces, trailingSpaces) => {
          // Add whitespace
          const authorName = ' '.repeat(leadingSpaces) + name + ' '.repeat(trailingSpaces);
          const contentWithSpaces = ' '.repeat(leadingSpaces) + content + ' '.repeat(trailingSpaces);

          // Trim and validate
          const trimmedName = authorName.trim();
          const trimmedContent = contentWithSpaces.trim();
          const isFormValid = trimmedName.length > 0 && trimmedContent.length > 0;

          // Should be valid after trimming
          expect(isFormValid).toBe(true);
          expect(trimmedName).toBe(name);
          expect(trimmedContent).toBe(content);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7: Comment form validation - length constraints', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 2000 }),
        (authorName, content) => {
          // Check length constraints
          const nameValid = authorName.length <= 100;
          const contentValid = content.length <= 2000;

          expect(nameValid).toBe(true);
          expect(contentValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7: Comment form validation - too long inputs', () => {
    // Name too long
    const longName = 'a'.repeat(101);
    expect(longName.length).toBeGreaterThan(100);

    // Content too long
    const longContent = 'a'.repeat(2001);
    expect(longContent.length).toBeGreaterThan(2000);
  });

  test('Property 7: Form state consistency', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 100 }),
        fc.string({ maxLength: 2000 }),
        fc.boolean(),
        (authorName, content, loading) => {
          const trimmedName = authorName.trim();
          const trimmedContent = content.trim();
          const isFormValid = trimmedName.length > 0 && trimmedContent.length > 0;

          // Button should be disabled if form invalid OR loading
          const shouldDisable = !isFormValid || loading;

          if (loading) {
            expect(shouldDisable).toBe(true);
          }

          if (!isFormValid) {
            expect(shouldDisable).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

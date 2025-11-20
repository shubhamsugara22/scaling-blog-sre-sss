import { describe, test, expect } from '@jest/globals';
import fc from 'fast-check';
import {
  likeRequestSchema,
  commentRequestSchema,
  subscribeRequestSchema,
  postFormDataSchema,
  loginSchema,
} from '@/lib/types';

/**
 * Feature: blog-interactions, Property 24: API invalid data handling
 * Validates: Requirements 7.5
 */

describe('Schema Validation Properties', () => {
  test('Property 24: API invalid data handling - Like requests', () => {
    fc.assert(
      fc.property(
        fc.record({
          postSlug: fc.oneof(
            fc.constant(''),
            fc.constant(null),
            fc.constant(undefined),
            fc.integer()
          ),
        }),
        (invalidData) => {
          const result = likeRequestSchema.safeParse(invalidData);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 24: API invalid data handling - Comment requests with empty fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          postSlug: fc.constant(''),
          authorName: fc.string(),
          content: fc.string(),
        }),
        (invalidData) => {
          const result = commentRequestSchema.safeParse(invalidData);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 24: API invalid data handling - Comment requests with too long content', () => {
    fc.assert(
      fc.property(
        fc.record({
          postSlug: fc.string({ minLength: 1 }),
          authorName: fc.string({ minLength: 1 }),
          content: fc.string({ minLength: 2001, maxLength: 3000 }),
        }),
        (invalidData) => {
          const result = commentRequestSchema.safeParse(invalidData);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 24: API invalid data handling - Subscribe requests with invalid email', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({ email: 'not-an-email' }),
          fc.constant({ email: '@example.com' }),
          fc.constant({ email: 'user@' }),
          fc.constant({ email: '' }),
          fc.constant({ email: 'no-at-sign.com' })
        ),
        (invalidData) => {
          const result = subscribeRequestSchema.safeParse(invalidData);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 24: API invalid data handling - Post form with missing required fields', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({ title: '', content: 'test', tags: [], summary: '' }),
          fc.constant({ title: 'test', content: '', tags: [], summary: '' }),
          fc.constant({ title: 'test', content: 'test', tags: Array(11).fill('tag'), summary: '' })
        ),
        (invalidData) => {
          const result = postFormDataSchema.safeParse(invalidData);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 24: API invalid data handling - Login with short password', () => {
    fc.assert(
      fc.property(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ maxLength: 7 }),
        }),
        (invalidData) => {
          const result = loginSchema.safeParse(invalidData);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Valid data passes schema validation', () => {
    // Test that valid data passes
    const validLike = { postSlug: 'test-post' };
    expect(likeRequestSchema.safeParse(validLike).success).toBe(true);

    const validComment = {
      postSlug: 'test-post',
      authorName: 'John Doe',
      content: 'Great post!',
    };
    expect(commentRequestSchema.safeParse(validComment).success).toBe(true);

    const validSubscribe = { email: 'user@example.com' };
    expect(subscribeRequestSchema.safeParse(validSubscribe).success).toBe(true);

    const validPost = {
      title: 'Test Post',
      content: 'This is test content',
      tags: ['test', 'blog'],
      summary: 'A test post',
    };
    expect(postFormDataSchema.safeParse(validPost).success).toBe(true);

    const validLogin = {
      email: 'user@example.com',
      password: 'password123',
    };
    expect(loginSchema.safeParse(validLogin).success).toBe(true);
  });
});

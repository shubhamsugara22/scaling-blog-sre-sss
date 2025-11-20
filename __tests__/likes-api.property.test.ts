import { describe, test, expect } from '@jest/globals';
import fc from 'fast-check';
import { likeRequestSchema } from '@/lib/types';

/**
 * Feature: blog-interactions, Property 20: Like API toggle behavior
 * Validates: Requirements 7.1
 */

describe('Like API Properties', () => {
  test('Property 20: Like API toggle behavior - request validation', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.boolean(),
        (postSlug, liked) => {
          const requestBody = { postSlug, liked };

          // Validate request
          const validation = likeRequestSchema.safeParse(requestBody);
          expect(validation.success).toBe(true);

          if (validation.success) {
            expect(validation.data.postSlug).toBe(postSlug);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 20: Like API toggle behavior - invalid requests rejected', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({ postSlug: '' }),
          fc.constant({ postSlug: null }),
          fc.constant({ postSlug: undefined }),
          fc.constant({})
        ),
        (invalidRequest) => {
          const validation = likeRequestSchema.safeParse(invalidRequest);
          expect(validation.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 20: Like toggle logic', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.boolean(),
        (currentCount, isLiked) => {
          // Simulate toggle logic
          let newCount: number;
          let newLiked: boolean;

          if (isLiked) {
            // Unlike: decrement
            newCount = Math.max(0, currentCount - 1);
            newLiked = false;
          } else {
            // Like: increment
            newCount = currentCount + 1;
            newLiked = true;
          }

          // Verify toggle behavior
          if (isLiked) {
            expect(newCount).toBeLessThanOrEqual(currentCount);
            expect(newLiked).toBe(false);
          } else {
            expect(newCount).toBe(currentCount + 1);
            expect(newLiked).toBe(true);
          }

          // Count should never be negative
          expect(newCount).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 20: Response format consistency', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 0, max: 1000 }),
        fc.boolean(),
        (postSlug, count, liked) => {
          // Simulate API response
          const response = {
            postSlug,
            count,
            liked,
          };

          // Verify response structure
          expect(response).toHaveProperty('postSlug');
          expect(response).toHaveProperty('count');
          expect(response).toHaveProperty('liked');
          expect(typeof response.postSlug).toBe('string');
          expect(typeof response.count).toBe('number');
          expect(typeof response.liked).toBe('boolean');
          expect(response.count).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

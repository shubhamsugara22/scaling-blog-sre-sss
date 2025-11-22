import { describe, it, expect } from 'vitest';
import { generateMarkdownContent, countWords } from './test-helpers';

describe('Test Infrastructure Setup', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should have test helpers available', () => {
    const markdown = generateMarkdownContent({ wordCount: 10 });
    expect(markdown).toBeTruthy();
    expect(typeof markdown).toBe('string');
  });

  it('should count words correctly', () => {
    const text = 'one two three four five';
    expect(countWords(text)).toBe(5);
  });

  it('should support fast-check property testing', async () => {
    const fc = await import('fast-check');
    expect(fc).toBeDefined();
    expect(typeof fc.assert).toBe('function');
  });
});

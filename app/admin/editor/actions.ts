'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PostFormData, PostCreationResponse } from '@/lib/types';
import { generateUniqueSlug } from '@/lib/slug';

export async function createPost(data: PostFormData): Promise<PostCreationResponse> {
  try {
    // Generate unique slug from title
    const slug = generateUniqueSlug(data.title);

    // Get current date
    const date = new Date().toISOString().split('T')[0];

    // Create frontmatter
    const frontmatter = {
      title: data.title,
      date,
      tags: data.tags,
      summary: data.summary,
    };

    // Create markdown content with frontmatter
    const fileContent = matter.stringify(data.content, frontmatter);

    // Write file to content/blog directory
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    
    // Ensure directory exists
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }

    const filePath = path.join(blogDir, `${slug}.md`);
    
    // Write file atomically
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, fileContent, 'utf8');
    fs.renameSync(tempPath, filePath);

    return {
      success: true,
      slug,
      message: 'Post created successfully',
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create post',
    };
  }
}

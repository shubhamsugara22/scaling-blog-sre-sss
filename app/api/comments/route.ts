import { NextRequest, NextResponse } from 'next/server';
import { commentRequestSchema } from '@/lib/types';
import { getComments, createComment } from '@/lib/comments';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get('postSlug');

    if (!postSlug) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Post slug is required',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const comments = getComments(postSlug);

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error in comments GET API:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch comments',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = commentRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: validation.error.errors[0].message,
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const { postSlug, authorName, content } = validation.data;

    // Create comment
    const comment = createComment(postSlug, authorName, content);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error in comments POST API:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to create comment',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

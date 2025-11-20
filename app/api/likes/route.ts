import { NextRequest, NextResponse } from 'next/server';
import { likeRequestSchema } from '@/lib/types';
import { toggleLike } from '@/lib/likes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = likeRequestSchema.safeParse(body);
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

    const { postSlug } = validation.data;

    // Get liked state from request (default to false)
    const liked = body.liked === true;

    // Toggle like
    const result = toggleLike(postSlug, liked);

    return NextResponse.json({
      postSlug,
      count: result.count,
      liked: result.liked,
    });
  } catch (error) {
    console.error('Error in likes API:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to toggle like',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

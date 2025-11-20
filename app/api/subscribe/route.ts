import { NextRequest, NextResponse } from 'next/server';
import { subscribeRequestSchema } from '@/lib/types';
import { addSubscriber, checkSubscriber } from '@/lib/subscribers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = subscribeRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Check if already subscribed
    const alreadySubscribed = checkSubscriber(email);
    if (alreadySubscribed) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter!',
      });
    }

    // Add subscriber
    addSubscriber(email);

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed! Thank you for joining our newsletter.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in subscribe API:', error);
    
    if (error instanceof Error && error.message === 'Email already subscribed') {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter!',
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to subscribe. Please try again later.',
      },
      { status: 500 }
    );
  }
}

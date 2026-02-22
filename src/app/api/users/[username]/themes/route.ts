import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users/[username]/themes - Get themes by user with filters
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'All';
    const sort = searchParams.get('sort') || 'newest';

    // Find user by username
    const user = await db.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build where clause
    const where: any = {
      createdBy: user.id,
    };

    // Add category filter
    if (category && category !== 'All') {
      where.category = category;
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'likes') {
      orderBy = { likesCount: 'desc' };
    } else if (sort === 'views') {
      orderBy = { viewsCount: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    // Fetch themes
    const themes = await db.theme.findMany({
      where,
      orderBy,
      select: {
        id: true,
        themeId: true,
        name: true,
        description: true,
        category: true,
        likesCount: true,
        viewsCount: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      themes,
      total: themes.length,
    });
  } catch (error) {
    console.error('Get user themes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

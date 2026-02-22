import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users/[username] - Get user profile with stats
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

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

    // Get all themes by this user
    const themes = await db.theme.findMany({
      where: { createdBy: user.id },
      select: {
        id: true,
        name: true,
        status: true,
        category: true,
        likesCount: true,
        viewsCount: true,
        createdAt: true,
      },
    });

    // Calculate stats
    const totalThemes = themes.length;
    const totalLikes = themes.reduce((sum, t) => sum + t.likesCount, 0);
    const totalViews = themes.reduce((sum, t) => sum + t.viewsCount, 0);
    const approvedThemes = themes.filter(t => t.status === 'APPROVED').length;
    const pendingThemes = themes.filter(t => t.status === 'PENDING').length;

    // Category breakdown
    const categories: Record<string, number> = {
      Dark: 0,
      Light: 0,
      AMOLED: 0,
      Other: 0,
    };
    themes.forEach(theme => {
      if (theme.category && categories[theme.category] !== undefined) {
        categories[theme.category]++;
      } else {
        categories.Other++;
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        profileUrl: user.profileUrl,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      stats: {
        totalThemes,
        totalLikes,
        totalViews,
        approvedThemes,
        pendingThemes,
        categories,
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

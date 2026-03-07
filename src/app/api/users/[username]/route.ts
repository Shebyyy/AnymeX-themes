import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET /api/users/[username] - Get user profile with stats
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // Find user by username
    const { data: user, error: findError } = await supabase
      .from('User')
      .select('*')
      .eq('username', username)
      .single();

    if (findError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all themes by this user
    const { data: themes, error: themesError } = await supabase
      .from('Theme')
      .select('id, name, status, category, likesCount, viewsCount, createdAt')
      .eq('createdBy', (user as any).id);

    // Calculate stats
    const themesList = themes || [];
    const totalThemes = themesList.length;
    const totalLikes = themesList.reduce((sum: number, t: any) => sum + (t.likesCount || 0), 0);
    const totalViews = themesList.reduce((sum: number, t: any) => sum + (t.viewsCount || 0), 0);
    const approvedThemes = themesList.filter((t: any) => t.status === 'APPROVED').length;
    const pendingThemes = themesList.filter((t: any) => t.status === 'PENDING').length;

    // Category breakdown
    const categories: Record<string, number> = {
      Dark: 0,
      Light: 0,
      AMOLED: 0,
      Other: 0,
    };
    themesList.forEach((theme: any) => {
      if (theme.category && categories[theme.category] !== undefined) {
        categories[theme.category]++;
      } else {
        categories.Other++;
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: (user as any).id,
        username: (user as any).username,
        role: (user as any).role,
        profileUrl: (user as any).profileUrl,
        isActive: (user as any).isActive,
        createdAt: (user as any).createdAt,
        lastLoginAt: (user as any).lastLoginAt,
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

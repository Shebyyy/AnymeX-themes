import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

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

    // Build query
    let query = supabase
      .from('Theme')
      .select('id, themeId, name, description, category, likesCount, viewsCount, status, createdAt')
      .eq('createdBy', (user as any).id);

    // Determine sort order
    let ascending = false;
    let sortColumn = 'createdAt';
    if (sort === 'likes') {
      sortColumn = 'likesCount';
      ascending = false;
    } else if (sort === 'views') {
      sortColumn = 'viewsCount';
      ascending = false;
    } else if (sort === 'newest') {
      sortColumn = 'createdAt';
      ascending = false;
    } else if (sort === 'oldest') {
      sortColumn = 'createdAt';
      ascending = true;
    }

    query = query.order(sortColumn, { ascending });

    const { data: themes, error: themesError } = await query;

    if (themesError) {
      throw themesError;
    }

    // Filter by category client-side
    let filteredThemes = themes || [];
    if (category && category !== 'All') {
      filteredThemes = filteredThemes.filter((theme: any) => theme.category === category);
    }

    return NextResponse.json({
      success: true,
      themes: filteredThemes,
      total: filteredThemes.length,
    });
  } catch (error) {
    console.error('Get user themes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

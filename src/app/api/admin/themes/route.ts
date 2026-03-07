import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { validateSession } from '@/lib/auth';

// GET /api/admin/themes - List all themes with filters
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const currentUser = await validateSession(token);

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('Theme')
      .select('*, creator:User(id, username, profileUrl)')
      .order('createdAt', { ascending: false });

    // Apply status filter
    if (status && ['PENDING', 'APPROVED', 'REJECTED', 'BROKEN'].includes(status)) {
      query = query.eq('status', status);
    }

    // Apply search filter (need to handle OR condition differently in Supabase)
    const { data: themes, error } = await query;

    if (error) {
      throw error;
    }

    // Filter by search term client-side since Supabase doesn't support OR easily
    let filteredThemes = themes || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredThemes = filteredThemes.filter((theme: any) => 
        theme.name?.toLowerCase().includes(searchLower) ||
        theme.creatorName?.toLowerCase().includes(searchLower) ||
        theme.description?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ success: true, themes: filteredThemes });
  } catch (error) {
    console.error('Get themes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

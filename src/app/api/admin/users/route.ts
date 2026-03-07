import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/db';
import { validateSession, hashPassword } from '@/lib/auth';

// GET /api/admin/users - List all users
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

    // Get users with theme counts
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('id, username, role, isActive, profileUrl, createdAt, lastLoginAt')
      .order('createdAt', { ascending: false });

    if (usersError) {
      throw usersError;
    }

    // Get theme counts for each user
    const { data: themeCounts, error: countsError } = await supabase
      .from('Theme')
      .select('createdBy');

    // Count themes per user
    const themeCountMap: Record<string, number> = {};
    if (themeCounts) {
      themeCounts.forEach((theme: any) => {
        if (theme.createdBy) {
          themeCountMap[theme.createdBy] = (themeCountMap[theme.createdBy] || 0) + 1;
        }
      });
    }

    // Add theme count to each user
    const usersWithCount = users?.map((user: any) => ({
      ...user,
      _count: {
        createdThemes: themeCountMap[user.id] || 0,
      },
    })) || [];

    return NextResponse.json({ success: true, users: usersWithCount });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { username, password, role, profileUrl } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUser, error: findError } = await supabase
      .from('User')
      .select('*')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Only SUPER_ADMIN can create SUPER_ADMIN users
    if (role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can create SUPER_ADMIN users' },
        { status: 403 }
      );
    }

    const passwordHash = await hashPassword(password);

    const { data: newUser, error: createError } = await supabase
      .from('User')
      .insert({
        id: generateId(),
        username,
        passwordHash,
        role: role || 'USER',
        profileUrl: profileUrl || null,
        isActive: true,
      })
      .select('id, username, role, isActive, profileUrl, createdAt')
      .single();

    if (createError) {
      throw createError;
    }

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

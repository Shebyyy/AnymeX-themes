import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { validateSession, hashPassword } from '@/lib/auth';

// GET /api/admin/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: user, error: findError } = await supabase
      .from('User')
      .select('id, username, role, isActive, profileUrl, createdAt, lastLoginAt')
      .eq('id', params.id)
      .single();

    if (findError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get theme count for the user
    const { count: themeCount, error: countError } = await supabase
      .from('Theme')
      .select('*', { count: 'exact', head: true })
      .eq('createdBy', params.id);

    const userWithCount = {
      ...user,
      _count: {
        createdThemes: themeCount || 0,
      },
    };

    return NextResponse.json({ success: true, user: userWithCount });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { role, isActive, profileUrl } = body;

    // Check if target user exists
    const { data: targetUser, error: findError } = await supabase
      .from('User')
      .select('*')
      .eq('id', params.id)
      .single();

    if (findError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent modifying SUPER_ADMIN users unless you are a SUPER_ADMIN
    if ((targetUser as any).role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot modify SUPER_ADMIN users' },
        { status: 403 }
      );
    }

    // Only SUPER_ADMIN can assign SUPER_ADMIN role
    if (role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can assign SUPER_ADMIN role' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (profileUrl !== undefined) updateData.profileUrl = profileUrl;

    const { data: updatedUser, error: updateError } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', params.id)
      .select('id, username, role, isActive, profileUrl, createdAt, lastLoginAt')
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if target user exists
    const { data: targetUser, error: findError } = await supabase
      .from('User')
      .select('*')
      .eq('id', params.id)
      .single();

    if (findError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting yourself
    if ((targetUser as any).id === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Prevent deleting SUPER_ADMIN users unless you are a SUPER_ADMIN
    if ((targetUser as any).role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete SUPER_ADMIN users' },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from('User')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

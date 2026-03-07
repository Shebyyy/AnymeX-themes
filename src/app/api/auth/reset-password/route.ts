import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { hashPassword, validateSession, isAdmin, generateToken } from '@/lib/auth';

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

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'User ID and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const isUserAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

    // Users can only reset their own password if they forgot it (with a token)
    // Admins can reset any user's password
    if (!isUserAdmin && currentUser.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if target user exists
    const { data: targetUser, error: findError } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .single();

    if (findError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update password
    const newPasswordHash = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from('User')
      .update({ passwordHash: newPasswordHash })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // Invalidate all sessions for the user
    const { error: deleteError } = await supabase
      .from('SessionToken')
      .delete()
      .eq('userId', userId);

    if (deleteError) {
      console.error('Failed to invalidate sessions:', deleteError);
      // Don't fail the request if session invalidation fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

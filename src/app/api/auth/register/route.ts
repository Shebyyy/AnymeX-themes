import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, profileUrl, role } = body;

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

    const normalizedUsername = username.trim();

    // Check if username already exists
    const { data: existingUsers, error: existingUserError } = await supabase
      .from('User')
      .select('id')
      .eq('username', normalizedUsername);

    if (existingUserError) {
      console.error('Error checking existing username:', existingUserError);
      return NextResponse.json(
        { error: existingUserError.message || 'Failed to validate username' },
        { status: 500 }
      );
    }

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Validate role - only USER and THEME_CREATOR can be registered
    // ADMIN and SUPER_ADMIN can only be created by existing admins
    const allowedRoles = ['USER', 'THEME_CREATOR'];
    let userRole = role || 'THEME_CREATOR'; // Default to THEME_CREATOR

    if (!allowedRoles.includes(userRole)) {
      userRole = 'THEME_CREATOR'; // Default to THEME_CREATOR if invalid role provided
    }

    const passwordHash = await hashPassword(password);

    const { data: user, error } = await supabase
      .from('User')
      .insert({
        id: generateId(),
        username: normalizedUsername,
        passwordHash,
        profileUrl,
        role: userRole,
        isActive: true,
      })
      .select('id, username, role, isActive, createdAt')
      .single();

    if (error || !user) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: error?.message || 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create session
    const token = await createSession(user.id);

    return NextResponse.json(
      {
        success: true,
        user,
        token,
        message: 'Account created successfully!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

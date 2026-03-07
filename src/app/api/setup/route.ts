import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if any users already exist
    const { count, error: countError } = await supabase
      .from('User')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting users:', countError);
    }

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Setup already completed. Users already exist.' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('User')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create the first SUPER_ADMIN user
    const { data: user, error } = await supabase
      .from('User')
      .insert({
        username,
        passwordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      })
      .select('id, username, role, isActive, createdAt')
      .single();

    if (error) {
      console.error('Error creating super admin:', error);
      return NextResponse.json(
        { error: 'Failed to create super admin' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'Super admin created successfully!',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

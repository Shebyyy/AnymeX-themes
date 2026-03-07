import { supabase } from './db';

// Simple password hashing (for production, use bcrypt or argon2)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export async function generateToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export async function createSession(userId: string): Promise<string> {
  const token = await generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const { error } = await supabase
    .from('SessionToken')
    .insert({
      userId,
      token,
      expiresAt: expiresAt.toISOString(),
    });

  if (error) {
    throw new Error('Failed to create session');
  }

  return token;
}

export async function validateSession(token: string) {
  const { data: session, error } = await supabase
    .from('SessionToken')
    .select(`
      id,
      userId,
      token,
      expiresAt,
      createdAt,
      user:User (
        id,
        username,
        passwordHash,
        role,
        profileUrl,
        isActive,
        createdAt,
        updatedAt,
        lastLoginAt
      )
    `)
    .eq('token', token)
    .single();

  if (error || !session) {
    return null;
  }

  const expiresAtDate = new Date(session.expiresAt);
  if (expiresAtDate < new Date()) {
    await supabase.from('SessionToken').delete().eq('id', session.id);
    return null;
  }

  // Update last login
  await supabase
    .from('User')
    .update({ lastLoginAt: new Date().toISOString() })
    .eq('id', session.userId);

  return session.user;
}

export async function destroySession(token: string): Promise<void> {
  await supabase.from('SessionToken').delete().eq('token', token);
}

export async function isAdmin(token: string): Promise<boolean> {
  const user = await validateSession(token);
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}

import { db } from './db';

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

  await db.sessionToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function validateSession(token: string) {
  const session = await db.sessionToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.sessionToken.delete({ where: { id: session.id } });
    }
    return null;
  }

  // Update last login
  await db.user.update({
    where: { id: session.userId },
    data: { lastLoginAt: new Date() },
  });

  return session.user;
}

export async function destroySession(token: string): Promise<void> {
  await db.sessionToken.deleteMany({ where: { token } });
}

export async function isAdmin(token: string): Promise<boolean> {
  const user = await validateSession(token);
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}

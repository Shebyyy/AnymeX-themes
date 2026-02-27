export const AUTH_TOKEN_KEYS = ["creator_token", "admin_token"] as const;
export const AUTH_USER_KEYS = ["creator_user", "admin_user"] as const;

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  for (const key of AUTH_TOKEN_KEYS) {
    const token = localStorage.getItem(key);
    if (token) return token;
  }

  return null;
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;

  for (const key of AUTH_TOKEN_KEYS) {
    localStorage.removeItem(key);
  }

  for (const key of AUTH_USER_KEYS) {
    localStorage.removeItem(key);
  }
}

export function getOrCreateAnonymousToken(): string {
  if (typeof window === "undefined") return "";

  let token = localStorage.getItem("anymex_token");
  if (!token) {
    token = `anymex_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem("anymex_token", token);
  }

  document.cookie = `anymex_token=${token}; path=/; max-age=31536000; SameSite=Lax`;

  return token;
}

export async function authFetchMe(token?: string) {
  const resolvedToken = token ?? getStoredAuthToken();
  if (!resolvedToken) return null;

  const response = await fetch("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${resolvedToken}`,
    },
  });

  if (!response.ok) return null;

  return response.json();
}

export async function authLogout(token?: string): Promise<void> {
  const resolvedToken = token ?? getStoredAuthToken();

  if (!resolvedToken) return;

  await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resolvedToken}`,
    },
  });
}

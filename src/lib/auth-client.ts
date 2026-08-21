import { createAuthClient } from 'better-auth/react';

// Robust URL sanitizer to prevent BetterAuthError when user writes URL without https://
const sanitizeBaseUrl = (rawUrl?: string): string => {
  if (!rawUrl || !rawUrl.trim()) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.origin.startsWith('http')) {
      return window.location.origin;
    }
    return 'http://localhost:3001';
  }

  let url = rawUrl.trim();
  // Auto-prepend https:// if protocol was omitted (e.g. "marlex.vercel.app" -> "https://marlex.vercel.app")
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  // Strip trailing slashes
  return url.replace(/\/+$/, '');
};

const baseUrl = sanitizeBaseUrl((import.meta as any).env?.VITE_API_URL);

export const authClient = createAuthClient({
  baseURL: baseUrl,
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

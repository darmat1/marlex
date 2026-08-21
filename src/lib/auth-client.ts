import { createAuthClient } from 'better-auth/react';

// Get API URL from env, or current origin in web, or fallback to localhost in dev Electron
const getApiBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.origin.startsWith('http')) {
    return window.location.origin;
  }
  return 'http://localhost:3001';
};

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

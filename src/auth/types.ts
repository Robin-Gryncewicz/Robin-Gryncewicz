/**
 * Authentication related type definitions
 */

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}

export type AuthProvider = 'local' | 'google' | 'github' | 'facebook';

export interface AuthOptions {
  provider: AuthProvider;
  redirectUrl?: string;
}

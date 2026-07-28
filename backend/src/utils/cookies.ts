import type { Response } from 'express';
import config from '../app/config/index.js';
import { REFRESH_TOKEN_COOKIE } from '../shared/constants/auth.constants.js';

const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Set the refresh token as a secure HttpOnly cookie.
 * - HttpOnly: not accessible from JavaScript
 * - Secure: only sent over HTTPS (in production)
 * - SameSite=Strict: CSRF protection
 */
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'strict' : 'lax',
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: '/',
  });
};

/**
 * Clear the refresh token cookie on logout or session revocation.
 */
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'strict' : 'lax',
    path: '/',
  });
};
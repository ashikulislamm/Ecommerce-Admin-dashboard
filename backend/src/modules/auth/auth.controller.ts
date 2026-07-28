import type { Request, Response } from 'express';
import AuthService from './auth.service.js';
import { ApiResponse } from '../../shared/responses/api-response.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../../utils/cookies.js';
import { REFRESH_TOKEN_COOKIE } from '../../shared/constants/auth.constants.js';

export class AuthController {
  /**
   * POST /api/v1/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    const meta = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    const { user, accessToken, rawRefreshToken } = await AuthService.login(req.body, meta);

    // Set raw refresh token in HttpOnly cookie
    setRefreshTokenCookie(res, rawRefreshToken);

    ApiResponse.success(res, 200, 'Login successful', {
      user,
      accessToken,
    });
  }

  /**
   * POST /api/v1/auth/refresh
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    const rawRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;

    const meta = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    const { user, accessToken, newRawRefreshToken } = await AuthService.refresh(
      rawRefreshToken,
      meta,
    );

    // Set rotated refresh token in HttpOnly cookie
    setRefreshTokenCookie(res, newRawRefreshToken);

    ApiResponse.success(res, 200, 'Token refreshed successfully', {
      user,
      accessToken,
    });
  }

  /**
   * POST /api/v1/auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    const rawRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;

    await AuthService.logout(rawRefreshToken);

    // Clear refresh cookie
    clearRefreshTokenCookie(res);

    ApiResponse.success(res, 200, 'Logged out successfully', null);
  }

  /**
   * GET /api/v1/auth/session
   */
  static async getSession(req: Request, res: Response): Promise<void> {
    const sessionData = await AuthService.getSession(req.user!);

    ApiResponse.success(res, 200, 'Session retrieved successfully', sessionData);
  }
}

export default AuthController;
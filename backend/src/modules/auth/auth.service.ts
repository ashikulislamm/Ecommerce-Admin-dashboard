import AuthRepository from './auth.repository.js';
import AuthorizationService from './authorization.service.js';
import type { LoginInput, LoginResponseData, RefreshResponseData, SessionResponseData } from './auth.types.js';
import { comparePassword } from '../../utils/password.js';
import { signAccessToken } from '../../utils/jwt.js';
import { generateOpaqueRefreshToken, hashRefreshToken } from '../../utils/refresh-token.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { AuthenticatedUser } from '../../shared/types/common.types.js';
import logger from '../../lib/logger.js';

const REFRESH_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AuthService {
  /**
   * User login.
   *
   * Security rules:
   * 1. Email normalized (trimmed + lowercased)
   * 2. Constant-time password comparison
   * 3. Generic authentication error prevents user enumeration
   * 4. Inactive user check prevents access
   * 5. Opaque refresh token generated and hashed before DB persistence
   */
  static async login(
    input: LoginInput,
    meta: { ipAddress?: string; userAgent?: string } = {},
  ): Promise<LoginResponseData & { rawRefreshToken: string }> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // 1. Lookup user
    const user = await AuthRepository.findUserByEmail(normalizedEmail);

    // Generic error to prevent user enumeration
    if (!user) {
      throw new AppError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // 2. Compare bcrypt password
    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // 3. Inactive user protection
    if (user.status !== 'ACTIVE') {
      throw new AppError(401, 'AUTH_USER_INACTIVE', 'User account is inactive');
    }

    // 4. Generate JWT access token
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    // 5. Generate secure opaque refresh token & store hash in DB
    const rawRefreshToken = generateOpaqueRefreshToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_SESSION_DURATION_MS);

    await AuthRepository.createRefreshSession({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        roleName: user.role.name,
        status: user.status,
      },
      accessToken,
      rawRefreshToken,
    };
  }

  /**
   * Refresh access token & rotate refresh token.
   *
   * Security rules:
   * 1. Reads raw refresh token from cookie, computes hash for DB lookup
   * 2. REUSE DETECTION: If a revoked token is presented, revokes ALL sessions for that user
   * 3. Checks session expiration & user active status
   * 4. ROTATION: Revokes old session and creates a new RefreshSession
   */
  static async refresh(
    rawRefreshToken: string | undefined,
    meta: { ipAddress?: string; userAgent?: string } = {},
  ): Promise<RefreshResponseData & { newRawRefreshToken: string }> {
    if (!rawRefreshToken) {
      throw new AppError(
        401,
        'AUTH_REFRESH_TOKEN_MISSING',
        'Refresh token cookie is missing',
      );
    }

    const tokenHash = hashRefreshToken(rawRefreshToken);
    const session = await AuthRepository.findSessionByHash(tokenHash);

    // 1. Session not found
    if (!session) {
      throw new AppError(401, 'AUTH_REFRESH_TOKEN_INVALID', 'Invalid refresh token');
    }

    // 2. REUSE DETECTION — Revoked token presented again!
    if (session.revokedAt !== null) {
      logger.warn(
        { userId: session.userId, sessionId: session.id },
        'SECURITY ALERT: Reused revoked refresh token detected. Revoking all user sessions.',
      );

      // Revoke ALL sessions for this user as a security safeguard
      await AuthRepository.revokeAllUserSessions(session.userId);

      throw new AppError(
        401,
        'AUTH_REFRESH_TOKEN_REUSED',
        'Revoked refresh token reuse detected. All sessions have been revoked for security.',
      );
    }

    // 3. Expired session
    if (session.expiresAt < new Date()) {
      await AuthRepository.revokeSession(session.id);
      throw new AppError(
        401,
        'AUTH_REFRESH_TOKEN_EXPIRED',
        'Refresh session has expired. Please log in again.',
      );
    }

    // 4. Inactive user check
    const user = session.user;
    if (!user || user.status !== 'ACTIVE') {
      await AuthRepository.revokeSession(session.id);
      throw new AppError(401, 'AUTH_USER_INACTIVE', 'User account is inactive');
    }

    // 5. ROTATION — Revoke current session & issue a new session
    await AuthRepository.revokeSession(session.id);

    const newRawRefreshToken = generateOpaqueRefreshToken();
    const newTokenHash = hashRefreshToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_SESSION_DURATION_MS);

    await AuthRepository.createRefreshSession({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    const newAccessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        roleName: user.role.name,
        status: user.status,
      },
      accessToken: newAccessToken,
      newRawRefreshToken,
    };
  }

  /**
   * Logout user.
   * Server-side session revocation & cookie cleanup.
   */
  static async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = hashRefreshToken(rawRefreshToken);
      const session = await AuthRepository.findSessionByHash(tokenHash);

      if (session && session.revokedAt === null) {
        await AuthRepository.revokeSession(session.id);
      }
    }
  }

  /**
   * Get current authenticated user session & permissions.
   */
  static async getSession(user: AuthenticatedUser): Promise<SessionResponseData> {
    const permissions = await AuthorizationService.getRolePermissions(user.roleId);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        roleName: user.roleName,
        status: user.status,
      },
      permissions,
    };
  }
}

export default AuthService;
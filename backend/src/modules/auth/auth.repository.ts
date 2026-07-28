import prisma from '../../lib/prisma.js';

export class AuthRepository {
  /**
   * Find a user by normalized email address.
   * Includes role information for permission evaluation.
   */
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Find user by ID.
   */
  static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Create a new RefreshSession record.
   */
  static async createRefreshSession(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.refreshSession.create({
      data,
    });
  }

  /**
   * Find a RefreshSession by tokenHash.
   * Includes associated user.
   */
  static async findSessionByHash(tokenHash: string) {
    return prisma.refreshSession.findFirst({
      where: { tokenHash },
      include: {
        user: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Revoke a specific RefreshSession by ID.
   */
  static async revokeSession(sessionId: string) {
    return prisma.refreshSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revoke all active sessions for a specific user (used when reuse attack detected or password changed).
   */
  static async revokeAllUserSessions(userId: string) {
    return prisma.refreshSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }
}

export default AuthRepository;
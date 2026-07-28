import jwt from 'jsonwebtoken';
import config from '../app/config/index.js';
import type { AccessTokenPayload, RefreshTokenPayload } from '../shared/types/common.types.js';
import { AppError } from '../shared/errors/app-error.js';

// --- Access Token ---

export const signAccessToken = (payload: Omit<AccessTokenPayload, 'type'>): string => {
  return jwt.sign(
    { ...payload, type: 'access' },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiresIn } as jwt.SignOptions,
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret) as AccessTokenPayload;

    if (decoded.type !== 'access') {
      throw AppError.tokenInvalid('Token type mismatch');
    }

    return decoded;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof jwt.TokenExpiredError) throw AppError.tokenExpired();
    throw AppError.tokenInvalid();
  }
};

// --- Refresh Token ---

export const signRefreshToken = (payload: Omit<RefreshTokenPayload, 'type'>): string => {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn } as jwt.SignOptions,
  );
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret) as RefreshTokenPayload;

    if (decoded.type !== 'refresh') {
      throw AppError.tokenInvalid('Token type mismatch');
    }

    return decoded;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof jwt.TokenExpiredError) throw AppError.tokenExpired();
    throw AppError.tokenInvalid();
  }
};
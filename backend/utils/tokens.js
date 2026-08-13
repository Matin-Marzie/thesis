import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import usersModel from '../models/usersModel.js';
import refreshTokensModel from '../models/refreshTokensModel.js';

// After REFRESH_TOKEN_ABSOLUTE_DAYS, user needs to login again.
const REFRESH_TOKEN_ABSOLUTE_DAYS = Number(process.env.REFRESH_TOKEN_ABSOLUTE_DAYS) || 90;

// Standardized access-token payload, used by every issuance site so
// verifyJWT.js can always rely on id/email/username being present.
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h' }
  );
};

// Refresh tokens are opaque random values, not JWTs - validity is decided
// entirely by DB state (row exists, not revoked, not past its absolute
// cap), so a self-verifying token would just be a redundant second source
// of truth.
export const generateRefreshTokenValue = () => {
  return crypto.randomBytes(64).toString('hex');
};

// HMAC with a server-only secret (same pattern as EmailVerificationCode.js /
// PasswordResetCode.js) so a leaked DB row alone isn't enough to reuse the
// token - the pepper is also needed.
export const hashRefreshToken = (rawToken) => {
  return crypto
    .createHmac('sha256', process.env.REFRESH_TOKEN_SECRET)
    .update(rawToken)
    .digest('hex');
};

export const getAbsoluteExpiryDate = () => {
  return new Date(Date.now() + REFRESH_TOKEN_ABSOLUTE_DAYS * 24 * 60 * 60 * 1000);
};

// Mints an access token + a brand-new refresh-token family for a fresh
// login/registration. Only call this on real login/register - never on
// rotation, since rotation must reuse the family's original expires_at
// (that's what makes the 90-day cap absolute rather than sliding).
export const issueTokenPair = async (user, { userAgent, ipAddress } = {}) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshTokenValue();

  await refreshTokensModel.createFamily({
    userId: user.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: getAbsoluteExpiryDate(),
    userAgent,
    ipAddress,
  });

  await usersModel.touchLastLogin(user.id);

  return { accessToken, refreshToken };
};

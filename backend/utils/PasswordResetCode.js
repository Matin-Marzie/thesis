import crypto from 'crypto';

const PASSWORD_CODE_TTL_MINUTES = Number(process.env.PASSWORD_RESET_CODE_EXPIRES_IN) || 10;
const MAX_WRONG_ATTEMPTS = 5;

// crypto.randomInt(0, 1000000) gives 0-999999; padStart preserves leading zeros
export const generateCode = () => {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
};

export const getCodeExpiresAt = () => {
  return new Date(Date.now() + PASSWORD_CODE_TTL_MINUTES * 60 * 1000);
};

// HMAC with a server-only secret (not just SHA-256) so a leaked DB row alone
// isn't enough to brute-force the 6-digit space - the pepper is also needed.
export const hashCode = (code) => {
  return crypto
    .createHmac('sha256', process.env.PASSWORD_RESET_SECRET)
    .update(code)
    .digest('hex');
};

export const verifyCode = (code, codeHash) => {
  const expected = Buffer.from(hashCode(code));
  const actual = Buffer.from(codeHash);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
};

export const attemptsExceeded = (attempts) => attempts >= MAX_WRONG_ATTEMPTS;

export { PASSWORD_CODE_TTL_MINUTES };

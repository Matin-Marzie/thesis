import RefreshTokenSchema from '../validation/RefreshTokenSchema.js';
import { generateAccessToken, generateRefreshTokenValue, hashRefreshToken } from '../utils/tokens.js';
import refreshTokensModel from '../models/refreshTokensModel.js';
import usersModel from '../models/usersModel.js';
import { logEvents } from '../middleware/logEvents.js';

const refreshTokenController = async (req, res) => {
  try {
    const { error, value } = RefreshTokenSchema.validate(req.body);

    if (error) {
      return res.status(401).json({
        message: 'Refresh token not found',
        code: 'REFRESH_TOKEN_MISSING',
      });
    }

    const { refreshToken } = value;

    // Generate the candidate replacement up front - rotate() only persists
    // it if the presented token turns out to still be valid.
    const newRawToken = generateRefreshTokenValue();
    const result = await refreshTokensModel.rotate(
      hashRefreshToken(refreshToken),
      hashRefreshToken(newRawToken),
      { userAgent: req.headers['user-agent'], ipAddress: req.ip }
    );

    if (result.status === 'not_found') {
      return res.status(403).json({
        message: 'Invalid refresh token',
        code: 'REFRESH_TOKEN_INVALID',
      });
    }

    if (result.status === 'reuse_detected') {
      logEvents(`SECURITY: refresh token reuse detected for user ${result.userId}, family ${result.familyId} revoked`, 'securityLog.log');
      return res.status(403).json({
        message: 'For your security, please log in again.',
        code: 'REFRESH_TOKEN_REUSED',
      });
    }

    if (result.status === 'expired') {
      return res.status(403).json({
        message: 'Your session has expired. Please log in again.',
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    }

    const user = await usersModel.get(result.userId);
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRawToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      message: 'Internal server error during token refresh',
    });
  }
};

export default refreshTokenController;

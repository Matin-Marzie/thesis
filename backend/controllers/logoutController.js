import refreshTokensModel from '../models/refreshTokensModel.js';
import { hashRefreshToken } from '../utils/tokens.js';
import { logEvents } from '../middleware/logEvents.js';

const logoutController = async (req, res) => {
  try {
    // Get refresh token from request body (sent from SecureStore)
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(204).json();
    }

    // Revoke the whole family this token belongs to (not just this one
    // row), so logout reliably kills the device's session even if the
    // client's stored token happens to be one rotation behind.
    const row = await refreshTokensModel.findByHash(hashRefreshToken(refreshToken));

    if (row) {
      await refreshTokensModel.revokeFamily(row.family_id);
      logEvents(`User logged out (user ${row.user_id})`, 'authLog.log');
    }

    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Internal server error during logout',
    });
  }
};

export default logoutController;

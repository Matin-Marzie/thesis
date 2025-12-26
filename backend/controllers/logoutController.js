import usersModel from '../models/usersModel.js';
import { logEvents } from '../middleware/logEvents.js';

const logoutController = async (req, res) => {
  try {
    // Get refresh token from request body (sent from SecureStore)
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(204).json();
    }

    // Find user with this refresh token
    const user = await usersModel.findByRefreshToken(refreshToken);

    if (user) {
      // Clear refresh token from database
      await usersModel.clearRefreshToken(user.id);
      logEvents(`User logged out: ${user.email}`, 'authLog.log');
    }

    // Refresh token cleared from database
    // Client should remove it from SecureStore
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

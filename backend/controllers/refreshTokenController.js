import jwt from 'jsonwebtoken';
import usersModel from '../models/usersModel.js';

const refreshTokenController = async (req, res) => {
  try {
    
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: 'Refresh token not found',
      });
    }

    // Find user with this refresh token
    const user = await usersModel.findByRefreshToken(refreshToken);

    if (!user) {
      return res.status(403).json({
        message: 'Invalid refresh token',
      });
    }

    // Verify refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err || user.id !== decoded.id) {
        return res.status(403).json({
          message: 'Invalid or expired refresh token',
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
      );

      res.status(200).json({
        message: 'Token refreshed successfully',
        data: {
          accessToken,
        },
      });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      message: 'Internal server error during token refresh',
    });
  }
};

export default refreshTokenController;

import ResetPasswordSchema from '../validation/ResetPasswordSchema.js';
import { hashPassword } from '../utils/password.js';
import usersModel from '../models/usersModel.js';
import passwordResetModel from '../models/passwordResetModel.js';
import { verifyCode, attemptsExceeded } from '../utils/PasswordResetCode.js';
import { logEvents } from '../middleware/logEvents.js';

const resetPasswordController = async (req, res) => {
  try {
    const { error, value } = ResetPasswordSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email, code, new_password } = value;

    const pending = await passwordResetModel.getByEmail(email);

    if (!pending) {
      return res.status(400).json({
        message: 'No password reset code found for this email. Please request a new one.\n(Resend code)',
      });
    }

    if (new Date(pending.expires_at).getTime() < Date.now()) {
      return res.status(400).json({
        message: 'Password reset code has expired. Please request a new one.\n(Resend code)',
      });
    }

    if (attemptsExceeded(pending.attempts)) {
      return res.status(429).json({
        message: 'Too many incorrect attempts. Please request a new code.\n(Resend code)',
      });
    }

    if (!verifyCode(code, pending.code_hash)) {
      await passwordResetModel.incrementAttempts(email);
      return res.status(400).json({
        message: 'Incorrect verification code',
      });
    }

    // A correct code was only ever delivered to a real, password-based
    // account (forgotPasswordController never emails the real code
    // otherwise) - these checks are defense in depth, not the primary gate.
    const user = await usersModel.findByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: 'Incorrect verification code',
      });
    }

    if (!user.password_hash && user.google_id) {
      return res.status(400).json({
        message: 'This account uses Google Sign-In - there is no password to reset',
      });
    }

    // Verification succeeded - the pending code is single-use
    await passwordResetModel.deleteByEmail(email);

    const password_hash = await hashPassword(new_password);
    // Also clears refresh_token, logging out any existing sessions
    await usersModel.updatePassword(user.id, password_hash);

    logEvents(`Password reset for ${user.email}`, 'authLog.log');

    return res.status(200).json({
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: '500: Failed to reset password (server error)',
    });
  }
};

export default resetPasswordController;

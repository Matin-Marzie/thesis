import VerifyResetCodeSchema from '../validation/VerifyResetCodeSchema.js';
import passwordResetModel from '../models/passwordResetModel.js';
import { verifyCode, attemptsExceeded } from '../utils/PasswordResetCode.js';

// Lets the client confirm the code is correct before asking for a new
// password. Does NOT delete the pending row or mark the code used - that
// still only happens in /auth/reset-password, which re-verifies the code
// as the real, single-use gate before changing anything.
const verifyResetCodeController = async (req, res) => {
  try {
    const { error, value } = VerifyResetCodeSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email, code } = value;

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

    return res.status(200).json({
      message: 'Code verified',
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      message: '500: Failed to verify code (server error)',
    });
  }
};

export default verifyResetCodeController;

import ForgotPasswordSchema from '../validation/ForgotPasswordSchema.js';
import usersModel from '../models/usersModel.js';
import passwordResetModel from '../models/passwordResetModel.js';
import { generateCode, getCodeExpiresAt, hashCode } from '../utils/PasswordResetCode.js';
import {
  sendPasswordResetCodeEmail,
  sendPasswordResetNotRegisteredEmail,
  sendPasswordResetGoogleAccountEmail,
} from '../utils/mailer.js';
import { logEvents } from '../middleware/logEvents.js';

const RESEND_COOLDOWN_MS = 60 * 1000;

// Always responds with the same generic message, regardless of whether the
// email is registered, to prevent account enumeration through this endpoint.
// A code/notice row is generated and stored either way (keeping the cooldown
// and response timing uniform); which of the three emails actually goes out
// - the code, a "not registered" notice, or a "use Google sign-in" notice -
// is the only signal, and only the owner of that inbox ever sees it.
const forgotPasswordController = async (req, res) => {
  try {
    const { error, value } = ForgotPasswordSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email } = value;
    const genericResponse = {
      message: 'A password reset code has been sent',
    };

    // 60s resend cooldown, derived from the pending row's created_at
    const pending = await passwordResetModel.getByEmail(email);
    if (pending) {
      const elapsedMs = Date.now() - new Date(pending.created_at).getTime();
      if (elapsedMs < RESEND_COOLDOWN_MS) {
        return res.status(200).json(genericResponse);
      }
    }

    const user = await usersModel.findByEmail(email);

    const code = generateCode();
    const codeHash = hashCode(code);
    const expiresAt = getCodeExpiresAt();
    await passwordResetModel.upsertCode(email, codeHash, expiresAt);

    if (!user) {
      await sendPasswordResetNotRegisteredEmail(email);
    } else if (!user.password_hash && user.google_id) {
      await sendPasswordResetGoogleAccountEmail(email);
    } else {
      await sendPasswordResetCodeEmail(email, code);
    }

    logEvents(`Password reset requested for ${email}`, 'authLog.log');

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: '500: Failed to process password reset request (server error)',
    });
  }
};

export default forgotPasswordController;

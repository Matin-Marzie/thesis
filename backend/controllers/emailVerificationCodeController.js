import SendCodeSchema from '../validation/SendCodeSchema.js';
import usersModel from '../models/usersModel.js';
import emailVerificationModel from '../models/emailVerificationModel.js';
import { generateCode, getCodeExpiresAt, hashCode, CODE_TTL_MINUTES } from '../utils/EmailVerificationCode.js';
import { sendVerificationCodeEmail } from '../utils/mailer.js';
import { logEvents } from '../middleware/logEvents.js';

const RESEND_COOLDOWN_MS = 60 * 1000;

const emailVerificationCodeController = async (req, res) => {
  try {
    const { error, value } = SendCodeSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email } = value;

    // Reject if the email is already a registered account
    const existing = await usersModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        message: 'Email already in use',
      });
    }

    // 60s resend cooldown, derived from the pending row's created_at
    const pending = await emailVerificationModel.getByEmail(email);
    if (pending) {
      const elapsedMs = Date.now() - new Date(pending.created_at).getTime();
      if (elapsedMs < RESEND_COOLDOWN_MS) {
        return res.status(429).json({
          message: 'Please wait before requesting another code',
          retry_after_seconds: Math.ceil((RESEND_COOLDOWN_MS - elapsedMs) / 1000),
        });
      }
    }

    const code = generateCode();
    const codeHash = hashCode(code);
    const expiresAt = getCodeExpiresAt();

    await sendVerificationCodeEmail(email, code);
    await emailVerificationModel.upsertCode(email, codeHash, expiresAt);

    logEvents(`Verification code sent to ${email}`, 'authLog.log');

    return res.status(200).json({
      message: 'Verification code sent',
      expires_in_minutes: CODE_TTL_MINUTES,
    });
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({
      message: '500: Failed to send verification code (server error)',
    });
  }
};

export default emailVerificationCodeController;

import nodemailer from 'nodemailer';
import { PASSWORD_CODE_TTL_MINUTES } from './PasswordResetCode.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationCodeEmail = async (toEmail, code) => {

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `Your verification code: ${code}`,
    text: `Your verification code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
    html: `<p>Your verification code is <strong style="font-size:20px;letter-spacing:2px">${code}</strong>.</p><p>It expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
  });

  return info;
};

export const sendPasswordResetCodeEmail = async (toEmail, code) => {

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `Your password reset code: ${code}`,
    text: `Your password reset code is ${code}. It expires in ${PASSWORD_CODE_TTL_MINUTES} minutes. If you didn't request this, you can ignore this email - your password will not change.`,
    html: `<p>Your password reset code is <strong style="font-size:20px;letter-spacing:2px">${code}</strong>.</p><p>It expires in ${PASSWORD_CODE_TTL_MINUTES} minutes. If you didn't request this, you can ignore this email - your password will not change.</p>`,
  });

  return info;
};

// Sent instead of a code when someone requests a password reset for an
// email that has no account - lets the actual owner of that inbox know,
// without telling the API caller whether the account exists.
export const sendPasswordResetNotRegisteredEmail = async (toEmail) => {

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Password reset requested for this email',
    text: `Someone requested a password reset using this email address, but no account is registered with it. If this wasn't you, you can safely ignore this email. If you meant to reset a different account's password, please check the email address and try again.`,
    html: `<p>Someone requested a password reset using this email address, but no account is registered with it.</p><p>If this wasn't you, you can safely ignore this email. If you meant to reset a different account's password, please check the email address and try again.</p>`,
  });

  return info;
};

// Sent instead of a code when the account exists but registered via Google
// (no password to reset) - the API response stays generic either way.
export const sendPasswordResetGoogleAccountEmail = async (toEmail) => {

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Password reset requested for this email',
    text: `Someone requested a password reset for this account, but it was created with Google Sign-In and has no password. Please log in with Google instead. If this wasn't you, you can safely ignore this email.`,
    html: `<p>Someone requested a password reset for this account, but it was created with Google Sign-In and has no password.</p><p>Please log in with Google instead. If this wasn't you, you can safely ignore this email.</p>`,
  });

  return info;
};

export default transporter;

import { OAuth2Client } from 'google-auth-library';
import GoogleAuthSchema from '../validation/GoogleAuthSchema.js';

const clientIds = {
  android: process.env.GOOGLE_CLIENT_ID_ANDROID,
  ios: process.env.GOOGLE_CLIENT_ID_IOS,
  // web: process.env.GOOGLE_CLIENT_ID_WEB,
};

const verifyGoogleToken = async (req, res, next) => {

  // Validate request body
  const { error, value } = GoogleAuthSchema.validate({ idToken: req.body.idToken, platform: req.body.platform });
  
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const { idToken, platform } = value;

  // Check if platform is supported
  const clientId = clientIds[platform];
  if (!clientId) {
    return res.status(400).json({
      success: false,
      message: 'Unsupported platform',
    });
  }

  try {

    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    req.googleUser = {
      google_id: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      first_name: payload.given_name,
      last_name: payload.family_name,
      profile_picture: payload.picture,
    };

    next();
  } catch (error) {
    console.error('Google token verification failed:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid Google token',
    });
  }
};

export default verifyGoogleToken;

import jwt from 'jsonwebtoken';

// Like verifyJWT, but never rejects the request - decodes the token and sets
// req.user when a valid Bearer token is present, otherwise just proceeds as
// a guest (req.user left undefined). For routes that return public data but
// should also tailor it to the viewer when they happen to be logged in (e.g.
// a creator's reels including the viewer's own like/save state).
const optionalVerifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (!err) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
      };
    }

    next();
  });
};

export default optionalVerifyJWT;

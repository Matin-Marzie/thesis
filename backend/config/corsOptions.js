import allowedOrigins from './allowedOrigins.js';

// A function delegate (rather than a static options object) so we get the
// request and can allow same-origin calls dynamically - needed because
// pages the backend itself serves (e.g. public/feedback.html, at whatever
// host:port it's reached on - localhost in dev, a LAN IP from a phone,
// prod domain later) submit same-origin POSTs, and browsers still attach
// an Origin header to those. Hardcoding every possible host:port into
// allowedOrigins would be a losing game; comparing Origin against the
// request's own Host covers all of them at once.
const corsOptionsDelegate = (req, callback) => {
  const origin = req.headers.origin;
  const isSameOrigin = origin && req.headers.host && origin.endsWith(`://${req.headers.host}`);

  if (!origin || isSameOrigin || allowedOrigins.indexOf(origin) !== -1) {
    callback(null, { origin: true, credentials: true, optionsSuccessStatus: 200 });
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

export default corsOptionsDelegate;

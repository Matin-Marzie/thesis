import { logEvents } from './logEvents.js';

const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    'errLog.log'
  );

  console.error(err.stack);

  // Set status 400 for body-parser JSON parse errors
  let status = err.status || res.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON format';
  }
  res.status(status);

  res.json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;

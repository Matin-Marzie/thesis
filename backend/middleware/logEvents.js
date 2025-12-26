import { format } from 'date-fns';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
  const logItem = `${dateTime}\t${message}\n`;

  try {
    const logsDir = path.join(__dirname, '..', 'logs');
    
    // Create logs directory if it doesn't exist
    try {
      await fs.access(logsDir);
    } catch {
      await fs.mkdir(logsDir);
    }

    // Append to log file
    await fs.appendFile(path.join(logsDir, logFileName), logItem);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
};

export const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
  console.log(`${req.method} ${req.path}`);
  next();
};

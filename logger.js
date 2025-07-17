const fs = require('fs');
const path = require('path');
const { createLogger, transports, format } = require('winston');

// Ensure logs directory exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    // Log to stdout for container visibility
    new transports.Console(),
    // Log to file for Promtail to scrape
    new transports.File({ filename: path.join(logDir, 'app.log') })
  ]
});

module.exports = logger;

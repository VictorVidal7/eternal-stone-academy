
const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
  const log = `${new Date().toISOString()} - ${req.method} - ${req.url} - ${req.ip}
`;
  fs.appendFile(path.join(__dirname, 'access.log'), log, (err) => {
    if (err) {
      console.error('Unable to write to access.log');
    }
  });
  next();
};

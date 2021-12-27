const config = require('./jest.config');

module.exports = {
  ...config,
  testRegex: `.*\\.es\\.test\\.ts$`,
};

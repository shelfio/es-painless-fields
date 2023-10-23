// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./jest.config');

module.exports = {
  preset: '@shelf/jest-elasticsearch',
  ...config,
  testRegex: `.*\\.es\\.test\\.ts$`,
};

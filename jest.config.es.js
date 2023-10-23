// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./jest.config');

module.exports = {
  ...config,
  preset: '@shelf/jest-elasticsearch',
  testRegex: `.*\\.es\\.test\\.ts$`,
};

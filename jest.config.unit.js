// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('./jest-base-config');

module.exports = {
  testRegex: `.*(?<!integration|es).test.ts$`,
  ...baseConfig,
};

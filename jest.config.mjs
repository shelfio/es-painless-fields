import baseConfig from './jest-base-config.js';

export default {
  ...baseConfig,
  testRegex: `.*(?<!integration|es).test.ts$`,
};

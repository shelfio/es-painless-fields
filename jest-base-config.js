const ES_PACKAGES_TO_TRANSFORM = ['@elastic/elasticsearch'];

/** @type {import('jest').Config} */
const config = {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/types.ts'],
  reporters: ['default'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
          },
        },
      },
    ],
  },
  resolver: 'ts-jest-resolver',
  transformIgnorePatterns: [
    `node_modules/(?!(${ES_PACKAGES_TO_TRANSFORM.join('|')}))/node_modules/.+\\.js`,
  ],
};

export default config;

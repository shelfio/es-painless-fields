// Add new ES dependencies here
const ES_PACKAGES_TO_TRANSFORM = ['flat'];

module.exports = {
  preset: '@shelf/jest-elasticsearch',
  transform: {
    '\\.[jt]sx?$': [
      'babel-jest',
      {
        configFile: '@shelf/babel-config/backend',
      },
    ],
  },
  transformIgnorePatterns: [
    `node_modules/(?!(${ES_PACKAGES_TO_TRANSFORM.join('|')}))/node_modules/.+\\.js`,
    'signal-exit', // Fix jest error "onExit is not a function" after adding lodash in ignore patterns
  ],
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const babel = require('@shelf/babel-config/backend');

module.exports = wallaby => {
  return {
    testFramework: 'jest',
    files: [
      'package.json',
      'src/**/*.ts',
      'src/**/*.js',
      'src/**/*.json',
      'src/package.json',
      '!src/**/*.test.ts',
      '!src/**/*.es.ts',
      '!src/**/*.integration.ts',
    ],
    tests: ['src/**/*.test.ts', '!src/**/*.es.test.ts', '!src/**/*.integration.test.ts'],
    env: {
      type: 'node',
      runner: 'node',
      params: {
        env: 'TZ=UTC',
      },
    },
    compilers: {
      'src/**/*.js': wallaby.compilers.babel(),
      '**/*.ts?(x)': wallaby.compilers.typeScript(),
    },
    preprocessors: {
      '**/*.js': file =>
        require('@babel/core').transform(file.content, {
          sourceMap: true,
          compact: false,
          filename: file.path,
          ...babel,
        }),
    },
    setup(w) {
      w.testFramework.configure({});
    },
  };
};

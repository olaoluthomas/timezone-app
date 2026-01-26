module.exports = {
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/public/**',
    '!src/index.js',
    '!src/app.js'
  ],
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  verbose: true
};

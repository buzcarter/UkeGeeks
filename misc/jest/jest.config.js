const path = require('path');

module.exports = {
  globals: {
  },
  collectCoverageFrom: [
    '<rootDir>/src/js/scriptasaurus/*.js',
    '!**/__test__/**',
  ],
  coveragePathIgnorePatterns: [
  ],
  coverageReporters: [
    'text-summary',
    'lcov',
  ],
  coverageThreshold: {
    global: {
      statements: 5,
      branches: 5,
      functions: 5,
      lines: 5,
    },
  },
  setupFilesAfterEnv: [
    '<rootDir>/misc/jest/jest.setup.js',
    '<rootDir>/misc/jest/jest.fdRequireJest.js',
  ],
  rootDir: path.resolve(__dirname, '../../'),
  testEnvironment: 'jest-environment-jsdom-global',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.git/',
    '<rootDir>/misc/',
  ],
  verbose: true,
};

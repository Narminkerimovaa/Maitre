module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.js'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }
};
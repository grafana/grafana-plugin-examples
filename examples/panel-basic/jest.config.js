const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test,jest}.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test,jest}.{js,jsx,ts,tsx}',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    },
  },
};

/* eslint-disable no-undef */
module.exports = {
  name: 'plugins-docker',
  preset: '../../../jest.config.js',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../../coverage/packages/plugins/docker',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/packages/plugins/docker',
      },
    ],
  ],
};

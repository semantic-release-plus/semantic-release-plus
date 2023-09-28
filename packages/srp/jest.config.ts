/* eslint-disable */
export default {
  displayName: 'srp',
  preset: '../../jest.preset.js',
  // override default test matcher to allow jest test with .spec.ts files and ava with .test.js files
  testMatch: ['**/+(*.)+(spec).+(ts|js)?(x)'],
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageReporters: ['clover', 'json', 'lcov', 'text'],
  coverageDirectory: '../../coverage/packages/srp',
};

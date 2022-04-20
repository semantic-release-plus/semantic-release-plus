module.exports = {
  displayName: 'srp',
  preset: '../../jest.preset.js',
  // override default test matcher to allow jest test with .spec.ts files and ava with .test.js files
  testMatch: ['**/+(*.)+(spec).+(ts|js)?(x)'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/srp',
};

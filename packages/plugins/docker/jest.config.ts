import type { Config } from 'jest';

const config: Config = {
  displayName: 'plugins-docker',

  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../../coverage/packages/plugins/docker',
  preset: '../../../jest.preset.js',
};

export default config;

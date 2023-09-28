const nxPreset = require('@nx/jest/preset').default;

/** @type {import('jest').Config} */
const config = {
  ...nxPreset,
  coverageReporters: ['json', 'lcovonly', 'text', 'text-summary'],
};

module.exports = config;

const nxPreset = require('@nrwl/jest/preset').default;

module.exports = {
  ...nxPreset,
  coverageReporters: [
    ...nxPreset.coverageReporters,
    'lcov',
    'text',
    'text-summary',
  ],
};

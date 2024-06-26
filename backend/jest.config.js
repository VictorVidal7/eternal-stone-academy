module.exports = {
  moduleNameMapper: {
    '\\.json$': '<rootDir>/test/__mocks__/jsonMock.js',
    '^ci-info$': '<rootDir>/test/__mocks__/ci-info.js',
  },
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 120000,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  maxWorkers: '50%',
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(ci-info)/)',
  ],
  verbose: true,
  bail: 1,
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  maxConcurrency: 1,
  globalSetup: './jest.global-setup.js',
  globalTeardown: './jest.global-teardown.js',
};
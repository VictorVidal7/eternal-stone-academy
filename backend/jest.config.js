module.exports = {
  moduleNameMapper: {
    '\\.json$': '<rootDir>/test/__mocks__/jsonMock.js',
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 30000, // Reducido a 30 segundos
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  maxWorkers: '50%', // Ejecuta pruebas en paralelo
};
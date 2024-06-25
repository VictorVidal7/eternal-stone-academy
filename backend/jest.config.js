module.exports = {
  moduleNameMapper: {
    '\\.json$': '<rootDir>/test/__mocks__/jsonMock.js',
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 90000 // Aumenta el tiempo de espera global para todas las pruebas
};

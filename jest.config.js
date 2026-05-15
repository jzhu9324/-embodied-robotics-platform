/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Mock next-auth and its providers to avoid ESM parsing issues
    '^next-auth$': '<rootDir>/__mocks__/next-auth.js',
    '^next-auth/providers/credentials$': '<rootDir>/__mocks__/next-auth-credentials.js',
    '^bcryptjs$': '<rootDir>/__mocks__/bcryptjs.js',
    '^./db$': '<rootDir>/__mocks__/db.js',
    '^@/lib/db$': '<rootDir>/__mocks__/db.js',
  },
}

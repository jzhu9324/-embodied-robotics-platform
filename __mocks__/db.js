// Mock for lib/db
module.exports = {
  db: {
    user: {
      findUnique: jest.fn(),
    },
    techNode: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}

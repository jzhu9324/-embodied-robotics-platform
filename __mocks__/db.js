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
    partner: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    communication: {
      create: jest.fn(),
    },
  },
}

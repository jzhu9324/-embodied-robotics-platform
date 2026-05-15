// Mock for lib/db
module.exports = {
  db: {
    user: {
      findUnique: jest.fn(),
    },
  },
}

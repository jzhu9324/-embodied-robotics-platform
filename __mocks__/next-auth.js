// Mock for next-auth
function NextAuth(config) {
  return {
    handlers: { GET: jest.fn(), POST: jest.fn() },
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  }
}
NextAuth.default = NextAuth
module.exports = NextAuth
module.exports.default = NextAuth

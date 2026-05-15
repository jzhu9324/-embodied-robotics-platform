// Mock for next-auth/providers/credentials
function Credentials(options) {
  return { id: 'credentials', type: 'credentials', ...options }
}
module.exports = Credentials
module.exports.default = Credentials

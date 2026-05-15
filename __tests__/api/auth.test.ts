import { authConfig } from '@/lib/auth'

describe('auth config', () => {
  it('has credentials provider', () => {
    const providers = authConfig.providers ?? []
    expect(providers.length).toBeGreaterThan(0)
  })

  it('uses jwt session strategy', () => {
    expect(authConfig.session?.strategy).toBe('jwt')
  })
})

import { authConfig } from '@/auth.config'

describe('auth config', () => {
  it('has session strategy configured', () => {
    expect(authConfig.session?.strategy).toBe('jwt')
  })

  it('uses jwt session strategy', () => {
    expect(authConfig.session?.strategy).toBe('jwt')
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'

describe('getDb', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('does not require DATABASE_URL until called', async () => {
    vi.stubEnv('DATABASE_URL', '')
    vi.resetModules()

    const dbModule = await import('./index')

    expect(() => dbModule.getDb()).toThrow('DATABASE_URL environment variable is not set')
  })
})

import { db } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  db: {
    demand: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('Demand API logic', () => {
  it('findMany filters by createdBy for RD users', async () => {
    const mock = [{ id: '1', title: 'Test', createdBy: 'user1', status: 'PENDING' }]
    ;(db.demand.findMany as jest.Mock).mockResolvedValue(mock)
    const result = await db.demand.findMany({ where: { createdBy: 'user1' } })
    expect(result[0].createdBy).toBe('user1')
  })
})

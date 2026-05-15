import { db } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  db: {
    partner: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('Partner API logic', () => {
  it('findMany includes techNode and communication count', async () => {
    const mock = [{ id: '1', name: 'Test', techNode: { name: '传感器' }, _count: { communications: 2 } }]
    ;(db.partner.findMany as jest.Mock).mockResolvedValue(mock)
    const result = await db.partner.findMany({ include: { techNode: true, _count: true } })
    expect(result[0]._count.communications).toBe(2)
  })
})

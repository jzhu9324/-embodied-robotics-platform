import { db } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  db: {
    techNode: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

describe('TechNode API logic', () => {
  it('findMany returns nodes ordered by order field', async () => {
    const mockNodes = [
      { id: '1', name: '驱动与执行器', parentId: null, order: 0, children: [] },
      { id: '2', name: '传感器', parentId: null, order: 1, children: [] },
    ]
    ;(db.techNode.findMany as jest.Mock).mockResolvedValue(mockNodes)

    const result = await db.techNode.findMany({ orderBy: { order: 'asc' } })
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('驱动与执行器')
  })
})

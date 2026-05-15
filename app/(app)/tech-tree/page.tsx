import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { TechTreeClient } from './TechTreeClient'

export default async function TechTreePage() {
  const session = await auth()
  const role = (session?.user as any)?.role as 'BD' | 'RD'

  const nodes = await db.techNode.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    include: {
      children: {
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { partners: true } },
          partners: true,
        }
      },
      _count: { select: { partners: true, demands: true } },
      partners: {
        include: { techNode: true }
      },
    },
  })

  return <TechTreeClient nodes={nodes} role={role} />
}

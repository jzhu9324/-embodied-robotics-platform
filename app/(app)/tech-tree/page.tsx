import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { TechTreeClient } from './TechTreeClient'

export default async function TechTreePage() {
  const session = await auth()
  const role = (session?.user as any)?.role as 'BD' | 'RD'

  const nodes = await db.techNode.findMany({
    orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
    include: {
      _count: { select: { partners: true, demands: true } },
      partners: {
        include: { techNode: { select: { name: true } } },
      },
    },
  })

  return <TechTreeClient nodes={nodes} role={role} />
}

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { MyDemandsClient } from './MyDemandsClient'

export default async function MyDemandsPage() {
  const session = await auth()
  const userId = (session?.user as any)?.id

  const demands = await db.demand.findMany({
    where: { createdBy: userId },
    include: {
      techNode: { select: { name: true } },
      updates: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <MyDemandsClient
      demands={demands.map(d => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        updates: d.updates.map(u => ({ content: u.content })),
      }))}
    />
  )
}

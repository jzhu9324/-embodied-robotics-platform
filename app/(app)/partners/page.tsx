import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { PartnersClient } from './PartnersClient'

export default async function PartnersPage() {
  const session = await auth()
  const role = (session?.user as any)?.role as 'BD' | 'RD'

  const [partners, techNodes] = await Promise.all([
    db.partner.findMany({
      include: { techNode: { select: { name: true } }, _count: { select: { communications: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.techNode.findMany({ orderBy: { order: 'asc' } }),
  ])

  return (
    <PartnersClient
      partners={partners}
      techNodes={techNodes}
      role={role}
    />
  )
}

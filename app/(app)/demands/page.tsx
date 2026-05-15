import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DemandsClient } from './DemandsClient'

export default async function DemandsPage() {
  const session = await auth()
  if ((session?.user as any)?.role !== 'BD') redirect('/my-demands')

  const demands = await db.demand.findMany({
    include: {
      techNode: { select: { name: true } },
      user: { select: { name: true } },
      updates: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-gray-200 px-7 h-[52px] flex items-center z-10">
        <span className="text-[15px] font-semibold">需求管理</span>
      </div>
      <div className="p-7">
        <DemandsClient demands={demands.map(d => ({
          ...d,
          createdAt: d.createdAt.toISOString(),
          updates: d.updates.map(u => ({ content: u.content })),
        }))} />
      </div>
    </div>
  )
}

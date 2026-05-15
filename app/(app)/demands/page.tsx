import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

const statusLabel: Record<string, string> = {
  PENDING: '待处理', IN_PROGRESS: '跟进中', RESOLVED: '已解决', NO_RESOURCE: '暂无资源',
}
const statusClass: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-500',
  IN_PROGRESS: 'bg-orange-100 text-orange-600',
  RESOLVED: 'bg-green-100 text-green-600',
  NO_RESOURCE: 'bg-red-100 text-red-500',
}
const urgencyLabel: Record<string, string> = { LOW: '低', MEDIUM: '中', HIGH: '高' }

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
        <div className="bg-white rounded-xl border border-gray-200">
          {demands.map((d) => (
            <div key={d.id} className="p-5 border-b border-gray-50 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold">{d.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${statusClass[d.status]}`}>
                  {statusLabel[d.status]}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-gray-400 mt-1">
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{d.techNode.name}</span>
                <span>{d.user.name}</span>
                <span>紧急程度：{urgencyLabel[d.urgency]}</span>
                <span>{new Date(d.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
              {d.updates[0] && (
                <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
                  最新进展：{d.updates[0].content}
                </div>
              )}
            </div>
          ))}
          {demands.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">暂无需求</div>
          )}
        </div>
      </div>
    </div>
  )
}

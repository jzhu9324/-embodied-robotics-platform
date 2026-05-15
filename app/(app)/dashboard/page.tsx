import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  const role = (session?.user as any)?.role
  const userId = (session?.user as any)?.id

  const [nodeCount, partnerCount, pendingDemands, communications] = await Promise.all([
    db.techNode.count(),
    db.partner.count(),
    db.demand.count({ where: { status: 'PENDING' } }),
    db.communication.count(),
  ])

  const recentDemands = await db.demand.findMany({
    where: role === 'BD' ? undefined : { createdBy: userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { techNode: { select: { name: true } }, user: { select: { name: true } } },
  })

  const recentComms = await db.communication.findMany({
    take: 5,
    orderBy: { date: 'desc' },
    include: { partner: { select: { name: true } }, user: { select: { name: true } } },
  })

  const statusClass: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-500',
    IN_PROGRESS: 'bg-orange-100 text-orange-600',
    RESOLVED: 'bg-green-100 text-green-600',
    NO_RESOURCE: 'bg-red-100 text-red-500',
  }
  const statusLabel: Record<string, string> = {
    PENDING: '待处理', IN_PROGRESS: '跟进中', RESOLVED: '已解决', NO_RESOURCE: '暂无资源',
  }

  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-gray-200 px-7 h-[52px] flex items-center z-10">
        <span className="text-[15px] font-semibold">总览</span>
      </div>
      <div className="p-7">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">你好，{session?.user?.name ?? '用户'} 👋</h2>
          <p className="text-sm text-gray-400 mt-1">这是你的技术交流资源总览</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: '技术节点', value: nodeCount, color: 'text-blue-500' },
            { label: '合作方总数', value: partnerCount, color: 'text-green-500' },
            { label: '待处理需求', value: pendingDemands, color: 'text-orange-500' },
            { label: '沟通记录', value: communications, color: 'text-gray-700' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-xs text-gray-400 mb-1">{s.label}</div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold">最新需求</span>
              <Link href={role === 'BD' ? '/demands' : '/my-demands'} className="text-xs text-blue-500">查看全部</Link>
            </div>
            {recentDemands.map((d) => (
              <div key={d.id} className="px-5 py-4 border-b border-gray-50 last:border-0">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-medium">{d.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass[d.status]}`}>
                    {statusLabel[d.status]}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {d.techNode.name} · {d.user.name}
                </div>
              </div>
            ))}
            {recentDemands.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">暂无需求</div>
            )}
          </div>

          {role === 'BD' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <span className="text-sm font-semibold">近期沟通记录</span>
              </div>
              <div className="px-5 py-2">
                {recentComms.map((c) => (
                  <div key={c.id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400 mb-1">
                        {new Date(c.date).toLocaleDateString('zh-CN')}
                      </div>
                      <div className="text-sm">
                        <strong>{c.partner.name}</strong> — {c.summary}
                      </div>
                      {c.nextStep && (
                        <div className="text-xs text-blue-500 mt-0.5">→ {c.nextStep}</div>
                      )}
                    </div>
                  </div>
                ))}
                {recentComms.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">暂无沟通记录</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

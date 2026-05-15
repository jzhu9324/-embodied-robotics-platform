import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const statusLabel: Record<string, string> = {
  PENDING: '待处理', IN_PROGRESS: '跟进中', RESOLVED: '已解决', NO_RESOURCE: '暂无资源',
}
const statusClass: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-500',
  IN_PROGRESS: 'bg-orange-100 text-orange-600',
  RESOLVED: 'bg-green-100 text-green-600',
  NO_RESOURCE: 'bg-red-100 text-red-500',
}
const steps = ['待处理', '跟进中', '已解决']

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
    <div>
      <div className="sticky top-0 bg-white border-b border-gray-200 px-7 h-[52px] flex items-center justify-between z-10">
        <span className="text-[15px] font-semibold">我的需求</span>
        <Link href="/portal">
          <Button size="sm">+ 提出新需求</Button>
        </Link>
      </div>
      <div className="p-7">
        <div className="bg-white rounded-xl border border-gray-200">
          {demands.map((d) => {
            const stepIndex = d.status === 'PENDING' ? 0 : d.status === 'IN_PROGRESS' ? 1 : 2
            return (
              <div key={d.id} className="p-5 border-b border-gray-50 last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold">{d.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusClass[d.status]}`}>
                    {statusLabel[d.status]}
                  </span>
                </div>
                {/* Progress steps */}
                <div className="flex items-center mb-3">
                  {steps.map((step, i) => (
                    <div key={step} className="flex items-center">
                      <div className="text-center">
                        <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1
                          ${i < stepIndex ? 'bg-green-400' : i === stepIndex ? 'bg-blue-500' : 'bg-gray-200'}`}
                        />
                        <div className={`text-[10px] ${i === stepIndex ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                          {step}
                        </div>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`h-0.5 w-12 mx-1 mb-3 ${i < stepIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
                {d.updates[0] && (
                  <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
                    <strong>BD 最新进展：</strong>{d.updates[0].content}
                  </div>
                )}
                <div className="flex gap-2 mt-2 text-xs text-gray-400">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{d.techNode.name}</span>
                  <span>{new Date(d.createdAt).toLocaleDateString('zh-CN')} 提交</span>
                </div>
              </div>
            )
          })}
          {demands.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">还没有提交过需求</div>
          )}
        </div>
      </div>
    </div>
  )
}

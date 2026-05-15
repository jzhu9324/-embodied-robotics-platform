import { db } from '@/lib/db'
import { PortalForm } from './PortalForm'

export default async function PortalPage() {
  const nodes = await db.techNode.findMany({
    orderBy: { order: 'asc' },
    include: { children: { orderBy: { order: 'asc' } } },
  })
  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-gray-200 px-7 h-[52px] flex items-center z-10">
        <span className="text-[15px] font-semibold">提出需求</span>
      </div>
      <div className="p-7 max-w-2xl">
        <p className="text-sm text-gray-500 mb-6">
          描述当前或未来可能需要外部支持的技术方向，BD 团队会跟进并寻找资源
        </p>
        <PortalForm nodes={nodes} />
      </div>
    </div>
  )
}

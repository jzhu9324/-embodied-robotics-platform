import Link from 'next/link'
import { Button } from '@/components/ui/button'

const statusLabel: Record<string, string> = {
  POTENTIAL: '潜在', CONTACTED: '已接触', COOPERATING: '合作中', PAUSED: '暂停',
}
const statusClass: Record<string, string> = {
  POTENTIAL: 'bg-gray-100 text-gray-600',
  CONTACTED: 'bg-orange-100 text-orange-600',
  COOPERATING: 'bg-green-100 text-green-600',
  PAUSED: 'bg-red-100 text-red-600',
}

export function NodeDetail({ node, role }: { node: any; role: 'BD' | 'RD' }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">科技树节点</p>
            <h2 className="text-xl font-bold">{node.name}</h2>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                {node._count?.partners ?? 0} 家合作方
              </span>
            </div>
          </div>
          {role === 'RD' && (
            <Link href="/portal">
              <Button size="sm">+ 提出需求</Button>
            </Link>
          )}
          {role === 'BD' && (
            <Button size="sm">+ 添加合作方</Button>
          )}
        </div>
        {node.description && (
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">{node.description}</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold">合作方列表</span>
        </div>
        {!node.partners || node.partners.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">暂无合作方，BD 可以添加</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">名称</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">类型</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">联系人</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">状态</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {node.partners.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-gray-500">{p.type === 'UNIVERSITY' ? '高校' : p.type === 'COMPANY' ? '企业' : '科研机构'}</td>
                  <td className="px-5 py-3 text-gray-500">{p.contactName ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusClass[p.status]}`}>
                      {statusLabel[p.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/partners/${p.id}`}>
                      <Button variant="outline" size="sm">详情 →</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

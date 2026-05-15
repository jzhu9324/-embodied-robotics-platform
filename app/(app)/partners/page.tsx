import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const statusLabel: Record<string, string> = {
  POTENTIAL: '潜在', CONTACTED: '已接触', COOPERATING: '合作中', PAUSED: '暂停',
}
const statusClass: Record<string, string> = {
  POTENTIAL: 'bg-gray-100 text-gray-500',
  CONTACTED: 'bg-orange-100 text-orange-600',
  COOPERATING: 'bg-green-100 text-green-600',
  PAUSED: 'bg-red-100 text-red-500',
}

export default async function PartnersPage() {
  const session = await auth()
  const role = (session?.user as any)?.role

  const partners = await db.partner.findMany({
    include: { techNode: { select: { name: true } }, _count: { select: { communications: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-gray-200 px-7 h-[52px] flex items-center justify-between z-10">
        <span className="text-[15px] font-semibold">合作方库</span>
        {role === 'BD' && <Button size="sm">+ 添加合作方</Button>}
      </div>
      <div className="p-7">
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['名称', '类型', '技术方向', '联系人', '沟通次数', '状态', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {p.type === 'UNIVERSITY' ? '高校' : p.type === 'COMPANY' ? '企业' : '科研机构'}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {p.techNode.name}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{p.contactName ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{p._count.communications}</td>
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
          {partners.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">暂无合作方</div>
          )}
        </div>
      </div>
    </div>
  )
}

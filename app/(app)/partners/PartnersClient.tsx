'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type TechNode = { id: string; name: string; parentId: string | null }
type Partner = {
  id: string
  name: string
  type: string
  status: string
  contactName: string | null
  techNode: { name: string }
  _count: { communications: number }
}

const statusLabel: Record<string, string> = {
  POTENTIAL: '潜在', CONTACTED: '已接触', COOPERATING: '合作中', PAUSED: '暂停',
}
const statusClass: Record<string, string> = {
  POTENTIAL: 'bg-gray-100 text-gray-500',
  CONTACTED: 'bg-orange-100 text-orange-600',
  COOPERATING: 'bg-green-100 text-green-600',
  PAUSED: 'bg-red-100 text-red-500',
}

function AddPartnerModal({
  techNodes,
  onClose,
  onSuccess,
}: {
  techNodes: TechNode[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'COMPANY' | 'UNIVERSITY' | 'RESEARCH'>('COMPANY')
  const [techNodeId, setTechNodeId] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !techNodeId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          contactName: contactName.trim() || null,
          contactInfo: contactInfo.trim() || null,
          techNodeId,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '创建失败')
        return
      }
      onSuccess()
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-[440px] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-4">添加合作方</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">名称 <span className="text-red-500">*</span></label>
            <input
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="如：某科技有限公司"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">类型</label>
            <div className="flex gap-2">
              {([['COMPANY', '企业'], ['UNIVERSITY', '高校'], ['RESEARCH', '科研机构']] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setType(val)}
                  className={`flex-1 py-1.5 rounded-lg border text-sm transition-colors
                    ${type === val ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">技术方向 <span className="text-red-500">*</span></label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={techNodeId}
              onChange={(e) => setTechNodeId(e.target.value)}
            >
              <option value="">请选择技术节点</option>
              {techNodes.map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">联系人</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="可选"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">联系方式</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="手机 / 邮箱（可选）"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !techNodeId}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function PartnersClient({
  partners: initialPartners,
  techNodes,
  role,
}: {
  partners: Partner[]
  techNodes: TechNode[]
  role: 'BD' | 'RD'
}) {
  const router = useRouter()
  const [partners, setPartners] = useState(initialPartners)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')

  const filtered = partners.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || p.status === filterStatus
    const matchType = !filterType || p.type === filterType
    return matchSearch && matchStatus && matchType
  })

  async function handleDelete(id: string) {
    if (!confirm('确定删除该合作方？相关沟通记录也会一并删除。')) return
    await fetch(`/api/partners/${id}`, { method: 'DELETE' })
    setPartners(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-gray-200 px-7 h-[52px] flex items-center justify-between z-10">
        <span className="text-[15px] font-semibold">合作方库</span>
        <div className="flex gap-2">
          {role === 'BD' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('/api/export', '_blank')}
            >
              导出 Excel
            </Button>
          )}
          {role === 'BD' && (
            <Button size="sm" onClick={() => setShowModal(true)}>+ 添加合作方</Button>
          )}
        </div>
      </div>
      <div className="p-7">
        {/* 搜索和筛选栏 */}
        <div className="flex gap-3 mb-4">
          <input
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="搜索合作方名称…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">所有状态</option>
            <option value="POTENTIAL">潜在</option>
            <option value="CONTACTED">已接触</option>
            <option value="COOPERATING">合作中</option>
            <option value="PAUSED">暂停</option>
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">所有类型</option>
            <option value="COMPANY">企业</option>
            <option value="UNIVERSITY">高校</option>
            <option value="RESEARCH">科研机构</option>
          </select>
          {(search || filterStatus || filterType) && (
            <button
              className="text-sm text-gray-400 hover:text-gray-600"
              onClick={() => { setSearch(''); setFilterStatus(''); setFilterType('') }}
            >
              清除筛选
            </button>
          )}
        </div>
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
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 group">
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
                    <div className="flex items-center gap-2">
                      <Link href={`/partners/${p.id}`}>
                        <Button variant="outline" size="sm">详情 →</Button>
                      </Link>
                      {role === 'BD' && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-xs text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="删除合作方"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              {partners.length === 0 ? '暂无合作方' : '没有符合条件的合作方'}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AddPartnerModal
          techNodes={techNodes}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); router.refresh() }}
        />
      )}
    </div>
  )
}

'use client'
import { useState } from 'react'

type Partner = { id: string; name: string; type: string }

type Demand = {
  id: string
  title: string
  description: string
  status: string
  urgency: string
  createdAt: string
  techNode: { name: string }
  user: { name: string | null }
  updates: { content: string }[]
  assignedPartner: { id: string; name: string } | null
}

const statusOptions = [
  { value: 'PENDING', label: '待处理', cls: 'bg-gray-100 text-gray-500' },
  { value: 'IN_PROGRESS', label: '跟进中', cls: 'bg-orange-100 text-orange-600' },
  { value: 'RESOLVED', label: '已解决', cls: 'bg-green-100 text-green-600' },
  { value: 'NO_RESOURCE', label: '暂无资源', cls: 'bg-red-100 text-red-500' },
]
const urgencyLabel: Record<string, string> = { LOW: '低', MEDIUM: '中', HIGH: '高' }
const typeLabel: Record<string, string> = { COMPANY: '企业', UNIVERSITY: '高校', RESEARCH: '科研机构' }

function DemandRow({ demand, partners }: { demand: Demand; partners: Partner[] }) {
  const [status, setStatus] = useState(demand.status)
  const [assignedPartner, setAssignedPartner] = useState(demand.assignedPartner)
  const [showUpdate, setShowUpdate] = useState(false)
  const [showPartnerPicker, setShowPartnerPicker] = useState(false)
  const [updateContent, setUpdateContent] = useState('')
  const [latestUpdate, setLatestUpdate] = useState(demand.updates[0]?.content ?? '')
  const [saving, setSaving] = useState(false)

  const current = statusOptions.find(s => s.value === status)!

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus)
    await fetch(`/api/demands/${demand.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  async function handleAssignPartner(partner: Partner | null) {
    await fetch(`/api/demands/${demand.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedPartnerId: partner?.id ?? null }),
    })
    setAssignedPartner(partner ? { id: partner.id, name: partner.name } : null)
    setShowPartnerPicker(false)
  }

  async function handleAddUpdate() {
    if (!updateContent.trim()) return
    setSaving(true)
    const res = await fetch(`/api/demands/${demand.id}/updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: updateContent.trim() }),
    })
    if (res.ok) {
      setLatestUpdate(updateContent.trim())
      setUpdateContent('')
      setShowUpdate(false)
    }
    setSaving(false)
  }

  return (
    <div className="p-5 border-b border-gray-50 last:border-0">
      <div className="flex items-start justify-between mb-2 gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{demand.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{demand.description}</p>
        </div>
        {/* Status selector */}
        <div className="relative shrink-0">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer appearance-none pr-5 font-medium ${current.cls}`}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none">▾</span>
        </div>
      </div>

      <div className="flex gap-3 text-xs text-gray-400 mb-3">
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{demand.techNode.name}</span>
        <span>{demand.user.name}</span>
        <span>紧急：{urgencyLabel[demand.urgency]}</span>
        <span>{new Date(demand.createdAt).toLocaleDateString('zh-CN')}</span>
      </div>

      {/* Assigned partner */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-400">跟进合作方：</span>
        {assignedPartner ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {assignedPartner.name}
            </span>
            <button
              onClick={() => setShowPartnerPicker(true)}
              className="text-xs text-gray-400 hover:text-blue-500"
            >
              更换
            </button>
            <button
              onClick={() => handleAssignPartner(null)}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              移除
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPartnerPicker(true)}
            className="text-xs text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full transition-colors"
          >
            + 指定合作方
          </button>
        )}
      </div>

      {latestUpdate && (
        <div className="mb-2 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
          最新进展：{latestUpdate}
        </div>
      )}

      {!showUpdate ? (
        <button
          onClick={() => setShowUpdate(true)}
          className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
        >
          + 添加进展
        </button>
      ) : (
        <div className="flex gap-2 mt-1">
          <input
            autoFocus
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs"
            placeholder="描述最新跟进情况…"
            value={updateContent}
            onChange={(e) => setUpdateContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddUpdate() }}
          />
          <button
            onClick={handleAddUpdate}
            disabled={saving || !updateContent.trim()}
            className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            保存
          </button>
          <button
            onClick={() => { setShowUpdate(false); setUpdateContent('') }}
            className="px-3 py-1.5 text-gray-400 text-xs hover:text-gray-600"
          >
            取消
          </button>
        </div>
      )}

      {/* Partner picker modal */}
      {showPartnerPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowPartnerPicker(false)}>
          <div className="bg-white rounded-xl p-6 w-[420px] max-h-[480px] shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-4">选择跟进合作方</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {partners.map(p => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors
                    ${assignedPartner?.id === p.id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                  onClick={() => handleAssignPartner(p)}
                >
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-gray-400">{typeLabel[p.type]}</span>
                </div>
              ))}
              {partners.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">暂无合作方，请先在科技树中添加</p>
              )}
            </div>
            <button
              onClick={() => setShowPartnerPicker(false)}
              className="mt-4 w-full py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function DemandsClient({ demands, partners }: { demands: Demand[]; partners: Partner[] }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterUrgency, setFilterUrgency] = useState('')

  const filtered = demands.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || d.status === filterStatus
    const matchUrgency = !filterUrgency || d.urgency === filterUrgency
    return matchSearch && matchStatus && matchUrgency
  })

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="搜索需求标题…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">所有状态</option>
          <option value="PENDING">待处理</option>
          <option value="IN_PROGRESS">跟进中</option>
          <option value="RESOLVED">已解决</option>
          <option value="NO_RESOURCE">暂无资源</option>
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filterUrgency}
          onChange={(e) => setFilterUrgency(e.target.value)}
        >
          <option value="">所有紧急度</option>
          <option value="HIGH">高</option>
          <option value="MEDIUM">中</option>
          <option value="LOW">低</option>
        </select>
        {(search || filterStatus || filterUrgency) && (
          <button
            className="text-sm text-gray-400 hover:text-gray-600"
            onClick={() => { setSearch(''); setFilterStatus(''); setFilterUrgency('') }}
          >
            清除筛选
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        {filtered.map(d => <DemandRow key={d.id} demand={d} partners={partners} />)}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            {demands.length === 0 ? '暂无需求' : '没有符合条件的需求'}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'

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
}

const statusOptions = [
  { value: 'PENDING', label: '待处理', cls: 'bg-gray-100 text-gray-500' },
  { value: 'IN_PROGRESS', label: '跟进中', cls: 'bg-orange-100 text-orange-600' },
  { value: 'RESOLVED', label: '已解决', cls: 'bg-green-100 text-green-600' },
  { value: 'NO_RESOURCE', label: '暂无资源', cls: 'bg-red-100 text-red-500' },
]
const urgencyLabel: Record<string, string> = { LOW: '低', MEDIUM: '中', HIGH: '高' }

function DemandRow({ demand }: { demand: Demand }) {
  const [status, setStatus] = useState(demand.status)
  const [showUpdate, setShowUpdate] = useState(false)
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

      <div className="flex gap-3 text-xs text-gray-400 mb-2">
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{demand.techNode.name}</span>
        <span>{demand.user.name}</span>
        <span>紧急：{urgencyLabel[demand.urgency]}</span>
        <span>{new Date(demand.createdAt).toLocaleDateString('zh-CN')}</span>
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
    </div>
  )
}

export function DemandsClient({ demands }: { demands: Demand[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {demands.map(d => <DemandRow key={d.id} demand={d} />)}
      {demands.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">暂无需求</div>
      )}
    </div>
  )
}

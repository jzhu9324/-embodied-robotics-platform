'use client'
import { useState } from 'react'

type LinkedDemand = { id: string; title: string; status: string }
type AllDemand = { id: string; title: string; status: string; techNode: { name: string } }

const statusLabel: Record<string, string> = {
  PENDING: '待处理', IN_PROGRESS: '跟进中', RESOLVED: '已解决', NO_RESOURCE: '暂无资源',
}
const statusClass: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-500',
  IN_PROGRESS: 'bg-orange-100 text-orange-600',
  RESOLVED: 'bg-green-100 text-green-600',
  NO_RESOURCE: 'bg-red-100 text-red-500',
}

export function LinkDemandSection({
  partnerId,
  initialDemands,
  isAdmin,
}: {
  partnerId: string
  initialDemands: LinkedDemand[]
  isAdmin: boolean
}) {
  const [linked, setLinked] = useState(initialDemands)
  const [showModal, setShowModal] = useState(false)
  const [allDemands, setAllDemands] = useState<AllDemand[]>([])
  const [loading, setLoading] = useState(false)

  async function openModal() {
    setLoading(true)
    setShowModal(true)
    const res = await fetch('/api/demands')
    if (res.ok) setAllDemands(await res.json())
    setLoading(false)
  }

  async function handleLink(demand: AllDemand) {
    await fetch(`/api/demands/${demand.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedPartnerId: partnerId }),
    })
    setLinked(prev => [...prev, { id: demand.id, title: demand.title, status: demand.status }])
    setShowModal(false)
  }

  const linkedIds = new Set(linked.map(d => d.id))

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">关联研发需求</h3>
        {isAdmin && (
          <button
            onClick={openModal}
            className="text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
          >
            + 关联需求
          </button>
        )}
      </div>

      {linked.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">暂无关联需求</div>
      ) : (
        <div className="space-y-2">
          {linked.map(d => (
            <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">{d.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass[d.status]}`}>
                {statusLabel[d.status]}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-[480px] max-h-[520px] shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-4">选择要关联的需求</h3>
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">加载中…</div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2">
                {allDemands.filter(d => !linkedIds.has(d.id)).map(d => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => handleLink(d)}
                  >
                    <div>
                      <div className="text-sm font-medium">{d.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{d.techNode.name}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass[d.status]}`}>
                      {statusLabel[d.status]}
                    </span>
                  </div>
                ))}
                {allDemands.filter(d => !linkedIds.has(d.id)).length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">暂无可关联的需求</div>
                )}
              </div>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </>
  )
}

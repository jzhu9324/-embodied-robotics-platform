'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TreePanel } from '@/components/tech-tree/TreePanel'
import { NodeDetail } from '@/components/tech-tree/NodeDetail'

function AddNodeModal({
  parentId,
  onClose,
  onSuccess,
}: {
  parentId: string | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tech-nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, parentId }),
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
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-4">{parentId ? '新建子节点' : '新建顶层节点'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">节点名称 <span className="text-red-500">*</span></label>
            <input
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="如：感知技术、执行器"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">描述（可选）</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              rows={3}
              placeholder="节点说明"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              disabled={loading || !name.trim()}
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

export function TechTreeClient({ nodes, role }: { nodes: any[]; role: 'BD' | 'RD' }) {
  const router = useRouter()
  const [selectedNode, setSelectedNode] = useState<any>(nodes[0] ?? null)
  const [addingParentId, setAddingParentId] = useState<string | null | undefined>(undefined)

  function handleAddNode(parentId: string | null) {
    setAddingParentId(parentId)
  }

  function handleModalClose() {
    setAddingParentId(undefined)
  }

  function handleModalSuccess() {
    setAddingParentId(undefined)
    router.refresh()
  }

  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-gray-200 px-7 h-[52px] flex items-center justify-between z-10">
        <span className="text-[15px] font-semibold">科技树</span>
        {role === 'BD' && (
          <button
            onClick={() => handleAddNode(null)}
            className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600"
          >
            + 新建节点
          </button>
        )}
      </div>
      <div className="p-7 flex gap-5">
        <TreePanel
          nodes={nodes}
          selectedId={selectedNode?.id ?? null}
          onSelect={setSelectedNode}
          isAdmin={role === 'BD'}
          onAddNode={handleAddNode}
        />
        {selectedNode ? (
          <NodeDetail node={selectedNode} role={role} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            选择左侧节点查看详情
          </div>
        )}
      </div>
      {addingParentId !== undefined && (
        <AddNodeModal
          parentId={addingParentId}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}

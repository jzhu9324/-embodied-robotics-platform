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

type FlatNode = {
  id: string
  name: string
  parentId: string | null
  order: number
  _count: { partners: number; demands?: number }
  partners?: any[]
}

type TreeNode = FlatNode & { children: TreeNode[] }

function buildTree(flat: FlatNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  flat.forEach(n => map.set(n.id, { ...n, children: [] }))
  const roots: TreeNode[] = []
  flat.forEach(n => {
    if (n.parentId && map.has(n.parentId)) {
      map.get(n.parentId)!.children.push(map.get(n.id)!)
    } else {
      roots.push(map.get(n.id)!)
    }
  })
  return roots
}

function AddPartnerModal({
  techNodeId,
  onClose,
  onSuccess,
}: {
  techNodeId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'COMPANY' | 'UNIVERSITY' | 'RESEARCH'>('COMPANY')
  const [contactName, setContactName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
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

export function TechTreeClient({ nodes: initialNodes, role }: { nodes: FlatNode[]; role: 'BD' | 'RD' }) {
  const router = useRouter()
  const [flatNodes, setFlatNodes] = useState(initialNodes)
  const treeNodes = buildTree(flatNodes)
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(treeNodes[0] ?? null)
  const [addingParentId, setAddingParentId] = useState<string | null | undefined>(undefined)
  const [addingPartnerForNodeId, setAddingPartnerForNodeId] = useState<string | null>(null)

  function handleAddNode(parentId: string | null) {
    setAddingParentId(parentId)
  }

  async function handleDeleteNode(nodeId: string) {
    if (!confirm('确定删除该节点？删除后无法恢复。')) return
    await fetch(`/api/tech-nodes/${nodeId}`, { method: 'DELETE' })
    if (selectedNode?.id === nodeId) setSelectedNode(null)
    router.refresh()
  }

  function handleModalClose() {
    setAddingParentId(undefined)
  }

  function handleModalSuccess() {
    setAddingParentId(undefined)
    router.refresh()
  }

  async function handleReorder(siblings: { id: string; order: number }[]) {
    // Optimistic update
    setFlatNodes(prev => {
      const orderMap = new Map(siblings.map(s => [s.id, s.order]))
      return prev.map(n => orderMap.has(n.id) ? { ...n, order: orderMap.get(n.id)! } : n)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    })
    await fetch('/api/tech-nodes/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: siblings }),
    })
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
          nodes={treeNodes}
          selectedId={selectedNode?.id ?? null}
          onSelect={(node) => setSelectedNode(node)}
          isAdmin={role === 'BD'}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onReorder={handleReorder}
          onRenameSuccess={() => router.refresh()}
        />
        {selectedNode ? (
          <NodeDetail
            node={selectedNode}
            role={role}
            onAddPartner={role === 'BD' ? () => setAddingPartnerForNodeId(selectedNode.id) : undefined}
          />
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
      {addingPartnerForNodeId && (
        <AddPartnerModal
          techNodeId={addingPartnerForNodeId}
          onClose={() => setAddingPartnerForNodeId(null)}
          onSuccess={() => { setAddingPartnerForNodeId(null); router.refresh() }}
        />
      )}
    </div>
  )
}

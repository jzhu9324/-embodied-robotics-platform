'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type FlatNode = { id: string; name: string; parentId: string | null }
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

function TreeNodeItem({
  node,
  selectedId,
  onSelect,
  depth,
}: {
  node: TreeNode
  selectedId: string
  onSelect: (id: string, name: string) => void
  depth: number
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0
  const isSelected = selectedId === node.id
  const isRoot = depth === 0

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
          ${isSelected ? 'bg-blue-50 ring-1 ring-blue-300' : 'hover:bg-gray-50'}
          ${isRoot ? 'font-semibold text-[13px]' : 'text-[12px] text-gray-700'}`}
        onClick={() => onSelect(node.id, node.name)}
      >
        {hasChildren ? (
          <button
            className="w-4 h-4 flex items-center justify-center text-gray-400 shrink-0"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          >
            <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-4 h-4 flex items-center justify-center shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
          </span>
        )}
        <span className="flex-1 truncate">{node.name}</span>
        {isSelected && <span className="text-blue-500 text-xs shrink-0">✓</span>}
      </div>

      {expanded && hasChildren && (
        <div className="ml-4 border-l-2 border-gray-100">
          {node.children.map(child => (
            <div key={child.id} className="relative">
              <div className="absolute left-0 top-[18px] w-2.5 h-0.5 bg-gray-200" />
              <div className="pl-3">
                <TreeNodeItem
                  node={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  depth={depth + 1}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function PortalForm({ nodes }: { nodes: FlatNode[] }) {
  const router = useRouter()
  const treeNodes = buildTree(nodes)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [techNodeId, setTechNodeId] = useState('')
  const [techNodeName, setTechNodeName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleSelectNode(id: string, name: string) {
    setTechNodeId(id)
    setTechNodeName(name)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!techNodeId) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, urgency, techNodeId }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '提交失败，请重试')
        return
      }
      router.push('/my-demands')
    } catch {
      setError('网络错误，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">需求标题 <span className="text-red-500">*</span></label>
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          placeholder="用一句话描述你的需求"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          关联技术方向 <span className="text-red-500">*</span>
          {techNodeName && (
            <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              已选：{techNodeName}
            </span>
          )}
        </label>
        <div className="border border-gray-200 rounded-lg p-3 max-h-[240px] overflow-y-auto bg-gray-50">
          {treeNodes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">暂无技术节点，请先在科技树中创建</p>
          ) : (
            treeNodes.map(node => (
              <TreeNodeItem
                key={node.id}
                node={node}
                selectedId={techNodeId}
                onSelect={handleSelectNode}
                depth={0}
              />
            ))
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">问题描述 <span className="text-red-500">*</span></label>
        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
          rows={4}
          placeholder="详细描述当前遇到的问题，包括技术背景、已尝试的方法等"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">紧急程度</label>
        <div className="flex gap-2">
          {([['LOW', '低'], ['MEDIUM', '中'], ['HIGH', '高']] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setUrgency(val)}
              className={`flex-1 py-2 rounded-lg border text-sm transition-colors
                ${urgency === val
                  ? 'border-blue-500 bg-blue-50 text-blue-600 font-semibold'
                  : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting || !title || !techNodeId || !description}>
        {submitting ? '提交中…' : '提交需求'}
      </Button>
    </form>
  )
}

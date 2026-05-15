'use client'
import { useState } from 'react'

type TechNode = {
  id: string
  name: string
  parentId: string | null
  children: TechNode[]
  _count: { partners: number; demands: number }
}

export function TreePanel({
  nodes,
  selectedId,
  onSelect,
  isAdmin,
  onAddNode,
}: {
  nodes: TechNode[]
  selectedId: string | null
  onSelect: (node: TechNode) => void
  isAdmin: boolean
  onAddNode: (parentId: string | null) => void
}) {
  return (
    <div className="w-[260px] shrink-0 bg-white rounded-xl border border-gray-200 py-2 overflow-y-auto">
      {nodes.map((node) => (
        <NodeRow
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          depth={0}
        />
      ))}
      {isAdmin && (
        <button
          onClick={() => onAddNode(null)}
          className="mx-4 mt-2 text-xs text-blue-500 hover:text-blue-700"
        >
          + 新建顶层节点
        </button>
      )}
    </div>
  )
}

function NodeRow({
  node,
  selectedId,
  onSelect,
  depth,
}: {
  node: TechNode
  selectedId: string | null
  onSelect: (n: TechNode) => void
  depth: number
}) {
  const [open, setOpen] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <>
      <div
        className={`flex items-center gap-2 py-[9px] cursor-pointer text-[13px] rounded-md mx-1 transition-colors
          ${selectedId === node.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}`}
        style={{ paddingLeft: `${16 + depth * 16}px`, paddingRight: '12px' }}
        onClick={() => onSelect(node)}
      >
        {hasChildren && (
          <span
            className="text-gray-400 text-xs mr-1"
            onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
          >
            {open ? '▾' : '▸'}
          </span>
        )}
        <span className="flex-1 font-medium">{node.name}</span>
        <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {node._count.partners}
        </span>
      </div>
      {open && hasChildren && node.children.map((child) => (
        <NodeRow key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
      ))}
    </>
  )
}

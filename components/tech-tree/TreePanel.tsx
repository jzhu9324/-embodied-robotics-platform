'use client'
import { useState, useRef } from 'react'

type TechNode = {
  id: string
  name: string
  parentId: string | null
  order: number
  children: TechNode[]
  _count: { partners: number }
  partners?: any[]
}

// ── Inline rename input ──────────────────────────────────────────────────────
function RenameInput({
  nodeId,
  initialName,
  onDone,
}: {
  nodeId: string
  initialName: string
  onDone: () => void
}) {
  const [value, setValue] = useState(initialName)
  const [saving, setSaving] = useState(false)

  async function save() {
    const trimmed = value.trim()
    if (!trimmed || trimmed === initialName) { onDone(); return }
    setSaving(true)
    await fetch(`/api/tech-nodes/${nodeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    })
    // Refresh is handled by parent via onDone → router.refresh()
    onDone()
  }

  return (
    <input
      autoFocus
      className="flex-1 text-[13px] font-semibold border border-blue-400 rounded px-1.5 py-0 h-6 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={e => {
        if (e.key === 'Enter') save()
        if (e.key === 'Escape') onDone()
      }}
      onClick={e => e.stopPropagation()}
    />
  )
}

// ── Drag state shared within one sibling list ────────────────────────────────
function DraggableList({
  nodes,
  selectedId,
  onSelect,
  isAdmin,
  onAddNode,
  onDeleteNode,
  onReorder,
  onRenameSuccess,
  depth,
}: {
  nodes: TechNode[]
  selectedId: string | null
  onSelect: (node: TechNode) => void
  isAdmin: boolean
  onAddNode: (parentId: string | null) => void
  onDeleteNode?: (nodeId: string) => void
  onReorder: (siblings: { id: string; order: number }[]) => void
  onRenameSuccess: () => void
  depth: number
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [overPos, setOverPos] = useState<'before' | 'after'>('after')

  function startDrag(e: React.DragEvent, id: string) {
    e.stopPropagation()
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function endDrag() {
    setDraggedId(null)
    setOverId(null)
  }

  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    if (id === draggedId) return
    setOverId(id)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setOverPos(e.clientY < rect.top + rect.height / 2 ? 'before' : 'after')
  }

  function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!draggedId || draggedId === targetId) { endDrag(); return }

    const ids = nodes.map(n => n.id)
    const fromIdx = ids.indexOf(draggedId)
    const toIdx = ids.indexOf(targetId)
    if (fromIdx === -1 || toIdx === -1) { endDrag(); return }

    const newIds = [...ids]
    newIds.splice(fromIdx, 1)
    const insertAt = overPos === 'before'
      ? newIds.indexOf(targetId)
      : newIds.indexOf(targetId) + 1
    newIds.splice(insertAt < 0 ? newIds.length : insertAt, 0, draggedId)

    onReorder(newIds.map((id, i) => ({ id, order: i })))
    endDrag()
  }

  const dropLine = <div className="h-0.5 bg-blue-400 rounded mx-2 my-0.5 pointer-events-none" />

  return (
    <>
      {nodes.map(node => {
        const isOver = overId === node.id
        return (
          <div key={node.id}>
            {isOver && overPos === 'before' && dropLine}
            <NodeItem
              node={node}
              selectedId={selectedId}
              onSelect={onSelect}
              isAdmin={isAdmin}
              onAddNode={onAddNode}
              onDeleteNode={onDeleteNode}
              onReorder={onReorder}
              onRenameSuccess={onRenameSuccess}
              depth={depth}
              isDragging={draggedId === node.id}
              onDragStartRow={startDrag}
              onDragEndRow={endDrag}
              onDragOverRow={onDragOver}
              onDropRow={onDrop}
            />
            {isOver && overPos === 'after' && dropLine}
          </div>
        )
      })}
    </>
  )
}

// ── Single node ──────────────────────────────────────────────────────────────
function NodeItem({
  node,
  selectedId,
  onSelect,
  isAdmin,
  onAddNode,
  onDeleteNode,
  onReorder,
  onRenameSuccess,
  depth,
  isDragging,
  onDragStartRow,
  onDragEndRow,
  onDragOverRow,
  onDropRow,
}: {
  node: TechNode
  selectedId: string | null
  onSelect: (node: TechNode) => void
  isAdmin: boolean
  onAddNode: (parentId: string | null) => void
  onDeleteNode?: (nodeId: string) => void
  onReorder: (siblings: { id: string; order: number }[]) => void
  onRenameSuccess: () => void
  depth: number
  isDragging: boolean
  onDragStartRow: (e: React.DragEvent, id: string) => void
  onDragEndRow: () => void
  onDragOverRow: (e: React.DragEvent, id: string) => void
  onDropRow: (e: React.DragEvent, id: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [renaming, setRenaming] = useState(false)
  const hasChildren = node.children.length > 0
  const isRoot = depth === 0
  const isSelected = selectedId === node.id

  if (isRoot) {
    return (
      <div className={`mb-2 ${isDragging ? 'opacity-40' : ''}`}>
        {/* Draggable row — NOT wrapping children */}
        <div
          className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors select-none
            ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}
          draggable={isAdmin}
          onDragStart={e => onDragStartRow(e, node.id)}
          onDragEnd={onDragEndRow}
          onDragOver={e => onDragOverRow(e, node.id)}
          onDrop={e => onDropRow(e, node.id)}
          onClick={() => !renaming && onSelect(node)}
        >
          {isAdmin && (
            <span
              className="text-gray-300 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
              title="拖拽排序"
              onMouseDown={e => e.stopPropagation()}
            >⠿</span>
          )}
          <button
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0 rounded"
            onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {renaming ? (
            <RenameInput nodeId={node.id} initialName={node.name} onDone={() => { setRenaming(false); onRenameSuccess() }} />
          ) : (
            <span className={`flex-1 text-[13px] font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
              {node.name}
            </span>
          )}

          <span className={`text-[11px] px-1.5 py-0.5 rounded-full shrink-0
            ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 border border-gray-200'}`}>
            {node._count.partners}
          </span>

          {isAdmin && !renaming && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
              <button
                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                onClick={e => { e.stopPropagation(); setRenaming(true) }}
                title="重命名"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                className="w-5 h-5 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded"
                onClick={e => { e.stopPropagation(); onAddNode(node.id) }}
                title="添加子节点"
              >+</button>
              {onDeleteNode && (
                <button
                  className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded text-xs"
                  onClick={e => { e.stopPropagation(); onDeleteNode(node.id) }}
                  title="删除节点"
                >✕</button>
              )}
            </div>
          )}
        </div>

        {expanded && hasChildren && (
          <div className="mt-1 ml-[18px] relative border-l-2 border-gray-200">
            <DraggableList
              nodes={node.children}
              selectedId={selectedId}
              onSelect={onSelect}
              isAdmin={isAdmin}
              onAddNode={onAddNode}
              onDeleteNode={onDeleteNode}
              onReorder={onReorder}
              onRenameSuccess={onRenameSuccess}
              depth={depth + 1}
            />
          </div>
        )}
      </div>
    )
  }

  // Non-root
  return (
    <div className={`relative ${isDragging ? 'opacity-40' : ''}`}>
      <div className="absolute left-0 top-[15px] w-2.5 h-0.5 bg-gray-200 pointer-events-none" />
      <div className="pl-3">
        <div
          className={`group flex items-center gap-1.5 py-[7px] pr-2 rounded-md cursor-pointer transition-colors select-none
            ${isSelected ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
          draggable={isAdmin}
          onDragStart={e => onDragStartRow(e, node.id)}
          onDragEnd={onDragEndRow}
          onDragOver={e => onDragOverRow(e, node.id)}
          onDrop={e => onDropRow(e, node.id)}
          onClick={() => !renaming && onSelect(node)}
        >
          {isAdmin && (
            <span
              className="text-gray-300 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[11px]"
              title="拖拽排序"
              onMouseDown={e => e.stopPropagation()}
            >⠿</span>
          )}
          <button
            className="w-4 h-4 flex items-center justify-center shrink-0"
            onClick={e => { e.stopPropagation(); if (hasChildren) setExpanded(!expanded) }}
          >
            {hasChildren ? (
              <svg className={`w-3 h-3 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
            )}
          </button>

          {renaming ? (
            <RenameInput nodeId={node.id} initialName={node.name} onDone={() => { setRenaming(false); onRenameSuccess() }} />
          ) : (
            <span className={`flex-1 text-[12px] truncate ${isSelected ? 'font-medium text-blue-600' : ''}`}>
              {node.name}
            </span>
          )}

          <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0
            ${isSelected ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
            {node._count.partners}
          </span>

          {isAdmin && !renaming && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
              <button
                className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                onClick={e => { e.stopPropagation(); setRenaming(true) }}
                title="重命名"
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                className="w-4 h-4 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded text-xs"
                onClick={e => { e.stopPropagation(); onAddNode(node.id) }}
                title="添加子节点"
              >+</button>
              {onDeleteNode && (
                <button
                  className="w-4 h-4 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded text-xs"
                  onClick={e => { e.stopPropagation(); onDeleteNode(node.id) }}
                  title="删除节点"
                >✕</button>
              )}
            </div>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="ml-[18px] relative border-l-2 border-gray-200">
          <DraggableList
            nodes={node.children}
            selectedId={selectedId}
            onSelect={onSelect}
            isAdmin={isAdmin}
            onAddNode={onAddNode}
            onDeleteNode={onDeleteNode}
            onReorder={onReorder}
            onRenameSuccess={onRenameSuccess}
            depth={depth + 1}
          />
        </div>
      )}
    </div>
  )
}

// ── TreePanel (public API) ────────────────────────────────────────────────────
export function TreePanel({
  nodes,
  selectedId,
  onSelect,
  isAdmin,
  onAddNode,
  onDeleteNode,
  onReorder,
  onRenameSuccess,
}: {
  nodes: TechNode[]
  selectedId: string | null
  onSelect: (node: TechNode) => void
  isAdmin: boolean
  onAddNode: (parentId: string | null) => void
  onDeleteNode?: (nodeId: string) => void
  onReorder: (siblings: { id: string; order: number }[]) => void
  onRenameSuccess: () => void
}) {
  return (
    <div className="w-[280px] shrink-0 bg-white rounded-xl border border-gray-200 p-3 overflow-y-auto max-h-[calc(100vh-100px)]">
      {nodes.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-xs">暂无节点</div>
      ) : (
        <DraggableList
          nodes={nodes}
          selectedId={selectedId}
          onSelect={onSelect}
          isAdmin={isAdmin}
          onAddNode={onAddNode}
          onDeleteNode={onDeleteNode}
          onReorder={onReorder}
          onRenameSuccess={onRenameSuccess}
          depth={0}
        />
      )}
      {isAdmin && (
        <div className="mt-1 pt-2 border-t border-gray-100">
          <button
            onClick={() => onAddNode(null)}
            className="w-full text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <span className="text-base leading-none">+</span>
            新建顶层节点
          </button>
        </div>
      )}
    </div>
  )
}

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

// A flat list of siblings with drag-and-drop support
function DraggableList({
  nodes,
  selectedId,
  onSelect,
  isAdmin,
  onAddNode,
  onDeleteNode,
  onReorder,
  depth,
}: {
  nodes: TechNode[]
  selectedId: string | null
  onSelect: (node: TechNode) => void
  isAdmin: boolean
  onAddNode: (parentId: string | null) => void
  onDeleteNode?: (nodeId: string) => void
  onReorder: (siblings: { id: string; order: number }[]) => void
  depth: number
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [overPosition, setOverPosition] = useState<'before' | 'after'>('after')
  const dragCounter = useRef(0)

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    // Make drag image semi-transparent
    const el = e.currentTarget as HTMLElement
    e.dataTransfer.setDragImage(el, 0, 0)
  }

  function handleDragEnd() {
    setDraggedId(null)
    setOverId(null)
    dragCounter.current = 0
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id === draggedId) return
    setOverId(id)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setOverPosition(e.clientY < rect.top + rect.height / 2 ? 'before' : 'after')
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null); setOverId(null); return
    }

    const ids = nodes.map(n => n.id)
    const fromIndex = ids.indexOf(draggedId)
    let toIndex = ids.indexOf(targetId)
    if (fromIndex === -1 || toIndex === -1) return

    const newIds = [...ids]
    newIds.splice(fromIndex, 1)
    if (overPosition === 'after') toIndex = ids.indexOf(targetId)
    else toIndex = ids.indexOf(targetId) - (fromIndex < ids.indexOf(targetId) ? 1 : 0)
    const insertAt = overPosition === 'before'
      ? newIds.indexOf(targetId)
      : newIds.indexOf(targetId) + 1
    newIds.splice(insertAt, 0, draggedId)

    const reordered = newIds.map((id, i) => ({ id, order: i }))
    onReorder(reordered)

    setDraggedId(null)
    setOverId(null)
  }

  return (
    <>
      {nodes.map(node => (
        <NodeItem
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          isAdmin={isAdmin}
          onAddNode={onAddNode}
          onDeleteNode={onDeleteNode}
          onReorder={onReorder}
          depth={depth}
          isDragging={draggedId === node.id}
          isOver={overId === node.id}
          overPosition={overId === node.id ? overPosition : null}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </>
  )
}

function NodeItem({
  node,
  selectedId,
  onSelect,
  isAdmin,
  onAddNode,
  onDeleteNode,
  onReorder,
  depth,
  isDragging,
  isOver,
  overPosition,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  node: TechNode
  selectedId: string | null
  onSelect: (node: TechNode) => void
  isAdmin: boolean
  onAddNode: (parentId: string | null) => void
  onDeleteNode?: (nodeId: string) => void
  onReorder: (siblings: { id: string; order: number }[]) => void
  depth: number
  isDragging: boolean
  isOver: boolean
  overPosition: 'before' | 'after' | null
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent, id: string) => void
  onDrop: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0
  const isRoot = depth === 0
  const isSelected = selectedId === node.id

  const dropLineClass = 'h-0.5 bg-blue-400 rounded mx-1 my-0.5'

  if (isRoot) {
    return (
      <div
        className={`mb-2 transition-opacity ${isDragging ? 'opacity-40' : ''}`}
        draggable={isAdmin}
        onDragStart={e => onDragStart(e, node.id)}
        onDragEnd={onDragEnd}
        onDragOver={e => onDragOver(e, node.id)}
        onDrop={() => onDrop(node.id)}
      >
        {isOver && overPosition === 'before' && <div className={dropLineClass} />}
        <div
          className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors select-none
            ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}
          onClick={() => onSelect(node)}
        >
          {isAdmin && (
            <span className="w-4 h-4 flex items-center justify-center text-gray-300 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" title="拖拽排序">
              ⠿
            </span>
          )}
          <button
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0 rounded"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className={`flex-1 text-[13px] font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
            {node.name}
          </span>
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full shrink-0
            ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 border border-gray-200'}`}>
            {node._count.partners}
          </span>
          {isAdmin && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
              <button
                className="w-5 h-5 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded"
                onClick={(e) => { e.stopPropagation(); onAddNode(node.id) }}
                title="添加子节点"
              >+</button>
              {onDeleteNode && (
                <button
                  className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded text-xs"
                  onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id) }}
                  title="删除节点"
                >✕</button>
              )}
            </div>
          )}
        </div>
        {isOver && overPosition === 'after' && <div className={dropLineClass} />}

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
              depth={depth + 1}
            />
          </div>
        )}
      </div>
    )
  }

  // Non-root node
  return (
    <div
      draggable={isAdmin}
      onDragStart={e => onDragStart(e, node.id)}
      onDragEnd={onDragEnd}
      onDragOver={e => onDragOver(e, node.id)}
      onDrop={() => onDrop(node.id)}
      className={`transition-opacity ${isDragging ? 'opacity-40' : ''}`}
    >
      {isOver && overPosition === 'before' && (
        <div className="relative">
          <div className="absolute left-0 top-[8px] w-2.5 h-0.5 bg-gray-200" />
          <div className="pl-3"><div className={dropLineClass} /></div>
        </div>
      )}
      <div className="relative">
        <div className="absolute left-0 top-[15px] w-2.5 h-0.5 bg-gray-200" />
        <div className="pl-3">
          <div
            className={`group flex items-center gap-1.5 py-[7px] pr-2 rounded-md cursor-pointer transition-colors select-none
              ${isSelected ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
            onClick={() => onSelect(node)}
          >
            {isAdmin && (
              <span className="w-3 h-3 flex items-center justify-center text-gray-300 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px]" title="拖拽排序">
                ⠿
              </span>
            )}
            <button
              className="w-4 h-4 flex items-center justify-center shrink-0"
              onClick={(e) => { e.stopPropagation(); if (hasChildren) setExpanded(!expanded) }}
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
            <span className={`flex-1 text-[12px] truncate ${isSelected ? 'font-medium text-blue-600' : ''}`}>
              {node.name}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0
              ${isSelected ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
              {node._count.partners}
            </span>
            {isAdmin && (
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
                <button
                  className="w-4 h-4 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded text-xs"
                  onClick={(e) => { e.stopPropagation(); onAddNode(node.id) }}
                  title="添加子节点"
                >+</button>
                {onDeleteNode && (
                  <button
                    className="w-4 h-4 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded text-xs"
                    onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id) }}
                    title="删除节点"
                  >✕</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {isOver && overPosition === 'after' && (
        <div className="relative">
          <div className="absolute left-0 top-[8px] w-2.5 h-0.5 bg-gray-200" />
          <div className="pl-3"><div className={dropLineClass} /></div>
        </div>
      )}

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
            depth={depth + 1}
          />
        </div>
      )}
    </div>
  )
}

export function TreePanel({
  nodes,
  selectedId,
  onSelect,
  isAdmin,
  onAddNode,
  onDeleteNode,
  onReorder,
}: {
  nodes: TechNode[]
  selectedId: string | null
  onSelect: (node: TechNode) => void
  isAdmin: boolean
  onAddNode: (parentId: string | null) => void
  onDeleteNode?: (nodeId: string) => void
  onReorder: (siblings: { id: string; order: number }[]) => void
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

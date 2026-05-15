'use client'
import { useState } from 'react'
import { TreePanel } from '@/components/tech-tree/TreePanel'
import { NodeDetail } from '@/components/tech-tree/NodeDetail'

export function TechTreeClient({ nodes, role }: { nodes: any[]; role: 'BD' | 'RD' }) {
  const [selectedNode, setSelectedNode] = useState<any>(nodes[0] ?? null)

  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-gray-200 px-7 h-[52px] flex items-center justify-between z-10">
        <span className="text-[15px] font-semibold">科技树</span>
        {role === 'BD' && (
          <button className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600">
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
          onAddNode={() => {}}
        />
        {selectedNode ? (
          <NodeDetail node={selectedNode} role={role} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            选择左侧节点查看详情
          </div>
        )}
      </div>
    </div>
  )
}

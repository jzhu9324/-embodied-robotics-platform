'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type FlatNode = { id: string; name: string }
type TechNode = FlatNode & { children: FlatNode[] }

export function PortalForm({ nodes }: { nodes: TechNode[] }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [techNodeId, setTechNodeId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Flatten nodes for selection
  const allNodes: FlatNode[] = []
  nodes.forEach((n) => { allNodes.push(n); n.children.forEach((c) => allNodes.push(c)) })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!techNodeId) return
    setSubmitting(true)
    await fetch('/api/demands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, urgency, techNodeId }),
    })
    router.push('/my-demands')
  }

  const urgencyOptions: Array<{ value: 'LOW' | 'MEDIUM' | 'HIGH'; label: string }> = [
    { value: 'LOW', label: '低' },
    { value: 'MEDIUM', label: '中' },
    { value: 'HIGH', label: '高' },
  ]

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
        <label className="block text-sm font-medium mb-1">关联技术方向 <span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-2 mt-1">
          {allNodes.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setTechNodeId(n.id)}
              className={`px-3 py-1.5 rounded-full border text-xs transition-colors
                ${techNodeId === n.id
                  ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
            >
              {n.name}
            </button>
          ))}
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
          {urgencyOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setUrgency(opt.value)}
              className={`flex-1 py-2 rounded-lg border text-sm transition-colors
                ${urgency === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-600 font-semibold'
                  : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={submitting || !title || !techNodeId}>
        {submitting ? '提交中…' : '提交需求'}
      </Button>
    </form>
  )
}

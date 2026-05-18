'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

type Communication = {
  id: string
  date: string
  summary: string
  nextStep: string | null
  user: { name: string | null }
}

export function CommunicationTimeline({
  partnerId,
  communications,
  isAdmin,
}: {
  partnerId: string
  communications: Communication[]
  isAdmin: boolean
}) {
  const [items, setItems] = useState(communications)
  const [showForm, setShowForm] = useState(false)
  const [summary, setSummary] = useState('')
  const [nextStep, setNextStep] = useState('')

  async function handleAdd() {
    const res = await fetch(`/api/partners/${partnerId}/communications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, nextStep }),
    })
    if (res.ok) {
      const record = await res.json()
      setItems([{ ...record, user: { name: '我' } }, ...items])
      setSummary('')
      setNextStep('')
      setShowForm(false)
    }
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-4">
          {!showForm ? (
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
              + 添加沟通记录
            </Button>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none"
                rows={3}
                placeholder="沟通内容摘要"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="下一步计划（选填）"
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} disabled={!summary.trim()}>保存</Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>取消</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 group/item">
            <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-gray-400">
                  {new Date(item.date).toLocaleDateString('zh-CN')} · {item.user.name ?? '未知'}
                </div>
                {isAdmin && (
                  <button
                    onClick={async () => {
                      if (!confirm('确定删除该沟通记录？')) return
                      await fetch(`/api/communications/${item.id}`, { method: 'DELETE' })
                      setItems(prev => prev.filter(i => i.id !== item.id))
                    }}
                    className="opacity-0 group-hover/item:opacity-100 transition-opacity text-xs text-gray-300 hover:text-red-500 shrink-0"
                  >
                    删除
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-700 mt-1">{item.summary}</div>
              {item.nextStep && (
                <div className="text-xs text-blue-500 mt-1">→ {item.nextStep}</div>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">暂无沟通记录</div>
        )}
      </div>
    </div>
  )
}

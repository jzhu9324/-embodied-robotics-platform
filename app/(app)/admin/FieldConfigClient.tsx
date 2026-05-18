'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FieldType = 'TEXT' | 'NUMBER' | 'SELECT' | 'RATING'
type FieldConfig = {
  id: string
  label: string
  type: FieldType
  options: string[]
  order: number
}

const typeLabel: Record<FieldType, string> = {
  TEXT: '文本',
  NUMBER: '数字',
  SELECT: '下拉选项',
  RATING: '评分（1-5）',
}

function AddFieldModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [label, setLabel] = useState('')
  const [type, setType] = useState<FieldType>('TEXT')
  const [optionsStr, setOptionsStr] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    setLoading(true)
    setError('')
    const options = type === 'SELECT'
      ? optionsStr.split('\n').map(s => s.trim()).filter(Boolean)
      : []
    try {
      const res = await fetch('/api/field-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim(), type, options }),
      })
      if (!res.ok) { setError('创建失败'); return }
      onSuccess()
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-[420px] shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-4">添加自定义字段</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">字段名称 <span className="text-red-500">*</span></label>
            <input
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="如：技术实力评级、擅长方向"
              value={label}
              onChange={e => setLabel(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">字段类型</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(typeLabel) as [FieldType, string][]).map(([val, lbl]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setType(val)}
                  className={`py-1.5 rounded-lg border text-sm transition-colors
                    ${type === val ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          {type === 'SELECT' && (
            <div>
              <label className="text-sm text-gray-600 block mb-1">选项（每行一个）</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                rows={4}
                placeholder={'优秀\n良好\n一般'}
                value={optionsStr}
                onChange={e => setOptionsStr(e.target.value)}
              />
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
            <button
              type="submit"
              disabled={loading || !label.trim()}
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

export function FieldConfigClient({ initialConfigs }: { initialConfigs: FieldConfig[] }) {
  const router = useRouter()
  const [configs, setConfigs] = useState(initialConfigs)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('删除后，已有合作方中该字段的数据将不再显示，确定删除？')) return
    setDeleting(id)
    await fetch(`/api/field-configs/${id}`, { method: 'DELETE' })
    setConfigs(prev => prev.filter(c => c.id !== id))
    setDeleting(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold">自定义字段配置</h2>
          <p className="text-xs text-gray-400 mt-0.5">配置合作方库中的自定义字段，所有合作方共享这套字段模板</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600"
        >
          + 添加字段
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {configs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            暂无自定义字段，点击"+ 添加字段"开始配置
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['字段名称', '类型', '选项', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {configs.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{c.label}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {typeLabel[c.type]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {c.type === 'SELECT' && c.options.length > 0
                      ? c.options.join(' · ')
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <AddFieldModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); router.refresh() }}
        />
      )}
    </div>
  )
}

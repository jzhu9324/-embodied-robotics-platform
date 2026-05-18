'use client'
import { useState } from 'react'

type FieldType = 'TEXT' | 'NUMBER' | 'SELECT' | 'RATING'
type FieldConfig = {
  id: string
  label: string
  type: FieldType
  options: string[]
}

function RatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-lg transition-colors ${star <= value ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export function CustomFieldsSection({
  partnerId,
  configs,
  initialValues,
  isAdmin,
}: {
  partnerId: string
  configs: FieldConfig[]
  initialValues: Record<string, unknown>
  isAdmin: boolean
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<Record<string, unknown>>(initialValues)

  if (configs.length === 0) return null

  function handleEdit() {
    setDraft({ ...values })
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/partners/${partnerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customFields: draft }),
    })
    if (res.ok) {
      setValues(draft)
      setEditing(false)
    }
    setSaving(false)
  }

  function renderViewValue(config: FieldConfig) {
    const val = values[config.id]
    if (val == null || val === '') return <span className="text-gray-300">—</span>
    if (config.type === 'RATING') {
      const num = Number(val)
      return (
        <span className="text-yellow-400">
          {'★'.repeat(num)}
          <span className="text-gray-200">{'★'.repeat(5 - num)}</span>
        </span>
      )
    }
    return <span className="text-sm font-medium">{String(val)}</span>
  }

  function renderEditField(config: FieldConfig) {
    const val = draft[config.id]
    const set = (v: unknown) => setDraft(prev => ({ ...prev, [config.id]: v }))

    if (config.type === 'RATING') {
      return <RatingInput value={Number(val) || 0} onChange={set} />
    }
    if (config.type === 'SELECT') {
      return (
        <select
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={String(val ?? '')}
          onChange={e => set(e.target.value)}
        >
          <option value="">请选择</option>
          {config.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    }
    if (config.type === 'NUMBER') {
      return (
        <input
          type="number"
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={String(val ?? '')}
          onChange={e => set(e.target.value === '' ? '' : Number(e.target.value))}
        />
      )
    }
    return (
      <input
        type="text"
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={String(val ?? '')}
        onChange={e => set(e.target.value)}
      />
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">自定义字段</h3>
        {isAdmin && !editing && (
          <button
            onClick={handleEdit}
            className="text-xs text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
          >
            编辑
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          {configs.map(c => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-28 shrink-0">{c.label}</span>
              {renderEditField(c)}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {configs.map(c => (
            <div key={c.id} className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">{c.label}</div>
              <div>{renderViewValue(c)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

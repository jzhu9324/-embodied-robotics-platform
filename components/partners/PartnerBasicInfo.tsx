'use client'
import { useState } from 'react'

type PartnerStatus = 'POTENTIAL' | 'CONTACTED' | 'COOPERATING' | 'PAUSED'

const statusOptions: { value: PartnerStatus; label: string }[] = [
  { value: 'POTENTIAL', label: '潜在' },
  { value: 'CONTACTED', label: '已接触' },
  { value: 'COOPERATING', label: '合作中' },
  { value: 'PAUSED', label: '暂停' },
]
const statusClass: Record<string, string> = {
  POTENTIAL: 'bg-gray-100 text-gray-500',
  CONTACTED: 'bg-orange-100 text-orange-600',
  COOPERATING: 'bg-green-100 text-green-600',
  PAUSED: 'bg-red-100 text-red-500',
}

export function PartnerBasicInfo({
  partnerId,
  initialName,
  initialType,
  initialStatus,
  initialContactName,
  initialContactInfo,
  techNodeName,
  isAdmin,
}: {
  partnerId: string
  initialName: string
  initialType: string
  initialStatus: string
  initialContactName: string | null
  initialContactInfo: string | null
  techNodeName: string
  isAdmin: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(initialName)
  const [status, setStatus] = useState(initialStatus)
  const [contactName, setContactName] = useState(initialContactName ?? '')
  const [contactInfo, setContactInfo] = useState(initialContactInfo ?? '')

  const typeLabel: Record<string, string> = {
    COMPANY: '企业', UNIVERSITY: '高校', RESEARCH: '科研机构',
  }

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/partners/${partnerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim() || initialName,
        status,
        contactName: contactName.trim() || null,
        contactInfo: contactInfo.trim() || null,
      }),
    })
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
      <div className="flex items-start justify-between">
        <div>
          {editing ? (
            <input
              className="text-xl font-bold border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          ) : (
            <h2 className="text-xl font-bold">{name}</h2>
          )}
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
              {typeLabel[initialType] ?? initialType}
            </span>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
              {techNodeName}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${statusClass[status]}`}>
              {statusOptions.find(s => s.value === status)?.label ?? status}
            </span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setName(initialName)
                    setStatus(initialStatus)
                    setContactName(initialContactName ?? '')
                    setContactInfo(initialContactInfo ?? '')
                  }}
                  className="text-sm text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                编辑
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">联系人</div>
          {editing ? (
            <input
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="请输入联系人"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
            />
          ) : (
            <div className="text-sm font-medium">{contactName || '—'}</div>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">联系方式</div>
          {editing ? (
            <input
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="手机 / 邮箱"
              value={contactInfo}
              onChange={e => setContactInfo(e.target.value)}
            />
          ) : (
            <div className="text-sm font-medium">{contactInfo || '—'}</div>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">状态</div>
          {editing ? (
            <select
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <div className="text-sm font-medium">
              {statusOptions.find(s => s.value === status)?.label ?? status}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

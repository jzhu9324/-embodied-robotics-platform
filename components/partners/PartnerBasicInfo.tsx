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
const typeLabel: Record<string, string> = {
  COMPANY: '企业', UNIVERSITY: '高校', RESEARCH: '科研机构',
}

export function PartnerBasicInfo({
  partnerId,
  initialName,
  initialType,
  initialStatus,
  initialContactName,
  initialContactTitle,
  initialContactInfo,
  initialDescription,
  techNodeName,
  isAdmin,
}: {
  partnerId: string
  initialName: string
  initialType: string
  initialStatus: string
  initialContactName: string | null
  initialContactTitle: string | null
  initialContactInfo: string | null
  initialDescription: string | null
  techNodeName: string
  isAdmin: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(initialName)
  const [type, setType] = useState(initialType)
  const [status, setStatus] = useState(initialStatus)
  const [contactName, setContactName] = useState(initialContactName ?? '')
  const [contactTitle, setContactTitle] = useState(initialContactTitle ?? '')
  const [contactInfo, setContactInfo] = useState(initialContactInfo ?? '')
  const [description, setDescription] = useState(initialDescription ?? '')

  function handleCancel() {
    setEditing(false)
    setName(initialName)
    setType(initialType)
    setStatus(initialStatus)
    setContactName(initialContactName ?? '')
    setContactTitle(initialContactTitle ?? '')
    setContactInfo(initialContactInfo ?? '')
    setDescription(initialDescription ?? '')
  }

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/partners/${partnerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim() || initialName,
        type,
        status,
        contactName: contactName.trim() || null,
        contactTitle: contactTitle.trim() || null,
        contactInfo: contactInfo.trim() || null,
        description: description.trim() || null,
      }),
    })
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
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
          <div className="flex gap-2 mt-2 flex-wrap">
            {editing ? (
              <select
                className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="COMPANY">企业</option>
                <option value="UNIVERSITY">高校</option>
                <option value="RESEARCH">科研机构</option>
              </select>
            ) : (
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                {typeLabel[type] ?? type}
              </span>
            )}
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
                  onClick={handleCancel}
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

      {/* 背景介绍 */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-1.5">背景介绍</div>
        {editing ? (
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={3}
            placeholder="机构背景、技术方向、核心优势等"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        ) : (
          <div className={`text-sm ${description ? 'text-gray-700' : 'text-gray-300'}`}>
            {description || (isAdmin ? '点击"编辑"添加背景介绍' : '暂无')}
          </div>
        )}
      </div>

      {/* 联系信息 */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">联系人</div>
          {editing ? (
            <input
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="姓名"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
            />
          ) : (
            <div className="text-sm font-medium">{contactName || '—'}</div>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">职位</div>
          {editing ? (
            <input
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="职位/职称"
              value={contactTitle}
              onChange={e => setContactTitle(e.target.value)}
            />
          ) : (
            <div className="text-sm font-medium">{contactTitle || '—'}</div>
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

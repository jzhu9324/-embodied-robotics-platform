import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { FieldConfigClient } from './FieldConfigClient'

export default async function AdminPage() {
  const session = await auth()
  if ((session?.user as any)?.role !== 'BD') redirect('/dashboard')

  const configs = await db.fieldConfig.findMany({ orderBy: { order: 'asc' } })

  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-gray-200 px-7 h-[52px] flex items-center z-10">
        <span className="text-[15px] font-semibold">后台管理</span>
      </div>
      <div className="p-7 max-w-3xl">
        <FieldConfigClient initialConfigs={configs} />
      </div>
    </div>
  )
}

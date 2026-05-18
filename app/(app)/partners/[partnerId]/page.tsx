import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { CommunicationTimeline } from '@/components/partners/CommunicationTimeline'
import { LinkDemandSection } from '@/components/partners/LinkDemandSection'
import { CustomFieldsSection } from '@/components/partners/CustomFieldsSection'

const statusLabel: Record<string, string> = {
  POTENTIAL: '潜在', CONTACTED: '已接触', COOPERATING: '合作中', PAUSED: '暂停',
}

export default async function PartnerDetailPage({ params }: { params: { partnerId: string } }) {
  const session = await auth()
  const role = (session?.user as any)?.role as 'BD' | 'RD'

  const [partner, fieldConfigs] = await Promise.all([
    db.partner.findUnique({
      where: { id: params.partnerId },
      include: {
        techNode: true,
        communications: {
          orderBy: { date: 'desc' },
          include: { user: { select: { name: true } } },
        },
        demands: { select: { id: true, title: true, status: true } },
      },
    }),
    db.fieldConfig.findMany({ orderBy: { order: 'asc' } }),
  ])
  if (!partner) notFound()

  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-gray-200 px-7 h-[52px] flex items-center z-10">
        <span className="text-[15px] font-semibold">{partner.name}</span>
      </div>
      <div className="p-7">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{partner.name}</h2>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                  {partner.type === 'UNIVERSITY' ? '高校' : partner.type === 'COMPANY' ? '企业' : '科研机构'}
                </span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                  {partner.techNode.name}
                </span>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                  {statusLabel[partner.status]}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: '联系人', value: partner.contactName ?? '—' },
              { label: '联系方式', value: partner.contactInfo ?? '—' },
              { label: '状态', value: statusLabel[partner.status] },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                <div className="text-sm font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 自定义字段 */}
        {fieldConfigs.length > 0 && (
          <CustomFieldsSection
            partnerId={partner.id}
            configs={fieldConfigs}
            initialValues={(partner.customFields as Record<string, unknown>) ?? {}}
            isAdmin={role === 'BD'}
          />
        )}

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold mb-4">沟通记录</h3>
            <CommunicationTimeline
              partnerId={partner.id}
              communications={partner.communications.map(c => ({
                ...c,
                date: c.date.toISOString(),
              }))}
              isAdmin={role === 'BD'}
            />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <LinkDemandSection
              partnerId={partner.id}
              initialDemands={partner.demands}
              isAdmin={role === 'BD'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

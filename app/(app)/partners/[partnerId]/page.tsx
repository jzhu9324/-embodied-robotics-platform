import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CommunicationTimeline } from '@/components/partners/CommunicationTimeline'
import { LinkDemandSection } from '@/components/partners/LinkDemandSection'
import { CustomFieldsSection } from '@/components/partners/CustomFieldsSection'
import { PartnerBasicInfo } from '@/components/partners/PartnerBasicInfo'

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
      <div className="sticky top-0 bg-white border-b border-gray-200 px-7 h-[52px] flex items-center gap-2 z-10">
        <Link href="/partners" className="text-gray-400 hover:text-gray-600 text-sm">合作方库</Link>
        <span className="text-gray-300">/</span>
        <span className="text-[15px] font-semibold">{partner.name}</span>
      </div>
      <div className="p-7">
        {/* 基本信息（可编辑） */}
        <PartnerBasicInfo
          partnerId={partner.id}
          initialName={partner.name}
          initialType={partner.type}
          initialStatus={partner.status}
          initialContactName={partner.contactName}
          initialContactTitle={(partner as any).contactTitle ?? null}
          initialContactInfo={partner.contactInfo}
          initialDescription={(partner as any).description ?? null}
          initialSource={(partner as any).source ?? 'EXTERNAL'}
          techNodeName={partner.techNode.name}
          isAdmin={role === 'BD'}
        />

        {/* 自定义字段 */}
        {role === 'BD' && (
          <CustomFieldsSection
            partnerId={partner.id}
            configs={fieldConfigs}
            initialValues={(partner.customFields as Record<string, unknown>) ?? {}}
            isAdmin={true}
            emptyHint={fieldConfigs.length === 0}
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

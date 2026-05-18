import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const partner = await db.partner.findUnique({
    where: { id: params.id },
    include: {
      techNode: true,
      communications: { orderBy: { date: 'desc' }, include: { user: { select: { name: true } } } },
      demands: { select: { id: true, title: true, status: true } },
    },
  })
  if (!partner) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(partner)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'BD') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.type !== undefined) data.type = body.type
  if (body.contactName !== undefined) data.contactName = body.contactName
  if (body.contactInfo !== undefined) data.contactInfo = body.contactInfo
  if (body.status !== undefined) data.status = body.status
  if (body.customFields !== undefined) data.customFields = body.customFields
  const partner = await db.partner.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(partner)
}

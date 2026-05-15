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
  const partner = await db.partner.update({
    where: { id: params.id },
    data: {
      name: body.name,
      type: body.type,
      contactName: body.contactName,
      contactInfo: body.contactInfo,
      status: body.status,
      customFields: body.customFields,
    },
  })
  return NextResponse.json(partner)
}

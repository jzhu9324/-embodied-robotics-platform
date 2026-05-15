import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const techNodeId = searchParams.get('techNodeId')

  const partners = await db.partner.findMany({
    where: techNodeId ? { techNodeId } : undefined,
    include: {
      techNode: { select: { name: true } },
      _count: { select: { communications: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(partners)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'BD') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const partner = await db.partner.create({
    data: {
      name: body.name,
      type: body.type,
      contactName: body.contactName ?? null,
      contactInfo: body.contactInfo ?? null,
      status: body.status ?? 'POTENTIAL',
      techNodeId: body.techNodeId,
      customFields: body.customFields ?? {},
    },
  })
  return NextResponse.json(partner, { status: 201 })
}

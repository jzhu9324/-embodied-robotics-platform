import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const role = (session.user as any).role

  const demands = await db.demand.findMany({
    where: role === 'BD' ? undefined : { createdBy: userId },
    include: {
      techNode: { select: { name: true } },
      user: { select: { name: true } },
      assignedPartner: { select: { name: true } },
      updates: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(demands)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const demand = await db.demand.create({
    data: {
      title: body.title,
      description: body.description,
      urgency: body.urgency ?? 'MEDIUM',
      techNodeId: body.techNodeId,
      createdBy: (session.user as any).id,
    },
  })
  return NextResponse.json(demand, { status: 201 })
}

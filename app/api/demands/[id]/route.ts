import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'BD') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const demand = await db.demand.update({
    where: { id: params.id },
    data: {
      status: body.status,
      assignedPartnerId: body.assignedPartnerId ?? null,
    },
  })
  return NextResponse.json(demand)
}

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'BD') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const update = await db.demandUpdate.create({
    data: {
      demandId: params.id,
      content: body.content,
      createdBy: (session.user as any).id,
    },
  })
  if (body.status) {
    await db.demand.update({ where: { id: params.id }, data: { status: body.status } })
  }
  return NextResponse.json(update, { status: 201 })
}

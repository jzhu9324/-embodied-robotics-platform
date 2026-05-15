import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'BD') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const record = await db.communication.create({
    data: {
      partnerId: params.id,
      summary: body.summary,
      nextStep: body.nextStep ?? null,
      date: body.date ? new Date(body.date) : new Date(),
      createdBy: (session.user as any).id,
    },
  })
  return NextResponse.json(record, { status: 201 })
}

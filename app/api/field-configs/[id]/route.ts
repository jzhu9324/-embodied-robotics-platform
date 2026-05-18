import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'BD') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const config = await db.fieldConfig.update({
    where: { id: params.id },
    data: {
      label: body.label,
      type: body.type,
      options: body.options ?? [],
    },
  })
  return NextResponse.json(config)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'BD') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await db.fieldConfig.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}

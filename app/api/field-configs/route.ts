import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const configs = await db.fieldConfig.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(configs)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'BD') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const count = await db.fieldConfig.count()
  const config = await db.fieldConfig.create({
    data: {
      label: body.label,
      type: body.type,
      options: body.options ?? [],
      order: count,
    },
  })
  return NextResponse.json(config, { status: 201 })
}

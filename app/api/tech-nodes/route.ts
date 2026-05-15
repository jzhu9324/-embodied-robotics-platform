import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const nodes = await db.techNode.findMany({
    orderBy: { order: 'asc' },
    include: {
      children: { orderBy: { order: 'asc' } },
      _count: { select: { partners: true, demands: true } },
    },
    where: { parentId: null },
  })
  return NextResponse.json(nodes)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'BD') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const node = await db.techNode.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      parentId: body.parentId ?? null,
      order: body.order ?? 0,
    },
  })
  return NextResponse.json(node, { status: 201 })
}

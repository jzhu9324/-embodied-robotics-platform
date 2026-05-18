import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// Batch-update order for a list of nodes (siblings reorder)
export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'BD') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { nodes } = await req.json() as { nodes: { id: string; order: number }[] }

  await db.$transaction(
    nodes.map(n => db.techNode.update({ where: { id: n.id }, data: { order: n.order } }))
  )

  return NextResponse.json({ ok: true })
}

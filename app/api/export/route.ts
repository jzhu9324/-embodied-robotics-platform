import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'BD') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const partners = await db.partner.findMany({
    include: {
      techNode: { select: { name: true } },
      _count: { select: { communications: true, demands: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const typeLabel: Record<string, string> = {
    COMPANY: '企业', UNIVERSITY: '高校', RESEARCH: '科研机构',
  }
  const statusLabel: Record<string, string> = {
    POTENTIAL: '潜在', CONTACTED: '已接触', COOPERATING: '合作中', PAUSED: '暂停',
  }

  const rows = partners.map(p => ({
    '名称': p.name,
    '类型': typeLabel[p.type] ?? p.type,
    '技术方向': p.techNode.name,
    '联系人': p.contactName ?? '',
    '联系方式': p.contactInfo ?? '',
    '状态': statusLabel[p.status] ?? p.status,
    '沟通次数': p._count.communications,
    '关联需求数': p._count.demands,
    '添加时间': p.createdAt.toLocaleDateString('zh-CN'),
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // 列宽
  ws['!cols'] = [
    { wch: 20 }, { wch: 10 }, { wch: 16 }, { wch: 10 },
    { wch: 20 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 12 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, '合作方库')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  const date = new Date().toISOString().slice(0, 10)
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="partners-${date}.xlsx"`,
    },
  })
}

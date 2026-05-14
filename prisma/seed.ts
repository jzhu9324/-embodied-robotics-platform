import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'bd@company.com' },
    update: {},
    create: { email: 'bd@company.com', name: 'BD Admin', password, role: 'BD' },
  })
  await prisma.user.upsert({
    where: { email: 'rd@company.com' },
    update: {},
    create: { email: 'rd@company.com', name: 'RD User', password, role: 'RD' },
  })
  console.log('Seeded users: bd@company.com / admin123')
}

main().finally(() => prisma.$disconnect())

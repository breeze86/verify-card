import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function createAdmin() {
  const args = process.argv.slice(2)
  const username = args[0] || 'admin'
  const password = args[1] || 'admin123'

  try {
    const passwordHash = await hashPassword(password)

    const admin = await prisma.admin.upsert({
      where: { username },
      update: { passwordHash },
      create: { username, passwordHash }
    })

    console.log(`Admin ${username} ${args[0] ? 'updated' : 'created'} successfully`)
    console.log(`ID: ${admin.id}`)
  } catch (error) {
    console.error('Failed to create admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

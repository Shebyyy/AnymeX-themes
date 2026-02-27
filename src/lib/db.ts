import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaLogLevel: Prisma.LogLevel[] = process.env.NODE_ENV === 'production' ? [] : ['query']

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: prismaLogLevel,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

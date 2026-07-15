import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const stores = await prisma.store.count();
  const ratings = await prisma.rating.count();
  const roles = await prisma.user.groupBy({ by: ['role'], _count: true });
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ users, stores, ratings, roles }, null, 2));
}

main()
  .finally(() => prisma.$disconnect());

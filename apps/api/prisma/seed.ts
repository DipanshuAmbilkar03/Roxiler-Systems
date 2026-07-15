import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

async function main() {
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const password = await hashPassword('Admin@123');

  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator User',
      email: 'admin@store-rating.local',
      password,
      address: '1 Admin Plaza, Platform HQ, City Center, State 10001',
      role: Role.ADMIN,
    },
  });

  const ownerPassword = await hashPassword('Owner@123');
  const owners = await Promise.all(
    [
      {
        name: 'Green Market Store Owner One',
        email: 'owner1@store-rating.local',
        address: '10 Market Street, Downtown District, Metro City 20001',
      },
      {
        name: 'Blue Harbor Store Owner Two',
        email: 'owner2@store-rating.local',
        address: '22 Harbor Road, Waterfront Area, Port City 20002',
      },
      {
        name: 'Sunny Bakery Store Owner Three',
        email: 'owner3@store-rating.local',
        address: '45 Bakery Lane, Old Town Quarter, Bake City 20003',
      },
    ].map((o) =>
      prisma.user.create({
        data: {
          ...o,
          password: ownerPassword,
          role: Role.STORE_OWNER,
        },
      }),
    ),
  );

  const userPassword = await hashPassword('User@1234');
  const users = await Promise.all(
    [
      {
        name: 'Normal User Alice Johnson',
        email: 'alice@store-rating.local',
        address: '100 Residential Ave, Suburb North, City 30001',
      },
      {
        name: 'Normal User Bob Williams',
        email: 'bob@store-rating.local',
        address: '200 Residential Ave, Suburb South, City 30002',
      },
      {
        name: 'Normal User Carol Davis XX',
        email: 'carol@store-rating.local',
        address: '300 Residential Ave, Suburb East, City 30003',
      },
      {
        name: 'Normal User David Miller X',
        email: 'david@store-rating.local',
        address: '400 Residential Ave, Suburb West, City 30004',
      },
    ].map((u) =>
      prisma.user.create({
        data: {
          ...u,
          password: userPassword,
          role: Role.NORMAL_USER,
        },
      }),
    ),
  );

  const stores = await Promise.all([
    prisma.store.create({
      data: {
        name: 'Green Market Fresh Foods',
        email: 'green@stores.local',
        address: '10 Market Street, Downtown District, Metro City 20001',
        ownerId: owners[0].id,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Blue Harbor Seafood Co',
        email: 'blue@stores.local',
        address: '22 Harbor Road, Waterfront Area, Port City 20002',
        ownerId: owners[1].id,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Sunny Bakery And Cafe XX',
        email: 'sunny@stores.local',
        address: '45 Bakery Lane, Old Town Quarter, Bake City 20003',
        ownerId: owners[2].id,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Green Market Express Hub',
        email: 'green2@stores.local',
        address: '11 Market Street Annex, Downtown, Metro City 20001',
        ownerId: owners[0].id,
      },
    }),
  ]);

  const ratingData: { userId: string; storeId: string; value: number }[] = [
    { userId: users[0].id, storeId: stores[0].id, value: 5 },
    { userId: users[1].id, storeId: stores[0].id, value: 4 },
    { userId: users[2].id, storeId: stores[0].id, value: 5 },
    { userId: users[0].id, storeId: stores[1].id, value: 3 },
    { userId: users[1].id, storeId: stores[1].id, value: 4 },
    { userId: users[3].id, storeId: stores[1].id, value: 5 },
    { userId: users[0].id, storeId: stores[2].id, value: 4 },
    { userId: users[2].id, storeId: stores[2].id, value: 5 },
    { userId: users[3].id, storeId: stores[2].id, value: 3 },
    { userId: users[1].id, storeId: stores[3].id, value: 4 },
    { userId: users[2].id, storeId: stores[3].id, value: 5 },
  ];

  await prisma.rating.createMany({ data: ratingData });

  // eslint-disable-next-line no-console
  console.log('Seed complete:', {
    admin: admin.email,
    owners: owners.map((o) => o.email),
    users: users.map((u) => u.email),
    stores: stores.length,
    ratings: ratingData.length,
  });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

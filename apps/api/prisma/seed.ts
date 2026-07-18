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

  const adminPasswordPlain = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123';
  const ownerPasswordPlain = process.env.SEED_OWNER_PASSWORD ?? 'Owner@123';
  const userPasswordPlain = process.env.SEED_USER_PASSWORD ?? 'User@1234';

  const password = await hashPassword(adminPasswordPlain);

  const admin = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar Sharma Admin',
      email: 'admin@store-rating.local',
      password,
      address: '12 MG Road, Connaught Place, New Delhi, Delhi 110001',
      role: Role.ADMIN,
    },
  });

  const ownerPassword = await hashPassword(ownerPasswordPlain);
  const owners = await Promise.all(
    [
      {
        name: 'Amitabh Verma Store Owner',
        email: 'owner1@store-rating.local',
        address: '45 Linking Road, Bandra West, Mumbai, Maharashtra 400050',
      },
      {
        name: 'Priya Nair Store Owner Two',
        email: 'owner2@store-rating.local',
        address: '18 Church Street, Brigade Road Area, Bengaluru, Karnataka 560001',
      },
      {
        name: 'Suresh Iyer Store Owner Three',
        email: 'owner3@store-rating.local',
        address: '7 T Nagar Main Road, Chennai, Tamil Nadu 600017',
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

  const userPassword = await hashPassword(userPasswordPlain);
  const users = await Promise.all(
    [
      {
        name: 'Ananya Sharma Normal User',
        email: 'alice@store-rating.local',
        address: '21 Koregaon Park Lane, Pune, Maharashtra 411001',
      },
      {
        name: 'Rohan Patel Normal User XX',
        email: 'bob@store-rating.local',
        address: '56 CG Road, Navrangpura, Ahmedabad, Gujarat 380009',
      },
      {
        name: 'Meera Krishnan Normal User',
        email: 'carol@store-rating.local',
        address: '9 Banjara Hills Road, Hyderabad, Telangana 500034',
      },
      {
        name: 'Arjun Singh Normal User XX',
        email: 'david@store-rating.local',
        address: '33 Park Street, Kolkata, West Bengal 700016',
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
        name: 'Fresh Basket Kirana Mart',
        email: 'green@stores.local',
        address: '45 Linking Road, Bandra West, Mumbai, Maharashtra 400050',
        ownerId: owners[0].id,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Coastal Catch Seafood Hub',
        email: 'blue@stores.local',
        address: '18 Church Street, Brigade Road Area, Bengaluru, Karnataka 560001',
        ownerId: owners[1].id,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Aroma Bakery And Cafe XX',
        email: 'sunny@stores.local',
        address: '7 T Nagar Main Road, Chennai, Tamil Nadu 600017',
        ownerId: owners[2].id,
      },
    }),
    prisma.store.create({
      data: {
        name: 'Fresh Basket Express Hub',
        email: 'green2@stores.local',
        address: '12 Hill Road Annex, Bandra West, Mumbai, Maharashtra 400050',
        ownerId: owners[0].id,
      },
    }),
  ]);

  const ratingData: {
    userId: string;
    storeId: string;
    value: number;
    comment?: string;
  }[] = [
    {
      userId: users[0].id,
      storeId: stores[0].id,
      value: 5,
      comment: 'Clean aisles and friendly staff. Always my first stop for sabzi.',
    },
    {
      userId: users[1].id,
      storeId: stores[0].id,
      value: 4,
      comment: 'Good prices overall. Produce is consistently fresh and local.',
    },
    { userId: users[2].id, storeId: stores[0].id, value: 5 },
    {
      userId: users[0].id,
      storeId: stores[1].id,
      value: 3,
      comment: 'Fresh catch, but weekends get crowded near Brigade Road.',
    },
    {
      userId: users[1].id,
      storeId: stores[1].id,
      value: 4,
      comment: 'Fresh seafood and helpful counter team. Good pomfret.',
    },
    { userId: users[3].id, storeId: stores[1].id, value: 5 },
    {
      userId: users[0].id,
      storeId: stores[2].id,
      value: 4,
      comment: 'Great filter coffee and soft buns. Worth the visit.',
    },
    { userId: users[2].id, storeId: stores[2].id, value: 5, comment: 'Best bakery nearby!' },
    { userId: users[3].id, storeId: stores[2].id, value: 3 },
    {
      userId: users[1].id,
      storeId: stores[3].id,
      value: 4,
      comment: 'Quick stop for essentials. Convenient Bandra location.',
    },
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


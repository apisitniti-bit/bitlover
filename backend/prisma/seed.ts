import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@bitlover.app' },
    update: {},
    create: {
      email: 'demo@bitlover.app',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log('✓ Created demo user:', demoUser.email);

  // Create user settings
  await prisma.userSettings.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      theme: 'dark',
      currency: 'USD',
      notifications: true,
    },
  });

  console.log('✓ Created user settings');

  // Create demo portfolio
  const demoPortfolio = await prisma.portfolio.upsert({
    where: { id: 'demo-portfolio-id' },
    update: {},
    create: {
      id: 'demo-portfolio-id',
      userId: demoUser.id,
      name: 'Main Portfolio',
      description: 'My primary cryptocurrency portfolio',
    },
  });

  console.log('✓ Created demo portfolio');

  // Create demo assets
  const assets = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1.5,
      purchasePrice: 45000,
      purchaseDate: new Date('2024-01-15'),
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      quantity: 10,
      purchasePrice: 2800,
      purchaseDate: new Date('2024-02-20'),
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      quantity: 25,
      purchasePrice: 380,
      purchaseDate: new Date('2024-03-10'),
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      quantity: 100,
      purchasePrice: 95,
      purchaseDate: new Date('2024-04-05'),
    },
    {
      symbol: 'XRP',
      name: 'Ripple',
      quantity: 5000,
      purchasePrice: 0.52,
      purchaseDate: new Date('2024-05-12'),
    },
  ];

  for (const asset of assets) {
    await prisma.asset.create({
      data: {
        portfolioId: demoPortfolio.id,
        ...asset,
      },
    });
  }

  console.log(`✓ Created ${assets.length} demo assets`);

  // Create demo transactions
  const transactions = [
    {
      portfolioId: demoPortfolio.id,
      type: 'BUY',
      symbol: 'BTC',
      quantity: 1.5,
      price: 45000,
      fee: 50,
      timestamp: new Date('2024-01-15'),
      notes: 'Initial Bitcoin purchase',
    },
    {
      portfolioId: demoPortfolio.id,
      type: 'BUY',
      symbol: 'ETH',
      quantity: 10,
      price: 2800,
      fee: 30,
      timestamp: new Date('2024-02-20'),
      notes: 'Ethereum investment',
    },
    {
      portfolioId: demoPortfolio.id,
      type: 'BUY',
      symbol: 'BNB',
      quantity: 25,
      price: 380,
      fee: 15,
      timestamp: new Date('2024-03-10'),
    },
    {
      portfolioId: demoPortfolio.id,
      type: 'BUY',
      symbol: 'SOL',
      quantity: 100,
      price: 95,
      fee: 20,
      timestamp: new Date('2024-04-05'),
    },
    {
      portfolioId: demoPortfolio.id,
      type: 'BUY',
      symbol: 'XRP',
      quantity: 5000,
      price: 0.52,
      fee: 10,
      timestamp: new Date('2024-05-12'),
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    });
  }

  console.log(`✓ Created ${transactions.length} demo transactions`);

  // Create demo watchlist
  const watchlist = [
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'MATIC', name: 'Polygon' },
  ];

  for (const item of watchlist) {
    await prisma.watchlist.create({
      data: {
        userId: demoUser.id,
        ...item,
      },
    });
  }

  console.log(`✓ Created ${watchlist.length} watchlist items`);

  // Create demo price alerts
  await prisma.priceAlert.create({
    data: {
      userId: demoUser.id,
      symbol: 'BTC',
      targetPrice: 100000,
      condition: 'ABOVE',
      isActive: true,
    },
  });

  await prisma.priceAlert.create({
    data: {
      userId: demoUser.id,
      symbol: 'ETH',
      targetPrice: 5000,
      condition: 'ABOVE',
      isActive: true,
    },
  });

  console.log('✓ Created 2 price alerts');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\nDemo User Credentials:');
  console.log('Email: demo@bitlover.app');
  console.log('Password: demo123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

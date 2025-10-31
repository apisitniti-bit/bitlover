import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_COINS = [
  { coinId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { coinId: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { coinId: 'tether', symbol: 'USDT', name: 'Tether' },
  { coinId: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { coinId: 'solana', symbol: 'SOL', name: 'Solana' },
  { coinId: 'ripple', symbol: 'XRP', name: 'XRP' },
  { coinId: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
  { coinId: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { coinId: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { coinId: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { coinId: 'tron', symbol: 'TRX', name: 'TRON' },
  { coinId: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { coinId: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { coinId: 'polygon', symbol: 'MATIC', name: 'Polygon' },
  { coinId: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
];

async function seedCoinList() {
  console.log('🌱 Seeding CoinList table...');

  for (const coin of INITIAL_COINS) {
    await prisma.coinList.upsert({
      where: { coinId: coin.coinId },
      update: {},
      create: coin,
    });
  }

  console.log(`✅ Seeded ${INITIAL_COINS.length} coins to CoinList`);
}

async function main() {
  try {
    await seedCoinList();
    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

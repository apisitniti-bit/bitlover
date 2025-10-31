// Clear all data from specified tables
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllData() {
  try {
    console.log('\n🗑️  CLEARING ALL DATA FROM DATABASE\n');
    console.log('='.repeat(80));
    
    // Count records before deletion
    const counts = {
      transactions: await prisma.transaction.count(),
      assets: await prisma.asset.count(),
      priceAlerts: await prisma.priceAlert.count(),
      watchlists: await prisma.watchlist.count(),
      portfolios: await prisma.portfolio.count(),
      userSettings: await prisma.userSettings.count(),
      users: await prisma.user.count(),
    };
    
    console.log('\n📊 Current records in database:');
    console.log(`   Transactions: ${counts.transactions}`);
    console.log(`   Assets: ${counts.assets}`);
    console.log(`   Price Alerts: ${counts.priceAlerts}`);
    console.log(`   Watchlists: ${counts.watchlists}`);
    console.log(`   Portfolios: ${counts.portfolios}`);
    console.log(`   User Settings: ${counts.userSettings}`);
    console.log(`   Users: ${counts.users}`);
    
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      console.log('\n✅ Database is already empty. No data to delete.\n');
      return;
    }
    
    console.log('\n🔄 Deleting records (respecting foreign key constraints)...\n');
    
    // Delete in correct order (children first, then parents)
    const results = {
      transactions: await prisma.transaction.deleteMany({}),
      assets: await prisma.asset.deleteMany({}),
      priceAlerts: await prisma.priceAlert.deleteMany({}),
      watchlists: await prisma.watchlist.deleteMany({}),
      portfolios: await prisma.portfolio.deleteMany({}),
      userSettings: await prisma.userSettings.deleteMany({}),
      users: await prisma.user.deleteMany({}),
    };
    
    console.log('✅ Deletion Results:');
    console.log(`   Transactions: ${results.transactions.count} deleted`);
    console.log(`   Assets: ${results.assets.count} deleted`);
    console.log(`   Price Alerts: ${results.priceAlerts.count} deleted`);
    console.log(`   Watchlists: ${results.watchlists.count} deleted`);
    console.log(`   Portfolios: ${results.portfolios.count} deleted`);
    console.log(`   User Settings: ${results.userSettings.count} deleted`);
    console.log(`   Users: ${results.users.count} deleted`);
    
    const totalDeleted = Object.values(results).reduce((sum, result) => sum + result.count, 0);
    console.log(`\n🎉 Total records deleted: ${totalDeleted}`);
    console.log('\n📋 Database is now clean.\n');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

clearAllData();

// Clear all transactions from database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTransactions() {
  try {
    console.log('\n🗑️  CLEARING ALL TRANSACTIONS\n');
    console.log('='.repeat(80));
    
    // Count transactions before deletion
    const countBefore = await prisma.transaction.count();
    console.log(`\n📊 Current transactions in database: ${countBefore}`);
    
    if (countBefore === 0) {
      console.log('\n✅ Database is already empty. No transactions to delete.\n');
      return;
    }
    
    // Delete all transactions
    const result = await prisma.transaction.deleteMany({});
    
    console.log(`\n✅ Successfully deleted ${result.count} transaction(s)!`);
    console.log('\n📋 Database is now clean.\n');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error clearing transactions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTransactions();

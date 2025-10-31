// Query transactions from database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listTransactions() {
  try {
    console.log('\n📋 TRANSACTION LIST\n');
    console.log('='.repeat(120));
    
    const transactions = await prisma.transaction.findMany({
      orderBy: { timestamp: 'desc' },
      include: {
        portfolio: {
          select: {
            name: true,
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (transactions.length === 0) {
      console.log('\n❌ No transactions found in database.\n');
    } else {
      console.log(`\n✅ Found ${transactions.length} transaction(s):\n`);
      
      transactions.forEach((tx, index) => {
        console.log(`${index + 1}. Transaction ID: ${tx.id}`);
        console.log(`   Type: ${tx.type}`);
        console.log(`   Symbol: ${tx.symbol}`);
        console.log(`   Quantity: ${tx.quantity}`);
        console.log(`   Price: $${tx.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        console.log(`   Total: $${(tx.quantity * tx.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        console.log(`   Fee: $${tx.fee}`);
        console.log(`   Timestamp: ${new Date(tx.timestamp).toLocaleString()}`);
        console.log(`   Portfolio: ${tx.portfolio.name}`);
        console.log(`   User: ${tx.portfolio.user.name} (${tx.portfolio.user.email})`);
        if (tx.notes) console.log(`   Notes: ${tx.notes}`);
        console.log('   ' + '-'.repeat(116));
      });
      
      // Summary
      const buyTransactions = transactions.filter(t => t.type === 'BUY');
      const sellTransactions = transactions.filter(t => t.type === 'SELL');
      const totalBuyValue = buyTransactions.reduce((sum, t) => sum + (t.quantity * t.price), 0);
      const totalSellValue = sellTransactions.reduce((sum, t) => sum + (t.quantity * t.price), 0);
      
      console.log('\n📊 SUMMARY:');
      console.log(`   Total Transactions: ${transactions.length}`);
      console.log(`   BUY Transactions: ${buyTransactions.length} (Total: $${totalBuyValue.toLocaleString('en-US', { minimumFractionDigits: 2 })})`);
      console.log(`   SELL Transactions: ${sellTransactions.length} (Total: $${totalSellValue.toLocaleString('en-US', { minimumFractionDigits: 2 })})`);
      console.log('');
    }
    
    console.log('='.repeat(120));
    
  } catch (error) {
    console.error('❌ Error querying transactions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listTransactions();

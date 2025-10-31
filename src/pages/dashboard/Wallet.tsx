import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, ArrowDownToLine, ArrowUpFromLine, Repeat, TrendingUp, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { Sparkline } from "@/components/Sparkline";
import { usePrices } from "@/contexts/PriceContext";

export default function Wallet() {
  const { prices, isLoading } = usePrices();
  
  // Convert prices Map to array and add demo quantities
  const walletCoins = Array.from(prices.values())
    .filter(coin => coin.coinId)
    .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
    .map(coin => ({
      ...coin,
      quantity: 1 // Demo: 1 unit of each coin
    }));

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">My Wallet</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowDownToLine className="h-4 w-4" />
            Deposit
          </Button>
          <Button size="sm" className="gap-2">
            <ArrowUpFromLine className="h-4 w-4" />
            Withdraw
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <Card className="glass hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-4 font-semibold">Asset</th>
                <th className="p-4 font-semibold text-right">Price</th>
                <th className="p-4 font-semibold text-right">Quantity</th>
                <th className="p-4 font-semibold text-right">Total Value</th>
                <th className="p-4 font-semibold text-right">24h Change</th>
                <th className="p-4 font-semibold text-center">Trend</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {walletCoins.map((coin, index) => {
                const totalValue = coin.currentPrice * coin.quantity;
                return (
                  <motion.tr
                    key={coin.coinId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {coin.image ? (
                          <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs">
                            {coin.symbol.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{coin.symbol}</p>
                          <p className="text-sm text-muted-foreground">{coin.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      ${coin.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right">
                      {coin.quantity.toLocaleString()} {coin.symbol}
                    </td>
                    <td className="p-4 text-right font-bold text-gradient">
                      ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right">
                      <div className={`inline-flex items-center gap-1 font-semibold ${(coin.priceChangePerc24h || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {(coin.priceChangePerc24h || 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {Math.abs(coin.priceChangePerc24h || 0).toFixed(2)}%
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-12 w-24 mx-auto">
                        <Sparkline change={coin.priceChangePerc24h || 0} />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="sm" variant="outline" className="text-xs">
                          Buy
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Trade
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Earn
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {walletCoins.map((coin, index) => {
          const totalValue = coin.currentPrice * coin.quantity;
          return (
            <motion.div
              key={coin.coinId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {coin.image ? (
                      <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                        {coin.symbol.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold">{coin.symbol}</p>
                      <p className="text-sm text-muted-foreground">{coin.name}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${(coin.priceChangePerc24h || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {(coin.priceChangePerc24h || 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {Math.abs(coin.priceChangePerc24h || 0).toFixed(2)}%
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold">${coin.currentPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-semibold">{coin.quantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Value</span>
                    <span className="font-bold text-gradient">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                
                <div className="h-12 mb-3">
                  <Sparkline change={coin.priceChangePerc24h || 0} />
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">Buy</Button>
                  <Button size="sm" variant="ghost" className="flex-1">Trade</Button>
                  <Button size="sm" variant="ghost" className="flex-1">Earn</Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

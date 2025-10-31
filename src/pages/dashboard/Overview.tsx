import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Sparkline } from "@/components/Sparkline";
import { usePrices } from "@/contexts/PriceContext";

export default function Overview() {
  const { prices, isLoading } = usePrices();
  
  // Convert prices Map to array and get top 5 by market cap
  const topCoins = Array.from(prices.values())
    .filter(coin => coin.coinId) // Only coinId entries, not symbol duplicates
    .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
    .slice(0, 5);
  
  // Calculate portfolio value from top coins
  const totalValue = topCoins.reduce((sum, coin) => sum + coin.currentPrice * 1, 0); // Assuming 1 unit each for demo
  const averageChange = topCoins.length > 0
    ? topCoins.reduce((sum, coin) => sum + (coin.priceChangePerc24h || 0), 0) / topCoins.length
    : 0;
  const btcPrice = prices.get('bitcoin')?.currentPrice || 1;
  const btcEquivalent = totalValue / btcPrice;

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="glass p-8 glow">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Portfolio Value</p>
              <p className="text-4xl font-bold text-gradient mb-1">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                ≈ {btcEquivalent.toFixed(4)} BTC
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">24h Change</p>
              <div className="flex items-center gap-2">
                {averageChange >= 0 ? (
                  <ArrowUpRight className="h-8 w-8 text-success" />
                ) : (
                  <ArrowDownRight className="h-8 w-8 text-destructive" />
                )}
                <p className={`text-3xl font-bold ${averageChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {averageChange >= 0 ? '+' : ''}{averageChange.toFixed(2)}%
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Assets</p>
              <p className="text-3xl font-bold">{topCoins.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Cryptocurrencies</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Top Coins */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Top Holdings</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topCoins.map((coin, index) => {
            const holdingQty = 1; // Demo: assume 1 unit of each coin
            const coinValue = coin.currentPrice * holdingQty;
            return (
              <motion.div
                key={coin.coinId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass p-6 hover:glow transition-all duration-300 hover:scale-105">
                  <div className="flex items-start justify-between mb-4">
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
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-semibold">${coin.currentPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Holdings</span>
                      <span className="font-semibold">{holdingQty.toLocaleString()} {coin.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Value</span>
                      <span className="font-bold text-gradient">${coinValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 h-16">
                    <Sparkline change={coin.priceChangePerc24h || 0} />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Sparkline } from "@/components/Sparkline";
import { usePrices } from "@/contexts/PriceContext";
import axios from "axios";
import { toast } from "sonner";

interface TopHolding {
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  purchasePrice: number;
  value: number;
  priceChange24h: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export default function Overview() {
  const { prices, isLoading: pricesLoading } = usePrices();
  const [topHoldings, setTopHoldings] = useState<TopHolding[]>([]);
  const [loadingHoldings, setLoadingHoldings] = useState(false);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    averageChange: 0,
    assetCount: 0,
  });
  
  // Fetch top holdings from backend
  useEffect(() => {
    const fetchTopHoldings = async () => {
      try {
        setLoadingHoldings(true);
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('token');

        if (!token) {
          console.log('No auth token, skipping holdings fetch');
          return;
        }

        // Fetch top holdings
        const response = await axios.get(`${apiUrl}/analytics/top-holdings?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const holdings = response.data || [];
        setTopHoldings(holdings);

        // Calculate portfolio stats from holdings
        const totalValue = holdings.reduce((sum: number, h: TopHolding) => sum + h.value, 0);
        const averageChange = holdings.length > 0
          ? holdings.reduce((sum: number, h: TopHolding) => sum + h.priceChange24h, 0) / holdings.length
          : 0;

        setPortfolioStats({
          totalValue,
          averageChange,
          assetCount: holdings.length,
        });

        console.log(`✅ Loaded ${holdings.length} top holdings`);
      } catch (error) {
        console.error('Failed to fetch top holdings:', error);
        if (axios.isAxiosError(error) && error.response?.status !== 401) {
          toast.error('Failed to load portfolio data');
        }
      } finally {
        setLoadingHoldings(false);
      }
    };

    fetchTopHoldings();
  }, []);

  const btcPrice = prices.get('bitcoin')?.currentPrice || 1;
  const btcEquivalent = portfolioStats.totalValue / btcPrice;

  if (pricesLoading || loadingHoldings) {
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
                ${portfolioStats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                ≈ {btcEquivalent.toFixed(4)} BTC
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">24h Change</p>
              <div className="flex items-center gap-2">
                {portfolioStats.averageChange >= 0 ? (
                  <ArrowUpRight className="h-8 w-8 text-success" />
                ) : (
                  <ArrowDownRight className="h-8 w-8 text-destructive" />
                )}
                <p className={`text-3xl font-bold ${portfolioStats.averageChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {portfolioStats.averageChange >= 0 ? '+' : ''}{portfolioStats.averageChange.toFixed(2)}%
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Assets</p>
              <p className="text-3xl font-bold">{portfolioStats.assetCount}</p>
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
        
        {topHoldings.length === 0 ? (
          <Card className="glass p-12 text-center col-span-full">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No Holdings Yet</h3>
            <p className="text-muted-foreground">
              Start trading to see your top holdings here!
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topHoldings.map((holding, index) => {
              // Get logo from price context
              const priceData = prices.get(holding.symbol.toLowerCase()) || 
                               Array.from(prices.values()).find(p => p.symbol === holding.symbol);
              
              return (
                <motion.div
                  key={holding.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass p-6 hover:glow transition-all duration-300 hover:scale-105">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {priceData?.image ? (
                          <img src={priceData.image} alt={holding.name} className="h-10 w-10 rounded-full" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                            {holding.symbol.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold">{holding.symbol}</p>
                          <p className="text-sm text-muted-foreground">{holding.name}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-semibold ${holding.priceChange24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {holding.priceChange24h >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {Math.abs(holding.priceChange24h).toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <span className="font-semibold">${holding.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Holdings</span>
                        <span className="font-semibold">{holding.quantity.toLocaleString()} {holding.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Value</span>
                        <span className="font-bold text-gradient">${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Profit/Loss</span>
                        <span className={`font-semibold ${holding.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {holding.profitLoss >= 0 ? '+' : ''}${holding.profitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-xs ml-1">({holding.profitLossPercentage >= 0 ? '+' : ''}{holding.profitLossPercentage.toFixed(2)}%)</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 h-16">
                      <Sparkline change={holding.priceChange24h} />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

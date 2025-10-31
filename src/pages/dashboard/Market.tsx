import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Activity, Repeat } from "lucide-react";
import { motion } from "framer-motion";
import { Sparkline } from "@/components/Sparkline";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";

type FilterType = "all" | "gainers" | "losers";

interface CoinData {
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  image: string;
}

export default function Market() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("all");
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [highlightedCoin, setHighlightedCoin] = useState<string | null>(null);

  // Fetch top 100 coins from backend
  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
        
        const response = await axios.get(`${apiUrl}/market/top?limit=100`);
        setMarketData(response.data);
        setLastSync(new Date());
        console.log(`✅ Loaded ${response.data.length} coins from market`);
      } catch (error) {
        console.error('Failed to fetch top coins:', error);
        toast.error('Failed to load market data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopCoins();

    // Refresh every 30 seconds
    const interval = setInterval(fetchTopCoins, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = marketData.filter(coin => {
    if (filter === "gainers") return (coin.price_change_percentage_24h || 0) > 0;
    if (filter === "losers") return (coin.price_change_percentage_24h || 0) < 0;
    return true;
  });

  // Navigate to Trade page with pre-selected coin
  const handleTradeClick = (coin: CoinData) => {
    // Convert coin name to coinId (lowercase, no spaces)
    const coinId = coin.name.toLowerCase().replace(/\s+/g, '-');
    
    // Highlight the selected coin briefly
    setHighlightedCoin(coin.symbol);
    setTimeout(() => setHighlightedCoin(null), 1000);
    
    // Navigate to trade page with coin pre-selected
    navigate(`/dashboard/trade?coin=${coinId}&symbol=${coin.symbol}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Market Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Top {marketData.length} cryptocurrencies by market cap
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {lastSync ? `Updated at ${lastSync.toLocaleTimeString()}` : 'Updating...'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={cn(
            "transition-all",
            filter === "all" && "glow"
          )}
        >
          All
        </Button>
        <Button
          variant={filter === "gainers" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("gainers")}
          className={cn(
            "gap-2 transition-all",
            filter === "gainers" && "glow"
          )}
        >
          <TrendingUp className="h-4 w-4" />
          Top Gainers
        </Button>
        <Button
          variant={filter === "losers" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("losers")}
          className={cn(
            "gap-2 transition-all",
            filter === "losers" && "glow"
          )}
        >
          <TrendingDown className="h-4 w-4" />
          Top Losers
        </Button>
      </div>

      {/* Desktop Table */}
      <Card className="glass hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-4 font-semibold">Rank</th>
                <th className="p-4 font-semibold">Coin</th>
                <th className="p-4 font-semibold text-right">Price</th>
                <th className="p-4 font-semibold text-right">24h Change</th>
                <th className="p-4 font-semibold text-right">Market Cap</th>
                <th className="p-4 font-semibold text-right">Volume</th>
                <th className="p-4 font-semibold text-center">Chart</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((coin, index) => (
                <motion.tr
                  key={`${coin.symbol}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    "border-b hover:bg-muted/50 transition-all duration-300",
                    highlightedCoin === coin.symbol && "bg-primary/10 ring-2 ring-primary"
                  )}
                >
                  <td className="p-4 text-muted-foreground font-semibold">
                    #{index + 1}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {coin.image ? (
                        <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">
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
                    ${coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right">
                    <div className={`inline-flex items-center gap-1 font-semibold ${(coin.price_change_percentage_24h || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {(coin.price_change_percentage_24h || 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    ${coin.market_cap ? (coin.market_cap / 1e9).toFixed(2) + 'B' : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    ${coin.total_volume ? (coin.total_volume / 1e9).toFixed(2) + 'B' : 'N/A'}
                  </td>
                  <td className="p-4">
                    <div className="h-12 w-32 mx-auto">
                      <Sparkline change={coin.price_change_percentage_24h || 0} />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-1 text-xs"
                        onClick={() => handleTradeClick(coin)}
                      >
                        <Repeat className="h-3 w-3" />
                        Trade
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredData.map((coin, index) => (
          <motion.div
            key={`${coin.symbol}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={cn(
              "glass p-4 transition-all duration-300",
              highlightedCoin === coin.symbol && "ring-2 ring-primary bg-primary/10"
            )}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground font-semibold">
                    #{index + 1}
                  </span>
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
                <div className={`flex items-center gap-1 text-sm font-semibold ${(coin.price_change_percentage_24h || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {(coin.price_change_percentage_24h || 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">${coin.current_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-semibold">${coin.market_cap ? (coin.market_cap / 1e9).toFixed(2) + 'B' : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Volume</span>
                  <span className="font-semibold">${coin.total_volume ? (coin.total_volume / 1e9).toFixed(2) + 'B' : 'N/A'}</span>
                </div>
              </div>
              
              <div className="h-12 mb-3">
                <Sparkline change={coin.price_change_percentage_24h || 0} />
              </div>

              <Button
                size="sm"
                variant="default"
                className="w-full gap-2"
                onClick={() => handleTradeClick(coin)}
              >
                <Repeat className="h-4 w-4" />
                Trade {coin.symbol}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

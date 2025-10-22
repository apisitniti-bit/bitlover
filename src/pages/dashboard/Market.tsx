import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cryptoData } from "@/lib/mockData";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Sparkline } from "@/components/Sparkline";
import { cn } from "@/lib/utils";

type FilterType = "all" | "gainers" | "losers";

export default function Market() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredData = cryptoData.filter(coin => {
    if (filter === "gainers") return coin.change_24h > 0;
    if (filter === "losers") return coin.change_24h < 0;
    return true;
  });

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Market Overview</h1>
        </div>
        <p className="text-sm text-muted-foreground">Updated just now</p>
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
              </tr>
            </thead>
            <tbody>
              {filteredData.map((coin, index) => (
                <motion.tr
                  key={coin.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4 text-muted-foreground font-semibold">
                    #{cryptoData.indexOf(coin) + 1}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={coin.logo}
                        alt={coin.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <div>
                        <p className="font-semibold">{coin.symbol}</p>
                        <p className="text-sm text-muted-foreground">{coin.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-semibold">
                    ${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right">
                    <div className={`inline-flex items-center gap-1 font-semibold ${coin.change_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {coin.change_24h >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {Math.abs(coin.change_24h).toFixed(2)}%
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    ${(coin.marketCap / 1e9).toFixed(2)}B
                  </td>
                  <td className="p-4 text-right">
                    ${(coin.volume / 1e9).toFixed(2)}B
                  </td>
                  <td className="p-4">
                    <div className="h-12 w-32 mx-auto">
                      <Sparkline change={coin.change_24h} />
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
            key={coin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground font-semibold">
                    #{cryptoData.indexOf(coin) + 1}
                  </span>
                  <img
                    src={coin.logo}
                    alt={coin.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-bold">{coin.symbol}</p>
                    <p className="text-sm text-muted-foreground">{coin.name}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${coin.change_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {coin.change_24h >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(coin.change_24h).toFixed(2)}%
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">${coin.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-semibold">${(coin.marketCap / 1e9).toFixed(2)}B</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Volume</span>
                  <span className="font-semibold">${(coin.volume / 1e9).toFixed(2)}B</span>
                </div>
              </div>
              
              <div className="h-12">
                <Sparkline change={coin.change_24h} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

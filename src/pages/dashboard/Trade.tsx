import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Repeat, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { usePrices } from "@/contexts/PriceContext";
import axios from "axios";

interface UserHolding {
  symbol: string;
  name: string;
  quantity: number;
  coinId: string;
}

export default function Trade() {
  const { prices, isLoading } = usePrices();
  const [searchParams] = useSearchParams();
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userHoldings, setUserHoldings] = useState<UserHolding[]>([]);
  const [loadingHoldings, setLoadingHoldings] = useState(false);
  
  // Get available coins (for Buy mode)
  const availableCoins = Array.from(prices.values())
    .filter(coin => coin.coinId)
    .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
  
  // Get coin from URL parameter or default to bitcoin
  const coinFromUrl = searchParams.get('coin');
  const defaultCoinId = coinFromUrl || availableCoins[0]?.coinId || 'bitcoin';
  
  const [selectedCoinId, setSelectedCoinId] = useState(defaultCoinId);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"buy" | "sell">("buy");

  // Update selected coin when URL parameter changes
  useEffect(() => {
    if (coinFromUrl && prices.has(coinFromUrl)) {
      setSelectedCoinId(coinFromUrl);
    }
  }, [coinFromUrl, prices]);

  const selectedCoin = prices.get(selectedCoinId);
  const estimatedTotal = selectedCoin && amount ? (parseFloat(amount) * selectedCoin.currentPrice).toFixed(2) : "0.00";

  // Get or create portfolio and fetch holdings on component mount
  useEffect(() => {
    const getOrCreatePortfolio = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No auth token found');
          return;
        }

        // Get user's portfolios
        const response = await axios.get(`${apiUrl}/portfolios`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        let userPortfolioId: string;
        
        if (response.data.length > 0) {
          // Use first portfolio
          userPortfolioId = response.data[0].id;
          setPortfolioId(userPortfolioId);
        } else {
          // Create default portfolio
          const createResponse = await axios.post(
            `${apiUrl}/portfolios`,
            { name: 'My Portfolio', description: 'Default trading portfolio' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          userPortfolioId = createResponse.data.id;
          setPortfolioId(userPortfolioId);
        }

        // Fetch user holdings for Sell mode
        await fetchUserHoldings(userPortfolioId);
      } catch (error) {
        console.error('Failed to get/create portfolio:', error);
        toast.error('Failed to initialize portfolio');
      }
    };

    getOrCreatePortfolio();
  }, []);

  // Fetch user holdings from wallet
  const fetchUserHoldings = async (portfolioIdToUse?: string) => {
    try {
      setLoadingHoldings(true);
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      const idToUse = portfolioIdToUse || portfolioId;
      if (!idToUse) {
        return;
      }

      // Fetch assets from user's portfolio
      const response = await axios.get(`${apiUrl}/assets/portfolio/${idToUse}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter assets with quantity > 0 and map to holdings format
      const holdings: UserHolding[] = response.data
        .filter((asset: any) => asset.quantity > 0)
        .map((asset: any) => {
          // Try to find matching coin in prices to get coinId
          const priceData = prices.get(asset.symbol.toLowerCase()) ||
                           Array.from(prices.values()).find(p => p.symbol === asset.symbol);
          
          return {
            symbol: asset.symbol,
            name: asset.name,
            quantity: asset.quantity,
            coinId: priceData?.coinId || asset.symbol.toLowerCase(),
          };
        });

      setUserHoldings(holdings);
      console.log(`✅ Loaded ${holdings.length} holdings for Sell mode`);
    } catch (error) {
      console.error('Failed to fetch user holdings:', error);
    } finally {
      setLoadingHoldings(false);
    }
  };

  // Refetch holdings when switching to Sell mode
  useEffect(() => {
    if (mode === 'sell' && portfolioId && userHoldings.length === 0) {
      fetchUserHoldings();
    }
  }, [mode, portfolioId]);

  // Auto-select first coin when switching modes
  useEffect(() => {
    if (mode === 'buy') {
      // In Buy mode, use URL param or first available coin
      const firstCoin = coinFromUrl || availableCoins[0]?.coinId || 'bitcoin';
      setSelectedCoinId(firstCoin);
    } else if (mode === 'sell') {
      // In Sell mode, use first holding or keep current if it exists in holdings
      if (userHoldings.length > 0) {
        const currentCoinInHoldings = userHoldings.find(h => h.coinId === selectedCoinId);
        if (!currentCoinInHoldings) {
          // Current coin not in holdings, select first holding
          setSelectedCoinId(userHoldings[0].coinId);
        }
      }
    }
  }, [mode, userHoldings]);

  if (isLoading || !selectedCoin) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading trading data...</p>
        </div>
      </div>
    );
  }

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Validate sell amount against holdings
    if (mode === "sell") {
      const currentHolding = userHoldings.find(h => h.coinId === selectedCoinId);
      if (!currentHolding) {
        toast.error("You don't own this cryptocurrency");
        return;
      }
      if (parseFloat(amount) > currentHolding.quantity) {
        toast.error(`Insufficient balance. You only have ${currentHolding.quantity} ${currentHolding.symbol}`);
        return;
      }
    }

    if (!portfolioId) {
      toast.error("Portfolio not initialized. Please refresh the page.");
      return;
    }

    setIsSaving(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please log in to trade');
        setIsSaving(false);
        return;
      }

      // Save transaction to database
      await axios.post(
        `${apiUrl}/transactions`,
        {
          portfolioId,
          type: mode.toUpperCase(),
          symbol: selectedCoin.symbol,
          quantity: parseFloat(amount),
          price: selectedCoin.currentPrice,
          fee: 0,
          notes: `${mode === 'buy' ? 'Bought' : 'Sold'} via Trade page`
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log(`✅ Transaction saved: ${mode.toUpperCase()} ${amount} ${selectedCoin.symbol} at $${selectedCoin.currentPrice}`);

      toast.success(
        `${mode === "buy" ? "Purchase" : "Sale"} Successful!`,
        {
          description: `${amount} ${selectedCoin.symbol} for $${estimatedTotal}`
        }
      );
      setAmount("");
      
      // Refetch holdings after successful trade to update available balance
      if (portfolioId) {
        fetchUserHoldings(portfolioId);
      }
    } catch (error) {
      console.error('Failed to save transaction:', error);
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.error || error.message;
        toast.error(`Transaction failed: ${errorMsg}`);
      } else {
        toast.error('Failed to save transaction. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Repeat className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Trade</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Trade Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="glass p-6 glow">
            <div className="space-y-6">
              {/* Buy/Sell Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 glass rounded-lg">
                <Button
                  variant={mode === "buy" ? "default" : "ghost"}
                  onClick={() => setMode("buy")}
                  className="transition-all"
                >
                  Buy
                </Button>
                <Button
                  variant={mode === "sell" ? "default" : "ghost"}
                  onClick={() => setMode("sell")}
                  className="transition-all"
                >
                  Sell
                </Button>
              </div>

              {/* Coin Selection */}
              <div className="space-y-2">
                <Label>
                  {mode === "buy" ? "Select Cryptocurrency to Buy" : "Select Cryptocurrency to Sell"}
                </Label>
                
                {mode === "sell" && userHoldings.length === 0 && !loadingHoldings ? (
                  <div className="glass p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      You currently have no coins to sell.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Buy some cryptocurrencies first!
                    </p>
                  </div>
                ) : (
                  <Select
                    value={selectedCoinId}
                    onValueChange={(value) => {
                      setSelectedCoinId(value);
                    }}
                    disabled={mode === "sell" && (loadingHoldings || userHoldings.length === 0)}
                  >
                    <SelectTrigger className="glass">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mode === "buy" ? (
                        // Buy mode: Show all available coins
                        availableCoins.map(coin => (
                          <SelectItem key={coin.coinId} value={coin.coinId}>
                            <div className="flex items-center gap-2">
                              {coin.image ? (
                                <img src={coin.image} alt={coin.name} className="h-5 w-5 rounded-full" />
                              ) : (
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                  {coin.symbol.slice(0, 1)}
                                </div>
                              )}
                              <span>{coin.symbol}</span>
                              <span className="text-muted-foreground">— {coin.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        // Sell mode: Show only user's holdings
                        userHoldings.map(holding => {
                          const priceData = prices.get(holding.coinId) ||
                                          Array.from(prices.values()).find(p => p.symbol === holding.symbol);
                          
                          return (
                            <SelectItem key={holding.coinId} value={holding.coinId}>
                              <div className="flex items-center gap-2">
                                {priceData?.image ? (
                                  <img src={priceData.image} alt={holding.name} className="h-5 w-5 rounded-full" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                    {holding.symbol.slice(0, 1)}
                                  </div>
                                )}
                                <span>{holding.symbol}</span>
                                <span className="text-muted-foreground">— {holding.name}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  ({holding.quantity.toLocaleString()} available)
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Amount ({selectedCoin.symbol})</Label>
                  {mode === "sell" && (() => {
                    const currentHolding = userHoldings.find(h => h.coinId === selectedCoinId);
                    return currentHolding ? (
                      <span className="text-xs text-muted-foreground">
                        Available: {currentHolding.quantity.toLocaleString()} {currentHolding.symbol}
                      </span>
                    ) : null;
                  })()}
                </div>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="glass text-lg"
                  step="0.01"
                  min="0"
                  max={mode === "sell" ? 
                    userHoldings.find(h => h.coinId === selectedCoinId)?.quantity : 
                    undefined
                  }
                  disabled={mode === "sell" && userHoldings.length === 0}
                />
                {mode === "sell" && amount && (() => {
                  const currentHolding = userHoldings.find(h => h.coinId === selectedCoinId);
                  const amountNum = parseFloat(amount);
                  if (currentHolding && amountNum > currentHolding.quantity) {
                    return (
                      <p className="text-xs text-destructive">
                        Insufficient balance. You only have {currentHolding.quantity} {currentHolding.symbol}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Current Price */}
              <div className="glass p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Current Price</span>
                  <span className="font-bold">${selectedCoin.currentPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">24h Change</span>
                  <span className={`flex items-center gap-1 font-semibold ${(selectedCoin.priceChangePerc24h || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {(selectedCoin.priceChangePerc24h || 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {Math.abs(selectedCoin.priceChangePerc24h || 0).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Estimated Total */}
              <div className="glass p-6 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Estimated Total</p>
                <p className="text-3xl font-bold text-gradient">${estimatedTotal}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {amount || "0"} {selectedCoin.symbol} × ${selectedCoin.currentPrice.toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAmount("");
                    toast.info("Trade cancelled");
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTrade}
                  className="glow"
                  disabled={isSaving || !portfolioId}
                >
                  {isSaving ? "Processing..." : `Confirm ${mode === "buy" ? "Buy" : "Sell"}`}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="glass p-6">
            <div className="flex items-center gap-3 mb-6">
              {selectedCoin.image ? (
                <img src={selectedCoin.image} alt={selectedCoin.name} className="h-16 w-16 rounded-full" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center font-bold text-2xl">
                  {selectedCoin.symbol.slice(0, 2)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{selectedCoin.name}</h2>
                <p className="text-muted-foreground">{selectedCoin.symbol}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your Holdings</p>
                <p className="text-xl font-bold">
                  1.00 {selectedCoin.symbol}
                </p>
                <p className="text-sm text-muted-foreground">
                  ≈ ${selectedCoin.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="glass p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                <p className="text-xl font-bold">
                  ${selectedCoin.marketCap ? (selectedCoin.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
                </p>
              </div>

              <div className="glass p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                <p className="text-xl font-bold">
                  ${selectedCoin.volume24h ? (selectedCoin.volume24h / 1e9).toFixed(2) + 'B' : 'N/A'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground">
                  <strong>Info:</strong> All trades are saved to your portfolio and transaction history. 
                  Real-time prices from CoinGecko API update every 10 seconds.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

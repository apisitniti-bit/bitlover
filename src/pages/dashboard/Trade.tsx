import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cryptoData } from "@/lib/mockData";
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

export default function Trade() {
  const [selectedCoin, setSelectedCoin] = useState(cryptoData[0]);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"buy" | "sell">("buy");

  const estimatedTotal = selectedCoin && amount ? (parseFloat(amount) * selectedCoin.price).toFixed(2) : "0.00";

  const handleTrade = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    toast.success(
      `Mock ${mode === "buy" ? "Purchase" : "Sale"} Successful!`,
      {
        description: `${amount} ${selectedCoin.symbol} for $${estimatedTotal}`
      }
    );
    setAmount("");
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
                <Label>Select Cryptocurrency</Label>
                <Select
                  value={selectedCoin.id}
                  onValueChange={(value) => {
                    const coin = cryptoData.find(c => c.id === value);
                    if (coin) setSelectedCoin(coin);
                  }}
                >
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoData.map(coin => (
                      <SelectItem key={coin.id} value={coin.id}>
                        <div className="flex items-center gap-2">
                          <img src={coin.logo} alt={coin.name} className="h-5 w-5 rounded-full" />
                          <span>{coin.symbol}</span>
                          <span className="text-muted-foreground">— {coin.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label>Amount ({selectedCoin.symbol})</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="glass text-lg"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Current Price */}
              <div className="glass p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Current Price</span>
                  <span className="font-bold">${selectedCoin.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">24h Change</span>
                  <span className={`flex items-center gap-1 font-semibold ${selectedCoin.change_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {selectedCoin.change_24h >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {Math.abs(selectedCoin.change_24h).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Estimated Total */}
              <div className="glass p-6 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Estimated Total</p>
                <p className="text-3xl font-bold text-gradient">${estimatedTotal}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {amount || "0"} {selectedCoin.symbol} × ${selectedCoin.price.toLocaleString()}
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
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTrade}
                  className="glow"
                >
                  Confirm {mode === "buy" ? "Buy" : "Sell"}
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
              <img
                src={selectedCoin.logo}
                alt={selectedCoin.name}
                className="h-16 w-16 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold">{selectedCoin.name}</h2>
                <p className="text-muted-foreground">{selectedCoin.symbol}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your Holdings</p>
                <p className="text-xl font-bold">
                  {selectedCoin.quantity.toLocaleString()} {selectedCoin.symbol}
                </p>
                <p className="text-sm text-muted-foreground">
                  ≈ ${(selectedCoin.quantity * selectedCoin.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="glass p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                <p className="text-xl font-bold">
                  ${(selectedCoin.marketCap / 1e9).toFixed(2)}B
                </p>
              </div>

              <div className="glass p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                <p className="text-xl font-bold">
                  ${(selectedCoin.volume / 1e9).toFixed(2)}B
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This is a mock trading interface. 
                  No real transactions are being executed. 
                  All data and trades are simulated for demonstration purposes.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

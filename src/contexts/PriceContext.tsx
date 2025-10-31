import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface CoinPrice {
  coinId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  marketCap: number | null;
  volume24h: number | null;
  priceChange24h: number | null;
  priceChangePerc24h: number | null;
  lastUpdated: string;
}

interface PriceContextType {
  prices: Map<string, CoinPrice>;
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
  getPriceBySymbol: (symbol: string) => CoinPrice | undefined;
  getPriceByCoinId: (coinId: string) => CoinPrice | undefined;
  refreshPrices: () => Promise<void>;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

interface PriceProviderProps {
  children: ReactNode;
  syncInterval?: number; // milliseconds, default 10000 (10 seconds)
}

export const PriceProvider: React.FC<PriceProviderProps> = ({ 
  children, 
  syncInterval = 10000 
}) => {
  const [prices, setPrices] = useState<Map<string, CoinPrice>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchPrices = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const response = await axios.get(`${apiUrl}/market/live`);
      
      if (response.data.success && response.data.data) {
        const priceMap = new Map<string, CoinPrice>();
        
        response.data.data.forEach((coin: CoinPrice) => {
          // Store by coinId (e.g., 'bitcoin')
          priceMap.set(coin.coinId, coin);
          // Also store by symbol (e.g., 'BTC') for easy lookup
          priceMap.set(coin.symbol.toUpperCase(), coin);
        });
        
        setPrices(priceMap);
        setLastSync(new Date());
        setError(null);
        
        console.log(
          `✅ [${new Date().toISOString()}] Prices synced: ${response.data.data.length} coins`
        );
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.message 
        : 'Failed to fetch prices';
      setError(errorMessage);
      console.error('❌ Price fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPrices = async () => {
    await fetchPrices();
  };

  const getPriceBySymbol = (symbol: string): CoinPrice | undefined => {
    return prices.get(symbol.toUpperCase());
  };

  const getPriceByCoinId = (coinId: string): CoinPrice | undefined => {
    return prices.get(coinId.toLowerCase());
  };

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, []);

  // Set up auto-refresh interval
  useEffect(() => {
    const interval = setInterval(fetchPrices, syncInterval);
    return () => clearInterval(interval);
  }, [syncInterval]);

  const value: PriceContextType = {
    prices,
    isLoading,
    error,
    lastSync,
    getPriceBySymbol,
    getPriceByCoinId,
    refreshPrices,
  };

  return (
    <PriceContext.Provider value={value}>
      {children}
    </PriceContext.Provider>
  );
};

// Custom hook to use price context
export const usePrices = (): PriceContextType => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrices must be used within a PriceProvider');
  }
  return context;
};

// Helper hook to get a specific coin price
export const useCoinPrice = (symbolOrCoinId: string): CoinPrice | undefined => {
  const { getPriceBySymbol, getPriceByCoinId } = usePrices();
  
  // Try symbol first (BTC, ETH), then coinId (bitcoin, ethereum)
  return getPriceBySymbol(symbolOrCoinId) || getPriceByCoinId(symbolOrCoinId);
};

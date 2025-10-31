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
  image?: string; // CoinGecko logo URL
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
        
        // Logo mapping for popular coins
        const logoMap: Record<string, string> = {
          'bitcoin': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
          'ethereum': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
          'tether': 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
          'binancecoin': 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
          'solana': 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
          'ripple': 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
          'usd-coin': 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
          'cardano': 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
          'dogecoin': 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
          'tron': 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
          'avalanche-2': 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
          'polkadot': 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
          'chainlink': 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
          'matic-network': 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
          'litecoin': 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
        };
        
        response.data.data.forEach((coin: CoinPrice) => {
          // Only store by coinId to avoid duplicates
          // Add logo URL if available
          const coinWithLogo = {
            ...coin,
            image: logoMap[coin.coinId] || undefined
          };
          priceMap.set(coin.coinId, coinWithLogo);
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
    // Search through all coins to find by symbol
    const upperSymbol = symbol.toUpperCase();
    for (const coin of prices.values()) {
      if (coin.symbol.toUpperCase() === upperSymbol) {
        return coin;
      }
    }
    return undefined;
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

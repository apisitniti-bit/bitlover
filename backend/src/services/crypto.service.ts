import axios from 'axios';

const COINGECKO_API = process.env.CRYPTO_API_BASE_URL || 'https://api.coingecko.com/api/v3';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

const getCachedData = (key: string): any | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Symbol to CoinGecko ID mapping
const symbolToId: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'MATIC': 'matic-network',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
};

export interface CoinPrice {
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  image?: string;
}

export interface CoinDetail extends CoinPrice {
  description?: string;
  market_cap_rank?: number;
  circulating_supply?: number;
  total_supply?: number;
  max_supply?: number;
}

export const cryptoService = {
  // Get current prices for multiple coins
  async getPrices(symbols: string[]): Promise<CoinPrice[]> {
    const cacheKey = `prices_${symbols.join('_')}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const ids = symbols.map(s => symbolToId[s.toUpperCase()] || s.toLowerCase()).join(',');
      const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids,
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          sparkline: false,
        },
      });

      const data = response.data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        image: coin.image,
      }));

      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching prices:', error);
      throw new Error('Failed to fetch cryptocurrency prices');
    }
  },

  // Get detailed information for a single coin
  async getCoinDetail(symbol: string): Promise<CoinDetail> {
    const cacheKey = `detail_${symbol}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const id = symbolToId[symbol.toUpperCase()] || symbol.toLowerCase();
      const response = await axios.get(`${COINGECKO_API}/coins/${id}`, {
        params: {
          localization: false,
          tickers: false,
          community_data: false,
          developer_data: false,
        },
      });

      const coin = response.data;
      const data: CoinDetail = {
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.market_data.current_price.usd,
        price_change_24h: coin.market_data.price_change_24h,
        price_change_percentage_24h: coin.market_data.price_change_percentage_24h,
        market_cap: coin.market_data.market_cap.usd,
        total_volume: coin.market_data.total_volume.usd,
        high_24h: coin.market_data.high_24h.usd,
        low_24h: coin.market_data.low_24h.usd,
        image: coin.image?.large,
        description: coin.description?.en,
        market_cap_rank: coin.market_cap_rank,
        circulating_supply: coin.market_data.circulating_supply,
        total_supply: coin.market_data.total_supply,
        max_supply: coin.market_data.max_supply,
      };

      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching coin detail:', error);
      throw new Error('Failed to fetch coin details');
    }
  },

  // Get top cryptocurrencies by market cap
  async getTopCoins(limit: number = 100): Promise<CoinPrice[]> {
    const cacheKey = `top_${limit}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
        },
      });

      const data = response.data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        image: coin.image,
      }));

      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching top coins:', error);
      throw new Error('Failed to fetch top cryptocurrencies');
    }
  },

  // Search for cryptocurrencies
  async searchCoins(query: string): Promise<any[]> {
    try {
      const response = await axios.get(`${COINGECKO_API}/search`, {
        params: { query },
      });

      return response.data.coins.slice(0, 10).map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        image: coin.large,
        market_cap_rank: coin.market_cap_rank,
      }));
    } catch (error) {
      console.error('Error searching coins:', error);
      throw new Error('Failed to search cryptocurrencies');
    }
  },

  // Get historical price data
  async getHistoricalData(symbol: string, days: number = 7): Promise<any> {
    const cacheKey = `historical_${symbol}_${days}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const id = symbolToId[symbol.toUpperCase()] || symbol.toLowerCase();
      const response = await axios.get(`${COINGECKO_API}/coins/${id}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days,
        },
      });

      const data = {
        prices: response.data.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp,
          price,
        })),
      };

      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw new Error('Failed to fetch historical price data');
    }
  },

  // Get trending coins
  async getTrendingCoins(): Promise<any[]> {
    const cacheKey = 'trending';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${COINGECKO_API}/search/trending`);
      
      const data = response.data.coins.map((item: any) => ({
        id: item.item.id,
        name: item.item.name,
        symbol: item.item.symbol.toUpperCase(),
        image: item.item.large,
        market_cap_rank: item.item.market_cap_rank,
        price_btc: item.item.price_btc,
      }));

      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      throw new Error('Failed to fetch trending cryptocurrencies');
    }
  },
};

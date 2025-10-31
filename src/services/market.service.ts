import api from './api';

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

export const marketService = {
  async getPrices(symbols: string[]): Promise<CoinPrice[]> {
    const response = await api.get('/market/prices', {
      params: { symbols: symbols.join(',') },
    });
    return response.data;
  },

  async getCoinDetail(symbol: string): Promise<any> {
    const response = await api.get(`/market/coins/${symbol}`);
    return response.data;
  },

  async getTopCoins(limit: number = 100): Promise<CoinPrice[]> {
    const response = await api.get('/market/top', {
      params: { limit },
    });
    return response.data;
  },

  async getTrending(): Promise<any[]> {
    const response = await api.get('/market/trending');
    return response.data;
  },

  async searchCoins(query: string): Promise<any[]> {
    const response = await api.get('/market/search', {
      params: { q: query },
    });
    return response.data;
  },

  async getHistoricalData(symbol: string, days: number = 7): Promise<any> {
    const response = await api.get(`/market/historical/${symbol}`, {
      params: { days },
    });
    return response.data;
  },
};

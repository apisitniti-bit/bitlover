import api from './api';

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  assets?: Asset[];
}

export interface Asset {
  id: string;
  portfolioId: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
}

export interface PortfolioSummary {
  portfolio: {
    id: string;
    name: string;
    description?: string | null;
  };
  summary: {
    totalValue: number;
    totalCost: number;
    totalProfitLoss: number;
    totalProfitLossPercentage: number;
    change24h: number;
    change24hPercentage: number;
    assetCount: number;
  };
  assets: Asset[];
}

export const portfolioService = {
  async getAllPortfolios(): Promise<Portfolio[]> {
    const response = await api.get('/portfolios');
    return response.data;
  },

  async getPortfolio(id: string): Promise<Portfolio> {
    const response = await api.get(`/portfolios/${id}`);
    return response.data;
  },

  async createPortfolio(data: { name: string; description?: string }): Promise<Portfolio> {
    const response = await api.post('/portfolios', data);
    return response.data.portfolio;
  },

  async updatePortfolio(id: string, data: { name?: string; description?: string }): Promise<Portfolio> {
    const response = await api.put(`/portfolios/${id}`, data);
    return response.data.portfolio;
  },

  async deletePortfolio(id: string): Promise<void> {
    await api.delete(`/portfolios/${id}`);
  },

  async getPortfolioSummary(id: string): Promise<PortfolioSummary> {
    const response = await api.get(`/portfolios/${id}/summary`);
    return response.data;
  },
};

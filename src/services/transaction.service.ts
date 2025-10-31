import api from './api';

export interface Transaction {
  id: string;
  portfolioId: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  fee: number;
  timestamp: string;
  notes?: string | null;
}

export interface CreateTransactionData {
  portfolioId: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  fee?: number;
  timestamp?: string;
  notes?: string;
}

export const transactionService = {
  async getTransactionsByPortfolio(portfolioId: string): Promise<Transaction[]> {
    const response = await api.get(`/transactions/portfolio/${portfolioId}`);
    return response.data;
  },

  async getTransaction(id: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const response = await api.post('/transactions', data);
    return response.data.transaction;
  },

  async updateTransaction(id: string, data: Partial<CreateTransactionData>): Promise<Transaction> {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data.transaction;
  },

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  async getTransactionHistory(): Promise<Transaction[]> {
    const response = await api.get('/transactions/history');
    return response.data;
  },
};

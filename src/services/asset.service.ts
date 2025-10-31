import api from './api';
import { Asset } from './portfolio.service';

export interface AddAssetData {
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate?: string;
}

export const assetService = {
  async getAssetsByPortfolio(portfolioId: string): Promise<Asset[]> {
    const response = await api.get(`/assets/portfolio/${portfolioId}`);
    return response.data;
  },

  async getAsset(id: string): Promise<Asset> {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  async addAsset(portfolioId: string, data: AddAssetData): Promise<Asset> {
    const response = await api.post(`/assets/portfolio/${portfolioId}`, data);
    return response.data.asset;
  },

  async updateAsset(id: string, data: Partial<AddAssetData>): Promise<Asset> {
    const response = await api.put(`/assets/${id}`, data);
    return response.data.asset;
  },

  async deleteAsset(id: string): Promise<void> {
    await api.delete(`/assets/${id}`);
  },

  async getAssetPerformance(id: string): Promise<any> {
    const response = await api.get(`/assets/${id}/performance`);
    return response.data;
  },
};

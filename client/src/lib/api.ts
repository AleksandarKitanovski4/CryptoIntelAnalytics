import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY
  }
});

export const analyzeMarket = async (coinSymbol: string, timeframe: string) => {
  try {
    const response = await api.get(`/api/analyze/${coinSymbol}/${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error analyzing market:', error);
    throw error;
  }
};

export const getAccuracyStats = async (params: {
  coinSymbol?: string;
  timeframe?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const response = await api.get('/api/accuracy', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching accuracy stats:', error);
    throw error;
  }
}; 
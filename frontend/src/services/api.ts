import axios from 'axios';
import { LogEntry, LogResponse, LogSearchParams, LogSearchResponse } from '../types/log';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const logApi = {
  // Create a new log
  createLog: async (log: LogEntry): Promise<LogResponse> => {
    const response = await api.post<LogResponse>('/logs', log);
    return response.data;
  },

  // Search logs
  searchLogs: async (params: LogSearchParams): Promise<LogSearchResponse> => {
    const response = await api.get<LogSearchResponse>('/logs/search', {
      params: {
        q: params.q,
        level: params.level,
        service: params.service,
        size: params.size || 20,
        from: params.from || 0,
      },
    });
    return response.data;
  },

  // Get latest logs
  getLatestLogs: async (size: number = 20): Promise<LogSearchResponse> => {
    const response = await api.get<LogSearchResponse>('/logs/latest', {
      params: { size },
    });
    return response.data;
  },
};
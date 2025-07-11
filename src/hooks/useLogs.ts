import { useState, useEffect, useCallback } from 'react';
import { LogResponse, LogSearchParams } from '../types/log';
import { logApi } from '../services/api';

export const useLogs = () => {
  const [logs, setLogs] = useState<LogResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const searchLogs = useCallback(async (params: LogSearchParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await logApi.searchLogs(params);
      setLogs(response.logs);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch logs');
      setLogs([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadLatestLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await logApi.getLatestLogs();
      setLogs(response.logs);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch latest logs');
      setLogs([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLatestLogs();
  }, [loadLatestLogs]);

  return {
    logs,
    isLoading,
    error,
    total,
    searchLogs,
    loadLatestLogs,
  };
};
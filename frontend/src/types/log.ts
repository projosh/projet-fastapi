export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  service: string;
}

export interface LogResponse {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  service: string;
}

export interface LogSearchParams {
  q?: string;
  level?: string;
  service?: string;
  size?: number;
  from?: number;
}

export interface LogSearchResponse {
  logs: LogResponse[];
  total: number;
  took: number;
}
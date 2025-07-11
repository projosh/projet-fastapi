import React from 'react';
import { LogResponse } from '../types/log';
import { Clock, Server, AlertCircle, Info, AlertTriangle, Bug } from 'lucide-react';

interface LogListProps {
  logs: LogResponse[];
  isLoading: boolean;
  total: number;
}

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'ERROR':
      return <AlertCircle size={16} className="text-red-500" />;
    case 'WARNING':
      return <AlertTriangle size={16} className="text-yellow-500" />;
    case 'INFO':
      return <Info size={16} className="text-blue-500" />;
    case 'DEBUG':
      return <Bug size={16} className="text-gray-500" />;
    default:
      return <Info size={16} className="text-gray-500" />;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'ERROR':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'WARNING':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'INFO':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'DEBUG':
      return 'bg-gray-50 border-gray-200 text-gray-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (error) {
    return timestamp;
  }
};

export const LogList: React.FC<LogListProps> = ({ logs, isLoading, total }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Logs ({total} résultats)
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Aucun log trouvé</p>
            <p className="text-sm">Essayez d'ajuster vos filtres de recherche</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getLevelIcon(log.level)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Server size={14} />
                    <span>{log.service}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock size={14} />
                  <span>{formatTimestamp(log.timestamp)}</span>
                </div>
              </div>
              
              <div className="pl-7">
                <p className="text-gray-800 leading-relaxed">{log.message}</p>
                <div className="mt-2 text-xs text-gray-400">
                  ID: {log.id}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
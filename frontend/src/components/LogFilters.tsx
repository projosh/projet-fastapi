import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

interface LogFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  levelFilter: string;
  setLevelFilter: (level: string) => void;
  serviceFilter: string;
  setServiceFilter: (service: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const LOG_LEVELS = ['', 'INFO', 'WARNING', 'ERROR', 'DEBUG'];

export const LogFilters: React.FC<LogFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  levelFilter,
  setLevelFilter,
  serviceFilter,
  setServiceFilter,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Recherche et filtres</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Recherche dans les messages
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans les messages..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
            Niveau
          </label>
          <select
            id="level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les niveaux</option>
            {LOG_LEVELS.slice(1).map(level => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
            Service
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="service"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              placeholder="Nom du service"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Actualiser"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { LogForm } from './components/LogForm';
import { LogFilters } from './components/LogFilters';
import { LogList } from './components/LogList';
import { useLogs } from './hooks/useLogs';
import { FileText, Database } from 'lucide-react';

function App() {
  const { logs, isLoading, error, total, searchLogs, loadLatestLogs } = useLogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = {
        q: searchQuery || undefined,
        level: levelFilter || undefined,
        service: serviceFilter || undefined,
      };
      
      // Only search if we have filters, otherwise load latest
      if (searchQuery || levelFilter || serviceFilter) {
        searchLogs(params);
      } else {
        loadLatestLogs();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, levelFilter, serviceFilter, searchLogs, loadLatestLogs]);

  const handleLogCreated = () => {
    // Refresh logs after creating a new one
    if (searchQuery || levelFilter || serviceFilter) {
      const params = {
        q: searchQuery || undefined,
        level: levelFilter || undefined,
        service: serviceFilter || undefined,
      };
      searchLogs(params);
    } else {
      loadLatestLogs();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Database size={24} className="text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Gestionnaire de Logs</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <FileText size={16} />
              {showForm ? 'Masquer le formulaire' : 'Ajouter un log'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-medium">Erreur:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Log Form */}
        {showForm && (
          <LogForm onLogCreated={handleLogCreated} />
        )}

        {/* Filters */}
        <LogFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          serviceFilter={serviceFilter}
          setServiceFilter={setServiceFilter}
          onRefresh={loadLatestLogs}
          isLoading={isLoading}
        />

        {/* Log List */}
        <LogList
          logs={logs}
          isLoading={isLoading}
          total={total}
        />
      </main>
    </div>
  );
}

export default App;
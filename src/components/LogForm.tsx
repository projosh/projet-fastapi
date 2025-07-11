import React, { useState } from 'react';
import { LogEntry } from '../types/log';
import { logApi } from '../services/api';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';

interface LogFormProps {
  onLogCreated: () => void;
}

const LOG_LEVELS = ['INFO', 'WARNING', 'ERROR', 'DEBUG'] as const;

export const LogForm: React.FC<LogFormProps> = ({ onLogCreated }) => {
  const [formData, setFormData] = useState<LogEntry>({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: '',
    service: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await logApi.createLog(formData);
      setSuccess(true);
      setFormData({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: '',
        service: '',
      });
      onLogCreated();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create log');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Plus size={20} />
        Ajouter un nouveau log
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 mb-1">
              Timestamp
            </label>
            <input
              type="datetime-local"
              id="timestamp"
              name="timestamp"
              value={formData.timestamp.slice(0, 16)}
              onChange={(e) => setFormData(prev => ({ ...prev, timestamp: e.target.value + ':00.000Z' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              Niveau
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {LOG_LEVELS.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
            Service
          </label>
          <input
            type="text"
            id="service"
            name="service"
            value={formData.service}
            onChange={handleInputChange}
            placeholder="ex: api-gateway, user-service"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={3}
            placeholder="Décrivez le message du log..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle size={16} />
            <span className="text-sm">Log créé avec succès!</span>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Création...' : 'Créer le log'}
        </button>
      </form>
    </div>
  );
};
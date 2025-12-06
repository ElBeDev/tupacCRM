'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface AIAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  intent: string;
  urgency: 'high' | 'medium' | 'low';
  suggestedScore: number;
  suggestedStatus: string;
  summary: string;
  suggestedResponse: string;
}

interface AIAssistantProps {
  conversationId: string;
  onAnalysisComplete?: (analysis: AIAnalysisResult) => void;
}

export default function AIAssistant({ conversationId, onAnalysisComplete }: AIAssistantProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [suggestedResponse, setSuggestedResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'response'>('analysis');

  const analyzeConversation = async () => {
    setLoading(true);
    try {
      const response = await api.post('/ai/analyze-conversation', {
        conversationId,
      });
      setAnalysis(response.data);
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data);
      }
    } catch (error) {
      console.error('Error analyzing conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateResponse = async () => {
    setLoading(true);
    try {
      const response = await api.post('/ai/generate-response', {
        conversationId,
      });
      setSuggestedResponse(response.data.response);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">Asistente IA</h3>
          </div>
          <button
            onClick={analyzeConversation}
            disabled={loading}
            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analizando...' : 'Analizar'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'analysis'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Análisis
          </button>
          <button
            onClick={() => {
              setActiveTab('response');
              if (!suggestedResponse) {
                generateResponse();
              }
            }}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'response'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Respuesta Sugerida
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            {!analysis && !loading && (
              <p className="text-gray-500 text-sm text-center py-8">
                Haz clic en "Analizar" para obtener insights de IA sobre esta conversación
              </p>
            )}

            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            )}

            {analysis && !loading && (
              <>
                {/* Sentiment & Urgency */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border ${getSentimentColor(analysis.sentiment)}`}>
                    <p className="text-xs font-medium mb-1">Sentimiento</p>
                    <p className="text-sm font-semibold capitalize">{analysis.sentiment}</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${getUrgencyColor(analysis.urgency)}`}>
                    <p className="text-xs font-medium mb-1">Urgencia</p>
                    <p className="text-sm font-semibold capitalize">{analysis.urgency}</p>
                  </div>
                </div>

                {/* Intent */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-blue-900 mb-1">Intención</p>
                  <p className="text-sm text-blue-700">{analysis.intent}</p>
                </div>

                {/* Score & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Score Sugerido</p>
                    <p className="text-2xl font-bold text-gray-900">{analysis.suggestedScore}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Estado Sugerido</p>
                    <p className="text-sm font-semibold text-gray-900">{analysis.suggestedStatus}</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-xs font-medium text-purple-900 mb-2">Resumen</p>
                  <p className="text-sm text-purple-700">{analysis.summary}</p>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'response' && (
          <div className="space-y-4">
            {!suggestedResponse && !loading && (
              <p className="text-gray-500 text-sm text-center py-8">
                Generando respuesta sugerida...
              </p>
            )}

            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            )}

            {suggestedResponse && !loading && (
              <>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestedResponse}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(suggestedResponse);
                    }}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={generateResponse}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Regenerar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

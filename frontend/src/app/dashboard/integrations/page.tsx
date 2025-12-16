'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface GoogleStatus {
  connected: boolean;
  needsReauth: boolean;
}

interface AIConfig {
  id: string;
  name: string;
  isActive: boolean;
  autoReply: boolean;
  model: string;
}

export default function IntegrationsPage() {
  const router = useRouter();
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [aiConnected, setAiConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      // Check Google status
      const googleResponse = await api.get('/google/status');
      setGoogleStatus(googleResponse.data);

      // Check AI status
      const aiStatusResponse = await api.get('/ai/status');
      setAiConnected(aiStatusResponse.data.connected);

      // Get AI config
      const aiConfigResponse = await api.get('/ai/config');
      if (aiConfigResponse.data && aiConfigResponse.data.id) {
        setAiConfig(aiConfigResponse.data);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await api.get('/google/url');
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error connecting Google:', error);
      alert('Error al conectar con Google');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de desconectar tu cuenta de Google?')) {
      return;
    }

    try {
      await api.post('/google/disconnect');
      await checkStatus();
      alert('Cuenta de Google desconectada');
    } catch (error) {
      console.error('Error disconnecting Google:', error);
      alert('Error al desconectar Google');
    }
  };

  const handleRefresh = async () => {
    try {
      await api.post('/google/refresh');
      await checkStatus();
      alert('Tokens actualizados correctamente');
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      alert('Error al actualizar tokens');
    }
  };

  const toggleAI = async () => {
    if (!aiConfig) return;
    
    try {
      await api.put(`/api/ai/config/${aiConfig.id}`, {
        ...aiConfig,
        isActive: !aiConfig.isActive,
      });
      await checkStatus();
    } catch (error) {
      console.error('Error toggling AI:', error);
      alert('Error al cambiar estado de IA');
    }
  };

  const toggleAutoReply = async () => {
    if (!aiConfig) return;
    
    try {
      await api.put(`/api/ai/config/${aiConfig.id}`, {
        ...aiConfig,
        autoReply: !aiConfig.autoReply,
      });
      await checkStatus();
    } catch (error) {
      console.error('Error toggling auto-reply:', error);
      alert('Error al cambiar auto-respuesta');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integraciones</h1>
        <p className="text-gray-600 mt-1">
          Conecta servicios externos para potenciar tu CRM
        </p>
      </div>

      {/* Grid de Integraciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Google Integration Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">Google Workspace</h2>
                  <p className="text-blue-100 text-sm">Calendar & Sheets</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${googleStatus?.connected ? 'bg-green-400' : 'bg-white/50'}`}></div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-3">
                {googleStatus?.connected 
                  ? 'Tu cuenta de Google está conectada y funcionando'
                  : 'Conecta tu cuenta para usar Calendar y Sheets'}
              </p>
              {googleStatus?.needsReauth && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-orange-800">
                    ⚠️ Los tokens han expirado. Necesitas reautenticar.
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Calendar</span>
                </div>
                <p className="text-xs text-gray-500">Agenda reuniones</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Sheets</span>
                </div>
                <p className="text-xs text-gray-500">Importa/exporta</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {!googleStatus?.connected ? (
                <button
                  onClick={handleConnect}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Conectar Google
                </button>
              ) : (
                <>
                  {googleStatus.needsReauth && (
                    <button
                      onClick={handleRefresh}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      Reautenticar
                    </button>
                  )}
                  <button
                    onClick={handleDisconnect}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Desconectar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* OpenAI Integration Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">OpenAI Assistant</h2>
                  <p className="text-purple-100 text-sm">Inteligencia Artificial</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${aiConnected && aiConfig?.isActive ? 'bg-green-400' : 'bg-white/50'}`}></div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-3">
                {aiConnected 
                  ? aiConfig?.isActive 
                    ? 'Asistente IA activo y analizando conversaciones'
                    : aiConfig
                      ? 'Asistente IA configurado pero desactivado'
                      : 'Configura tu asistente IA'
                  : 'Configura la API Key de OpenAI en variables de entorno'}
              </p>
              {aiConfig && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Modelo:</span>
                    <span className="font-mono text-gray-900">{aiConfig.model}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-gray-600">Auto-respuesta:</span>
                    <span className={`font-medium ${aiConfig.autoReply ? 'text-green-600' : 'text-gray-400'}`}>
                      {aiConfig.autoReply ? 'Activada' : 'Desactivada'}
                    </span>
                  </div>
                </div>
              )}
              {!aiConfig && aiConnected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-yellow-800">
                    ⚠️ No hay configuración. Haz clic en "Configurar IA" para crear una.
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-base">📊</span>
                  <span className="text-xs font-medium text-gray-700">Análisis</span>
                </div>
                <p className="text-xs text-gray-500">Califica leads</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-base">💬</span>
                  <span className="text-xs font-medium text-gray-700">Respuestas</span>
                </div>
                <p className="text-xs text-gray-500">24/7 automático</p>
              </div>
            </div>

            {/* Quick Toggles */}
            {aiConnected && aiConfig && (
              <div className="space-y-2 mb-4">
                <button
                  onClick={toggleAI}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border transition-colors ${
                    aiConfig.isActive 
                      ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm font-medium">Asistente IA</span>
                  <div className={`w-10 h-6 rounded-full transition-colors ${aiConfig.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${aiConfig.isActive ? 'ml-5' : 'ml-1'}`}></div>
                  </div>
                </button>

                <button
                  onClick={toggleAutoReply}
                  disabled={!aiConfig.isActive}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border transition-colors ${
                    aiConfig.autoReply && aiConfig.isActive
                      ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  } ${!aiConfig.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-sm font-medium">Auto-respuesta</span>
                  <div className={`w-10 h-6 rounded-full transition-colors ${aiConfig.autoReply && aiConfig.isActive ? 'bg-purple-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${aiConfig.autoReply ? 'ml-5' : 'ml-1'}`}></div>
                  </div>
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => router.push('/dashboard/integrations/ai')}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Configurar IA
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

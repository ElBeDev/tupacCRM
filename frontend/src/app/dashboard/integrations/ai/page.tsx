'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface AIConfig {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  autoReply: boolean;
  fallbackMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AIConfigPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  const [formData, setFormData] = useState({
    name: 'Configuración Principal',
    systemPrompt: '',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 500,
    isActive: true,
    autoReply: false,
    fallbackMessage: '',
  });

  useEffect(() => {
    loadConfig();
    checkAPIKey();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.get('/ai/config');
      if (response.data && response.data.id) {
        setConfig(response.data);
        setFormData({
          name: response.data.name,
          systemPrompt: response.data.systemPrompt,
          model: response.data.model,
          temperature: response.data.temperature,
          maxTokens: response.data.maxTokens,
          isActive: response.data.isActive,
          autoReply: response.data.autoReply,
          fallbackMessage: response.data.fallbackMessage || '',
        });
      }
    } catch (error) {
      console.error('Error loading AI config:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAPIKey = async () => {
    try {
      const response = await api.get('/ai/status');
      setApiKeyStatus(response.data.connected ? 'connected' : 'disconnected');
    } catch (error) {
      setApiKeyStatus('disconnected');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (config) {
        await api.put(`/api/ai/config/${config.id}`, formData);
        await loadConfig();
        alert('✅ Configuración guardada correctamente');
      } else {
        alert('⚠️ No se encontró configuración. Contacta al administrador.');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('❌ Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await api.post('/ai/test', {
        messages: ['Hola, me interesa conocer más sobre sus servicios. ¿Pueden ayudarme?'],
      });
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      setTestResult(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const toggleActive = async () => {
    const newValue = !formData.isActive;
    setFormData({ ...formData, isActive: newValue });
    
    if (config) {
      try {
        await api.put(`/api/ai/config/${config.id}`, { ...formData, isActive: newValue });
        await loadConfig();
      } catch (error) {
        console.error('Error toggling active:', error);
      }
    }
  };

  const toggleAutoReply = async () => {
    const newValue = !formData.autoReply;
    setFormData({ ...formData, autoReply: newValue });
    
    if (config) {
      try {
        await api.put(`/api/ai/config/${config.id}`, { ...formData, autoReply: newValue });
        await loadConfig();
      } catch (error) {
        console.error('Error toggling auto-reply:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/dashboard/integrations')}
              className="text-gray-600 hover:text-gray-900 mb-2 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Volver a Integraciones</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Configuración del Asistente IA</h1>
            <p className="mt-2 text-gray-600">
              Ajusta el comportamiento y personalidad de tu asistente inteligente
            </p>
          </div>
          
          {/* API Status Badge */}
          <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className={`w-3 h-3 rounded-full ${
              apiKeyStatus === 'connected' ? 'bg-green-500' : 
              apiKeyStatus === 'disconnected' ? 'bg-red-500' : 
              'bg-yellow-500 animate-pulse'
            }`}></div>
            <span className="text-sm font-medium text-gray-700">
              {apiKeyStatus === 'connected' ? 'OpenAI Conectado' : 
               apiKeyStatus === 'disconnected' ? 'OpenAI Desconectado' : 
               'Verificando...'}
            </span>
          </div>
        </div>

        {/* Warning if API key not configured */}
        {apiKeyStatus === 'disconnected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">API Key de OpenAI no configurada</h3>
                <p className="text-sm text-red-700 mt-1">
                  Agrega <code className="bg-red-100 px-1 rounded">OPENAI_API_KEY=sk-...</code> en el archivo <code className="bg-red-100 px-1 rounded">.env</code> del backend y reinicia el servidor.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Toggle Active */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Estado del Asistente</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.isActive ? '🟢 Activo - Analizando conversaciones' : '⚫ Desactivado'}
                </p>
              </div>
              <button
                onClick={toggleActive}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                  formData.isActive ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${
                    formData.isActive ? 'translate-x-11' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Toggle Auto-Reply */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Respuesta Automática</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.autoReply ? '🤖 Respondiendo automáticamente' : '👤 Modo manual'}
                </p>
              </div>
              <button
                onClick={toggleAutoReply}
                disabled={!formData.isActive}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                  formData.autoReply && formData.isActive ? 'bg-purple-600' : 'bg-gray-300'
                } ${!formData.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${
                    formData.autoReply ? 'translate-x-11' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Configuración del Modelo</h2>
            <p className="text-sm text-gray-600 mt-1">Ajusta los parámetros de OpenAI</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Configuración
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Mi Asistente IA"
              />
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo de IA
              </label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <optgroup label="GPT-4 (Más inteligente)">
                  <option value="gpt-4-turbo">GPT-4 Turbo (128K contexto)</option>
                  <option value="gpt-4-turbo-preview">GPT-4 Turbo Preview</option>
                  <option value="gpt-4">GPT-4 (8K contexto)</option>
                  <option value="gpt-4-32k">GPT-4 32K</option>
                </optgroup>
                <optgroup label="GPT-3.5 (Más rápido)">
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (16K) ⭐ Recomendado</option>
                  <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K</option>
                </optgroup>
              </select>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-blue-50 p-2 rounded">
                  <span className="font-medium text-blue-900">GPT-4:</span>
                  <span className="text-blue-700"> $0.03/1K tokens</span>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <span className="font-medium text-green-900">GPT-3.5:</span>
                  <span className="text-green-700"> $0.002/1K tokens</span>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <span className="font-medium text-purple-900">Estimado:</span>
                  <span className="text-purple-700"> $2-20/mes</span>
                </div>
              </div>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt del Sistema
                <span className="text-xs text-gray-500 ml-2">(Define la personalidad y comportamiento)</span>
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                placeholder="Eres un asistente de ventas profesional y amigable. Tu objetivo es:&#10;1. Calificar leads según su interés y urgencia&#10;2. Responder preguntas de manera clara&#10;3. Ser empático y profesional&#10;4. Identificar oportunidades de venta"
              />
              <div className="mt-2 flex items-start space-x-2 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong>Consejo:</strong> Sé específico sobre cómo debe analizar conversaciones, qué información buscar, y cómo debe responder. 
                  Incluye el tono de voz, industria, y valores de tu empresa.
                </span>
              </div>
            </div>

            {/* Temperature & Max Tokens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperatura: {formData.temperature.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Conservador (0)</span>
                  <span>Balanceado (1)</span>
                  <span>Creativo (2)</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Controla la aleatoriedad. Valores bajos = respuestas más consistentes. Valores altos = más creatividad.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Tokens: {formData.maxTokens}
                </label>
                <input
                  type="range"
                  min="100"
                  max="4000"
                  step="50"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Corto (100)</span>
                  <span>Medio (2000)</span>
                  <span>Largo (4000)</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Límite de longitud de las respuestas. 1 token ≈ 4 caracteres. Más tokens = mayor costo.
                </p>
              </div>
            </div>

            {/* Fallback Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje de Respaldo (Fallback)
                <span className="text-xs text-gray-500 ml-2">(Opcional - se usa si la IA falla)</span>
              </label>
              <textarea
                value={formData.fallbackMessage}
                onChange={(e) => setFormData({ ...formData, fallbackMessage: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Gracias por tu mensaje. Un agente se pondrá en contacto contigo pronto."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={handleTest}
              disabled={testing || !formData.isActive || apiKeyStatus !== 'connected'}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {testing ? '🧪 Probando...' : '🧪 Probar Configuración'}
            </button>

            <button
              onClick={handleSave}
              disabled={saving || apiKeyStatus !== 'connected'}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {saving ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Resultado de la Prueba</h3>
              <button
                onClick={() => setTestResult(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                {testResult}
              </pre>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Análisis Automático</p>
              </div>
            </div>
            <ul className="space-y-1 text-xs text-blue-800">
              <li>• Calificación de leads (0-100)</li>
              <li>• Detección de sentimiento</li>
              <li>• Identificación de intención</li>
              <li>• Nivel de urgencia</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">💬</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900">Respuestas 24/7</p>
              </div>
            </div>
            <ul className="space-y-1 text-xs text-green-800">
              <li>• Respuestas contextuales</li>
              <li>• Personalidad consistente</li>
              <li>• Multi-idioma</li>
              <li>• Sin límite de conversaciones</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🎯</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-900">Pipeline Inteligente</p>
              </div>
            </div>
            <ul className="space-y-1 text-xs text-purple-800">
              <li>• Actualización automática</li>
              <li>• Predicción de conversión</li>
              <li>• Priorización de leads</li>
              <li>• Sugerencias de acciones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

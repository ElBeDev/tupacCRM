'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function SheetsPage() {
  const [loading, setLoading] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('Contactos');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleQuickExport = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/api/google/sheets/quick-export', {
        title: `TupacCRM - Contactos ${new Date().toLocaleDateString()}`,
      });

      setResult({
        type: 'export',
        message: 'Contactos exportados exitosamente',
        url: response.data.spreadsheetUrl,
        spreadsheetId: response.data.spreadsheetId,
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('No tienes una cuenta de Google conectada. Ve a Integraciones para conectar.');
      } else {
        setError('Error al exportar contactos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!spreadsheetId.trim()) {
      alert('Por favor ingresa el ID de la spreadsheet');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/api/google/sheets/export', {
        spreadsheetId: spreadsheetId.trim(),
        sheetName,
      });

      setResult({
        type: 'export',
        message: 'Contactos exportados exitosamente',
        url: response.data.spreadsheetUrl,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al exportar contactos');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!spreadsheetId.trim()) {
      alert('Por favor ingresa el ID de la spreadsheet');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/api/google/sheets/import', {
        spreadsheetId: spreadsheetId.trim(),
        sheetName,
      });

      setResult({
        type: 'import',
        message: 'Importación completada',
        ...response.data,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al importar contactos');
    } finally {
      setLoading(false);
    }
  };

  if (error && error.includes('cuenta de Google')) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <svg
            className="w-16 h-16 text-yellow-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cuenta de Google no conectada
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/dashboard/integrations"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ir a Integraciones
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Google Sheets</h1>
        <p className="text-gray-600 mt-1">
          Importa y exporta contactos usando Google Sheets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exportación Rápida */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Exportación Rápida</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Crea una nueva spreadsheet y exporta todos los contactos en un solo paso.
          </p>
          <button
            onClick={handleQuickExport}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Exportar Ahora</span>
              </>
            )}
          </button>
        </div>

        {/* Exportar a Spreadsheet Existente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Exportar a Existente</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Exporta contactos a una spreadsheet que ya tienes creada.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID de Spreadsheet
              </label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={e => setSpreadsheetId(e.target.value)}
                placeholder="1abc...xyz"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lo encuentras en la URL: docs.google.com/spreadsheets/d/<strong>ID</strong>/edit
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Hoja
              </label>
              <input
                type="text"
                value={sheetName}
                onChange={e => setSheetName(e.target.value)}
                placeholder="Contactos"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleExport}
              disabled={loading || !spreadsheetId.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Exportando...' : 'Exportar'}
            </button>
          </div>
        </div>

        {/* Importar desde Spreadsheet */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Importar Contactos</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Importa contactos desde una spreadsheet existente. La primera fila debe contener los
            nombres de las columnas (Nombre, Email, Teléfono, etc.).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID de Spreadsheet
              </label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={e => setSpreadsheetId(e.target.value)}
                placeholder="1abc...xyz"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Hoja
              </label>
              <input
                type="text"
                value={sheetName}
                onChange={e => setSheetName(e.target.value)}
                placeholder="Contactos"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <button
            onClick={handleImport}
            disabled={loading || !spreadsheetId.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Importando...' : 'Importar Contactos'}
          </button>
        </div>
      </div>

      {/* Resultado */}
      {result && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-green-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">{result.message}</h3>
              {result.type === 'export' && result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-green-700 hover:text-green-800 font-medium"
                >
                  <span>Abrir en Google Sheets</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
              {result.type === 'import' && (
                <div className="text-sm text-green-800 space-y-1">
                  <p>✓ Contactos creados: {result.created}</p>
                  <p>✓ Contactos actualizados: {result.updated}</p>
                  {result.errors && result.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium text-orange-700">
                        ⚠️ {result.errors.length} error(es) encontrado(s)
                      </summary>
                      <ul className="mt-2 space-y-1 pl-4">
                        {result.errors.map((err: string, i: number) => (
                          <li key={i} className="text-xs text-orange-700">
                            {err}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !error.includes('cuenta de Google') && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

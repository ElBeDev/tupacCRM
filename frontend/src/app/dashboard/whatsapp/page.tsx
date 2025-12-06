'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';

export default function WhatsAppPage() {
  const [connected, setConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
    
    // Initialize Socket.IO
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const newSocket = io(WS_URL);
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('whatsapp:qr', (data: { qr: string }) => {
      console.log('QR received');
      setQrCode(data.qr);
      setLoading(false);
    });

    newSocket.on('whatsapp:connected', (data: { phoneNumber: string }) => {
      console.log('WhatsApp connected!');
      setConnected(true);
      setQrCode(null);
      setPhoneNumber(data.phoneNumber);
      setLoading(false);
    });

    newSocket.on('whatsapp:disconnected', () => {
      console.log('WhatsApp disconnected');
      setConnected(false);
      setQrCode(null);
      setPhoneNumber(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const checkStatus = async () => {
    try {
      const response = await api.get('/api/whatsapp/status');
      setConnected(response.data.connected);
      setQrCode(response.data.qrCode);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      await api.post('/api/whatsapp/connect');
      // El QR se recibirá vía Socket.IO
    } catch (error) {
      console.error('Error connecting:', error);
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.post('/api/whatsapp/disconnect');
      setConnected(false);
      setQrCode(null);
      setPhoneNumber(null);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integración WhatsApp</h1>
        <p className="text-gray-600 mt-1">Conecta y gestiona tu cuenta de WhatsApp Business</p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Estado de Conexión
            </h2>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${
                  connected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {connected ? 'Conectado' : 'Desconectado'}
              </span>
              {phoneNumber && (
                <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                  ({phoneNumber})
                </span>
              )}
            </div>
          </div>
          <div>
            {!connected ? (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Conectando...' : 'Conectar WhatsApp'}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Desconectar
              </button>
            )}
          </div>
        </div>

        {qrCode && !connected && (
          <div className="mt-6 text-center bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Escanea el código QR con tu WhatsApp
            </h3>
            <div className="flex justify-center">
              <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    qrCode
                  )}`}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              1. Abre WhatsApp en tu teléfono
              <br />
              2. Ve a Configuración {'>'} Dispositivos vinculados
              <br />
              3. Toca en "Vincular un dispositivo"
              <br />
              4. Escanea este código QR
            </p>
          </div>
        )}

        {connected && (
          <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0"
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
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                  ¡WhatsApp conectado exitosamente!
                </h3>
                <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                  Ahora puedes recibir y enviar mensajes a través de tu número de WhatsApp.
                  Los mensajes entrantes aparecerán automáticamente en las conversaciones.
                </p>
              </div>
            </div>
          </div>
        )}

        {!connected && !qrCode && !loading && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Conecta tu WhatsApp
                </h3>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  Haz clic en "Conectar WhatsApp" para generar un código QR y vincular tu cuenta.
                  No necesitas la API oficial de WhatsApp Business.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

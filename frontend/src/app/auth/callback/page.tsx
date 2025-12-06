'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh');

    if (token && refreshToken) {
      // Guardar tokens
      setAuth(
        { id: '', email: '', name: '', role: '' }, // El user será cargado después
        token,
        refreshToken
      );

      // Redirigir al dashboard
      router.push('/dashboard');
    } else {
      // Error en la autenticación
      router.push('/login?error=auth_failed');
    }
  }, [searchParams, setAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completando autenticación...</p>
      </div>
    </div>
  );
}

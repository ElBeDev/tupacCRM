'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import NavbarCollapsable from '@/components/dashboard/NavbarCollapsable';
import { Box } from '@chakra-ui/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box display="flex" minH="100vh" bg="#FEFEFE">
      <NavbarCollapsable />
      <Box flex={1} ml={{ base: 0, md: '224px' }}>
        {children}
      </Box>
    </Box>
  );
}

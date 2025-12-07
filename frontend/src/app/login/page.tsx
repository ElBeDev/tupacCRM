'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('demo@tupaccrm.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulación de login para desarrollo
      // En producción, esto haría una llamada real al backend
      setTimeout(() => {
        const mockUser = {
          id: '1',
          email: email,
          name: 'Usuario Demo',
          role: 'admin',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        };

        setAuth(mockUser, 'mock-access-token', 'mock-refresh-token');
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError('Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, purple.50, blue.50)"
      px={4}
    >
      <Container maxW="md">
        <Card shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              {/* Logo y Título */}
              <VStack spacing={3}>
                <Box
                  w="64px"
                  h="64px"
                  bg="brand.500"
                  borderRadius="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={Sparkles} color="white" boxSize={8} />
                </Box>
                <Heading size="lg" textAlign="center">
                  TupacCRM
                </Heading>
                <Text color="gray.600" textAlign="center">
                  Inicia sesión en tu cuenta
                </Text>
              </VStack>

              {/* Alerta de Demo */}
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Box fontSize="sm">
                  <Text fontWeight="semibold">Modo Demo</Text>
                  <Text>Email: demo@tupaccrm.com</Text>
                  <Text>Contraseña: demo123</Text>
                </Box>
              </Alert>

              {error && (
                <Alert status="error" borderRadius="lg">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Contraseña</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                          icon={<Icon as={showPassword ? EyeOff : Eye} />}
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    width="full"
                    isLoading={loading}
                    loadingText="Iniciando sesión..."
                  >
                    Iniciar Sesión
                  </Button>
                </VStack>
              </form>

              {/* Divider */}
              <HStack>
                <Divider />
                <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                  o
                </Text>
                <Divider />
              </HStack>

              {/* Link a Registro */}
              <Text textAlign="center" fontSize="sm" color="gray.600">
                ¿No tienes cuenta?{' '}
                <Link href="/register" style={{ color: '#9D39FE', fontWeight: 'semibold' }}>
                  Regístrate aquí
                </Link>
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Footer */}
        <Text textAlign="center" mt={6} fontSize="sm" color="gray.600">
          © 2026 TupacCRM. Todos los derechos reservados.
        </Text>
      </Container>
    </Box>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Skeleton,
  Icon,
} from '@chakra-ui/react';
import { ChevronDown, Calendar, MessageCircle, Zap } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('Esta semana');

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => setLoading(false), 1500);
  }, []);

  return (
    <Flex
      direction="column"
      flex={1}
      bg="#FEFEFE"
      minH="100vh"
      overflow="auto"
    >
      {/* Header Section */}
      <Box px={8} pt={8} pb={6}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading 
              size="lg" 
              fontWeight="700"
              color="gray.800"
              mb={2}
            >
              Hola {user?.name?.split(' ')[0] || 'Usuario'} 👋🏼
            </Heading>
            <Flex align="center" gap={2}>
              <Text fontSize="sm" color="gray.600" fontWeight="600">
                Hoy
              </Text>
              <Text fontSize="sm" color="gray.500">
                {new Date().toLocaleDateString('es-ES', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Text>
            </Flex>
          </Box>
        </Flex>

        {/* Indicadores Section */}
        <Box>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading size="md" fontWeight="700" color="gray.800" mb={1}>
                Indicadores
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Agrega o modifícalos según tus preferencias
              </Text>
            </Box>
            <Flex align="center" gap={3}>
              <Text fontSize="sm" color="gray.500">
                Mostrando data desde:
              </Text>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDown size={16} />}
                  size="sm"
                  bg="white"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{ bg: 'gray.50' }}
                  fontWeight="500"
                >
                  {selectedPeriod}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setSelectedPeriod('Hoy')}>Hoy</MenuItem>
                  <MenuItem onClick={() => setSelectedPeriod('Esta semana')}>Esta semana</MenuItem>
                  <MenuItem onClick={() => setSelectedPeriod('Este mes')}>Este mes</MenuItem>
                  <MenuItem onClick={() => setSelectedPeriod('Este año')}>Este año</MenuItem>
                  <MenuItem onClick={() => setSelectedPeriod('Personalizado')}>
                    Personalizado
                  </MenuItem>
                </MenuList>
              </Menu>
              <Button
                size="sm"
                leftIcon={<Calendar size={16} />}
                variant="outline"
                borderColor="gray.200"
                _hover={{ bg: 'gray.50' }}
              >
                Fecha personalizada
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Box>

      {/* Métricas Section */}
      <Box px={8} pb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" fontWeight="700" color="gray.800">
            Métricas
          </Heading>
          <Button
            size="sm"
            bg="white"
            border="1px"
            borderColor="gray.200"
            _hover={{ bg: 'gray.50' }}
          >
            {selectedPeriod}
          </Button>
        </Flex>

        <Text fontSize="sm" color="gray.600" mb={6}>
          Elegí hasta 4 indicadores para comparar en los gráficos:
        </Text>

        {/* Metrics Cards */}
        <Flex gap={4} flexWrap="wrap">
          {/* Conversaciones Card */}
          <Skeleton isLoaded={!loading} borderRadius="xl">
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor="gray.200"
              minW="280px"
              flex="1"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ 
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
            >
              <Flex justify="space-between" align="flex-start" mb={4}>
                <Flex align="center" gap={3}>
                  <Flex
                    bg="purple.50"
                    w="48px"
                    h="48px"
                    borderRadius="12px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={MessageCircle} color="#9D39FE" boxSize={6} />
                  </Flex>
                  <Text fontWeight="600" color="gray.700">
                    Conversaciones
                  </Text>
                </Flex>
              </Flex>
              <Flex align="baseline" gap={2}>
                <Text fontSize="3xl" fontWeight="700" color="gray.800">
                  {loading ? '...' : '247'}
                </Text>
                <Text fontSize="sm" color="green.500" fontWeight="600">
                  +12.5%
                </Text>
              </Flex>
              <Text fontSize="xs" color="gray.500" mt={1}>
                vs. período anterior
              </Text>
            </Box>
          </Skeleton>

          {/* Mensajes Recibidos Card */}
          <Skeleton isLoaded={!loading} borderRadius="xl">
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor="gray.200"
              minW="280px"
              flex="1"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ 
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
            >
              <Flex justify="space-between" align="flex-start" mb={4}>
                <Flex align="center" gap={3}>
                  <Flex
                    bg="blue.50"
                    w="48px"
                    h="48px"
                    borderRadius="12px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={MessageCircle} color="blue.500" boxSize={6} />
                  </Flex>
                  <Text fontWeight="600" color="gray.700">
                    Mensajes Recibidos
                  </Text>
                </Flex>
              </Flex>
              <Flex align="baseline" gap={2}>
                <Text fontSize="3xl" fontWeight="700" color="gray.800">
                  {loading ? '...' : '1,482'}
                </Text>
                <Text fontSize="sm" color="green.500" fontWeight="600">
                  +8.3%
                </Text>
              </Flex>
              <Text fontSize="xs" color="gray.500" mt={1}>
                vs. período anterior
              </Text>
            </Box>
          </Skeleton>

          {/* Seguimientos Card */}
          <Skeleton isLoaded={!loading} borderRadius="xl">
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor="gray.200"
              minW="280px"
              flex="1"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ 
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
            >
              <Flex justify="space-between" align="flex-start" mb={4}>
                <Flex align="center" gap={3}>
                  <Flex
                    bg="orange.50"
                    w="48px"
                    h="48px"
                    borderRadius="12px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={Zap} color="orange.500" boxSize={6} />
                  </Flex>
                  <Text fontWeight="600" color="gray.700">
                    Seguimientos
                  </Text>
                </Flex>
              </Flex>
              <Flex align="baseline" gap={2}>
                <Text fontSize="3xl" fontWeight="700" color="gray.800">
                  {loading ? '...' : '89'}
                </Text>
                <Text fontSize="sm" color="red.500" fontWeight="600">
                  -2.1%
                </Text>
              </Flex>
              <Text fontSize="xs" color="gray.500" mt={1}>
                vs. período anterior
              </Text>
            </Box>
          </Skeleton>

          {/* Smart Tags Card */}
          <Skeleton isLoaded={!loading} borderRadius="xl">
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor="gray.200"
              minW="280px"
              flex="1"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ 
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
            >
              <Flex justify="space-between" align="flex-start" mb={4}>
                <Flex align="center" gap={3}>
                  <Flex
                    bg="green.50"
                    w="48px"
                    h="48px"
                    borderRadius="12px"
                    align="center"
                    justify="center"
                  >
                    <Text fontSize="2xl">🏷️</Text>
                  </Flex>
                  <Text fontWeight="600" color="gray.700">
                    Smart Tags
                  </Text>
                </Flex>
              </Flex>
              <Flex align="baseline" gap={2}>
                <Text fontSize="3xl" fontWeight="700" color="gray.800">
                  {loading ? '...' : '34'}
                </Text>
                <Text fontSize="sm" color="green.500" fontWeight="600">
                  +5.7%
                </Text>
              </Flex>
              <Text fontSize="xs" color="gray.500" mt={1}>
                vs. período anterior
              </Text>
            </Box>
          </Skeleton>
        </Flex>

        {/* Placeholder for Charts - Coming Soon */}
        <Box mt={8}>
          <Flex
            bg="white"
            p={12}
            borderRadius="xl"
            border="1px"
            borderColor="gray.200"
            justify="center"
            align="center"
            direction="column"
            gap={3}
          >
            <Text fontSize="4xl" opacity={0.3}>
              📊
            </Text>
            <Text fontSize="lg" fontWeight="600" color="gray.400">
              Gráficos próximamente
            </Text>
            <Text fontSize="sm" color="gray.400">
              Aquí podrás visualizar tus métricas en gráficos interactivos
            </Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}

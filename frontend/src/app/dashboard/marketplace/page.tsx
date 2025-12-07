'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Button,
  Icon,
  Image,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tabs,
  TabList,
  Tab,
} from '@chakra-ui/react';
import { Search, Star, Download, Zap, MessageSquare, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  downloads: number;
  image: string;
  isPremium: boolean;
}

const mockItems: MarketplaceItem[] = [
  {
    id: '1',
    name: 'Asistente de Ventas',
    description: 'IA especializada en cerrar ventas y hacer seguimiento de leads',
    category: 'Ventas',
    price: 0,
    rating: 4.8,
    downloads: 1250,
    image: 'https://via.placeholder.com/300x200/9D39FE/FFFFFF?text=Ventas',
    isPremium: false,
  },
  {
    id: '2',
    name: 'Soporte al Cliente 24/7',
    description: 'Responde automáticamente preguntas frecuentes de tus clientes',
    category: 'Soporte',
    price: 29,
    rating: 4.9,
    downloads: 2100,
    image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Soporte',
    isPremium: true,
  },
  {
    id: '3',
    name: 'Generador de Contenido',
    description: 'Crea contenido para redes sociales y marketing',
    category: 'Marketing',
    price: 0,
    rating: 4.6,
    downloads: 890,
    image: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Marketing',
    isPremium: false,
  },
  {
    id: '4',
    name: 'Análisis de Sentimientos',
    description: 'Analiza el sentimiento de las conversaciones con clientes',
    category: 'Análisis',
    price: 49,
    rating: 4.7,
    downloads: 650,
    image: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Analisis',
    isPremium: true,
  },
  {
    id: '5',
    name: 'Traductor Multiidioma',
    description: 'Traduce automáticamente conversaciones a 100+ idiomas',
    category: 'Utilidades',
    price: 19,
    rating: 4.5,
    downloads: 1780,
    image: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Traductor',
    isPremium: true,
  },
  {
    id: '6',
    name: 'Recordatorios Inteligentes',
    description: 'Sistema automático de recordatorios y seguimiento',
    category: 'Productividad',
    price: 0,
    rating: 4.4,
    downloads: 920,
    image: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Recordatorios',
    isPremium: false,
  },
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const categories = ['Todos', 'Ventas', 'Soporte', 'Marketing', 'Análisis', 'Utilidades', 'Productividad'];

  return (
    <Box bg={bgColor} minH="100vh" pl={{ base: 0, md: '224px' }} pt={4}>
      <Container maxW="container.xl" py={8}>
        <VStack align="stretch" spacing={6}>
          {/* Header */}
          <Box>
            <Heading size="lg" mb={2}>
              Marketplace
            </Heading>
            <Text color="gray.600">
              Descubre y agrega nuevos asistentes de IA a tu CRM
            </Text>
          </Box>

          {/* Search and Filters */}
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={Search} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar asistentes, plantillas y extensiones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>

                <HStack spacing={4}>
                  <Select
                    placeholder="Categoría"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    maxW="200px"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat.toLowerCase()}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                  <Select placeholder="Precio" maxW="200px">
                    <option value="free">Gratis</option>
                    <option value="paid">De pago</option>
                  </Select>
                  <Select placeholder="Ordenar por" maxW="200px">
                    <option value="popular">Más popular</option>
                    <option value="rating">Mejor valorados</option>
                    <option value="recent">Más recientes</option>
                  </Select>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Featured Badge */}
          <HStack spacing={2} flexWrap="wrap">
            <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
              🔥 Destacados
            </Badge>
            <Badge colorScheme="green" px={3} py={1} borderRadius="full">
              ✨ Nuevos
            </Badge>
            <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
              ⭐ Mejor valorados
            </Badge>
          </HStack>

          {/* Marketplace Items Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {mockItems.map((item) => (
              <Card
                key={item.id}
                bg={cardBg}
                _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                transition="all 0.2s"
                overflow="hidden"
              >
                <Box position="relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    h="160px"
                    w="full"
                    objectFit="cover"
                  />
                  {item.isPremium && (
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme="yellow"
                      fontSize="xs"
                    >
                      PREMIUM
                    </Badge>
                  )}
                </Box>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Heading size="sm" mb={1}>
                        {item.name}
                      </Heading>
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {item.description}
                      </Text>
                    </Box>

                    <HStack spacing={4} fontSize="sm" color="gray.600">
                      <HStack spacing={1}>
                        <Icon as={Star} boxSize={4} color="yellow.400" />
                        <Text fontWeight="medium">{item.rating}</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Icon as={Download} boxSize={4} />
                        <Text>{item.downloads}</Text>
                      </HStack>
                    </HStack>

                    <HStack justify="space-between" align="center">
                      <Text fontWeight="bold" fontSize="lg" color="brand.500">
                        {item.price === 0 ? 'Gratis' : `$${item.price}`}
                      </Text>
                      <Button
                        size="sm"
                        colorScheme="brand"
                        leftIcon={<Icon as={item.price === 0 ? Download : ShoppingCart} />}
                      >
                        {item.price === 0 ? 'Instalar' : 'Comprar'}
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Load More */}
          <Box textAlign="center" pt={4}>
            <Button variant="outline" colorScheme="brand" size="lg">
              Cargar más
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

'use client';

import {
  Box,
  Flex,
  Text,
  Icon,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  VStack,
  HStack,
  Avatar,
  Badge,
  Progress,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  MessageSquare,
  Settings,
  Sparkles,
  FileText,
  TestTube,
  Tag,
  Megaphone,
  Database,
  Users,
  ChevronLeft,
  ChevronRight,
  Crown,
  LogOut,
  Kanban,
  ShoppingCart,
  Ticket,
} from 'lucide-react';

interface NavLink {
  name: string;
  href: string;
  icon: any;
}

interface NavSection {
  title: string;
  items: NavLink[];
}

export default function NavbarCollapsable() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const { isOpen: isExpanded, onToggle } = useDisclosure({ defaultIsOpen: true });

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const mainLinks: NavLink[] = [
    { name: 'Inicio', href: '/dashboard', icon: Home },
    { name: 'Chats', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Configuración', href: '/dashboard/configuration', icon: Settings },
  ];

  const sections: NavSection[] = [
    {
      title: 'Crear',
      items: [
        { name: 'Asistentes', href: '/dashboard/prompt', icon: Sparkles },
        { name: 'Testing', href: '/dashboard/testing', icon: TestTube },
      ],
    },
    {
      title: 'Automatización',
      items: [
        { name: 'Pedidos', href: '/dashboard/orders', icon: ShoppingCart },
        { name: 'Reclamos', href: '/dashboard/tickets', icon: Ticket },
        { name: 'Pipeline', href: '/dashboard/pipeline', icon: Kanban },
        { name: 'Smart Tags', href: '/dashboard/smart-tags', icon: Tag },
        { name: 'Campañas', href: '/dashboard/campaigns', icon: Megaphone },
        { name: 'Base de datos', href: '/dashboard/database', icon: Database },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <Flex
      as="nav"
      direction="column"
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w={isExpanded ? '224px' : '80px'}
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      transition="width 0.2s"
      zIndex={1000}
    >
      {/* Header con Logo */}
      <Flex
        p={4}
        align="center"
        justify="space-between"
        borderBottom="1px"
        borderColor="gray.200"
      >
        {isExpanded && (
          <HStack spacing={2}>
            <Box
              w="32px"
              h="32px"
              bg="brand.500"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={Sparkles} color="white" boxSize={5} />
            </Box>
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              TupacCRM
            </Text>
          </HStack>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggle}
          ml={isExpanded ? 0 : 'auto'}
          mr={isExpanded ? 0 : 'auto'}
        >
          <Icon as={isExpanded ? ChevronLeft : ChevronRight} />
        </Button>
      </Flex>

      {/* Links principales */}
      <VStack spacing={1} px={3} py={4} align="stretch" flex={1} overflowY="auto">
        {mainLinks.map((link) => (
          <Link key={link.href} href={link.href} style={{ width: '100%' }}>
            <Flex
              px={3}
              py={2.5}
              borderRadius="lg"
              align="center"
              bg={isActive(link.href) ? 'brand.50' : 'transparent'}
              color={isActive(link.href) ? 'brand.500' : 'gray.600'}
              fontWeight={isActive(link.href) ? 'semibold' : 'medium'}
              _hover={{ bg: isActive(link.href) ? 'brand.50' : 'gray.100' }}
              cursor="pointer"
              transition="all 0.2s"
            >
              <Icon as={link.icon} boxSize={5} />
              {isExpanded && (
                <Text ml={3} fontSize="sm">
                  {link.name}
                </Text>
              )}
            </Flex>
          </Link>
        ))}

        {/* Secciones con Accordion (solo cuando está expandido) */}
        {isExpanded && (
          <Accordion allowMultiple mt={2}>
            {sections.map((section, idx) => (
              <AccordionItem key={idx} border="none">
                <AccordionButton
                  px={3}
                  py={2}
                  borderRadius="lg"
                  _hover={{ bg: 'gray.100' }}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      {section.title}
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={2} px={0}>
                  <VStack spacing={1} align="stretch">
                    {section.items.map((item) => (
                      <Link key={item.href} href={item.href} style={{ width: '100%' }}>
                        <Flex
                          px={6}
                          py={2}
                          align="center"
                          color={isActive(item.href) ? 'brand.500' : 'gray.600'}
                          fontWeight={isActive(item.href) ? 'semibold' : 'normal'}
                          _hover={{ bg: 'gray.50' }}
                          cursor="pointer"
                          borderRadius="md"
                        >
                          <Text fontSize="sm">{item.name}</Text>
                        </Flex>
                      </Link>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </VStack>

      {/* Footer con info del usuario */}
      {isExpanded && (
        <Box borderTop="1px" borderColor="gray.200" p={4}>
          {/* Usuario */}
          <Link href="/dashboard/settings">
            <Flex
              align="center"
              p={2}
              borderRadius="lg"
              _hover={{ bg: 'gray.100' }}
              cursor="pointer"
            >
              <Avatar size="sm" name="Usuario" bg="brand.500" />
              <Box ml={3} flex={1}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                  TUPAC CRM
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Ver perfil
                </Text>
              </Box>
            </Flex>
          </Link>

          {/* Botón de Logout */}
          <Button
            leftIcon={<Icon as={LogOut} />}
            onClick={handleLogout}
            size="sm"
            variant="ghost"
            colorScheme="red"
            w="full"
            mt={2}
            justifyContent="flex-start"
          >
            Cerrar Sesión
          </Button>
        </Box>
      )}

      {/* Versión compacta del footer */}
      {!isExpanded && (
        <Box borderTop="1px" borderColor="gray.200" p={2}>
          <Link href="/dashboard/settings">
            <Flex justify="center" mb={2}>
              <Avatar size="sm" name="Usuario" bg="brand.500" />
            </Flex>
          </Link>
          <Button
            onClick={handleLogout}
            size="sm"
            variant="ghost"
            colorScheme="red"
            w="full"
            p={0}
            minW="auto"
          >
            <Icon as={LogOut} boxSize={5} />
          </Button>
        </Box>
      )}
    </Flex>
  );
}

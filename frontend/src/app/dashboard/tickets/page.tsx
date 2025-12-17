'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Text,
  useToast,
  VStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  FiMoreVertical,
  FiEye,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiMessageSquare,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';

interface Ticket {
  id: string;
  ticketNumber: string;
  type: string;
  status: string;
  priority: string;
  subject: string;
  description?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  contact: {
    id: string;
    name: string;
    phone?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
}

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

const statusColors: Record<string, string> = {
  OPEN: 'red',
  IN_PROGRESS: 'yellow',
  PENDING: 'orange',
  RESOLVED: 'green',
  CLOSED: 'gray',
};

const statusLabels: Record<string, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En Progreso',
  PENDING: 'Pendiente',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
};

const priorityColors: Record<string, string> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const typeLabels: Record<string, string> = {
  COMPLAINT: 'Reclamo',
  QUESTION: 'Consulta',
  RETURN: 'Devolución',
  EXCHANGE: 'Cambio',
  OTHER: 'Otro',
};

export default function TicketsPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modal de resolución
  const [resolution, setResolution] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [statusFilter, priorityFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to load tickets');

      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los tickets',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string, resolutionText?: string) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('accessToken');
      
      const body: any = { status };
      if (resolutionText) body.resolution = resolutionText;
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) throw new Error('Failed to update ticket');

      toast({
        title: 'Éxito',
        description: 'Ticket actualizado',
        status: 'success',
        duration: 2000,
      });

      onClose();
      loadTickets();
      loadStats();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el ticket',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const openResolveModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setResolution(ticket.resolution || '');
    onOpen();
  };

  const handleResolve = () => {
    if (selectedTicket) {
      updateTicketStatus(selectedTicket.id, 'RESOLVED', resolution);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      ticket.ticketNumber.toLowerCase().includes(searchLower) ||
      ticket.subject.toLowerCase().includes(searchLower) ||
      ticket.contact.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg">Reclamos y Tickets</Heading>
          <Text color="gray.600">Gestiona los reclamos de tus clientes</Text>
        </Box>
        <HStack>
          <IconButton
            aria-label="Refrescar"
            icon={<FiRefreshCw />}
            onClick={() => { loadTickets(); loadStats(); }}
            isLoading={loading}
          />
        </HStack>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Total</StatLabel>
          <StatNumber>{stats.total}</StatNumber>
          <StatHelpText>Todos los tickets</StatHelpText>
        </Stat>
        <Stat bg="red.50" p={4} borderRadius="lg" shadow="sm">
          <StatLabel color="red.600">Abiertos</StatLabel>
          <StatNumber color="red.600">{stats.open}</StatNumber>
          <StatHelpText>Requieren atención</StatHelpText>
        </Stat>
        <Stat bg="yellow.50" p={4} borderRadius="lg" shadow="sm">
          <StatLabel color="yellow.600">En Progreso</StatLabel>
          <StatNumber color="yellow.600">{stats.inProgress}</StatNumber>
          <StatHelpText>Siendo atendidos</StatHelpText>
        </Stat>
        <Stat bg="green.50" p={4} borderRadius="lg" shadow="sm">
          <StatLabel color="green.600">Resueltos</StatLabel>
          <StatNumber color="green.600">{stats.resolved}</StatNumber>
          <StatHelpText>Completados</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Filters */}
      <HStack spacing={4} mb={6} bg="white" p={4} borderRadius="lg" shadow="sm">
        <Box flex={1}>
          <Input
            placeholder="Buscar por número, asunto o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftElement={<Icon as={FiSearch} ml={3} color="gray.400" />}
          />
        </Box>
        <Select
          w="200px"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="OPEN">Abiertos</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="PENDING">Pendientes</option>
          <option value="RESOLVED">Resueltos</option>
          <option value="CLOSED">Cerrados</option>
        </Select>
        <Select
          w="200px"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">Todas las prioridades</option>
          <option value="URGENT">Urgente</option>
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Media</option>
          <option value="LOW">Baja</option>
        </Select>
      </HStack>

      {/* Table */}
      <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
        {loading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner size="lg" color="purple.500" />
          </Flex>
        ) : filteredTickets.length === 0 ? (
          <Flex justify="center" align="center" h="200px" direction="column">
            <Icon as={FiMessageSquare} boxSize={12} color="gray.300" mb={4} />
            <Text color="gray.500">No hay tickets</Text>
          </Flex>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Ticket</Th>
                <Th>Cliente</Th>
                <Th>Asunto</Th>
                <Th>Tipo</Th>
                <Th>Prioridad</Th>
                <Th>Estado</Th>
                <Th>Fecha</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredTickets.map((ticket) => (
                <Tr key={ticket.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Text fontWeight="medium" color="purple.600">
                      {ticket.ticketNumber}
                    </Text>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{ticket.contact.name}</Text>
                      {ticket.contact.phone && (
                        <Text fontSize="sm" color="gray.500">
                          {ticket.contact.phone}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td maxW="300px">
                    <Text noOfLines={2}>{ticket.subject}</Text>
                  </Td>
                  <Td>
                    <Badge variant="subtle" colorScheme="purple">
                      {typeLabels[ticket.type] || ticket.type}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={priorityColors[ticket.priority]}>
                      {priorityLabels[ticket.priority] || ticket.priority}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={statusColors[ticket.status]}>
                      {statusLabels[ticket.status] || ticket.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600">
                      {formatDate(ticket.createdAt)}
                    </Text>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        {ticket.status === 'OPEN' && (
                          <MenuItem
                            icon={<FiClock />}
                            onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                          >
                            Marcar En Progreso
                          </MenuItem>
                        )}
                        {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                          <MenuItem
                            icon={<FiCheck />}
                            onClick={() => openResolveModal(ticket)}
                          >
                            Resolver
                          </MenuItem>
                        )}
                        {ticket.status === 'RESOLVED' && (
                          <MenuItem
                            icon={<FiCheck />}
                            onClick={() => updateTicketStatus(ticket.id, 'CLOSED')}
                          >
                            Cerrar
                          </MenuItem>
                        )}
                        <MenuItem icon={<FiEye />}>Ver Conversación</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Modal de Resolución */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Resolver Ticket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTicket && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold">{selectedTicket.ticketNumber}</Text>
                  <Text color="gray.600">{selectedTicket.subject}</Text>
                </Box>
                
                {selectedTicket.description && (
                  <Box bg="gray.50" p={3} borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Descripción:</Text>
                    <Text fontSize="sm">{selectedTicket.description}</Text>
                  </Box>
                )}
                
                <FormControl>
                  <FormLabel>Resolución</FormLabel>
                  <Textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Describe cómo se resolvió el problema..."
                    rows={4}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="green"
              onClick={handleResolve}
              isLoading={updating}
              leftIcon={<FiCheck />}
            >
              Marcar como Resuelto
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

'use client';

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  HStack,
  VStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  useDisclosure,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Divider,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  FiSearch,
  FiDownload,
  FiTag,
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiPhone,
  FiMail,
  FiMessageSquare,
  FiUser,
} from 'react-icons/fi';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source: string;
  status: string;
  score: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'blue',
  CONTACTED: 'cyan',
  QUALIFIED: 'green',
  PROPOSAL: 'purple',
  NEGOTIATION: 'orange',
  WON: 'green',
  LOST: 'red',
};

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nuevo',
  CONTACTED: 'Contactado',
  QUALIFIED: 'Calificado',
  PROPOSAL: 'Propuesta',
  NEGOTIATION: 'Negociación',
  WON: 'Ganado',
  LOST: 'Perdido',
};

const SOURCE_LABELS: Record<string, string> = {
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  TIKTOK: 'TikTok',
  WEBSITE: 'Web',
  MANUAL: 'Manual',
  IMPORT: 'Importado',
};

export default function DatabasePage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const toast = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSource, setFormSource] = useState('MANUAL');
  const [formStatus, setFormStatus] = useState('NEW');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load contacts');

      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los contactos',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormSource('MANUAL');
    setFormStatus('NEW');
  };

  const createContact = async () => {
    if (!formName.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es requerido',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail || undefined,
          phone: formPhone || undefined,
          source: formSource,
          status: formStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create contact');
      }

      toast({
        title: '¡Contacto Creado!',
        description: `"${formName}" se ha agregado correctamente`,
        status: 'success',
        duration: 3000,
      });

      resetForm();
      onClose();
      await loadContacts();
    } catch (error: any) {
      console.error('Error creating contact:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el contacto',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (contact: Contact) => {
    setSelectedContact(contact);
    setFormName(contact.name);
    setFormEmail(contact.email || '');
    setFormPhone(contact.phone || '');
    setFormSource(contact.source);
    setFormStatus(contact.status);
    onEditOpen();
  };

  const updateContact = async () => {
    if (!selectedContact || !formName.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contacts/${selectedContact.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formName,
            email: formEmail || undefined,
            phone: formPhone || undefined,
            source: formSource,
            status: formStatus,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update contact');

      toast({
        title: 'Contacto Actualizado',
        status: 'success',
        duration: 2000,
      });

      resetForm();
      onEditClose();
      await loadContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el contacto',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm('¿Estás seguro de eliminar este contacto?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contacts/${contactId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete contact');

      toast({
        title: 'Contacto Eliminado',
        status: 'success',
        duration: 2000,
      });

      await loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el contacto',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery)
  );

  const exportContacts = () => {
    const csv = [
      ['Nombre', 'Email', 'Teléfono', 'Fuente', 'Estado', 'Score', 'Tags'].join(','),
      ...contacts.map((c) =>
        [
          c.name,
          c.email || '',
          c.phone || '',
          c.source,
          c.status,
          c.score,
          c.tags.join(';'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contactos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: 'Exportación completada',
      description: `${contacts.length} contactos exportados`,
      status: 'success',
      duration: 3000,
    });
  };

  return (
    <Flex direction="column" w="full" h="100vh" bg="#FEFEFE" overflow="hidden">
      {/* Header Section */}
      <Box p={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={3}>
            <Box
              p={2}
              bg="linear-gradient(135deg, #9D39FE 0%, #6366F1 100%)"
              borderRadius="xl"
            >
              <Icon as={FiUser} boxSize={6} color="white" />
            </Box>
            <Box>
              <Heading fontSize="2xl" fontWeight="bold" color="gray.800">
                Contactos
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {contacts.length} contactos en la base de datos
              </Text>
            </Box>
          </HStack>

          <Button
            leftIcon={<FiPlus />}
            bg="#9D39FE"
            color="white"
            size="md"
            _hover={{ bg: '#8B2FE6' }}
            borderRadius="xl"
            fontWeight="medium"
            px={6}
            onClick={onOpen}
          >
            Nuevo Contacto
          </Button>
        </Flex>

        {/* Search and Actions Bar */}
        <Flex gap={3} mb={4}>
          <InputGroup flex="1" maxW="400px">
            <InputLeftElement h="full">
              <Icon as={FiSearch} boxSize={5} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              h="42px"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              _placeholder={{ color: 'gray.400' }}
              _focus={{
                borderColor: '#9D39FE',
                boxShadow: '0 0 0 1px #9D39FE',
              }}
            />
          </InputGroup>

          <Flex gap={2}>
            <Button
              leftIcon={<FiTag />}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              color="gray.700"
              size="md"
              _hover={{ bg: 'gray.50' }}
              borderRadius="lg"
              fontWeight="medium"
              px={4}
            >
              Filtrar por Tags
            </Button>

            <Button
              leftIcon={<FiDownload />}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              color="gray.700"
              size="md"
              _hover={{ bg: 'gray.50' }}
              borderRadius="lg"
              fontWeight="medium"
              px={4}
              onClick={exportContacts}
              isDisabled={contacts.length === 0}
            >
              Exportar CSV
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Content */}
      <Box flex="1" px={6} pb={6} overflowY="auto">
        {loading && contacts.length === 0 ? (
          <Flex justify="center" align="center" h="300px">
            <Spinner size="xl" color="purple.500" />
          </Flex>
        ) : contacts.length === 0 ? (
          /* Empty State */
          <Flex
            flex="1"
            direction="column"
            align="center"
            justify="center"
            p={8}
            minH="400px"
          >
            <Box
              w="350px"
              h="220px"
              bg="gray.100"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={6}
            >
              <Icon as={FiUser} boxSize={20} color="gray.400" />
            </Box>

            <Heading fontSize="xl" fontWeight="semibold" color="gray.800" mb={2}>
              Aún no hay contactos
            </Heading>

            <Text fontSize="md" color="gray.600" mb={8} textAlign="center">
              ¡Agrega tu primer contacto o conecta WhatsApp para empezar!
            </Text>

            <Button
              leftIcon={<FiPlus />}
              bg="#9D39FE"
              color="white"
              size="lg"
              _hover={{ bg: '#8B2FE6' }}
              borderRadius="lg"
              fontWeight="semibold"
              px={8}
              py={6}
              onClick={onOpen}
            >
              Agregar Contacto
            </Button>
          </Flex>
        ) : (
          /* Contacts Table */
          <Box
            bg="white"
            borderRadius="xl"
            border="1px"
            borderColor="gray.200"
            overflow="hidden"
          >
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Contacto</Th>
                  <Th>Teléfono</Th>
                  <Th>Fuente</Th>
                  <Th>Estado</Th>
                  <Th>Score</Th>
                  <Th>Tags</Th>
                  <Th width="50px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredContacts.map((contact) => (
                  <Tr
                    key={contact.id}
                    _hover={{ bg: 'gray.50' }}
                    transition="all 0.2s"
                  >
                    <Td>
                      <HStack spacing={3}>
                        <Avatar size="sm" name={contact.name} bg="purple.500" />
                        <Box>
                          <Text fontWeight="medium">{contact.name}</Text>
                          {contact.email && (
                            <Text fontSize="xs" color="gray.500">
                              {contact.email}
                            </Text>
                          )}
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      {contact.phone ? (
                        <HStack spacing={1}>
                          <Icon as={FiPhone} boxSize={3} color="gray.400" />
                          <Text fontSize="sm">{contact.phone}</Text>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="gray.400">
                          -
                        </Text>
                      )}
                    </Td>
                    <Td>
                      <Badge colorScheme="gray" borderRadius="full" fontSize="xs">
                        {SOURCE_LABELS[contact.source] || contact.source}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={STATUS_COLORS[contact.status] || 'gray'}
                        borderRadius="full"
                        fontSize="xs"
                      >
                        {STATUS_LABELS[contact.status] || contact.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          contact.score >= 80
                            ? 'green'
                            : contact.score >= 50
                            ? 'yellow'
                            : 'gray'
                        }
                        borderRadius="full"
                        fontSize="xs"
                      >
                        {contact.score}
                      </Badge>
                    </Td>
                    <Td>
                      <Wrap spacing={1}>
                        {contact.tags.slice(0, 2).map((tag, idx) => (
                          <WrapItem key={idx}>
                            <Tag size="sm" colorScheme="purple" borderRadius="full">
                              <TagLabel>{tag}</TagLabel>
                            </Tag>
                          </WrapItem>
                        ))}
                        {contact.tags.length > 2 && (
                          <WrapItem>
                            <Tag size="sm" colorScheme="gray" borderRadius="full">
                              <TagLabel>+{contact.tags.length - 2}</TagLabel>
                            </Tag>
                          </WrapItem>
                        )}
                      </Wrap>
                    </Td>
                    <Td>
                      <Menu isLazy placement="bottom-end">
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                          aria-label="Opciones"
                          borderRadius="lg"
                          _hover={{ bg: 'gray.100' }}
                        />
                        <MenuList shadow="xl" borderRadius="xl" zIndex={1000} minW="150px">
                          <MenuItem
                            icon={<FiMessageSquare />}
                            onClick={() =>
                              (window.location.href = `/dashboard/chat?contact=${contact.id}`)
                            }
                          >
                            Ver Conversación
                          </MenuItem>
                          <MenuItem
                            icon={<FiEdit2 />}
                            onClick={() => openEditModal(contact)}
                          >
                            Editar
                          </MenuItem>
                          <Divider my={1} />
                          <MenuItem
                            icon={<FiTrash2 />}
                            color="red.500"
                            onClick={() => deleteContact(contact.id)}
                          >
                            Eliminar
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {filteredContacts.length === 0 && searchQuery && (
              <Flex justify="center" align="center" py={12}>
                <VStack spacing={2}>
                  <Icon as={FiSearch} boxSize={8} color="gray.300" />
                  <Text color="gray.500">
                    No se encontraron resultados para "{searchQuery}"
                  </Text>
                </VStack>
              </Flex>
            )}
          </Box>
        )}
      </Box>

      {/* Modal de Creación */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" mx={4}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box
                p={2}
                bg="linear-gradient(135deg, #9D39FE 0%, #6366F1 100%)"
                borderRadius="xl"
              >
                <Icon as={FiPlus} boxSize={5} color="white" />
              </Box>
              <Box>
                <Text>Nuevo Contacto</Text>
                <Text fontSize="sm" fontWeight="normal" color="gray.500">
                  Agrega un nuevo contacto a tu base de datos
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Nombre
                </FormLabel>
                <Input
                  placeholder="Nombre completo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  borderRadius="xl"
                  size="lg"
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    borderRadius="xl"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Teléfono
                  </FormLabel>
                  <Input
                    placeholder="+52 123 456 7890"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    borderRadius="xl"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Fuente
                  </FormLabel>
                  <Select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    borderRadius="xl"
                  >
                    <option value="MANUAL">Manual</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="WEBSITE">Sitio Web</option>
                    <option value="IMPORT">Importado</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Estado
                  </FormLabel>
                  <Select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    borderRadius="xl"
                  >
                    <option value="NEW">Nuevo</option>
                    <option value="CONTACTED">Contactado</option>
                    <option value="QUALIFIED">Calificado</option>
                    <option value="PROPOSAL">Propuesta</option>
                    <option value="NEGOTIATION">Negociación</option>
                    <option value="WON">Ganado</option>
                    <option value="LOST">Perdido</option>
                  </Select>
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose} borderRadius="xl">
              Cancelar
            </Button>
            <Button
              bg="#9D39FE"
              color="white"
              _hover={{ bg: '#8B2FE6' }}
              onClick={createContact}
              isLoading={loading}
              isDisabled={!formName.trim()}
              borderRadius="xl"
              px={8}
            >
              Crear Contacto
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Edición */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" mx={4}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box
                p={2}
                bg="linear-gradient(135deg, #9D39FE 0%, #6366F1 100%)"
                borderRadius="xl"
              >
                <Icon as={FiEdit2} boxSize={5} color="white" />
              </Box>
              <Box>
                <Text>Editar Contacto</Text>
                <Text fontSize="sm" fontWeight="normal" color="gray.500">
                  Modifica la información del contacto
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Nombre
                </FormLabel>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  borderRadius="xl"
                  size="lg"
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    borderRadius="xl"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Teléfono
                  </FormLabel>
                  <Input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    borderRadius="xl"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Fuente
                  </FormLabel>
                  <Select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    borderRadius="xl"
                  >
                    <option value="MANUAL">Manual</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="WEBSITE">Sitio Web</option>
                    <option value="IMPORT">Importado</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Estado
                  </FormLabel>
                  <Select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    borderRadius="xl"
                  >
                    <option value="NEW">Nuevo</option>
                    <option value="CONTACTED">Contactado</option>
                    <option value="QUALIFIED">Calificado</option>
                    <option value="PROPOSAL">Propuesta</option>
                    <option value="NEGOTIATION">Negociación</option>
                    <option value="WON">Ganado</option>
                    <option value="LOST">Perdido</option>
                  </Select>
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onEditClose} borderRadius="xl">
              Cancelar
            </Button>
            <Button
              bg="#9D39FE"
              color="white"
              _hover={{ bg: '#8B2FE6' }}
              onClick={updateContact}
              isLoading={loading}
              isDisabled={!formName.trim()}
              borderRadius="xl"
              px={8}
            >
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

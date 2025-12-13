'use client';

import {
  Box,
  Button,
  Container,
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
  Badge,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  FiMessageSquare,
  FiMoreVertical,
  FiPlus,
  FiSend,
  FiTrash2,
} from 'react-icons/fi';

// Iconos personalizados
const MagicWandIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M7.5,5.6L5,7L6.4,4.5L5,2L7.5,3.4L10,2L8.6,4.5L10,7L7.5,5.6M19.5,15.4L22,14L20.6,16.5L22,19L19.5,17.6L17,19L18.4,16.5L17,14L19.5,15.4M22,2L20.6,4.5L22,7L19.5,5.6L17,7L18.4,4.5L17,2L19.5,3.4L22,2M13.34,12.78L15.78,10.34L13.66,8.22L11.22,10.66L13.34,12.78M14.37,7.29L16.71,9.63C17.1,10 17.1,10.65 16.71,11.04L5.04,22.71C4.65,23.1 4,23.1 3.63,22.71L1.29,20.37C0.9,20 0.9,19.35 1.29,18.96L12.96,7.29C13.35,6.9 14,6.9 14.37,7.29Z"
    />
  </Icon>
);

const EditIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
    />
  </Icon>
);

const RobotIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"
    />
  </Icon>
);

interface Assistant {
  id: string;
  name: string;
  description?: string;
  instructions: string;
  model: string;
  temperature: number;
  isActive: boolean;
  createdAt: string;
}

interface TestMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function TestingPage() {
  const [mode, setMode] = useState<'ai' | 'manual'>('manual');
  const [message, setMessage] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Estados para asistentes
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingLoading, setTestingLoading] = useState(false);
  
  // Estados para creación de asistente
  const [assistantName, setAssistantName] = useState('');
  const [assistantDescription, setAssistantDescription] = useState('');
  const [assistantInstructions, setAssistantInstructions] = useState('');
  const [assistantModel, setAssistantModel] = useState('gpt-4-turbo-preview');
  const [assistantTemperature, setAssistantTemperature] = useState('0.7');

  // Cargar asistentes al montar
  useEffect(() => {
    loadAssistants();
  }, []);

  // Cargar mensajes cuando se selecciona un asistente
  useEffect(() => {
    if (selectedAssistant) {
      loadTestMessages(selectedAssistant.id);
    }
  }, [selectedAssistant]);

  const loadAssistants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Token:', token ? 'exists' : 'missing');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load assistants');

      const data = await response.json();
      setAssistants(data);

      // Seleccionar el primer asistente si existe
      if (data.length > 0 && !selectedAssistant) {
        setSelectedAssistant(data[0]);
      }
    } catch (error) {
      console.error('Error loading assistants:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los asistentes',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTestMessages = async (assistantId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assistants/${assistantId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();
      setTestMessages(data);
    } catch (error) {
      console.error('Error loading test messages:', error);
    }
  };

  const createAssistantManual = async () => {
    if (!assistantName || !assistantInstructions) {
      toast({
        title: 'Error',
        description: 'El nombre y las instrucciones son requeridos',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: assistantName,
          description: assistantDescription,
          instructions: assistantInstructions,
          model: assistantModel,
          temperature: parseFloat(assistantTemperature),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create assistant');
      }

      const newAssistant = await response.json();
      
      toast({
        title: 'Éxito',
        description: `Asistente "${newAssistant.name}" creado correctamente`,
        status: 'success',
        duration: 3000,
      });

      // Limpiar formulario
      setAssistantName('');
      setAssistantDescription('');
      setAssistantInstructions('');
      setAssistantModel('gpt-4-turbo-preview');
      setAssistantTemperature('0.7');
      
      // Recargar lista y cerrar modal
      await loadAssistants();
      setSelectedAssistant(newAssistant);
      onClose();
    } catch (error: any) {
      console.error('Error creating assistant:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el asistente',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!message.trim() || !selectedAssistant) return;

    try {
      setTestingLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assistants/${selectedAssistant.id}/test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: message.trim(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      // Recargar mensajes
      await loadTestMessages(selectedAssistant.id);
      setMessage('');
      
    } catch (error: any) {
      console.error('Error sending test message:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el mensaje',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setTestingLoading(false);
    }
  };

  const deleteAssistant = async (assistantId: string) => {
    if (!confirm('¿Estás seguro de eliminar este asistente?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assistants/${assistantId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete assistant');

      toast({
        title: 'Éxito',
        description: 'Asistente eliminado correctamente',
        status: 'success',
        duration: 3000,
      });

      // Si era el seleccionado, limpiar selección
      if (selectedAssistant?.id === assistantId) {
        setSelectedAssistant(null);
        setTestMessages([]);
      }

      await loadAssistants();
    } catch (error) {
      console.error('Error deleting assistant:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el asistente',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const clearMessages = async () => {
    if (!selectedAssistant) return;
    if (!confirm('¿Estás seguro de limpiar el historial de mensajes?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assistants/${selectedAssistant.id}/messages`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to clear messages');

      setTestMessages([]);
      toast({
        title: 'Éxito',
        description: 'Historial limpiado correctamente',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast({
        title: 'Error',
        description: 'No se pudo limpiar el historial',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">Asistentes</Heading>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
            Crear Asistente
          </Button>
        </Flex>

        {/* Main Content */}
        <Flex gap={6}>
          {/* Lista de Asistentes */}
          <Box w="300px" bg="white" borderRadius="lg" p={4} shadow="sm">
            <Heading size="sm" mb={4}>
              Mis Asistentes
            </Heading>
            {loading ? (
              <Flex justify="center" py={8}>
                <Spinner />
              </Flex>
            ) : assistants.length === 0 ? (
              <Text color="gray.500" fontSize="sm" textAlign="center" py={8}>
                No tienes asistentes aún
              </Text>
            ) : (
              <VStack spacing={2} align="stretch">
                {assistants.map((assistant) => (
                  <Flex
                    key={assistant.id}
                    p={3}
                    bg={selectedAssistant?.id === assistant.id ? 'blue.50' : 'gray.50'}
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => setSelectedAssistant(assistant)}
                    justify="space-between"
                    align="center"
                  >
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontWeight="medium" fontSize="sm">
                        {assistant.name}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {assistant.model}
                      </Text>
                    </VStack>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <MenuList>
                        <MenuItem
                          icon={<FiTrash2 />}
                          onClick={() => deleteAssistant(assistant.id)}
                        >
                          Eliminar
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                ))}
              </VStack>
            )}
          </Box>

          {/* Área de Pruebas */}
          <Box flex={1} bg="white" borderRadius="lg" p={6} shadow="sm">
            {selectedAssistant ? (
              <VStack spacing={4} align="stretch" h="600px">
                {/* Header del Asistente */}
                <Flex justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Heading size="md">{selectedAssistant.name}</Heading>
                    {selectedAssistant.description && (
                      <Text fontSize="sm" color="gray.600">
                        {selectedAssistant.description}
                      </Text>
                    )}
                  </VStack>
                  <Button size="sm" variant="ghost" onClick={clearMessages}>
                    Limpiar Chat
                  </Button>
                </Flex>

                <Divider />

                {/* Mensajes */}
                <Box
                  flex={1}
                  overflowY="auto"
                  p={4}
                  bg="gray.50"
                  borderRadius="md"
                >
                  {testMessages.length === 0 ? (
                    <Text color="gray.500" textAlign="center" py={8}>
                      Envía un mensaje para probar el asistente
                    </Text>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {testMessages.map((msg) => (
                        <Flex
                          key={msg.id}
                          justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                        >
                          <Box
                            maxW="70%"
                            bg={msg.role === 'user' ? 'blue.500' : 'white'}
                            color={msg.role === 'user' ? 'white' : 'gray.800'}
                            p={3}
                            borderRadius="lg"
                            shadow="sm"
                          >
                            <Text fontSize="sm" whiteSpace="pre-wrap">
                              {msg.content}
                            </Text>
                          </Box>
                        </Flex>
                      ))}
                    </VStack>
                  )}
                </Box>

                {/* Input de Mensaje */}
                <HStack>
                  <Textarea
                    placeholder="Escribe un mensaje..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendTestMessage();
                      }
                    }}
                    rows={2}
                  />
                  <IconButton
                    aria-label="Enviar"
                    icon={testingLoading ? <Spinner size="sm" /> : <FiSend />}
                    colorScheme="blue"
                    isDisabled={!message.trim() || testingLoading}
                    onClick={sendTestMessage}
                  />
                </HStack>
              </VStack>
            ) : (
              <Flex justify="center" align="center" h="600px">
                <VStack spacing={4}>
                  <Icon as={RobotIcon} boxSize={16} color="gray.400" />
                  <Text color="gray.500">
                    Selecciona un asistente para comenzar
                  </Text>
                </VStack>
              </Flex>
            )}
          </Box>
        </Flex>
      </VStack>

      {/* Modal de Creación */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent>
          <ModalHeader>Crear Nuevo Asistente</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Selector de Modo */}
            <HStack mb={6} spacing={4}>
              <Button
                leftIcon={<EditIcon />}
                onClick={() => setMode('manual')}
                colorScheme={mode === 'manual' ? 'blue' : 'gray'}
                variant={mode === 'manual' ? 'solid' : 'outline'}
                flex={1}
              >
                Manual
              </Button>
              <Button
                leftIcon={<MagicWandIcon />}
                onClick={() => setMode('ai')}
                colorScheme={mode === 'ai' ? 'purple' : 'gray'}
                variant={mode === 'ai' ? 'solid' : 'outline'}
                flex={1}
                isDisabled
              >
                Con IA (Próximamente)
              </Button>
            </HStack>

            {mode === 'manual' && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Nombre
                  </Text>
                  <Input
                    placeholder="Ej: Asistente de Ventas"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                  />
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Descripción (opcional)
                  </Text>
                  <Input
                    placeholder="Breve descripción del asistente"
                    value={assistantDescription}
                    onChange={(e) => setAssistantDescription(e.target.value)}
                  />
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Instrucciones del Sistema
                  </Text>
                  <Textarea
                    placeholder="Define cómo debe comportarse el asistente..."
                    value={assistantInstructions}
                    onChange={(e) => setAssistantInstructions(e.target.value)}
                    rows={6}
                  />
                </Box>

                <Flex gap={4}>
                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">
                      Modelo
                    </Text>
                    <Select
                      value={assistantModel}
                      onChange={(e) => setAssistantModel(e.target.value)}
                    >
                      <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </Select>
                  </Box>

                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">
                      Temperatura
                    </Text>
                    <Input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={assistantTemperature}
                      onChange={(e) => setAssistantTemperature(e.target.value)}
                    />
                  </Box>
                </Flex>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={createAssistantManual}
              isLoading={loading}
              isDisabled={!assistantName || !assistantInstructions}
            >
              Crear Asistente
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

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
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
  Badge,
  Divider,
  Spinner,
  Avatar,
  Tooltip,
  FormControl,
  FormLabel,
  FormHelperText,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Image,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  FiMessageSquare,
  FiMoreVertical,
  FiPlus,
  FiSend,
  FiTrash2,
  FiImage,
  FiX,
  FiSettings,
  FiEye,
  FiRefreshCw,
  FiUpload,
} from 'react-icons/fi';

// Iconos personalizados
const RobotIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"
    />
  </Icon>
);

const SparklesIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12,2L14.4,8.6L21,9L16.5,14L18,21L12,17.5L6,21L7.5,14L3,9L9.6,8.6L12,2Z"
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
  openaiId?: string;
}

interface TestMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  imageUrl?: string;
}

// Modelos disponibles con sus capacidades
const AVAILABLE_MODELS = [
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o', 
    description: 'Más inteligente, con visión',
    vision: true,
    badge: 'Recomendado',
    badgeColor: 'green'
  },
  { 
    id: 'gpt-4o-mini', 
    name: 'GPT-4o Mini', 
    description: 'Rápido y económico, con visión',
    vision: true,
    badge: 'Económico',
    badgeColor: 'blue'
  },
  { 
    id: 'gpt-4-turbo', 
    name: 'GPT-4 Turbo', 
    description: 'Potente, con visión',
    vision: true,
    badge: null,
    badgeColor: null
  },
  { 
    id: 'gpt-3.5-turbo', 
    name: 'GPT-3.5 Turbo', 
    description: 'Rápido y económico',
    vision: false,
    badge: null,
    badgeColor: null
  },
];

export default function AssistantsPage() {
  const [message, setMessage] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para asistentes
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingLoading, setTestingLoading] = useState(false);
  
  // Estados para edición de asistente
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editModel, setEditModel] = useState('gpt-4o');
  const [editTemperature, setEditTemperature] = useState(0.7);
  
  // Estados para imágenes
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Estados para creación de asistente
  const [assistantName, setAssistantName] = useState('');
  const [assistantDescription, setAssistantDescription] = useState('');
  const [assistantInstructions, setAssistantInstructions] = useState('');
  const [assistantModel, setAssistantModel] = useState('gpt-4o');
  const [assistantTemperature, setAssistantTemperature] = useState(0.7);

  // Scroll to bottom cuando hay nuevos mensajes
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [testMessages, scrollToBottom]);

  // Cargar asistentes al montar
  useEffect(() => {
    loadAssistants();
  }, []);

  // Cargar mensajes cuando se selecciona un asistente
  useEffect(() => {
    if (selectedAssistant) {
      loadMessages(selectedAssistant.id);
    }
  }, [selectedAssistant]);

  const loadAssistants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load assistants');

      const data = await response.json();
      setAssistants(data);

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

  const loadMessages = async (assistantId: string) => {
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

  const resetForm = () => {
    setAssistantName('');
    setAssistantDescription('');
    setAssistantInstructions('');
    setAssistantModel('gpt-4o');
    setAssistantTemperature(0.7);
  };

  const createAssistant = async () => {
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
          temperature: assistantTemperature,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create assistant');
      }

      const newAssistant = await response.json();
      
      toast({
        title: '¡Asistente Creado!',
        description: `"${newAssistant.name}" está listo para ayudarte`,
        status: 'success',
        duration: 3000,
      });

      resetForm();
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

  // Manejo de imágenes
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
  };

  const addImages = (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size < 20 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      toast({
        title: 'Aviso',
        description: 'Algunas imágenes fueron ignoradas (máx 20MB, solo imágenes)',
        status: 'warning',
        duration: 3000,
      });
    }

    setSelectedImages(prev => [...prev, ...validFiles].slice(0, 5));
    
    // Crear previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagesPreviews(prev => [...prev, e.target?.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const sendTestMessage = async () => {
    if ((!message.trim() && selectedImages.length === 0) || !selectedAssistant) return;

    try {
      setTestingLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Preparar contenido con imágenes si las hay
      let content: any = message.trim();
      
      if (selectedImages.length > 0) {
        const imagePromises = selectedImages.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        });
        
        const base64Images = await Promise.all(imagePromises);
        
        content = {
          text: message.trim() || 'Analiza esta imagen',
          images: base64Images,
        };
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assistants/${selectedAssistant.id}/test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: typeof content === 'string' ? content : JSON.stringify(content),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      // Limpiar inputs
      setMessage('');
      setSelectedImages([]);
      setImagesPreviews([]);
      
      // Recargar mensajes
      await loadMessages(selectedAssistant.id);
      
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
    if (!confirm('¿Estás seguro de eliminar este asistente? Esta acción no se puede deshacer.')) return;

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
        title: 'Asistente eliminado',
        status: 'success',
        duration: 3000,
      });

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
    if (!confirm('¿Limpiar todo el historial de conversación?')) return;

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
        title: 'Historial limpiado',
        status: 'success',
        duration: 2000,
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

  // Abrir modal de edición
  const openEditModal = () => {
    if (!selectedAssistant) return;
    setEditName(selectedAssistant.name);
    setEditDescription(selectedAssistant.description || '');
    setEditInstructions(selectedAssistant.instructions);
    setEditModel(selectedAssistant.model);
    setEditTemperature(selectedAssistant.temperature);
    onEditOpen();
  };

  // Actualizar asistente
  const updateAssistant = async () => {
    if (!selectedAssistant || !editName || !editInstructions) {
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assistants/${selectedAssistant.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName,
            description: editDescription,
            instructions: editInstructions,
            model: editModel,
            temperature: editTemperature,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update assistant');
      }

      const updatedAssistant = await response.json();

      toast({
        title: '¡Asistente Actualizado!',
        description: `"${updatedAssistant.name}" ha sido actualizado`,
        status: 'success',
        duration: 3000,
      });

      await loadAssistants();
      setSelectedAssistant(updatedAssistant);
      onEditClose();
    } catch (error: any) {
      console.error('Error updating assistant:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el asistente',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Duplicar asistente
  const duplicateAssistant = async (assistant: Assistant) => {
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
          name: `${assistant.name} (copia)`,
          description: assistant.description,
          instructions: assistant.instructions,
          model: assistant.model,
          temperature: assistant.temperature,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to duplicate assistant');
      }

      const newAssistant = await response.json();

      toast({
        title: '¡Asistente Duplicado!',
        description: `"${newAssistant.name}" creado`,
        status: 'success',
        duration: 3000,
      });

      await loadAssistants();
      setSelectedAssistant(newAssistant);
    } catch (error: any) {
      console.error('Error duplicating assistant:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo duplicar el asistente',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" px={6} py={4}>
        <Flex justify="space-between" align="center" maxW="1600px" mx="auto">
          <HStack spacing={3}>
            <Box
              p={2}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              borderRadius="xl"
            >
              <Icon as={RobotIcon} boxSize={6} color="white" />
            </Box>
            <Box>
              <Heading size="md" bgGradient="linear(to-r, purple.600, blue.500)" bgClip="text">
                Asistentes IA
              </Heading>
              <Text fontSize="xs" color="gray.500">
                Crea y prueba asistentes con GPT-4o Vision
              </Text>
            </Box>
          </HStack>
          
          <Button 
            leftIcon={<FiPlus />} 
            bgGradient="linear(to-r, purple.500, blue.500)"
            color="white"
            _hover={{ bgGradient: "linear(to-r, purple.600, blue.600)" }}
            onClick={onOpen}
            size="md"
            borderRadius="xl"
            shadow="md"
          >
            Nuevo Asistente
          </Button>
        </Flex>
      </Box>

      {/* Main Content */}
      <Flex maxW="1600px" mx="auto" p={6} gap={6} minH="calc(100vh - 80px)">
        {/* Sidebar - Lista de Asistentes */}
        <Box 
          w="320px" 
          bg="white" 
          borderRadius="2xl" 
          shadow="sm"
          border="1px"
          borderColor="gray.200"
          overflow="hidden"
        >
          <Box p={4} borderBottom="1px" borderColor="gray.100">
            <HStack justify="space-between">
              <Text fontWeight="semibold" color="gray.700">
                Mis Asistentes
              </Text>
              <Badge colorScheme="purple" borderRadius="full" px={2}>
                {assistants.length}
              </Badge>
            </HStack>
          </Box>
          
          <Box p={3} maxH="calc(100vh - 200px)" overflowY="auto">
            {loading ? (
              <Flex justify="center" py={8}>
                <Spinner color="purple.500" />
              </Flex>
            ) : assistants.length === 0 ? (
              <VStack py={8} spacing={3}>
                <Icon as={RobotIcon} boxSize={12} color="gray.300" />
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  No tienes asistentes aún
                </Text>
                <Button size="sm" colorScheme="purple" variant="ghost" onClick={onOpen}>
                  Crear el primero
                </Button>
              </VStack>
            ) : (
              <VStack spacing={2} align="stretch">
                {assistants.map((assistant) => {
                  const modelInfo = AVAILABLE_MODELS.find(m => m.id === assistant.model);
                  return (
                    <Box
                      key={assistant.id}
                      p={3}
                      bg={selectedAssistant?.id === assistant.id ? 'purple.50' : 'gray.50'}
                      borderRadius="xl"
                      cursor="pointer"
                      onClick={() => setSelectedAssistant(assistant)}
                      border="2px"
                      borderColor={selectedAssistant?.id === assistant.id ? 'purple.300' : 'transparent'}
                      transition="all 0.2s"
                      _hover={{ 
                        bg: selectedAssistant?.id === assistant.id ? 'purple.50' : 'gray.100',
                        transform: 'translateX(4px)'
                      }}
                    >
                      <Flex justify="space-between" align="start">
                        <HStack spacing={3} flex={1}>
                          <Avatar 
                            size="sm" 
                            name={assistant.name}
                            bg={selectedAssistant?.id === assistant.id ? 'purple.500' : 'gray.400'}
                            icon={<Icon as={RobotIcon} boxSize={4} />}
                          />
                          <Box flex={1} overflow="hidden">
                            <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                              {assistant.name}
                            </Text>
                            <HStack spacing={1} mt={1}>
                              <Badge 
                                fontSize="2xs" 
                                colorScheme={modelInfo?.vision ? 'green' : 'gray'}
                                borderRadius="full"
                              >
                                {modelInfo?.name || assistant.model}
                              </Badge>
                              {modelInfo?.vision && (
                                <Tooltip label="Soporta imágenes">
                                  <Badge fontSize="2xs" colorScheme="blue" borderRadius="full">
                                    <HStack spacing={0.5}>
                                      <Icon as={FiEye} boxSize={2} />
                                      <Text>Vision</Text>
                                    </HStack>
                                  </Badge>
                                </Tooltip>
                              )}
                            </HStack>
                          </Box>
                        </HStack>
                        
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="xs"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <MenuList shadow="lg" borderRadius="xl">
                            <MenuItem 
                              icon={<FiSettings />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAssistant(assistant);
                                setEditName(assistant.name);
                                setEditDescription(assistant.description || '');
                                setEditInstructions(assistant.instructions);
                                setEditModel(assistant.model);
                                setEditTemperature(assistant.temperature);
                                onEditOpen();
                              }}
                            >
                              Editar
                            </MenuItem>
                            <MenuItem 
                              icon={<FiRefreshCw />}
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateAssistant(assistant);
                              }}
                            >
                              Duplicar
                            </MenuItem>
                            <Divider my={1} />
                            <MenuItem 
                              icon={<FiTrash2 />} 
                              color="red.500"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAssistant(assistant.id);
                              }}
                            >
                              Eliminar
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>
        </Box>

        {/* Área de Chat */}
        <Box 
          flex={1} 
          bg="white" 
          borderRadius="2xl" 
          shadow="sm"
          border="1px"
          borderColor="gray.200"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          {selectedAssistant ? (
            <>
              {/* Header del Chat */}
              <Box p={4} borderBottom="1px" borderColor="gray.100" bg="gray.50">
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Avatar 
                      size="md" 
                      name={selectedAssistant.name}
                      bg="purple.500"
                      icon={<Icon as={RobotIcon} boxSize={5} />}
                    />
                    <Box>
                      <HStack>
                        <Heading size="sm">{selectedAssistant.name}</Heading>
                        <Badge colorScheme="green" borderRadius="full" fontSize="2xs">
                          Activo
                        </Badge>
                      </HStack>
                      {selectedAssistant.description && (
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {selectedAssistant.description}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                  
                  <HStack>
                    <Tooltip label="Limpiar conversación">
                      <IconButton
                        aria-label="Clear"
                        icon={<FiRefreshCw />}
                        variant="ghost"
                        size="sm"
                        onClick={clearMessages}
                      />
                    </Tooltip>
                    <Tooltip label="Configuración del asistente">
                      <IconButton
                        aria-label="Settings"
                        icon={<FiSettings />}
                        variant="ghost"
                        size="sm"
                        onClick={openEditModal}
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
              </Box>

              {/* Mensajes */}
              <Box 
                flex={1} 
                overflowY="auto" 
                p={4}
                bg="gray.50"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                position="relative"
              >
                {isDragging && (
                  <Box
                    position="absolute"
                    inset={0}
                    bg="purple.50"
                    border="3px dashed"
                    borderColor="purple.300"
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={10}
                  >
                    <VStack>
                      <Icon as={FiUpload} boxSize={12} color="purple.400" />
                      <Text color="purple.600" fontWeight="medium">
                        Suelta las imágenes aquí
                      </Text>
                    </VStack>
                  </Box>
                )}
                
                {testMessages.length === 0 ? (
                  <VStack justify="center" h="full" spacing={4} py={12}>
                    <Box
                      p={4}
                      bg="white"
                      borderRadius="2xl"
                      shadow="sm"
                    >
                      <Icon as={SparklesIcon} boxSize={12} color="purple.300" />
                    </Box>
                    <Text color="gray.500" textAlign="center" fontSize="sm">
                      Inicia una conversación con <strong>{selectedAssistant.name}</strong>
                    </Text>
                    {AVAILABLE_MODELS.find(m => m.id === selectedAssistant.model)?.vision && (
                      <HStack>
                        <Icon as={FiImage} color="blue.400" />
                        <Text fontSize="xs" color="gray.500">
                          Puedes enviar imágenes arrastrándolas aquí
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {testMessages.map((msg) => (
                      <Flex
                        key={msg.id}
                        justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                      >
                        <HStack 
                          align="start" 
                          spacing={3}
                          maxW="75%"
                          flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'}
                        >
                          <Avatar 
                            size="sm"
                            name={msg.role === 'user' ? 'U' : selectedAssistant.name}
                            bg={msg.role === 'user' ? 'blue.500' : 'purple.500'}
                            icon={msg.role === 'assistant' ? <Icon as={RobotIcon} boxSize={3} /> : undefined}
                          />
                          <Box
                            bg={msg.role === 'user' ? 'blue.500' : 'white'}
                            color={msg.role === 'user' ? 'white' : 'gray.800'}
                            p={4}
                            borderRadius="2xl"
                            borderBottomRightRadius={msg.role === 'user' ? 'sm' : '2xl'}
                            borderBottomLeftRadius={msg.role === 'assistant' ? 'sm' : '2xl'}
                            shadow="sm"
                          >
                            <Text fontSize="sm" whiteSpace="pre-wrap">
                              {msg.content}
                            </Text>
                          </Box>
                        </HStack>
                      </Flex>
                    ))}
                    <div ref={messagesEndRef} />
                  </VStack>
                )}
              </Box>

              {/* Input de Mensaje */}
              <Box p={4} bg="white" borderTop="1px" borderColor="gray.100">
                {/* Preview de imágenes seleccionadas */}
                {imagesPreviews.length > 0 && (
                  <HStack mb={3} spacing={2} flexWrap="wrap">
                    {imagesPreviews.map((preview, index) => (
                      <Box key={index} position="relative">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="lg"
                          border="2px"
                          borderColor="purple.200"
                        />
                        <IconButton
                          aria-label="Remove"
                          icon={<FiX />}
                          size="xs"
                          colorScheme="red"
                          borderRadius="full"
                          position="absolute"
                          top={-2}
                          right={-2}
                          onClick={() => removeImage(index)}
                        />
                      </Box>
                    ))}
                  </HStack>
                )}
                
                <HStack spacing={3}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                  />
                  
                  {AVAILABLE_MODELS.find(m => m.id === selectedAssistant.model)?.vision && (
                    <Tooltip label="Adjuntar imagen">
                      <IconButton
                        aria-label="Attach image"
                        icon={<FiImage />}
                        variant="ghost"
                        colorScheme="purple"
                        onClick={() => fileInputRef.current?.click()}
                      />
                    </Tooltip>
                  )}
                  
                  <Input
                    placeholder="Escribe tu mensaje..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendTestMessage();
                      }
                    }}
                    bg="gray.50"
                    border="none"
                    borderRadius="xl"
                    py={6}
                    _focus={{ bg: 'gray.100', boxShadow: 'none' }}
                  />
                  
                  <IconButton
                    aria-label="Enviar"
                    icon={testingLoading ? <Spinner size="sm" /> : <FiSend />}
                    colorScheme="purple"
                    borderRadius="xl"
                    isDisabled={(!message.trim() && selectedImages.length === 0) || testingLoading}
                    onClick={sendTestMessage}
                  />
                </HStack>
              </Box>
            </>
          ) : (
            <Flex justify="center" align="center" h="full" bg="gray.50">
              <VStack spacing={6}>
                <Box
                  p={6}
                  bg="white"
                  borderRadius="3xl"
                  shadow="sm"
                >
                  <Icon as={RobotIcon} boxSize={20} color="gray.300" />
                </Box>
                <VStack spacing={2}>
                  <Text color="gray.600" fontWeight="medium">
                    Selecciona un asistente
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    o crea uno nuevo para comenzar
                  </Text>
                </VStack>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="purple"
                  variant="outline"
                  onClick={onOpen}
                  borderRadius="xl"
                >
                  Crear Asistente
                </Button>
              </VStack>
            </Flex>
          )}
        </Box>
      </Flex>

      {/* Modal de Creación */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" mx={4}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box
                p={2}
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                borderRadius="xl"
              >
                <Icon as={FiPlus} boxSize={5} color="white" />
              </Box>
              <Box>
                <Text>Crear Nuevo Asistente</Text>
                <Text fontSize="sm" fontWeight="normal" color="gray.500">
                  Configura tu asistente de IA personalizado
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            <VStack spacing={5} align="stretch">
              {/* Nombre */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">Nombre</FormLabel>
                <Input
                  placeholder="Ej: Asistente de Ventas"
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  borderRadius="xl"
                  size="lg"
                />
              </FormControl>

              {/* Descripción */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">Descripción</FormLabel>
                <Input
                  placeholder="Breve descripción del asistente"
                  value={assistantDescription}
                  onChange={(e) => setAssistantDescription(e.target.value)}
                  borderRadius="xl"
                />
              </FormControl>

              {/* Instrucciones */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">Instrucciones del Sistema</FormLabel>
                <Textarea
                  placeholder="Define cómo debe comportarse el asistente, su personalidad, conocimientos específicos y restricciones..."
                  value={assistantInstructions}
                  onChange={(e) => setAssistantInstructions(e.target.value)}
                  rows={5}
                  borderRadius="xl"
                />
                <FormHelperText>
                  Sé específico sobre el rol, tono y tipo de respuestas que esperas
                </FormHelperText>
              </FormControl>

              {/* Modelo */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">Modelo</FormLabel>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                  {AVAILABLE_MODELS.map((model) => (
                    <GridItem key={model.id}>
                      <Box
                        p={3}
                        bg={assistantModel === model.id ? 'purple.50' : 'gray.50'}
                        borderRadius="xl"
                        border="2px"
                        borderColor={assistantModel === model.id ? 'purple.400' : 'transparent'}
                        cursor="pointer"
                        onClick={() => setAssistantModel(model.id)}
                        transition="all 0.2s"
                        _hover={{ bg: assistantModel === model.id ? 'purple.50' : 'gray.100' }}
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <HStack>
                              <Text fontWeight="medium" fontSize="sm">{model.name}</Text>
                              {model.vision && (
                                <Icon as={FiEye} color="blue.400" boxSize={3} />
                              )}
                            </HStack>
                            <Text fontSize="xs" color="gray.500">{model.description}</Text>
                          </VStack>
                          {model.badge && (
                            <Badge colorScheme={model.badgeColor || 'gray'} fontSize="2xs" borderRadius="full">
                              {model.badge}
                            </Badge>
                          )}
                        </HStack>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </FormControl>

              {/* Temperatura */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  <HStack justify="space-between">
                    <Text>Creatividad (Temperatura)</Text>
                    <Badge colorScheme="purple" borderRadius="full">
                      {assistantTemperature.toFixed(1)}
                    </Badge>
                  </HStack>
                </FormLabel>
                <Slider
                  value={assistantTemperature}
                  onChange={(v) => setAssistantTemperature(v)}
                  min={0}
                  max={2}
                  step={0.1}
                >
                  <SliderTrack bg="gray.200" borderRadius="full">
                    <SliderFilledTrack bg="purple.400" />
                  </SliderTrack>
                  <SliderThumb boxSize={5} />
                </Slider>
                <HStack justify="space-between" mt={1}>
                  <Text fontSize="xs" color="gray.500">Preciso</Text>
                  <Text fontSize="xs" color="gray.500">Creativo</Text>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose} borderRadius="xl">
              Cancelar
            </Button>
            <Button
              bgGradient="linear(to-r, purple.500, blue.500)"
              color="white"
              _hover={{ bgGradient: "linear(to-r, purple.600, blue.600)" }}
              onClick={createAssistant}
              isLoading={loading}
              isDisabled={!assistantName || !assistantInstructions}
              borderRadius="xl"
              px={8}
            >
              Crear Asistente
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Edición */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" mx={4}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box
                p={2}
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                borderRadius="xl"
              >
                <Icon as={FiSettings} boxSize={5} color="white" />
              </Box>
              <Box>
                <Text>Editar Asistente</Text>
                <Text fontSize="sm" fontWeight="normal" color="gray.500">
                  Modifica la configuración de tu asistente
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            <VStack spacing={5} align="stretch">
              {/* Nombre */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">Nombre</FormLabel>
                <Input
                  placeholder="Ej: Asistente de Ventas"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  borderRadius="xl"
                  size="lg"
                />
              </FormControl>

              {/* Descripción */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">Descripción</FormLabel>
                <Input
                  placeholder="Breve descripción del asistente"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  borderRadius="xl"
                />
              </FormControl>

              {/* Instrucciones */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">Instrucciones del Sistema</FormLabel>
                <Textarea
                  placeholder="Define cómo debe comportarse el asistente..."
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  rows={5}
                  borderRadius="xl"
                />
                <FormHelperText>
                  Sé específico sobre el rol, tono y tipo de respuestas que esperas
                </FormHelperText>
              </FormControl>

              {/* Modelo */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">Modelo</FormLabel>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                  {AVAILABLE_MODELS.map((model) => (
                    <GridItem key={model.id}>
                      <Box
                        p={3}
                        bg={editModel === model.id ? 'purple.50' : 'gray.50'}
                        borderRadius="xl"
                        border="2px"
                        borderColor={editModel === model.id ? 'purple.400' : 'transparent'}
                        cursor="pointer"
                        onClick={() => setEditModel(model.id)}
                        transition="all 0.2s"
                        _hover={{ bg: editModel === model.id ? 'purple.50' : 'gray.100' }}
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <HStack>
                              <Text fontWeight="medium" fontSize="sm">{model.name}</Text>
                              {model.vision && (
                                <Icon as={FiEye} color="blue.400" boxSize={3} />
                              )}
                            </HStack>
                            <Text fontSize="xs" color="gray.500">{model.description}</Text>
                          </VStack>
                          {model.badge && (
                            <Badge colorScheme={model.badgeColor || 'gray'} fontSize="2xs" borderRadius="full">
                              {model.badge}
                            </Badge>
                          )}
                        </HStack>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </FormControl>

              {/* Temperatura */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  <HStack justify="space-between">
                    <Text>Creatividad (Temperatura)</Text>
                    <Badge colorScheme="purple" borderRadius="full">
                      {editTemperature.toFixed(1)}
                    </Badge>
                  </HStack>
                </FormLabel>
                <Slider
                  value={editTemperature}
                  onChange={(v) => setEditTemperature(v)}
                  min={0}
                  max={2}
                  step={0.1}
                >
                  <SliderTrack bg="gray.200" borderRadius="full">
                    <SliderFilledTrack bg="purple.400" />
                  </SliderTrack>
                  <SliderThumb boxSize={5} />
                </Slider>
                <HStack justify="space-between" mt={1}>
                  <Text fontSize="xs" color="gray.500">Preciso</Text>
                  <Text fontSize="xs" color="gray.500">Creativo</Text>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onEditClose} borderRadius="xl">
              Cancelar
            </Button>
            <Button
              bgGradient="linear(to-r, purple.500, blue.500)"
              color="white"
              _hover={{ bgGradient: "linear(to-r, purple.600, blue.600)" }}
              onClick={updateAssistant}
              isLoading={loading}
              isDisabled={!editName || !editInstructions}
              borderRadius="xl"
              px={8}
            >
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

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
  Text,
  Textarea,
  useToast,
  VStack,
  Badge,
  Divider,
  Spinner,
  Avatar,
  Tooltip,
  Select,
  FormControl,
  FormLabel,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import {
  FiMessageSquare,
  FiMoreVertical,
  FiSend,
  FiTrash2,
  FiRefreshCw,
  FiZap,
  FiCpu,
  FiSettings,
  FiImage,
  FiX,
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

interface AIConfig {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  isActive: boolean;
}

export default function TestingPage() {
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [tabIndex, setTabIndex] = useState(0);

  // Estados para modo Asistente
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingLoading, setTestingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Estados para modo AI Config
  const [aiConfigs, setAiConfigs] = useState<AIConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<AIConfig | null>(null);
  const [aiTestMessages, setAiTestMessages] = useState<{ role: string; content: string }[]>([]);
  const [aiMessage, setAiMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadAssistants();
    loadAIConfigs();
  }, []);

  useEffect(() => {
    if (selectedAssistant) {
      loadMessages(selectedAssistant.id);
    }
  }, [selectedAssistant]);

  useEffect(() => {
    scrollToBottom();
  }, [testMessages, aiTestMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAssistants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistants`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to load assistants');

      const data = await response.json();
      setAssistants(data);

      if (data.length > 0 && !selectedAssistant) {
        setSelectedAssistant(data[0]);
      }
    } catch (error) {
      console.error('Error loading assistants:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIConfigs = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setAiConfigs([data]);
          setSelectedConfig(data);
        }
      }
    } catch (error) {
      console.error('Error loading AI config:', error);
    }
  };

  const loadMessages = async (assistantId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assistants/${assistantId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();
      setTestMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendTestMessage = async () => {
    if ((!message.trim() && selectedImages.length === 0) || !selectedAssistant) return;

    try {
      setTestingLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Preparar payload con o sin imágenes
      let payload: any;
      if (selectedImages.length > 0) {
        payload = {
          message: JSON.stringify({
            text: message.trim(),
            images: selectedImages
          })
        };
      } else {
        payload = { message: message.trim() };
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assistants/${selectedAssistant.id}/test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      setMessage('');
      setSelectedImages([]);
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

  // Funciones para manejar imágenes
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'La imagen debe ser menor a 5MB',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImages((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });

    // Limpiar input para poder seleccionar la misma imagen
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const sendAITestMessage = async () => {
    if (!aiMessage.trim()) return;

    const userMessage = aiMessage.trim();
    setAiTestMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setAiMessage('');
    setAiLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Hola, me interesa su producto' },
            { role: 'assistant', content: '¡Hola! Me alegra tu interés. ¿Qué producto te gustaría conocer?' },
            { role: 'user', content: userMessage },
          ],
        }),
      });

      if (!response.ok) throw new Error('Failed to test AI');

      const data = await response.json();
      setAiTestMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response || data.analysis?.suggestedResponse || 'Sin respuesta' },
      ]);
    } catch (error: any) {
      console.error('Error testing AI:', error);
      setAiTestMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Error al procesar el mensaje' },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const clearMessages = async () => {
    if (!selectedAssistant) return;
    if (!confirm('¿Limpiar historial de conversación?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistants/${selectedAssistant.id}/messages`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      setTestMessages([]);
      toast({ title: 'Historial limpiado', status: 'success', duration: 2000 });
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  };

  return (
    <Flex direction="column" w="full" h="100vh" bg="#FEFEFE" overflow="hidden">
      {/* Header */}
      <Box p={6} borderBottom="1px solid" borderColor="gray.200">
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <Box p={2} bg="linear-gradient(135deg, #9D39FE 0%, #6366F1 100%)" borderRadius="xl">
              <Icon as={FiZap} boxSize={6} color="white" />
            </Box>
            <Box>
              <Heading fontSize="2xl" fontWeight="bold" color="gray.800">
                Pruebas de IA
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Prueba tus asistentes y configuraciones de IA
              </Text>
            </Box>
          </HStack>
        </Flex>
      </Box>

      {/* Tabs */}
      <Tabs
        index={tabIndex}
        onChange={setTabIndex}
        colorScheme="purple"
        flex="1"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <TabList px={6} bg="gray.50" borderBottom="1px" borderColor="gray.200">
          <Tab fontWeight="medium" _selected={{ color: 'purple.600', borderColor: 'purple.600' }}>
            <HStack spacing={2}>
              <Icon as={RobotIcon} boxSize={4} />
              <Text>Asistentes</Text>
            </HStack>
          </Tab>
          <Tab fontWeight="medium" _selected={{ color: 'purple.600', borderColor: 'purple.600' }}>
            <HStack spacing={2}>
              <Icon as={FiCpu} boxSize={4} />
              <Text>IA de Ventas</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels flex="1" overflow="hidden">
          {/* Tab: Asistentes */}
          <TabPanel p={0} h="full">
            <Flex h="full">
              {/* Sidebar */}
              <Box w="280px" bg="white" borderRight="1px" borderColor="gray.200" p={4}>
                <Text fontWeight="semibold" mb={4} color="gray.700">
                  Mis Asistentes
                </Text>

                {loading ? (
                  <Flex justify="center" py={8}>
                    <Spinner color="purple.500" />
                  </Flex>
                ) : assistants.length === 0 ? (
                  <VStack py={8} spacing={3}>
                    <Icon as={RobotIcon} boxSize={10} color="gray.300" />
                    <Text color="gray.500" fontSize="sm" textAlign="center">
                      No hay asistentes
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="purple"
                      variant="ghost"
                      onClick={() => (window.location.href = '/dashboard/prompt')}
                    >
                      Crear uno
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={2} align="stretch">
                    {assistants.map((assistant) => (
                      <Box
                        key={assistant.id}
                        p={3}
                        bg={selectedAssistant?.id === assistant.id ? 'purple.50' : 'gray.50'}
                        borderRadius="lg"
                        cursor="pointer"
                        onClick={() => setSelectedAssistant(assistant)}
                        border="2px"
                        borderColor={selectedAssistant?.id === assistant.id ? 'purple.300' : 'transparent'}
                        _hover={{ bg: 'gray.100' }}
                      >
                        <HStack spacing={3}>
                          <Avatar size="sm" name={assistant.name} bg="purple.500" />
                          <Box flex={1}>
                            <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                              {assistant.name}
                            </Text>
                            <Badge fontSize="2xs" colorScheme="purple">
                              {assistant.model}
                            </Badge>
                          </Box>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>

              {/* Chat Area */}
              <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
                {selectedAssistant ? (
                  <>
                    {/* Header */}
                    <Box p={4} borderBottom="1px" borderColor="gray.100" bg="gray.50">
                      <Flex justify="space-between" align="center">
                        <HStack spacing={3}>
                          <Avatar size="md" name={selectedAssistant.name} bg="purple.500" />
                          <Box>
                            <Text fontWeight="semibold">{selectedAssistant.name}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {selectedAssistant.model}
                            </Text>
                          </Box>
                        </HStack>
                        <Tooltip label="Limpiar chat">
                          <IconButton
                            aria-label="Clear"
                            icon={<FiRefreshCw />}
                            variant="ghost"
                            size="sm"
                            onClick={clearMessages}
                          />
                        </Tooltip>
                      </Flex>
                    </Box>

                    {/* Messages */}
                    <Box flex={1} overflowY="auto" p={4} bg="gray.50">
                      {testMessages.length === 0 ? (
                        <VStack justify="center" h="full" spacing={4}>
                          <Icon as={FiMessageSquare} boxSize={12} color="gray.300" />
                          <Text color="gray.500">Envía un mensaje para comenzar</Text>
                        </VStack>
                      ) : (
                        <VStack spacing={4} align="stretch">
                          {testMessages.map((msg) => (
                            <Flex
                              key={msg.id}
                              justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                            >
                              <Box
                                bg={msg.role === 'user' ? 'purple.500' : 'white'}
                                color={msg.role === 'user' ? 'white' : 'gray.800'}
                                p={4}
                                borderRadius="xl"
                                maxW="75%"
                                shadow="sm"
                              >
                                <Text fontSize="sm" whiteSpace="pre-wrap">
                                  {msg.content}
                                </Text>
                              </Box>
                            </Flex>
                          ))}
                          <div ref={messagesEndRef} />
                        </VStack>
                      )}
                    </Box>

                    {/* Input */}
                    <Box p={4} bg="white" borderTop="1px" borderColor="gray.100">
                      {/* Preview de imágenes seleccionadas */}
                      {selectedImages.length > 0 && (
                        <HStack spacing={2} mb={3} flexWrap="wrap">
                          {selectedImages.map((img, index) => (
                            <Box key={index} position="relative">
                              <Box
                                as="img"
                                src={img}
                                alt={`Preview ${index + 1}`}
                                w="60px"
                                h="60px"
                                objectFit="cover"
                                borderRadius="md"
                                border="2px solid"
                                borderColor="purple.200"
                              />
                              <IconButton
                                aria-label="Eliminar imagen"
                                icon={<FiX />}
                                size="xs"
                                colorScheme="red"
                                position="absolute"
                                top="-2"
                                right="-2"
                                borderRadius="full"
                                onClick={() => removeImage(index)}
                              />
                            </Box>
                          ))}
                        </HStack>
                      )}
                      
                      <HStack spacing={3}>
                        {/* Input oculto para imágenes */}
                        <input
                          type="file"
                          ref={imageInputRef}
                          style={{ display: 'none' }}
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                        />
                        
                        <Tooltip label="Adjuntar imagen">
                          <IconButton
                            aria-label="Adjuntar imagen"
                            icon={<FiImage />}
                            variant="ghost"
                            colorScheme="purple"
                            borderRadius="xl"
                            onClick={() => imageInputRef.current?.click()}
                            isDisabled={testingLoading}
                          />
                        </Tooltip>
                        
                        <Input
                          placeholder="Escribe un mensaje..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendTestMessage();
                            }
                          }}
                          borderRadius="xl"
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
                    <VStack spacing={4}>
                      <Icon as={RobotIcon} boxSize={16} color="gray.300" />
                      <Text color="gray.500">Selecciona un asistente</Text>
                    </VStack>
                  </Flex>
                )}
              </Box>
            </Flex>
          </TabPanel>

          {/* Tab: IA de Ventas */}
          <TabPanel p={0} h="full">
            <Flex h="full" direction="column">
              {/* Info */}
              <Box p={4} bg="purple.50" borderBottom="1px" borderColor="purple.100">
                <HStack spacing={3}>
                  <Icon as={FiCpu} boxSize={5} color="purple.600" />
                  <Box>
                    <Text fontWeight="medium" color="purple.800">
                      Probando: {selectedConfig?.name || 'Configuración de IA'}
                    </Text>
                    <Text fontSize="sm" color="purple.600">
                      Modelo: {selectedConfig?.model || 'gpt-4-turbo-preview'}
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {/* Messages */}
              <Box flex={1} overflowY="auto" p={4} bg="gray.50">
                {aiTestMessages.length === 0 ? (
                  <VStack justify="center" h="full" spacing={4}>
                    <Icon as={FiMessageSquare} boxSize={12} color="gray.300" />
                    <Text color="gray.500">Simula una conversación de ventas</Text>
                    <Text fontSize="sm" color="gray.400">
                      La IA responderá como si fuera un cliente potencial
                    </Text>
                  </VStack>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {aiTestMessages.map((msg, idx) => (
                      <Flex key={idx} justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}>
                        <Box
                          bg={msg.role === 'user' ? 'purple.500' : 'white'}
                          color={msg.role === 'user' ? 'white' : 'gray.800'}
                          p={4}
                          borderRadius="xl"
                          maxW="75%"
                          shadow="sm"
                        >
                          <Text fontSize="sm" whiteSpace="pre-wrap">
                            {msg.content}
                          </Text>
                        </Box>
                      </Flex>
                    ))}
                    {aiLoading && (
                      <Flex justify="flex-start">
                        <Box bg="white" p={4} borderRadius="xl" shadow="sm">
                          <HStack spacing={2}>
                            <Spinner size="sm" color="purple.500" />
                            <Text fontSize="sm" color="gray.500">
                              Pensando...
                            </Text>
                          </HStack>
                        </Box>
                      </Flex>
                    )}
                    <div ref={messagesEndRef} />
                  </VStack>
                )}
              </Box>

              {/* Input */}
              <Box p={4} bg="white" borderTop="1px" borderColor="gray.100">
                <HStack spacing={3}>
                  <Input
                    placeholder="Escribe como si fueras un cliente..."
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendAITestMessage();
                      }
                    }}
                    borderRadius="xl"
                  />
                  <Button
                    colorScheme="purple"
                    borderRadius="xl"
                    px={6}
                    onClick={() => {
                      setAiTestMessages([]);
                    }}
                    variant="ghost"
                  >
                    Limpiar
                  </Button>
                  <IconButton
                    aria-label="Enviar"
                    icon={aiLoading ? <Spinner size="sm" /> : <FiSend />}
                    colorScheme="purple"
                    borderRadius="xl"
                    isDisabled={!aiMessage.trim() || aiLoading}
                    onClick={sendAITestMessage}
                  />
                </HStack>
              </Box>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}

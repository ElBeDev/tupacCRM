'use client';

import {
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Badge,
  IconButton,
  Textarea,
  Button,
  Icon,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Filter,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  sentAt: string;
  status?: string;
}

interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  channel: string;
  status: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const selectedConversation = conversations.find((c) => c.id === selectedChat);

  const filteredConversations = conversations.filter((conv) =>
    conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contactPhone.includes(searchQuery)
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations and setup socket
  useEffect(() => {
    loadConversations();

    // Initialize Socket.IO for real-time updates
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const newSocket = io(WS_URL);

    newSocket.on('connect', () => {
      console.log('Chat socket connected');
    });

    newSocket.on('whatsapp:message', (data: { conversationId: string; message: Message }) => {
      console.log('New message received:', data);
      
      // Update conversation list
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === data.conversationId) {
            return {
              ...conv,
              lastMessage: data.message.content,
              lastMessageAt: data.message.sentAt,
              unreadCount: selectedChat === data.conversationId ? 0 : conv.unreadCount + 1,
            };
          }
          return conv;
        });
        // Sort by last message time
        return updated.sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
      });

      // If this conversation is selected, add the message
      if (selectedChat === data.conversationId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
      // Mark as read
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedChat ? { ...conv, unreadCount: 0 } : conv
        )
      );
    }
  }, [selectedChat]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/conversations');
      setConversations(response.data);
      
      // Auto-select first conversation if available
      if (response.data.length > 0 && !selectedChat) {
        setSelectedChat(response.data[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las conversaciones',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const response = await api.get(\`/conversations/\${conversationId}/messages\`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      const response = await api.post('/whatsapp/send', {
        phone: selectedConversation.contactPhone,
        message: messageText,
      });

      // Add message to UI immediately
      const newMessage: Message = {
        id: response.data.messageId || Date.now().toString(),
        content: messageText,
        direction: 'outbound',
        sentAt: new Date().toISOString(),
        status: 'sent',
      };
      
      setMessages(prev => [...prev, newMessage]);

      // Update conversation last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedChat
            ? { ...conv, lastMessage: messageText, lastMessageAt: new Date().toISOString() }
            : conv
        )
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error al enviar',
        description: error.response?.data?.error || 'No se pudo enviar el mensaje',
        status: 'error',
        duration: 3000,
      });
      // Restore the message
      setMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return \`\${minutes}m\`;
    if (hours < 24) return \`\${hours}h\`;
    if (days < 7) return \`\${days}d\`;
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Flex h="100vh" bg="#FEFEFE">
      {/* Lista de Conversaciones - Panel Izquierdo */}
      <Box
        w="360px"
        minW="360px"
        borderRight="1px"
        borderColor="gray.200"
        bg="white"
        h="100vh"
        display="flex"
        flexDirection="column"
      >
        {/* Header de Conversaciones */}
        <Box p={4} borderBottom="1px" borderColor="gray.200">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="lg" fontWeight="700" color="gray.800">
              Conversaciones
            </Text>
            <Flex gap={2}>
              <IconButton
                aria-label="Actualizar"
                icon={loading ? <Spinner size="sm" /> : <Filter size={18} />}
                size="sm"
                variant="ghost"
                onClick={loadConversations}
                isDisabled={loading}
                _hover={{ bg: 'gray.100' }}
              />
              <IconButton
                aria-label="Nueva conversación"
                icon={<Plus size={18} />}
                size="sm"
                variant="ghost"
                _hover={{ bg: 'gray.100' }}
              />
            </Flex>
          </Flex>

          {/* Search Bar */}
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none">
              <Icon as={Search} color="gray.400" boxSize={4} />
            </InputLeftElement>
            <Input
              placeholder="Buscar conversación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: '#9D39FE', boxShadow: '0 0 0 1px #9D39FE' }}
              borderRadius="lg"
            />
          </InputGroup>
        </Box>

        {/* Lista de Conversaciones */}
        <Box flex={1} overflowY="auto">
          {loading ? (
            <Flex justify="center" align="center" h="200px">
              <Spinner size="lg" color="#9D39FE" />
            </Flex>
          ) : filteredConversations.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              h="200px"
              gap={3}
              px={4}
            >
              <Icon as={MessageSquare} boxSize={12} color="gray.300" />
              <Text fontSize="sm" color="gray.500" textAlign="center">
                {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones aún'}
              </Text>
              <Text fontSize="xs" color="gray.400" textAlign="center">
                Conecta WhatsApp y espera mensajes entrantes
              </Text>
            </Flex>
          ) : (
            filteredConversations.map((conv) => (
              <Flex
                key={conv.id}
                p={4}
                cursor="pointer"
                bg={selectedChat === conv.id ? 'purple.50' : 'transparent'}
                borderLeft={selectedChat === conv.id ? '3px solid' : '3px solid transparent'}
                borderLeftColor={selectedChat === conv.id ? '#9D39FE' : 'transparent'}
                _hover={{ bg: selectedChat === conv.id ? 'purple.50' : 'gray.50' }}
                transition="all 0.2s"
                onClick={() => setSelectedChat(conv.id)}
                gap={3}
              >
                {/* Avatar con canal */}
                <Box position="relative">
                  <Avatar
                    size="md"
                    name={conv.contactName}
                    src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${conv.contactPhone}\`}
                  />
                  {conv.channel === 'whatsapp' && (
                    <Box
                      position="absolute"
                      bottom={0}
                      right={0}
                      w="16px"
                      h="16px"
                      bg="green.400"
                      borderRadius="full"
                      border="2px solid white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="8px" color="white">W</Text>
                    </Box>
                  )}
                </Box>

                {/* Información del contacto */}
                <Flex flex={1} direction="column" overflow="hidden">
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontWeight="600" color="gray.800" fontSize="sm" noOfLines={1}>
                      {conv.contactName || conv.contactPhone}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatTime(conv.lastMessageAt)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="gray.600" noOfLines={1} flex={1}>
                      {conv.lastMessage}
                    </Text>
                    {conv.unreadCount > 0 && (
                      <Badge
                        bg="#9D39FE"
                        color="white"
                        borderRadius="full"
                        px={2}
                        py={0.5}
                        fontSize="xs"
                        ml={2}
                      >
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            ))
          )}
        </Box>
      </Box>

      {/* Área de Chat - Panel Derecho */}
      {selectedConversation ? (
        <Flex flex={1} direction="column" bg="#FEFEFE">
          {/* Header del Chat */}
          <Box
            p={4}
            borderBottom="1px"
            borderColor="gray.200"
            bg="white"
          >
            <Flex justify="space-between" align="center">
              <Flex align="center" gap={3}>
                <Avatar
                  size="sm"
                  name={selectedConversation.contactName}
                  src={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${selectedConversation.contactPhone}\`}
                />
                <Box>
                  <Text fontWeight="600" color="gray.800" fontSize="sm">
                    {selectedConversation.contactName || selectedConversation.contactPhone}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {selectedConversation.contactPhone} • {selectedConversation.channel}
                  </Text>
                </Box>
              </Flex>

              <Flex gap={2}>
                <IconButton
                  aria-label="Llamar"
                  icon={<Phone size={18} />}
                  size="sm"
                  variant="ghost"
                  _hover={{ bg: 'gray.100' }}
                />
                <IconButton
                  aria-label="Videollamada"
                  icon={<Video size={18} />}
                  size="sm"
                  variant="ghost"
                  _hover={{ bg: 'gray.100' }}
                />
                <IconButton
                  aria-label="Más opciones"
                  icon={<MoreVertical size={18} />}
                  size="sm"
                  variant="ghost"
                  _hover={{ bg: 'gray.100' }}
                />
              </Flex>
            </Flex>
          </Box>

          {/* Mensajes */}
          <Box
            flex={1}
            overflowY="auto"
            p={6}
            bg="#FEFEFE"
          >
            {loadingMessages ? (
              <Flex justify="center" align="center" h="100%">
                <Spinner size="lg" color="#9D39FE" />
              </Flex>
            ) : messages.length > 0 ? (
              <Flex direction="column" gap={4}>
                {messages.map((msg) => (
                  <Flex
                    key={msg.id}
                    justify={msg.direction === 'outbound' ? 'flex-end' : 'flex-start'}
                  >
                    <Box maxW="70%">
                      <Box
                        bg={msg.direction === 'outbound' ? '#9D39FE' : 'white'}
                        color={msg.direction === 'outbound' ? 'white' : 'gray.800'}
                        px={4}
                        py={3}
                        borderRadius="xl"
                        border={msg.direction === 'inbound' ? '1px' : 'none'}
                        borderColor="gray.200"
                        boxShadow="sm"
                      >
                        <Text fontSize="sm" whiteSpace="pre-wrap">{msg.content}</Text>
                      </Box>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        mt={1}
                        textAlign={msg.direction === 'outbound' ? 'right' : 'left'}
                      >
                        {formatMessageTime(msg.sentAt)}
                      </Text>
                    </Box>
                  </Flex>
                ))}
                <div ref={messagesEndRef} />
              </Flex>
            ) : (
              <Flex
                h="100%"
                align="center"
                justify="center"
                direction="column"
                gap={3}
              >
                <Text fontSize="4xl" opacity={0.3}>
                  💬
                </Text>
                <Text fontSize="md" color="gray.400" fontWeight="600">
                  Sin mensajes aún
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Comienza la conversación enviando un mensaje
                </Text>
              </Flex>
            )}
          </Box>

          {/* Input de Mensaje */}
          <Box
            p={4}
            borderTop="1px"
            borderColor="gray.200"
            bg="white"
          >
            <Flex gap={3} align="flex-end">
              <IconButton
                aria-label="Adjuntar archivo"
                icon={<Paperclip size={20} />}
                variant="ghost"
                _hover={{ bg: 'gray.100' }}
              />
              
              <Box flex={1}>
                <Textarea
                  placeholder="Escribe un mensaje..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  resize="none"
                  rows={1}
                  minH="40px"
                  maxH="120px"
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: '#9D39FE', boxShadow: '0 0 0 1px #9D39FE' }}
                  borderRadius="lg"
                  isDisabled={sending}
                />
              </Box>

              <IconButton
                aria-label="Emojis"
                icon={<Smile size={20} />}
                variant="ghost"
                _hover={{ bg: 'gray.100' }}
              />

              <Button
                colorScheme="purple"
                bg="#9D39FE"
                _hover={{ bg: '#8A2BE2' }}
                leftIcon={sending ? <Spinner size="sm" /> : <Send size={18} />}
                onClick={handleSendMessage}
                isDisabled={!message.trim() || sending}
              >
                Enviar
              </Button>
            </Flex>
          </Box>
        </Flex>
      ) : (
        <Flex
          flex={1}
          align="center"
          justify="center"
          direction="column"
          gap={4}
          bg="#FEFEFE"
        >
          <Text fontSize="6xl" opacity={0.2}>
            💬
          </Text>
          <Text fontSize="xl" fontWeight="600" color="gray.400">
            {loading ? 'Cargando conversaciones...' : 'Selecciona una conversación'}
          </Text>
          <Text fontSize="sm" color="gray.400">
            {loading ? '' : 'Elige un contacto para comenzar a chatear'}
          </Text>
        </Flex>
      )}
    </Flex>
  );
}

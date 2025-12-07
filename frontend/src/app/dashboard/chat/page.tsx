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
  Divider,
  Icon,
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
} from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  status: 'online' | 'offline';
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    lastMessage: 'Hola, me interesa el producto',
    time: '5m',
    unread: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan',
    status: 'online',
    messages: [
      { id: '1', text: 'Hola, buenos días', sender: 'contact', time: '10:00 AM' },
      { id: '2', text: 'Hola! ¿En qué puedo ayudarte?', sender: 'user', time: '10:01 AM' },
      { id: '3', text: 'Me interesa conocer más sobre sus productos', sender: 'contact', time: '10:02 AM' },
      { id: '4', text: 'Claro, tenemos una amplia gama de productos. ¿Buscas algo específico?', sender: 'user', time: '10:03 AM' },
    ],
  },
  {
    id: '2',
    name: 'María García',
    lastMessage: '¿Cuándo pueden entregar?',
    time: '15m',
    unread: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    status: 'online',
    messages: [
      { id: '1', text: '¿Cuándo pueden entregar?', sender: 'contact', time: '9:45 AM' },
      { id: '2', text: 'Podemos entregar en 2-3 días hábiles', sender: 'user', time: '9:50 AM' },
    ],
  },
  {
    id: '3',
    name: 'Carlos López',
    lastMessage: 'Gracias por la información',
    time: '1h',
    unread: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    status: 'offline',
    messages: [
      { id: '1', text: 'Necesito cotización', sender: 'contact', time: '8:30 AM' },
      { id: '2', text: 'Por supuesto, te envío la cotización', sender: 'user', time: '8:35 AM' },
      { id: '3', text: 'Gracias por la información', sender: 'contact', time: '8:40 AM' },
    ],
  },
  {
    id: '4',
    name: 'Ana Martínez',
    lastMessage: 'Perfecto, gracias',
    time: '2h',
    unread: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    status: 'offline',
    messages: [],
  },
  {
    id: '5',
    name: 'Pedro Sánchez',
    lastMessage: '¿Tienen stock disponible?',
    time: '3h',
    unread: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
    status: 'online',
    messages: [],
  },
];

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string>(mockConversations[0].id);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedConversation = mockConversations.find((c) => c.id === selectedChat);
  
  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
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
                aria-label="Filtrar"
                icon={<Filter size={18} />}
                size="sm"
                variant="ghost"
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
          {filteredConversations.map((conv) => (
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
              {/* Avatar con status */}
              <Box position="relative">
                <Avatar
                  size="md"
                  src={conv.avatar}
                  name={conv.name}
                />
                {conv.status === 'online' && (
                  <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    w="12px"
                    h="12px"
                    bg="green.400"
                    borderRadius="full"
                    border="2px solid white"
                  />
                )}
              </Box>

              {/* Información del contacto */}
              <Flex flex={1} direction="column" overflow="hidden">
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontWeight="600" color="gray.800" fontSize="sm" noOfLines={1}>
                    {conv.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {conv.time}
                  </Text>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" color="gray.600" noOfLines={1} flex={1}>
                    {conv.lastMessage}
                  </Text>
                  {conv.unread > 0 && (
                    <Badge
                      bg="#9D39FE"
                      color="white"
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="xs"
                      ml={2}
                    >
                      {conv.unread}
                    </Badge>
                  )}
                </Flex>
              </Flex>
            </Flex>
          ))}
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
                  src={selectedConversation.avatar}
                  name={selectedConversation.name}
                />
                <Box>
                  <Text fontWeight="600" color="gray.800" fontSize="sm">
                    {selectedConversation.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {selectedConversation.status === 'online' ? 'En línea' : 'Desconectado'}
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
            {selectedConversation.messages.length > 0 ? (
              <Flex direction="column" gap={4}>
                {selectedConversation.messages.map((msg) => (
                  <Flex
                    key={msg.id}
                    justify={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                  >
                    <Box maxW="70%">
                      <Box
                        bg={msg.sender === 'user' ? '#9D39FE' : 'white'}
                        color={msg.sender === 'user' ? 'white' : 'gray.800'}
                        px={4}
                        py={3}
                        borderRadius="xl"
                        border={msg.sender === 'contact' ? '1px' : 'none'}
                        borderColor="gray.200"
                      >
                        <Text fontSize="sm">{msg.text}</Text>
                      </Box>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        mt={1}
                        textAlign={msg.sender === 'user' ? 'right' : 'left'}
                      >
                        {msg.time}
                      </Text>
                    </Box>
                  </Flex>
                ))}
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
                leftIcon={<Send size={18} />}
                onClick={handleSendMessage}
                isDisabled={!message.trim()}
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
            Selecciona una conversación
          </Text>
          <Text fontSize="sm" color="gray.400">
            Elige un contacto para comenzar a chatear
          </Text>
        </Flex>
      )}
    </Flex>
  );
}

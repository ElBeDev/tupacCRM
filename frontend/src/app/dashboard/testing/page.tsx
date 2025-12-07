'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  Icon,
  HStack,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';

// Icono de check
const CheckIcon = (props: any) => (
  <Icon viewBox="0 0 20 20" {...props}>
    <path
      d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z"
      fill="currentColor"
    />
  </Icon>
);

// Icono de chevron down
const ChevronDownIcon = (props: any) => (
  <Icon viewBox="0 0 20 20" {...props}>
    <path
      d="M5.29289 7.29289C5.68342 6.90237 6.31658 6.90237 6.70711 7.29289L10 10.5858L13.2929 7.29289C13.6834 6.90237 14.3166 6.90237 14.7071 7.29289C15.0976 7.68342 15.0976 8.31658 14.7071 8.70711L10.7071 12.7071C10.3166 13.0976 9.68342 13.0976 9.29289 12.7071L5.29289 8.70711C4.90237 8.31658 4.90237 7.68342 5.29289 7.29289Z"
      fill="currentColor"
    />
  </Icon>
);

// Icono de varita mágica con estrellas
const MagicWandIcon = (props: any) => (
  <Icon viewBox="0 0 21 22" {...props}>
    <path
      d="M19.5 11L17 13.5M8.5 2L6 4.5M2 8.5L4.5 6M13.5 19.5L11 17M19.5 4L17 6.5M4.5 17L2 19.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 9L9 13L7 11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="11"
      cy="11"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </Icon>
);

// Icono de lápiz/editar
const EditIcon = (props: any) => (
  <Icon viewBox="0 0 21 20" {...props}>
    <path
      d="M14.5 2.5C14.8978 2.10217 15.4374 1.87868 16 1.87868C16.2786 1.87868 16.5544 1.93355 16.8118 2.04015C17.0692 2.14674 17.303 2.30301 17.5 2.5C17.697 2.69698 17.8532 2.93083 17.9598 3.1882C18.0665 3.44557 18.1213 3.72141 18.1213 4C18.1213 4.27859 18.0665 4.55442 17.9598 4.81179C17.8532 5.06916 17.697 5.30301 17.5 5.5L6 17L2 18L3 14L14.5 2.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Icon>
);

// Icono de robot con cerradura
const RobotIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M12 2C13.1046 2 14 2.89543 14 4V6H16C17.1046 6 18 6.89543 18 8V9C19.6569 9 21 10.3431 21 12V19C21 20.6569 19.6569 22 18 22H6C4.34315 22 3 20.6569 3 19V12C3 10.3431 4.34315 9 6 9V8C6 6.89543 6.89543 6 8 6H10V4C10 2.89543 10.8954 2 12 2ZM16 11H8V19C8 19.5523 8.44772 20 9 20H15C15.5523 20 16 19.5523 16 19V11ZM12 13C12.5523 13 13 13.4477 13 14V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V14C11 13.4477 11.4477 13 12 13Z"
      fill="currentColor"
    />
  </Icon>
);

export default function TestingPage() {
  const [mode, setMode] = useState<'ai' | 'manual'>('manual');
  const [message, setMessage] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      bg="#FEFEFE"
      minH="100vh"
      p={{ base: 4, md: 8 }}
    >
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        mb={8}
        flexDirection={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Heading
          as="h2"
          size="xl"
          fontWeight="600"
          color="gray.800"
        >
          Crear asistente
        </Heading>

        {/* Mode Selector Dropdown */}
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            bg="white"
            border="1px solid"
            borderColor="gray.300"
            color="gray.700"
            _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
            _active={{ bg: 'gray.100' }}
            size="md"
            borderRadius="md"
            fontWeight="500"
            transition="all 0.2s"
          >
            {mode === 'ai' ? 'Crear con IA' : 'Crear manualmente'}
          </MenuButton>
          <MenuList
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            shadow="lg"
          >
            <MenuItem
              onClick={() => setMode('ai')}
              py={3}
              _hover={{ bg: 'gray.50' }}
            >
              <HStack spacing={3} w="full">
                <MagicWandIcon boxSize={5} color="gray.600" />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" fontWeight="600" color="gray.800">
                    Crear con IA
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Chatea con Prometheo para crear al asistente
                  </Text>
                </VStack>
                {mode === 'ai' && (
                  <CheckIcon boxSize={4} color="#9D39FE" />
                )}
              </HStack>
            </MenuItem>

            <MenuItem
              onClick={() => setMode('manual')}
              py={3}
              _hover={{ bg: 'gray.50' }}
            >
              <HStack spacing={3} w="full">
                <EditIcon boxSize={5} color="gray.600" />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" fontWeight="600" color="gray.800">
                    Crear manualmente
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Escribe y diseña vos mismo a tu asistente
                  </Text>
                </VStack>
                {mode === 'manual' && (
                  <CheckIcon boxSize={4} color="#9D39FE" />
                )}
              </HStack>
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {/* Main Content Area */}
      <Flex
        gap={6}
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        {/* Left: Empty State */}
        <Box flex={1}>
          <Flex
            direction="column"
            align="center"
            justify="center"
            minH="400px"
            textAlign="center"
          >
            <VStack spacing={6}>
              {/* Icon */}
              <Box
                p={6}
                bg="gray.50"
                borderRadius="full"
                border="1px solid"
                borderColor="gray.200"
              >
                <RobotIcon boxSize={12} color="gray.400" />
              </Box>

              {/* Text */}
              <VStack spacing={2}>
                <Text
                  fontSize="lg"
                  fontWeight="600"
                  color="gray.800"
                >
                  Crea un asistente para poder comenzar
                </Text>
              </VStack>

              {/* CTA Button */}
              <Button
                leftIcon={<Text fontSize="xl">+</Text>}
                bg="#9D39FE"
                color="white"
                _hover={{ bg: '#8B2DE8' }}
                size="lg"
                borderRadius="md"
                fontWeight="500"
                px={8}
                transition="all 0.2s"
              >
                Crear
              </Button>
            </VStack>
          </Flex>
        </Box>

        {/* Right: Testing Panel */}
        <Box
          flex={1}
          maxW={{ lg: '500px' }}
        >
          <Box
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
            overflow="hidden"
            shadow="sm"
          >
            {/* Header */}
            <Box
              px={6}
              py={4}
              borderBottom="1px solid"
              borderColor="gray.200"
            >
              <Heading as="h3" size="md" fontWeight="600" color="gray.800">
                Testear
              </Heading>
            </Box>

            {/* Messages Area */}
            <Box
              px={6}
              py={4}
              minH="300px"
              maxH="500px"
              overflowY="auto"
              bg="gray.50"
            >
              <VStack spacing={4} align="stretch">
                {/* Empty state for messages */}
                <Text fontSize="sm" color="gray.500" textAlign="center" pt={8}>
                  No hay mensajes todavía
                </Text>
              </VStack>
            </Box>

            {/* Input Area */}
            <Box
              px={6}
              py={4}
              borderTop="1px solid"
              borderColor="gray.200"
              bg="white"
            >
              <VStack spacing={3} align="stretch">
                <Textarea
                  placeholder="Escribe un mensaje..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={1}
                  resize="none"
                  minH="44px"
                  border="1px solid"
                  borderColor="gray.300"
                  borderRadius="md"
                  _focus={{
                    borderColor: '#9D39FE',
                    boxShadow: '0 0 0 1px #9D39FE',
                  }}
                  _placeholder={{ color: 'gray.400' }}
                />
                
                <Button
                  bg="#9D39FE"
                  color="white"
                  _hover={{ bg: '#8B2DE8' }}
                  _disabled={{
                    bg: 'gray.300',
                    cursor: 'not-allowed',
                    opacity: 0.6,
                  }}
                  isDisabled={!message.trim()}
                  size="md"
                  borderRadius="md"
                  fontWeight="500"
                  transition="all 0.2s"
                >
                  Enviar
                </Button>
              </VStack>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}

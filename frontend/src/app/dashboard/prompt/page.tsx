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
} from '@chakra-ui/react';
import { useState } from 'react';

// Icono de robot con cerradura
const RobotIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M12 2C13.1046 2 14 2.89543 14 4V6H16C17.1046 6 18 6.89543 18 8V9C19.6569 9 21 10.3431 21 12V19C21 20.6569 19.6569 22 18 22H6C4.34315 22 3 20.6569 3 19V12C3 10.3431 4.34315 9 6 9V8C6 6.89543 6.89543 6 8 6H10V4C10 2.89543 10.8954 2 12 2ZM16 11H8V19C8 19.5523 8.44772 20 9 20H15C15.5523 20 16 19.5523 16 19V11ZM12 13C12.5523 13 13 13.4477 13 14V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V14C11 13.4477 11.4477 13 12 13Z"
      fill="currentColor"
    />
  </Icon>
);

// Icono de configuración (gear)
const SettingsIcon = (props: any) => (
  <Icon viewBox="0 0 20 20" {...props}>
    <path
      d="M10 6C7.79086 6 6 7.79086 6 10C6 12.2091 7.79086 14 10 14C12.2091 14 14 12.2091 14 10C14 7.79086 12.2091 6 10 6ZM10 12C8.89543 12 8 11.1046 8 10C8 8.89543 8.89543 8 10 8C11.1046 8 12 8.89543 12 10C12 11.1046 11.1046 12 10 12Z"
      fill="currentColor"
    />
    <path
      d="M17.5 9.58C17.55 9.72 17.58 9.86 17.58 10C17.58 10.14 17.55 10.28 17.5 10.42L19.04 11.54C19.18 11.65 19.22 11.85 19.13 12.01L17.69 14.49C17.6 14.65 17.4 14.72 17.24 14.66L15.4 13.98C15.06 14.24 14.69 14.45 14.29 14.61L14 16.58C13.97 16.76 13.81 16.89 13.63 16.89H10.77C10.59 16.89 10.43 16.76 10.4 16.58L10.11 14.61C9.71 14.45 9.34 14.24 9 13.98L7.16 14.66C7 14.72 6.8 14.65 6.71 14.49L5.27 12.01C5.18 11.85 5.22 11.65 5.36 11.54L6.9 10.42C6.85 10.28 6.82 10.14 6.82 10C6.82 9.86 6.85 9.72 6.9 9.58L5.36 8.46C5.22 8.35 5.18 8.15 5.27 7.99L6.71 5.51C6.8 5.35 7 5.28 7.16 5.34L9 6.02C9.34 5.76 9.71 5.55 10.11 5.39L10.4 3.42C10.43 3.24 10.59 3.11 10.77 3.11H13.63C13.81 3.11 13.97 3.24 14 3.42L14.29 5.39C14.69 5.55 15.06 5.76 15.4 6.02L17.24 5.34C17.4 5.28 17.6 5.35 17.69 5.51L19.13 7.99C19.22 8.15 19.18 8.35 19.04 8.46L17.5 9.58Z"
      fill="currentColor"
    />
  </Icon>
);

export default function PromptsPage() {
  const [assistants] = useState([]);

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
          Asistentes
        </Heading>

        <HStack spacing={3}>
          <Button
            leftIcon={<Text fontSize="xl">+</Text>}
            bg="#9D39FE"
            color="white"
            _hover={{ bg: '#8B2DE8' }}
            size="md"
            borderRadius="md"
            fontWeight="500"
            transition="all 0.2s"
          >
            Crear nuevo
          </Button>
          
          <Button
            leftIcon={<SettingsIcon boxSize={5} />}
            variant="outline"
            borderColor="gray.300"
            color="gray.700"
            _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
            size="md"
            borderRadius="md"
            fontWeight="500"
            transition="all 0.2s"
          >
            Ajustes y horarios
          </Button>
        </HStack>
      </Flex>

      {/* Empty State */}
      {assistants.length === 0 && (
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
                fontSize="xl"
                fontWeight="600"
                color="gray.800"
              >
                Crea un asistente
              </Text>
              <Text
                fontSize="md"
                color="gray.500"
              >
                Para poder comenzar
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
      )}
    </Box>
  );
}

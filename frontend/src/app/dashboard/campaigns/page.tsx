'use client';

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  Icon,
} from '@chakra-ui/react';

// Megaphone Icon
const MegaphoneIcon = (props: any) => (
  <Icon viewBox="0 0 21 21" {...props}>
    <path
      d="M18.375 3.9375L10.5 7.875V13.125L18.375 17.0625V3.9375Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 13.125H7C6.53587 13.125 6.09075 12.9406 5.76256 12.6124C5.43437 12.2842 5.25 11.8391 5.25 11.375V9.625C5.25 9.16087 5.43437 8.71575 5.76256 8.38756C6.09075 8.05937 6.53587 7.875 7 7.875H10.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.875 13.125L6.5625 18.375L9.1875 17.0625"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default function CampaignsPage() {
  return (
    <Flex
      direction="column"
      w="full"
      h="100vh"
      bg="#FEFEFE"
      overflow="hidden"
    >
      {/* Header Section */}
      <Box p={6}>
        <Heading
          fontSize="2xl"
          fontWeight="bold"
          color="gray.800"
          mb={2}
        >
          Campañas
        </Heading>
        <Text fontSize="sm" color="gray.600" mb={6}>
          Gestiona tus campañas de mensajería automatizada
        </Text>
      </Box>

      {/* Empty State */}
      <Flex
        flex="1"
        direction="column"
        align="center"
        justify="center"
        p={8}
      >
        <Image
          src="/images/empty_campaigns.svg"
          alt="Sin campañas"
          w="350px"
          h="220px"
          mb={6}
          fallback={
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
              <MegaphoneIcon boxSize={20} color="gray.400" />
            </Box>
          }
        />

        <Heading
          fontSize="xl"
          fontWeight="semibold"
          color="gray.800"
          mb={2}
        >
          Aún no hay campañas disponibles
        </Heading>

        <Text
          fontSize="md"
          color="gray.600"
          mb={8}
          textAlign="center"
        >
          Crea tu primera campaña automatizada para conectar con tus clientes
        </Text>

        <Button
          bg="#9D39FE"
          color="white"
          size="lg"
          _hover={{ bg: '#8B2FE6' }}
          borderRadius="lg"
          fontWeight="semibold"
          px={8}
          py={6}
          aria-label="Crear campaña"
        >
          Crear Nueva Campaña
        </Button>
      </Flex>
    </Flex>
  );
}

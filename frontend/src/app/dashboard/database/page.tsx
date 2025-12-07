'use client';

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
} from '@chakra-ui/react';

// Search Icon
const SearchIcon = (props: any) => (
  <Icon viewBox="0 0 20 21" {...props}>
    <path
      d="M9.16667 16.625C12.8486 16.625 15.8333 13.491 15.8333 9.625C15.8333 5.75901 12.8486 2.625 9.16667 2.625C5.48477 2.625 2.5 5.75901 2.5 9.625C2.5 13.491 5.48477 16.625 9.16667 16.625Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 18.3746L13.875 14.5684"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

// Tag Icon
const TagIcon = (props: any) => (
  <Icon viewBox="0 0 21 21" {...props}>
    <path
      d="M6.5625 6.5625H6.57125M18.4538 12.1713L12.18 18.445C12.0175 18.6077 11.8245 18.7368 11.612 18.8249C11.3996 18.9129 11.1719 18.9583 10.9419 18.9583C10.7119 18.9583 10.4842 18.9129 10.2717 18.8249C10.0593 18.7368 9.86628 18.6077 9.70375 18.445L2.1875 10.9375V2.1875H10.9375L18.4538 9.70375C18.7797 10.0316 18.9626 10.4752 18.9626 10.9375C18.9626 11.3998 18.7797 11.8434 18.4538 12.1713Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

// Download Icon
const DownloadIcon = (props: any) => (
  <Icon viewBox="0 0 21 21" {...props}>
    <path
      d="M18.375 13.125V16.625C18.375 17.0891 18.1906 17.5342 17.8624 17.8624C17.5342 18.1906 17.0891 18.375 16.625 18.375H4.375C3.91087 18.375 3.46575 18.1906 3.13756 17.8624C2.80937 17.5342 2.625 17.0891 2.625 16.625V13.125M6.125 8.75L10.5 13.125M10.5 13.125L14.875 8.75M10.5 13.125V2.625"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default function DatabasePage() {
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
          mb={6}
        >
          Contactos
        </Heading>

        {/* Search and Actions Bar */}
        <Flex gap={3} mb={4}>
          {/* Search Input */}
          <InputGroup flex="1" maxW="400px">
            <InputLeftElement h="full">
              <SearchIcon boxSize={5} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar"
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              h="42px"
              _placeholder={{ color: 'gray.400' }}
              _focus={{
                borderColor: '#9D39FE',
                boxShadow: '0 0 0 1px #9D39FE',
              }}
            />
          </InputGroup>

          {/* Action Buttons */}
          <Flex gap={2}>
            <Button
              leftIcon={<TagIcon boxSize={5} />}
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
              Tags
            </Button>

            <Button
              leftIcon={<DownloadIcon boxSize={5} />}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              color="gray.700"
              size="md"
              _hover={{ bg: 'gray.50' }}
              borderRadius="lg"
              fontWeight="medium"
              px={4}
              isDisabled
              opacity={0.5}
              cursor="not-allowed"
            >
              Descargar
            </Button>
          </Flex>
        </Flex>
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
          src="/images/empty_database.svg"
          alt="Sin datos"
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
              <SearchIcon boxSize={20} color="gray.400" />
            </Box>
          }
        />

        <Heading
          fontSize="xl"
          fontWeight="semibold"
          color="gray.800"
          mb={2}
        >
          Aún no hay datos disponibles
        </Heading>

        <Text
          fontSize="md"
          color="gray.600"
          mb={8}
          textAlign="center"
        >
          ¡Comienza a usar <strong>Prometheo</strong> y empezarás a verlos!
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
          aria-label="Agregar variables"
        >
          Agregar variables
        </Button>
      </Flex>
    </Flex>
  );
}

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

// Icono de Tag con estrella
const TagIcon = (props: any) => (
  <Icon viewBox="0 0 21 28" {...props}>
    <path
      d="M6.5625 14.1836H6.57125M18.4538 19.7923L12.18 26.0661C12.0175 26.2288 11.8245 26.3579 11.612 26.4459C11.3996 26.534 11.1719 26.5793 10.9419 26.5793C10.7119 26.5793 10.4842 26.534 10.2717 26.4459C10.0593 26.3579 9.86628 26.2288 9.70375 26.0661L2.1875 18.5586V9.80859H10.9375L18.4538 17.3248C18.7797 17.6527 18.9626 18.0963 18.9626 18.5586C18.9626 19.0209 18.7797 19.4645 18.4538 19.7923Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.0308 2.75396L13.1729 1.94933L13.6118 2.63858C14.2893 3.70275 15.3825 4.43363 16.6248 4.65311L17.4294 4.79527L16.7402 5.23411C15.676 5.91166 14.9451 7.0048 14.7256 8.24712L14.5835 9.05175L14.1446 8.36251C13.4671 7.29834 12.3739 6.56745 11.1316 6.34797L10.327 6.20582L11.0162 5.76698C12.0804 5.08943 12.8113 3.99629 13.0308 2.75396Z"
      stroke="currentColor"
    />
  </Icon>
);

// Icono de Plus
const AddIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M0,12a1.5,1.5,0,0,0,1.5,1.5h8.75a.25.25,0,0,1,.25.25V22.5a1.5,1.5,0,0,0,3,0V13.75a.25.25,0,0,1,.25-.25H22.5a1.5,1.5,0,0,0,0-3H13.75a.25.25,0,0,1-.25-.25V1.5a1.5,1.5,0,0,0-3,0v8.75a.25.25,0,0,1-.25.25H1.5A1.5,1.5,0,0,0,0,12Z"
    />
  </Icon>
);

export default function SmartTagsPage() {
  return (
    <Flex
      direction="column"
      w="full"
      h="100vh"
      bg="#FEFEFE"
      overflow="hidden"
    >
      {/* Header Section */}
      <Box p={6} borderBottom="1px solid" borderColor="gray.200">
        <Flex justify="space-between" align="center" mb={3}>
          <Heading
            fontSize="2xl"
            fontWeight="bold"
            color="gray.800"
          >
            Smart Tags
          </Heading>

          <Button
            leftIcon={<TagIcon boxSize={5} />}
            bg="#9D39FE"
            color="white"
            size="md"
            _hover={{ bg: '#8B2FE6' }}
            borderRadius="lg"
            fontWeight="medium"
            px={6}
          >
            Tags
          </Button>
        </Flex>

        <Text fontSize="sm" color="gray.600" maxW="2xl">
          Crea y edita tus Smart Tags para que Prometheo pueda clasificar a tus leads automáticamente.
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
          src="/images/empty_tags.svg"
          alt="Sin tags"
          w="226px"
          h="177px"
          mb={6}
          fallback={
            <Box
              w="226px"
              h="177px"
              bg="gray.100"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={6}
            >
              <TagIcon boxSize={20} color="gray.400" />
            </Box>
          }
        />

        <Heading
          fontSize="xl"
          fontWeight="semibold"
          color="gray.800"
          mb={2}
        >
          Aún no tienes smart tags creados
        </Heading>

        <Text
          fontSize="md"
          color="gray.600"
          mb={8}
          textAlign="center"
        >
          ¡Crea tus tags para poder empezar a etiquetar a tus clientes!
        </Text>

        <Button
          leftIcon={<AddIcon />}
          bg="#9D39FE"
          color="white"
          size="lg"
          _hover={{ bg: '#8B2FE6' }}
          borderRadius="lg"
          fontWeight="semibold"
          px={8}
          py={6}
        >
          Crear
        </Button>
      </Flex>
    </Flex>
  );
}

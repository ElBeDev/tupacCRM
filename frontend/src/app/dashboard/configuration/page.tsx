'use client';

import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Divider,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Spinner,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';

// WhatsApp SVG Icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 48 48" width="24" height="24" fill="currentColor">
    <path fillRule="evenodd" d="M23.4571 2.9151C35.0567 2.9151 44.4675 12.3191 44.4675 23.9255C44.4675 35.5318 35.1243 45.1588 23.4571 44.9358C19.1672 44.8548 16.2352 44.544 13.0397 42.1727C10.6009 40.3554 0.967218 49.0568 5.73002 34.809C3.69654 31.5797 2.48726 27.8708 2.43997 23.9255C2.31161 12.3731 11.8507 2.9151 23.4571 2.9151V2.9151Z" clipRule="evenodd" fill="#FEFEFE"/>
    <path fillRule="evenodd" d="M40.6572 7.15101C36.2187 2.71924 30.3277 0.273662 24.0516 0.266907C11.1144 0.266907 0.582158 10.7991 0.575403 23.7364C0.575403 27.8709 1.65632 31.9041 3.71007 35.4643L0.379486 47.6247L12.8236 44.3617C16.2637 46.2376 20.1197 47.2202 24.0381 47.2193H24.0516C36.9889 47.2193 47.5143 36.6939 47.5211 23.7499C47.5278 17.4805 45.089 11.5895 40.6572 7.15101V7.15101ZM16.1812 35.0995C16.3433 35.2009 16.6811 35.2009 17.4648 35.2009C20.7683 35.1941 23.6192 35.1874 25.646 35.1874C35.1175 35.1874 34.8676 25.2159 30.4425 23.9728C31.0911 22.8243 34.0434 20.6625 32.2193 16.2037C30.4088 11.7922 22.6397 12.7921 17.3229 12.7921C15.357 12.7921 15.6475 14.2513 15.661 16.5077C15.6745 20.0883 15.661 29.776 15.661 33.9646C15.661 34.809 15.9177 34.9441 16.1812 35.0995V35.0995ZM20.2752 31.4447H25.092C27.139 31.4379 28.963 30.4854 28.9157 28.4451C28.882 26.5265 27.6051 25.8914 25.8284 25.7158C24.1394 25.7361 22.2073 25.7361 20.2752 25.7361V31.4447ZM20.2752 21.8785C23.8422 21.8312 25.2136 22.0204 27.1593 21.534C28.4969 20.7773 29.0779 17.9602 27.166 17.0076C25.8351 16.3456 21.91 16.5685 20.2752 16.6361V21.8785ZM24.0516 43.2537H24.0381C20.5386 43.2537 17.1067 42.3147 14.1139 40.5379L13.3978 40.1123L6.01378 42.0512L7.98645 34.8563L7.52031 34.1132C5.56817 31.0046 4.5353 27.4071 4.54102 23.7364C4.54102 12.9812 13.2965 4.23253 24.0584 4.23253C29.267 4.23253 34.165 6.26601 37.8468 9.95464C41.5355 13.6365 43.5622 18.5412 43.5622 23.7499C43.5554 34.505 34.8 43.2537 24.0516 43.2537Z" clipRule="evenodd" fill="#25D366"/>
  </svg>
);

// Instagram SVG Icon
const InstagramIcon = () => (
  <svg viewBox="0 0 16 16" width="24" height="24" fill="currentColor">
    <path d="M7.49999 1.35138C9.50258 1.35138 9.73977 1.359 10.5306 1.39508C11.2619 1.42846 11.659 1.55064 11.9233 1.65332C12.2733 1.78937 12.5232 1.95193 12.7856 2.21436C13.0481 2.47679 13.2106 2.72666 13.3467 3.07671C13.4494 3.34102 13.5715 3.73814 13.6049 4.46936C13.641 5.26023 13.6486 5.49742 13.6486 7.50002C13.6486 9.50261 13.641 9.7398 13.6049 10.5306C13.5715 11.2619 13.4494 11.659 13.3467 11.9233C13.2106 12.2734 13.0481 12.5232 12.7856 12.7857C12.5232 13.0481 12.2733 13.2107 11.9233 13.3467C11.659 13.4494 11.2619 13.5716 10.5306 13.6049C9.73989 13.641 9.5027 13.6487 7.49999 13.6487C5.49727 13.6487 5.26008 13.641 4.46936 13.6049C3.73811 13.5716 3.34099 13.4494 3.07671 13.3467C2.72663 13.2107 2.47676 13.0481 2.21433 12.7857C1.9519 12.5232 1.78934 12.2734 1.65332 11.9233C1.55061 11.659 1.42843 11.2619 1.39505 10.5307C1.35897 9.7398 1.35135 9.50261 1.35135 7.50002C1.35135 5.49742 1.35897 5.26023 1.39505 4.46939C1.42843 3.73814 1.55061 3.34102 1.65332 3.07671C1.78934 2.72666 1.9519 2.47679 2.21433 2.21436C2.47676 1.95193 2.72663 1.78937 3.07671 1.65332C3.34099 1.55064 3.73811 1.42846 4.46933 1.39508C5.2602 1.359 5.49739 1.35138 7.49999 1.35138ZM7.49999 0C5.46309 0 5.20771 0.00863368 4.40776 0.0451333C3.60944 0.0815734 3.06427 0.20834 2.58719 0.393755C2.09399 0.585423 1.67574 0.841873 1.25879 1.25882C0.841843 1.67577 0.585393 2.09402 0.393725 2.58721C0.20831 3.0643 0.0815436 3.60947 0.0451035 4.40779C0.0086039 5.20771 0 5.46312 0 7.50002C0 9.53691 0.0086039 9.79232 0.0451035 10.5922C0.0815436 11.3906 0.20831 11.9357 0.393725 12.4128C0.585393 12.906 0.841843 13.3243 1.25879 13.7412C1.67574 14.1582 2.09399 14.4146 2.58719 14.6063C3.06427 14.7917 3.60944 14.9185 4.40776 14.9549C5.20771 14.9914 5.46309 15 7.49999 15C9.53688 15 9.79229 14.9914 10.5922 14.9549C11.3905 14.9185 11.9357 14.7917 12.4128 14.6063C12.906 14.4146 13.3242 14.1582 13.7412 13.7412C14.1581 13.3243 14.4146 12.906 14.6062 12.4128C14.7917 11.9357 14.9184 11.3906 14.9549 10.5922C14.9914 9.79232 15 9.53691 15 7.50002C15 5.46312 14.9914 5.20771 14.9549 4.40779C14.9184 3.60947 14.7917 3.0643 14.6062 2.58721C14.4146 2.09402 14.1581 1.67577 13.7412 1.25882C13.3242 0.841873 12.906 0.585423 12.4128 0.393755C11.9357 0.20834 11.3905 0.0815734 10.5922 0.0451333C9.79229 0.00863368 9.53688 0 7.49999 0ZM7.49999 3.64865C5.37295 3.64865 3.64862 5.37298 3.64862 7.50002C3.64862 9.62706 5.37295 11.3514 7.49999 11.3514C9.62703 11.3514 11.3513 9.62706 11.3513 7.50002C11.3513 5.37298 9.62703 3.64865 7.49999 3.64865ZM7.49999 10C6.11928 10 4.99997 8.88072 4.99997 7.50002C4.99997 6.11931 6.11928 5 7.49999 5C8.88069 5 10 6.11931 10 7.50002C10 8.88072 8.88069 10 7.49999 10ZM12.4035 3.49649C12.4035 3.99355 12.0006 4.39651 11.5035 4.39651C11.0064 4.39651 10.6035 3.99355 10.6035 3.49649C10.6035 2.99943 11.0064 2.5965 11.5035 2.5965C12.0006 2.5965 12.4035 2.99943 12.4035 3.49649Z"/>
  </svg>
);

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState('connections');
  const [isLoading, setIsLoading] = useState(false);
  
  // WhatsApp State
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    checkWhatsAppStatus();
    
    // Initialize Socket.IO
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const newSocket = io(WS_URL);
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('whatsapp:qr', (data: { qr: string }) => {
      console.log('QR received');
      setQrCode(data.qr);
      setWhatsappLoading(false);
    });

    newSocket.on('whatsapp:connected', (data: { phoneNumber: string }) => {
      console.log('WhatsApp connected!');
      setWhatsappConnected(true);
      setQrCode(null);
      setPhoneNumber(data.phoneNumber);
      setWhatsappLoading(false);
      onClose();
    });

    newSocket.on('whatsapp:disconnected', () => {
      console.log('WhatsApp disconnected');
      setWhatsappConnected(false);
      setQrCode(null);
      setPhoneNumber(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const checkWhatsAppStatus = async () => {
    try {
      const response = await api.get('/api/whatsapp/status');
      setWhatsappConnected(response.data.connected);
      if (response.data.phoneNumber) {
        setPhoneNumber(response.data.phoneNumber);
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    }
  };

  const handleWhatsAppConnect = async () => {
    setWhatsappLoading(true);
    setQrCode(null);
    onOpen();
    try {
      await api.post('/api/whatsapp/connect');
      // El QR se recibirá vía Socket.IO
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      setWhatsappLoading(false);
      onClose();
    }
  };

  const handleWhatsAppDisconnect = async () => {
    try {
      await api.post('/api/whatsapp/disconnect');
      setWhatsappConnected(false);
      setQrCode(null);
      setPhoneNumber(null);
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
    }
  };

  return (
    <Box bg="#FEFEFE" minH="100vh" pl={{ base: 0, md: '224px' }} pt={4}>
      <Box maxW="1400px" mx="auto" px={6} py={6}>
        {/* Tabs Header */}
        <Flex gap={4} mb={8} borderBottom="1px solid" borderColor="gray.200">
          <Button
            variant="unstyled"
            px={4}
            pb={3}
            borderBottom="2px solid"
            borderColor={activeTab === 'connections' ? '#9D39FE' : 'transparent'}
            color={activeTab === 'connections' ? '#9D39FE' : 'gray.600'}
            fontWeight={activeTab === 'connections' ? '600' : '400'}
            fontSize="14px"
            _hover={{ color: '#9D39FE' }}
            onClick={() => setActiveTab('connections')}
          >
            Conexiones
          </Button>
          <Button
            variant="unstyled"
            px={4}
            pb={3}
            borderBottom="2px solid"
            borderColor={activeTab === 'integrations' ? '#9D39FE' : 'transparent'}
            color={activeTab === 'integrations' ? '#9D39FE' : 'gray.600'}
            fontWeight={activeTab === 'integrations' ? '600' : '400'}
            fontSize="14px"
            _hover={{ color: '#9D39FE' }}
            onClick={() => setActiveTab('integrations')}
          >
            Integraciones
          </Button>
        </Flex>

        {/* Content Area */}
        <Skeleton isLoaded={!isLoading} minH="400px">
          <Flex gap={6} flexWrap="wrap">
            {/* WhatsApp Card */}
            <Box
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="xl"
              p={6}
              flex="1"
              minW="300px"
              maxW="500px"
              _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              <VStack align="stretch" spacing={4}>
                {/* Header */}
                <HStack justify="space-between" align="flex-start">
                  <HStack spacing={3}>
                    <Box color="#25D366">
                      <WhatsAppIcon />
                    </Box>
                    <Text fontSize="16px" fontWeight="600" color="gray.800">
                      WhatsApp
                    </Text>
                  </HStack>
                  <Badge
                    bg={whatsappConnected ? "green.100" : "gray.100"}
                    color={whatsappConnected ? "green.600" : "gray.600"}
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="12px"
                    fontWeight="500"
                  >
                    {whatsappConnected ? "Conectado" : "No conectado"}
                  </Badge>
                </HStack>

                <Divider />

                {/* Content */}
                <VStack align="stretch" spacing={3} py={2}>
                  {whatsappConnected && phoneNumber ? (
                    <>
                      <HStack justify="space-between">
                        <Text fontSize="13px" color="gray.600">
                          Número:
                        </Text>
                        <Text fontSize="13px" fontWeight="600" color="gray.800">
                          {phoneNumber}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="13px" color="gray.600">
                          Estado:
                        </Text>
                        <HStack spacing={2}>
                          <Box w="2" h="2" borderRadius="full" bg="green.500" />
                          <Text fontSize="13px" fontWeight="600" color="green.600">
                            Activo
                          </Text>
                        </HStack>
                      </HStack>
                    </>
                  ) : (
                    <Text fontSize="14px" color="gray.600">
                      Conecta tu WhatsApp para recibir y enviar mensajes automáticamente
                    </Text>
                  )}
                </VStack>

                {/* Button */}
                {whatsappConnected ? (
                  <Button
                    variant="outline"
                    borderColor="red.500"
                    color="red.500"
                    size="md"
                    borderRadius="md"
                    _hover={{ bg: 'red.50' }}
                    fontSize="14px"
                    fontWeight="600"
                    onClick={handleWhatsAppDisconnect}
                  >
                    Desconectar
                  </Button>
                ) : (
                  <Button
                    bg="#9D39FE"
                    color="white"
                    size="md"
                    borderRadius="md"
                    _hover={{ bg: '#8B2DE8' }}
                    _active={{ bg: '#7A24D6' }}
                    fontSize="14px"
                    fontWeight="600"
                    onClick={handleWhatsAppConnect}
                    isLoading={whatsappLoading}
                  >
                    Conectar
                  </Button>
                )}
              </VStack>
            </Box>

            {/* WhatsApp QR Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
              <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
              <ModalContent borderRadius="xl">
                <ModalHeader>
                  <Text fontSize="20px" fontWeight="700" color="gray.800">
                    Conectar WhatsApp
                  </Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                  <VStack spacing={6} align="center">
                    {/* QR Code Area */}
                    <Box
                      w="280px"
                      h="280px"
                      bg="gray.50"
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="2px solid"
                      borderColor="gray.200"
                    >
                      {whatsappLoading && !qrCode ? (
                        <VStack spacing={3}>
                          <Spinner size="xl" color="#9D39FE" thickness="4px" />
                          <Text fontSize="14px" color="gray.600">
                            Generando código QR...
                          </Text>
                        </VStack>
                      ) : qrCode ? (
                        <Image
                          src={qrCode}
                          alt="WhatsApp QR Code"
                          w="260px"
                          h="260px"
                        />
                      ) : (
                        <Text fontSize="14px" color="gray.500">
                          Esperando código QR...
                        </Text>
                      )}
                    </Box>

                    {/* Instructions */}
                    <VStack align="stretch" spacing={3} w="full">
                      <Text fontSize="16px" fontWeight="600" color="gray.800" textAlign="center">
                        Escanea el código QR
                      </Text>
                      <VStack align="flex-start" spacing={2} pl={4}>
                        <Text fontSize="14px" color="gray.600">
                          1. Abre WhatsApp en tu teléfono
                        </Text>
                        <Text fontSize="14px" color="gray.600">
                          2. Toca Menú o Configuración
                        </Text>
                        <Text fontSize="14px" color="gray.600">
                          3. Toca Dispositivos vinculados
                        </Text>
                        <Text fontSize="14px" color="gray.600">
                          4. Apunta tu teléfono a esta pantalla para escanear el código
                        </Text>
                      </VStack>
                    </VStack>
                  </VStack>
                </ModalBody>
              </ModalContent>
            </Modal>

            {/* Instagram Card */}
            <Box
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="xl"
              p={6}
              flex="1"
              minW="300px"
              maxW="500px"
              _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              <VStack align="stretch" spacing={4}>
                {/* Header */}
                <HStack justify="space-between" align="flex-start">
                  <HStack spacing={3}>
                    <Box color="#E1306C">
                      <InstagramIcon />
                    </Box>
                    <Text fontSize="16px" fontWeight="600" color="gray.800">
                      Instagram
                    </Text>
                  </HStack>
                  <Badge
                    bg="gray.100"
                    color="gray.600"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="12px"
                    fontWeight="500"
                  >
                    No conectado
                  </Badge>
                </HStack>

                <Divider />

                {/* Content */}
                <VStack align="stretch" spacing={3} py={2}>
                  <Text fontSize="14px" color="gray.600">
                    Conecta para ver información
                  </Text>
                </VStack>

                {/* Button */}
                <Button
                  bg="#9D39FE"
                  color="white"
                  size="md"
                  borderRadius="md"
                  _hover={{ bg: '#8B2DE8' }}
                  _active={{ bg: '#7A24D6' }}
                  fontSize="14px"
                  fontWeight="600"
                >
                  Conectar
                </Button>
              </VStack>
            </Box>
          </Flex>
        </Skeleton>
      </Box>
    </Box>
  );
}

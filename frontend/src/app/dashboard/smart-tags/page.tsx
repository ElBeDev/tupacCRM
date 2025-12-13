'use client';

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Select,
  Switch,
  HStack,
  VStack,
  Badge,
  useDisclosure,
  useToast,
  Spinner,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Grid,
  GridItem,
  Divider,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiZap, FiTag } from 'react-icons/fi';

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

// Colores disponibles para tags
const TAG_COLORS = [
  { name: 'Púrpura', value: '#9D39FE' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Naranja', value: '#F59E0B' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Índigo', value: '#6366F1' },
];

// Campos disponibles para condiciones
const CONDITION_FIELDS = [
  { value: 'score', label: 'Score de Lead' },
  { value: 'status', label: 'Estado' },
  { value: 'source', label: 'Fuente' },
];

// Operadores disponibles
const CONDITION_OPERATORS = [
  { value: '>=', label: 'Mayor o igual a' },
  { value: '<=', label: 'Menor o igual a' },
  { value: '==', label: 'Igual a' },
  { value: '!=', label: 'Diferente de' },
  { value: '>', label: 'Mayor que' },
  { value: '<', label: 'Menor que' },
  { value: 'contains', label: 'Contiene' },
];

interface SmartTag {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  conditions?: {
    field: string;
    operator: string;
    value: string | number;
  };
  isAutomatic: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function SmartTagsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();

  const [smartTags, setSmartTags] = useState<SmartTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<SmartTag | null>(null);
  const [tagStats, setTagStats] = useState<Record<string, number>>({});

  // Form states para crear
  const [tagName, setTagName] = useState('');
  const [tagDescription, setTagDescription] = useState('');
  const [tagColor, setTagColor] = useState('#9D39FE');
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [conditionField, setConditionField] = useState('score');
  const [conditionOperator, setConditionOperator] = useState('>=');
  const [conditionValue, setConditionValue] = useState('');

  // Form states para editar
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#9D39FE');
  const [editIsAutomatic, setEditIsAutomatic] = useState(false);
  const [editConditionField, setEditConditionField] = useState('score');
  const [editConditionOperator, setEditConditionOperator] = useState('>=');
  const [editConditionValue, setEditConditionValue] = useState('');

  useEffect(() => {
    loadSmartTags();
    loadTagStats();
  }, []);

  const loadSmartTags = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/smart-tags`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load smart tags');

      const data = await response.json();
      setSmartTags(data);
    } catch (error) {
      console.error('Error loading smart tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTagStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/smart-tags/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTagStats(data);
      }
    } catch (error) {
      console.error('Error loading tag stats:', error);
    }
  };

  const resetForm = () => {
    setTagName('');
    setTagDescription('');
    setTagColor('#9D39FE');
    setIsAutomatic(false);
    setConditionField('score');
    setConditionOperator('>=');
    setConditionValue('');
  };

  const createSmartTag = async () => {
    if (!tagName.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del tag es requerido',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const conditions = isAutomatic && conditionValue
        ? { field: conditionField, operator: conditionOperator, value: conditionValue }
        : null;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/smart-tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: tagName,
          description: tagDescription,
          color: tagColor,
          isAutomatic,
          conditions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create tag');
      }

      toast({
        title: '¡Tag Creado!',
        description: `"${tagName}" se ha creado correctamente`,
        status: 'success',
        duration: 3000,
      });

      resetForm();
      onClose();
      await loadSmartTags();
    } catch (error: any) {
      console.error('Error creating tag:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el tag',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (tag: SmartTag) => {
    setSelectedTag(tag);
    setEditName(tag.name);
    setEditDescription(tag.description || '');
    setEditColor(tag.color);
    setEditIsAutomatic(tag.isAutomatic);
    if (tag.conditions) {
      setEditConditionField(tag.conditions.field);
      setEditConditionOperator(tag.conditions.operator);
      setEditConditionValue(String(tag.conditions.value));
    }
    onEditOpen();
  };

  const updateSmartTag = async () => {
    if (!selectedTag || !editName.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const conditions = editIsAutomatic && editConditionValue
        ? { field: editConditionField, operator: editConditionOperator, value: editConditionValue }
        : null;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/smart-tags/${selectedTag.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName,
            description: editDescription,
            color: editColor,
            isAutomatic: editIsAutomatic,
            conditions,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update tag');

      toast({
        title: 'Tag Actualizado',
        status: 'success',
        duration: 2000,
      });

      onEditClose();
      await loadSmartTags();
    } catch (error) {
      console.error('Error updating tag:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el tag',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSmartTag = async (tagId: string) => {
    if (!confirm('¿Estás seguro de eliminar este tag?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/smart-tags/${tagId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete tag');

      toast({
        title: 'Tag Eliminado',
        status: 'success',
        duration: 2000,
      });

      await loadSmartTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el tag',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Flex direction="column" w="full" h="100vh" bg="#FEFEFE" overflow="hidden">
      {/* Header Section */}
      <Box p={6} borderBottom="1px solid" borderColor="gray.200">
        <Flex justify="space-between" align="center" mb={3}>
          <HStack spacing={3}>
            <Box p={2} bg="linear-gradient(135deg, #9D39FE 0%, #6366F1 100%)" borderRadius="xl">
              <Icon as={FiTag} boxSize={6} color="white" />
            </Box>
            <Box>
              <Heading fontSize="2xl" fontWeight="bold" color="gray.800">
                Smart Tags
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {smartTags.length} tags configurados
              </Text>
            </Box>
          </HStack>

          <Button
            leftIcon={<FiPlus />}
            bg="#9D39FE"
            color="white"
            size="md"
            _hover={{ bg: '#8B2FE6' }}
            borderRadius="xl"
            fontWeight="medium"
            px={6}
            onClick={onOpen}
          >
            Crear Tag
          </Button>
        </Flex>

        <Text fontSize="sm" color="gray.600" maxW="2xl">
          Crea y edita tus Smart Tags para que el sistema pueda clasificar a tus leads automáticamente.
        </Text>
      </Box>

      {/* Content */}
      <Box flex="1" p={6} overflowY="auto">
        {loading && smartTags.length === 0 ? (
          <Flex justify="center" align="center" h="300px">
            <Spinner size="xl" color="purple.500" />
          </Flex>
        ) : smartTags.length === 0 ? (
          /* Empty State */
          <Flex flex="1" direction="column" align="center" justify="center" p={8} minH="400px">
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

            <Heading fontSize="xl" fontWeight="semibold" color="gray.800" mb={2}>
              Aún no tienes smart tags creados
            </Heading>

            <Text fontSize="md" color="gray.600" mb={8} textAlign="center">
              ¡Crea tus tags para poder empezar a etiquetar a tus clientes automáticamente!
            </Text>

            <Button
              leftIcon={<FiPlus />}
              bg="#9D39FE"
              color="white"
              size="lg"
              _hover={{ bg: '#8B2FE6' }}
              borderRadius="lg"
              fontWeight="semibold"
              px={8}
              py={6}
              onClick={onOpen}
            >
              Crear Primer Tag
            </Button>
          </Flex>
        ) : (
          /* Tags Grid */
          <Grid templateColumns="repeat(auto-fill, minmax(320px, 1fr))" gap={4}>
            {smartTags.map((tag) => (
              <GridItem key={tag.id}>
                <Box
                  bg="white"
                  borderRadius="xl"
                  border="1px"
                  borderColor="gray.200"
                  p={5}
                  transition="all 0.2s"
                  _hover={{ shadow: 'md', borderColor: 'purple.200' }}
                >
                  <Flex justify="space-between" align="start" mb={3}>
                    <HStack spacing={3}>
                      <Box
                        w={10}
                        h={10}
                        borderRadius="lg"
                        bg={tag.color}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiTag} boxSize={5} color="white" />
                      </Box>
                      <Box>
                        <Text fontWeight="semibold" color="gray.800">
                          {tag.name}
                        </Text>
                        {tag.isAutomatic && (
                          <Badge colorScheme="purple" fontSize="2xs" borderRadius="full">
                            <HStack spacing={1}>
                              <Icon as={FiZap} boxSize={2} />
                              <Text>Automático</Text>
                            </HStack>
                          </Badge>
                        )}
                      </Box>
                    </HStack>

                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList shadow="lg" borderRadius="xl">
                        <MenuItem icon={<FiEdit2 />} onClick={() => openEditModal(tag)}>
                          Editar
                        </MenuItem>
                        <Divider my={1} />
                        <MenuItem
                          icon={<FiTrash2 />}
                          color="red.500"
                          onClick={() => deleteSmartTag(tag.id)}
                        >
                          Eliminar
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>

                  {tag.description && (
                    <Text fontSize="sm" color="gray.600" mb={3} noOfLines={2}>
                      {tag.description}
                    </Text>
                  )}

                  {tag.conditions && (
                    <Box bg="gray.50" p={3} borderRadius="lg" mb={3}>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Condición automática:
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {CONDITION_FIELDS.find((f) => f.value === tag.conditions?.field)?.label}{' '}
                        {CONDITION_OPERATORS.find((o) => o.value === tag.conditions?.operator)?.label}{' '}
                        <strong>{tag.conditions.value}</strong>
                      </Text>
                    </Box>
                  )}

                  <HStack justify="space-between">
                    <Text fontSize="xs" color="gray.400">
                      {tagStats[tag.name] || 0} contactos
                    </Text>
                    <Box w={4} h={4} borderRadius="full" bg={tag.color} />
                  </HStack>
                </Box>
              </GridItem>
            ))}
          </Grid>
        )}
      </Box>

      {/* Modal de Creación */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" mx={4}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="linear-gradient(135deg, #9D39FE 0%, #6366F1 100%)" borderRadius="xl">
                <Icon as={FiPlus} boxSize={5} color="white" />
              </Box>
              <Box>
                <Text>Crear Smart Tag</Text>
                <Text fontSize="sm" fontWeight="normal" color="gray.500">
                  Configura una nueva etiqueta inteligente
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={5} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Nombre del Tag
                </FormLabel>
                <Input
                  placeholder="Ej: Lead Caliente"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  borderRadius="xl"
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Descripción
                </FormLabel>
                <Textarea
                  placeholder="Descripción opcional del tag"
                  value={tagDescription}
                  onChange={(e) => setTagDescription(e.target.value)}
                  borderRadius="xl"
                  rows={2}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Color
                </FormLabel>
                <HStack spacing={2} flexWrap="wrap">
                  {TAG_COLORS.map((color) => (
                    <Box
                      key={color.value}
                      w={10}
                      h={10}
                      borderRadius="lg"
                      bg={color.value}
                      cursor="pointer"
                      border="3px solid"
                      borderColor={tagColor === color.value ? 'gray.800' : 'transparent'}
                      onClick={() => setTagColor(color.value)}
                      transition="all 0.2s"
                      _hover={{ transform: 'scale(1.1)' }}
                    />
                  ))}
                </HStack>
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel fontSize="sm" fontWeight="medium" mb={0}>
                    Tag Automático
                  </FormLabel>
                  <FormHelperText mt={1}>
                    Aplicar automáticamente según condiciones
                  </FormHelperText>
                </Box>
                <Switch
                  colorScheme="purple"
                  size="lg"
                  isChecked={isAutomatic}
                  onChange={(e) => setIsAutomatic(e.target.checked)}
                />
              </FormControl>

              {isAutomatic && (
                <Box bg="gray.50" p={4} borderRadius="xl">
                  <Text fontSize="sm" fontWeight="medium" mb={3}>
                    Condición para aplicar automáticamente:
                  </Text>
                  <HStack spacing={3}>
                    <Select
                      value={conditionField}
                      onChange={(e) => setConditionField(e.target.value)}
                      borderRadius="lg"
                      size="sm"
                    >
                      {CONDITION_FIELDS.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={conditionOperator}
                      onChange={(e) => setConditionOperator(e.target.value)}
                      borderRadius="lg"
                      size="sm"
                    >
                      {CONDITION_OPERATORS.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </Select>
                    <Input
                      placeholder="Valor"
                      value={conditionValue}
                      onChange={(e) => setConditionValue(e.target.value)}
                      borderRadius="lg"
                      size="sm"
                      w="120px"
                    />
                  </HStack>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose} borderRadius="xl">
              Cancelar
            </Button>
            <Button
              bg="#9D39FE"
              color="white"
              _hover={{ bg: '#8B2FE6' }}
              onClick={createSmartTag}
              isLoading={loading}
              isDisabled={!tagName.trim()}
              borderRadius="xl"
              px={8}
            >
              Crear Tag
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Edición */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" mx={4}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="linear-gradient(135deg, #9D39FE 0%, #6366F1 100%)" borderRadius="xl">
                <Icon as={FiEdit2} boxSize={5} color="white" />
              </Box>
              <Box>
                <Text>Editar Smart Tag</Text>
                <Text fontSize="sm" fontWeight="normal" color="gray.500">
                  Modifica la configuración del tag
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={5} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Nombre del Tag
                </FormLabel>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  borderRadius="xl"
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Descripción
                </FormLabel>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  borderRadius="xl"
                  rows={2}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Color
                </FormLabel>
                <HStack spacing={2} flexWrap="wrap">
                  {TAG_COLORS.map((color) => (
                    <Box
                      key={color.value}
                      w={10}
                      h={10}
                      borderRadius="lg"
                      bg={color.value}
                      cursor="pointer"
                      border="3px solid"
                      borderColor={editColor === color.value ? 'gray.800' : 'transparent'}
                      onClick={() => setEditColor(color.value)}
                      transition="all 0.2s"
                      _hover={{ transform: 'scale(1.1)' }}
                    />
                  ))}
                </HStack>
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel fontSize="sm" fontWeight="medium" mb={0}>
                    Tag Automático
                  </FormLabel>
                  <FormHelperText mt={1}>
                    Aplicar automáticamente según condiciones
                  </FormHelperText>
                </Box>
                <Switch
                  colorScheme="purple"
                  size="lg"
                  isChecked={editIsAutomatic}
                  onChange={(e) => setEditIsAutomatic(e.target.checked)}
                />
              </FormControl>

              {editIsAutomatic && (
                <Box bg="gray.50" p={4} borderRadius="xl">
                  <Text fontSize="sm" fontWeight="medium" mb={3}>
                    Condición para aplicar automáticamente:
                  </Text>
                  <HStack spacing={3}>
                    <Select
                      value={editConditionField}
                      onChange={(e) => setEditConditionField(e.target.value)}
                      borderRadius="lg"
                      size="sm"
                    >
                      {CONDITION_FIELDS.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={editConditionOperator}
                      onChange={(e) => setEditConditionOperator(e.target.value)}
                      borderRadius="lg"
                      size="sm"
                    >
                      {CONDITION_OPERATORS.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </Select>
                    <Input
                      placeholder="Valor"
                      value={editConditionValue}
                      onChange={(e) => setEditConditionValue(e.target.value)}
                      borderRadius="lg"
                      size="sm"
                      w="120px"
                    />
                  </HStack>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onEditClose} borderRadius="xl">
              Cancelar
            </Button>
            <Button
              bg="#9D39FE"
              color="white"
              _hover={{ bg: '#8B2FE6' }}
              onClick={updateSmartTag}
              isLoading={loading}
              isDisabled={!editName.trim()}
              borderRadius="xl"
              px={8}
            >
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Configuración del tema (modo claro/oscuro)
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Paleta de colores extraída de Prometheo
const colors = {
  brand: {
    50: '#f5e5ff',
    100: '#e0b3ff',
    200: '#cc80ff',
    300: '#b84dff',
    400: '#a31aff',
    500: '#9D39FE', // Color principal de Prometheo
    600: '#8a00e6',
    700: '#6600b3',
    800: '#4d0080',
    900: '#33004d',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Estilos globales similar a Prometheo
const styles = {
  global: {
    body: {
      bg: '#FEFEFE', // Fondo exacto de Prometheo
      color: 'gray.800',
      fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    '*::placeholder': {
      color: 'gray.400',
    },
    '*, *::before, &::after': {
      borderColor: 'gray.200',
    },
  },
};

// Componentes personalizados
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'lg',
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
        color: 'white',
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
        },
      }),
      ghost: {
        _hover: {
          bg: 'gray.100',
        },
      },
    },
    defaultProps: {
      colorScheme: 'brand',
    },
  },
  Badge: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
      px: 2,
      py: 0.5,
    },
  },
};

// Configuración de fuentes similar a Prometheo (usan DM Sans)
const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
};

const theme = extendTheme({
  config,
  colors,
  styles,
  components,
  fonts,
});

export default theme;

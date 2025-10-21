/**
 * ATS UI Design System - Design Tokens
 * 
 * This file contains all the design tokens for consistent styling
 * across the ATS UI application.
 */

export const colors = {
  // Primary Colors
  black: '#0D0D0D',
  deepGray: '#1A1A1A',
  mediumGray: '#2B2B2B',
  
  // Accent Colors
  purple: '#A689F3',
  yellow: '#FFD85C',
  green: '#2ECC71',
  red: '#E74C3C',
  
  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    subtle: '#7A7A7A',
  },
  
  // Data Visualization
  chart: {
    line1: '#A689F3',
    line2: '#FFD85C',
    mapDots: '#C5A3FF',
  }
} as const;

export const typography = {
  fontFamily: {
    primary: ['Inter', 'Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'].join(', '),
  },
  
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },
  
  fontSize: {
    heading: {
      min: '20px',
      max: '28px',
      responsive: 'clamp(20px, 2.5vw, 28px)',
    },
    body: {
      min: '14px',
      max: '16px',
      responsive: 'clamp(14px, 1.5vw, 16px)',
    },
    label: {
      min: '12px',
      max: '13px',
      responsive: 'clamp(12px, 1vw, 13px)',
    },
  },
} as const;

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '0.75rem', // 12px
  lg: '1rem',    // 16px
  xl: '1.5rem',  // 24px
  '2xl': '2rem', // 32px
  '3xl': '3rem', // 48px
} as const;

export const borderRadius = {
  sm: '0.125rem', // 2px
  md: '0.375rem', // 6px
  lg: '0.5rem',   // 8px
  xl: '0.75rem',  // 12px
} as const;

// CSS Custom Properties (CSS Variables) for easy usage
export const cssVariables = {
  colors: {
    '--color-black': colors.black,
    '--color-deep-gray': colors.deepGray,
    '--color-medium-gray': colors.mediumGray,
    '--color-purple': colors.purple,
    '--color-yellow': colors.yellow,
    '--color-green': colors.green,
    '--color-red': colors.red,
    '--color-text-primary': colors.text.primary,
    '--color-text-secondary': colors.text.secondary,
    '--color-text-subtle': colors.text.subtle,
    '--color-chart-line-1': colors.chart.line1,
    '--color-chart-line-2': colors.chart.line2,
    '--color-map-dots': colors.chart.mapDots,
  },
  typography: {
    '--font-family-primary': typography.fontFamily.primary,
    '--font-weight-regular': typography.fontWeight.regular.toString(),
    '--font-weight-medium': typography.fontWeight.medium.toString(),
    '--font-weight-semibold': typography.fontWeight.semibold.toString(),
    '--font-size-heading': typography.fontSize.heading.responsive,
    '--font-size-body': typography.fontSize.body.responsive,
    '--font-size-label': typography.fontSize.label.responsive,
  },
} as const;

// Utility function to get CSS variable
export const getCSSVariable = (variable: string): string => `var(${variable})`;

// Component style presets
export const componentStyles = {
  card: {
    dark: {
      backgroundColor: colors.deepGray,
      color: colors.text.primary,
      border: `1px solid ${colors.mediumGray}`,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
    },
  },
  
  button: {
    primary: {
      backgroundColor: colors.purple,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
      padding: `${spacing.sm} ${spacing.lg}`,
      borderRadius: borderRadius.md,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
    },
    secondary: {
      backgroundColor: colors.yellow,
      color: colors.black,
      fontWeight: typography.fontWeight.medium,
      padding: `${spacing.sm} ${spacing.lg}`,
      borderRadius: borderRadius.md,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
    },
  },
  
  input: {
    dark: {
      backgroundColor: colors.deepGray,
      border: `1px solid ${colors.mediumGray}`,
      color: colors.text.primary,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.body.responsive,
    },
  },
} as const;

// Tailwind CSS class mappings for your design system
export const tailwindClasses = {
  backgrounds: {
    black: 'bg-[#0D0D0D]',
    deepGray: 'bg-[#1A1A1A]',
    mediumGray: 'bg-[#2B2B2B]',
    purple: 'bg-[#A689F3]',
    yellow: 'bg-[#FFD85C]',
    green: 'bg-[#2ECC71]',
    red: 'bg-[#E74C3C]',
  },
  
  text: {
    primary: 'text-[#FFFFFF]',
    secondary: 'text-[#B3B3B3]',
    subtle: 'text-[#7A7A7A]',
    purple: 'text-[#A689F3]',
    yellow: 'text-[#FFD85C]',
    green: 'text-[#2ECC71]',
    red: 'text-[#E74C3C]',
  },
  
  borders: {
    mediumGray: 'border-[#2B2B2B]',
    purple: 'border-[#A689F3]',
  },
  
  typography: {
    fontRegular: 'font-normal',
    fontMedium: 'font-medium',
    fontSemibold: 'font-semibold',
  },
} as const;

export type Colors = typeof colors;
export type Typography = typeof typography;
export type ComponentStyles = typeof componentStyles;
export type TailwindClasses = typeof tailwindClasses;
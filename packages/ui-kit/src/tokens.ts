/**
 * Marginalia Design System Tokens
 * Source of truth for color palette, dark mode variants, status indicators, and typography scale.
 */

export const colors = {
  // Light Mode - Marginalia Palette
  paper: '#f7f6f2',        // Background
  ink: '#14141a',          // Primary text, headers, navigation
  highlighter: '#f4b43d',  // Mustard
  marginnote: '#00a896',   // Teal
  fadedInk: '#52525b',     // Muted text
  line: '#e2ddd5',         // Borders
  coral: '#ff5a36',        // Coral accent

  // Status Colors
  statusPending: '#f4b43d',
  statusApproved: '#00a896',
  statusRejected: '#ff5a36',

  // Dark Mode Variants
  dark: {
    paper: '#14141a',        
    ink: '#f7f6f2',          
    highlighter: '#f4b43d',  
    marginnote: '#00a896',   
    fadedInk: '#a1a1aa',     
    line: '#27272a',         
    coral: '#ff5a36',
    statusPending: '#f4b43d',
    statusApproved: '#00a896',
    statusRejected: '#ff5a36',
  },
} as const;

export const typography = {
  fontFamily: {
    display: ['Clash Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    body: ['General Sans', 'Satoshi', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
} as const;

export const Theme = {
  colors,
  typography,
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
} as const;

export type Colors = typeof colors;
export type Typography = typeof typography;

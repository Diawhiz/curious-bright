/**
 * Marginalia Design System Tokens
 * Source of truth for color palette, dark mode variants, status indicators, and typography scale.
 */

export const colors = {
  // Light Mode - Marginalia Palette
  paper: '#F7F7F2',        // Background
  ink: '#1E2A4A',          // Primary text, headers, navigation
  highlighter: '#E8A93B',  // Primary accent - CTAs, active states, repository/reading features
  marginnote: '#2E9E83',   // Secondary accent - Live features ONLY (chat presence, calls, whiteboard cursors)
  fadedInk: '#6B7690',     // Muted text, timestamps, secondary labels
  line: '#DDD9CC',         // Hairline rules, dividers, subtle borders

  // Status Colors
  statusPending: '#E8A93B',  // Highlighter
  statusApproved: '#2E9E83', // Marginnote
  statusRejected: '#B85C4A', // Muted brick

  // Dark Mode Variants
  dark: {
    paper: '#10141F',        // Near-black navy background
    ink: '#F7F7F2',          // Paper text color for contrast
    highlighter: '#E8A93B',  // Holds contrast on dark
    marginnote: '#2E9E83',   // Holds contrast on dark
    fadedInk: '#94A0B8',     // Adjusted faded ink for dark readability
    line: '#242F48',         // Subtle dark divider line
    statusPending: '#E8A93B',
    statusApproved: '#2E9E83',
    statusRejected: '#D46A58',
  },
} as const;

export const typography = {
  fontFamily: {
    display: ['Newsreader', 'Georgia', 'serif'],
    body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
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

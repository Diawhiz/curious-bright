/**
 * Curious Bright Design System Tokens
 * Source of truth for color palette, collaborator accents, typography, and container shape.
 */

export const colors = {
  // Curious Bright Core Palette
  paper: '#F7F6F2',        // Warm paper background
  paperElevated: '#FFFFFF',// Card/panel surface
  ink: '#14141A',          // Primary text & solid ink-black buttons
  fadedInk: '#6B685C',     // Muted text, timestamps, secondary labels
  line: '#E2DFC9',         // Warm rules, dividers, subtle borders
  lineHover: '#C8C4B0',    // Border hover state

  // Collaborator Accents
  coral: '#FF5A36',        // Primary collaborator accent / cursor
  teal: '#00A896',         // Secondary collaborator accent / cursor
  mustard: '#F4B43D',      // Tertiary collaborator accent / cursor

  // Highlights & Status (using plain words, no status dots!)
  highlighter: '#F4B43D',  // Highlighter draw-on accent
  marginnote: '#00A896',   // Live feature accent

  statusPending: '#F4B43D',
  statusApproved: '#00A896',
  statusRejected: '#FF5A36',

  // Dark variant mappings to preserve system token structure
  dark: {
    paper: '#F7F6F2',
    ink: '#14141A',
    highlighter: '#F4B43D',
    marginnote: '#00A896',
    fadedInk: '#6B685C',
    line: '#E2DFC9',
    statusPending: '#F4B43D',
    statusApproved: '#00A896',
    statusRejected: '#FF5A36',
  },
} as const;

export const typography = {
  fontFamily: {
    display: ['Clash Display', 'Georgia', 'serif'],
    body: ['General Sans', 'Satoshi', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'monospace'],
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
    sm: '2px',
    md: '4px',
    lg: '6px',
    commentCorner: '0px 14px 0px 0px',
  },
} as const;

export type Colors = typeof colors;
export type Typography = typeof typography;

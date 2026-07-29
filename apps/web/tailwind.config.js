import { colors, typography } from '@curious-bright/ui-kit';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: colors.paper,
          dark: colors.dark.paper,
        },
        ink: {
          DEFAULT: colors.ink,
          dark: colors.dark.ink,
        },
        highlighter: {
          DEFAULT: colors.highlighter,
          dark: colors.dark.highlighter,
        },
        marginnote: {
          DEFAULT: colors.marginnote,
          dark: colors.dark.marginnote,
        },
        'faded-ink': {
          DEFAULT: colors.fadedInk,
          dark: colors.dark.fadedInk,
        },
        line: {
          DEFAULT: colors.line,
          dark: colors.dark.line,
        },
        status: {
          pending: colors.statusPending,
          approved: colors.statusApproved,
          rejected: colors.statusRejected,
        },
      },
      fontFamily: {
        display: typography.fontFamily.display,
        body: typography.fontFamily.body,
        mono: typography.fontFamily.mono,
      },
    },
  },
  plugins: [],
};

import { colors, typography } from '@curious-bright/ui-kit';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: colors.paper,
          dark: colors.paper,
        },
        ink: {
          DEFAULT: colors.ink,
          dark: colors.ink,
        },
        coral: colors.coral,
        teal: colors.teal,
        mustard: colors.mustard,
        highlighter: {
          DEFAULT: colors.highlighter,
        },
        marginnote: {
          DEFAULT: colors.marginnote,
        },
        coral: {
          DEFAULT: colors.coral,
          dark: colors.dark.coral,
        },
        'faded-ink': {
          DEFAULT: colors.fadedInk,
        },
        line: {
          DEFAULT: colors.line,
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

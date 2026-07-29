import React, { createContext, useContext, useState, ReactNode } from 'react';
import { colors, typography, Colors, Typography } from '@curious-bright/ui-kit';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: {
    paper: string;
    ink: string;
    highlighter: string;
    marginnote: string;
    fadedInk: string;
    line: string;
    statusPending: string;
    statusApproved: string;
    statusRejected: string;
  };
  typography: Typography;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const activeColors = isDarkMode
    ? {
        paper: colors.dark.paper,
        ink: colors.dark.ink,
        highlighter: colors.dark.highlighter,
        marginnote: colors.dark.marginnote,
        fadedInk: colors.dark.fadedInk,
        line: colors.dark.line,
        statusPending: colors.dark.statusPending,
        statusApproved: colors.dark.statusApproved,
        statusRejected: colors.dark.statusRejected,
      }
    : {
        paper: colors.paper,
        ink: colors.ink,
        highlighter: colors.highlighter,
        marginnote: colors.marginnote,
        fadedInk: colors.fadedInk,
        line: colors.line,
        statusPending: colors.statusPending,
        statusApproved: colors.statusApproved,
        statusRejected: colors.statusRejected,
      };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        colors: activeColors,
        typography,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

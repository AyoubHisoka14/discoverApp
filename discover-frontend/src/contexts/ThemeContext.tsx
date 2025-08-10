import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, Theme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    // Try to get theme from localStorage, fallback to 'dark'
    const savedTheme = localStorage.getItem('themeMode');
    return (savedTheme as ThemeMode) || 'dark';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return themeMode === 'dark';
  });

  // Create theme based on current mode
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#1976d2' : '#1976d2',
      },
      secondary: {
        main: isDarkMode ? '#dc004e' : '#dc004e',
      },
      background: {
        default: isDarkMode ? '#121212' : '#f8f9fa',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#2c3e50',
        secondary: isDarkMode ? '#b0b0b0' : '#6c757d',
      },
      divider: isDarkMode ? '#333333' : '#e9ecef',
    },
    typography: {
      h4: {
        fontWeight: 600,
        color: isDarkMode ? '#ffffff' : '#2c3e50',
      },
      h5: {
        fontWeight: 600,
        color: isDarkMode ? '#ffffff' : '#2c3e50',
      },
      h6: {
        fontWeight: 600,
        color: isDarkMode ? '#ffffff' : '#2c3e50',
      },
      body1: {
        color: isDarkMode ? '#e0e0e0' : '#495057',
      },
      body2: {
        color: isDarkMode ? '#b0b0b0' : '#6c757d',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDarkMode 
              ? '0px 2px 4px rgba(0, 0, 0, 0.3)' 
              : '0px 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDarkMode 
              ? '0px 2px 4px rgba(0, 0, 0, 0.3)' 
              : '0px 2px 8px rgba(0, 0, 0, 0.1)',
            border: isDarkMode ? '1px solid #333333' : '1px solid #e9ecef',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDarkMode 
              ? '0px 2px 4px rgba(0, 0, 0, 0.3)' 
              : '0px 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
          contained: {
            boxShadow: isDarkMode 
              ? '0px 2px 4px rgba(0, 0, 0, 0.3)' 
              : '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#333333' : '#f8f9fa',
            border: isDarkMode ? '1px solid #555555' : '1px solid #dee2e6',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            '&.Mui-selected': {
              fontWeight: 600,
            },
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? 'transparent' : '#ffffff',
            borderRadius: '8px',
            padding: '24px',
            marginTop: '16px',
            marginBottom: '16px',
            boxShadow: isDarkMode 
              ? 'none' 
              : '0px 2px 8px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiGrid: {
        styleOverrides: {
          root: {
            '& .MuiPaper-root': {
              borderRadius: '12px',
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            border: isDarkMode ? '2px solid #333333' : '2px solid #e9ecef',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDarkMode ? '#333333' : '#e9ecef',
            margin: '16px 0',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDarkMode 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDarkMode 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
    },
  });

  // Handle theme changes
  useEffect(() => {
    setIsDarkMode(themeMode === 'dark');
  }, [themeMode]);

  // Save theme mode to localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
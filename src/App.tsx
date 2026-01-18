import React, { useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RuleEditorPage from './pages/RuleEditorPage';
import YamlEditorPage from './pages/YamlEditorPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import OutputPage from './pages/OutputPage';

const App: React.FC = () => {
  const { settings } = useApp();

  const theme = useMemo(() => {
    const mode = settings?.theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : (settings?.theme || 'light');

    return createTheme({
      palette: {
        mode: mode as 'light' | 'dark',
        primary: {
          main: '#2196f3',
          light: '#64b5f6',
          dark: '#1976d2',
        },
        secondary: {
          main: '#ff9800',
          light: '#ffb74d',
          dark: '#f57c00',
        },
        background: {
          default: mode === 'dark' ? '#121212' : '#f5f5f5',
          paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
        success: {
          main: '#4caf50',
        },
        error: {
          main: '#f44336',
        },
        warning: {
          main: '#ff9800',
        },
        info: {
          main: '#2196f3',
        },
      },
      typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: settings?.fontSize || 14,
        h1: {
          fontSize: '2.5rem',
          fontWeight: 600,
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 600,
        },
        h3: {
          fontSize: '1.5rem',
          fontWeight: 600,
        },
        h4: {
          fontSize: '1.25rem',
          fontWeight: 600,
        },
        h5: {
          fontSize: '1.1rem',
          fontWeight: 600,
        },
        h6: {
          fontSize: '1rem',
          fontWeight: 600,
        },
        button: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: '8px 16px',
            },
            contained: {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: mode === 'dark' 
                ? '0 2px 8px rgba(0,0,0,0.3)' 
                : '0 2px 8px rgba(0,0,0,0.08)',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 8,
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 6,
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              borderRadius: 6,
              fontSize: '0.75rem',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRadius: 0,
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 16,
            },
          },
        },
      },
    });
  }, [settings?.theme, settings?.fontSize]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/rules" element={<RuleEditorPage />} />
              <Route path="/yaml" element={<YamlEditorPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/output" element={<OutputPage />} />
            </Routes>
          </Layout>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

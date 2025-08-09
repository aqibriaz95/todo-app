import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { TodoProvider } from './context/TodoContext';
import { UIProvider, useUI } from './context/UIContext';
import { SettingsProvider } from './context/SettingsContext';
import { lightTheme, darkTheme } from './theme';
import AuthGuard from './components/auth/AuthGuard';
import Layout from './components/common/Layout';
import TodoDashboard from './components/todos/TodoDashboard';

const AppContent: React.FC = () => {
  const { theme } = useUI();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          body: {
            margin: 0,
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          },
          '#root': {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      />
      
      <SettingsProvider>
        <AuthProvider>
          <TodoProvider>
            <AuthGuard>
              <Layout>
                <TodoDashboard />
              </Layout>
            </AuthGuard>
          </TodoProvider>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <UIProvider>
      <AppContent />
    </UIProvider>
  );
};

export default App;
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import AuthPage from './AuthPage';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser?.isLoggedIn) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

export default AuthGuard;
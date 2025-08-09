import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  useTheme,
} from '@mui/material';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AuthPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: theme.palette.primary.main,
              }}
            >
              Todo App
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Organize your tasks with AI-powered features
            </Typography>
          </Box>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="auth tabs"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTabs-indicator': {
                height: 3,
              },
            }}
            variant="fullWidth"
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <LoginForm onSwitchToRegister={() => setTabValue(1)} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <RegisterForm onSwitchToLogin={() => setTabValue(0)} />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthPage;
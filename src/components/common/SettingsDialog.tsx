import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Key as KeyIcon,
} from '@mui/icons-material';
import { useSettings } from '../../context/SettingsContext';
import { OpenAIService } from '../../services/openai';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { openaiApiKey, setOpenaiApiKey } = useSettings();
  const openaiService = new OpenAIService();

  console.log('SettingsDialog - Current API Key:', openaiApiKey ? 'SET' : 'NOT SET');

  useEffect(() => {
    if (open) {
      setApiKey(openaiApiKey || '');
      setError('');
      setSuccess(false);
    }
  }, [open, openaiApiKey]);

  const handleSave = () => {
    setError('');
    setSuccess(false);

    if (!apiKey.trim()) {
      setOpenaiApiKey('');
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
      return;
    }

    if (!openaiService.validateApiKey(apiKey.trim())) {
      setError('Please enter a valid OpenAI API key (starts with "sk-")');
      return;
    }

    setOpenaiApiKey(apiKey.trim());
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setApiKey(openaiApiKey || '');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <KeyIcon />
        Settings
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            OpenAI API Configuration
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Enter your OpenAI API key to enable AI features like translation and subtask generation.
            Your key is stored locally in your browser and never sent to our servers.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Settings saved successfully!
          </Alert>
        )}

        <TextField
          fullWidth
          label="OpenAI API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          type={showKey ? 'text' : 'password'}
          placeholder="sk-..."
          helperText="Get your API key from https://platform.openai.com/api-keys"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle API key visibility"
                  onClick={() => setShowKey(!showKey)}
                  edge="end"
                >
                  {showKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>
            Privacy Notice
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • Your API key is stored only in your browser's local storage
            • We never transmit or store your key on our servers
            • AI features work by sending requests directly from your browser to our Vercel functions, which then communicate with OpenAI
            • You can remove your key at any time by clearing this field
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
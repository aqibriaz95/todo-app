import React, { useState } from 'react';
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
  Chip,
  Divider,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Translate as TranslateIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { Todo } from '../../types';
import { useTodos } from '../../context/TodoContext';
import { useSettings } from '../../context/SettingsContext';
import { OpenAIService } from '../../services/openai';

interface TranslateDialogProps {
  open: boolean;
  onClose: () => void;
  todo: Todo;
}

const TranslateDialog: React.FC<TranslateDialogProps> = ({ open, onClose, todo }) => {
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [lastTranslation, setLastTranslation] = useState<{language: string, text: string} | null>(null);
  
  const { addTranslation, switchToLanguage, switchToOriginal } = useTodos();
  const { openaiApiKey } = useSettings();
  const openaiService = new OpenAIService();

  console.log('TranslateDialog - API Key available:', !!openaiApiKey);

  const handleTranslate = async () => {
    if (!targetLanguage.trim()) {
      setError('Please enter a target language');
      return;
    }

    if (!openaiApiKey) {
      // Demo mode - simple mock translation
      const mockTitle = `[Demo: ${targetLanguage}] ${todo.title}`;
      const mockDescription = todo.description ? `[Demo: ${targetLanguage}] ${todo.description}` : undefined;
      
      addTranslation(todo.id, targetLanguage.trim().toLowerCase(), mockTitle, mockDescription);
      switchToLanguage(todo.id, targetLanguage.trim().toLowerCase());
      
      setLastTranslation({
        language: targetLanguage.trim(),
        text: `Title: ${mockTitle}${mockDescription ? `\nDescription: ${mockDescription}` : ''}`
      });
      setTargetLanguage('');
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);
    setError('');

    try {
      // First translate the title
      const translatedTitle = await openaiService.translateText(
        todo.title,
        targetLanguage.trim(),
        openaiApiKey
      );

      // Then translate the description if it exists
      let translatedDescription: string | undefined;
      if (todo.description && todo.description.trim()) {
        translatedDescription = await openaiService.translateText(
          todo.description,
          targetLanguage.trim(),
          openaiApiKey
        );
      }

      // Save the translation and switch to it
      addTranslation(todo.id, targetLanguage.trim().toLowerCase(), translatedTitle, translatedDescription);
      switchToLanguage(todo.id, targetLanguage.trim().toLowerCase());
      
      setLastTranslation({
        language: targetLanguage.trim(),
        text: `Title: ${translatedTitle}${translatedDescription ? `\nDescription: ${translatedDescription}` : ''}`
      });
      setTargetLanguage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyTranslation = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClose = () => {
    setTargetLanguage('');
    setError('');
    setLastTranslation(null);
    onClose();
  };

  const existingTranslations = Object.entries(todo.translations);

  const handleSwitchToLanguage = (language: string) => {
    console.log('TranslateDialog - Switching to language:', language);
    console.log('TranslateDialog - Todo before switch:', todo);
    switchToLanguage(todo.id, language);
    handleClose();
  };

  const handleSwitchToOriginal = () => {
    switchToOriginal(todo.id);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TranslateIcon />
          Translate Task
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Current Task ({todo.currentLanguage === todo.originalLanguage ? 'Original' : todo.currentLanguage})
          </Typography>
          <Box sx={{ p: 2, bgcolor: todo.currentLanguage === todo.originalLanguage ? 'grey.50' : 'info.50', borderRadius: 1, border: '1px solid', borderColor: todo.currentLanguage === todo.originalLanguage ? 'grey.200' : 'info.200' }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              {todo.title}
            </Typography>
            {todo.description && (
              <Typography variant="body2" color="textSecondary">
                {todo.description}
              </Typography>
            )}
          </Box>
          
          {todo.currentLanguage !== todo.originalLanguage && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Original ({todo.originalLanguage}):
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  {todo.originalTitle}
                </Typography>
                {todo.originalDescription && (
                  <Typography variant="body2" color="textSecondary">
                    {todo.originalDescription}
                  </Typography>
                )}
              </Box>
              <Button
                size="small"
                onClick={handleSwitchToOriginal}
                sx={{ mt: 1 }}
                variant="outlined"
              >
                Switch to Original
              </Button>
            </Box>
          )}
        </Box>

        {!openaiApiKey && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Please set your OpenAI API key in Settings to use translation features.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Translate to:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              label="Target Language"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              placeholder="e.g., Spanish, French, German, Japanese..."
              disabled={isTranslating}
              autoFocus={true}
              helperText={!openaiApiKey ? 'Demo mode active - set OpenAI API key in Settings for real translation' : 'Enter any language name'}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isTranslating && targetLanguage.trim()) {
                  handleTranslate();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleTranslate}
              disabled={isTranslating || !targetLanguage.trim()}
              startIcon={isTranslating ? <CircularProgress size={20} /> : <TranslateIcon />}
              sx={{ minWidth: 120, height: 56 }}
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </Button>
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Enter any language name (e.g., "Spanish", "French", "Japanese")
          </Typography>
        </Box>

        {lastTranslation && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.main' }}>
              Latest Translation ({lastTranslation.language}):
            </Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'success.50', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'success.200',
              position: 'relative'
            }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {lastTranslation.text}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleCopyTranslation(lastTranslation.text)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        {existingTranslations.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" gutterBottom>
              Available Translations:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {existingTranslations.map(([language]) => (
                <Chip
                  key={language}
                  label={language}
                  variant={todo.currentLanguage === language ? "filled" : "outlined"}
                  size="small"
                  onClick={() => handleSwitchToLanguage(language)}
                  clickable
                  color={todo.currentLanguage === language ? "primary" : "default"}
                />
              ))}
            </Box>
            <Typography variant="caption" color="textSecondary">
              Click on a language to switch the task to that language
            </Typography>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TranslateDialog;
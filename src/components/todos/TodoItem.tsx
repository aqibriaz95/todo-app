import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Translate as TranslateIcon,
  AutoAwesome as AIIcon,
  MoreVert as MoreIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { Todo } from '../../types';
import { useTodos } from '../../context/TodoContext';
import { useSettings } from '../../context/SettingsContext';
import { OpenAIService } from '../../services/openai';
import SubtasksList from './SubtasksList';
import TranslateDialog from './TranslateDialog';
import ConfirmDialog from './ConfirmDialog';

interface TodoItemProps {
  todo: Todo;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const [expanded, setExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  
  const { toggleComplete, deleteTodo, addSubtask } = useTodos();
  const { openaiApiKey } = useSettings();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleToggleComplete = () => {
    toggleComplete(todo.id);
  };

  const handleDelete = () => {
    deleteTodo(todo.id);
    setDeleteConfirmOpen(false);
  };

  const handleCopy = () => {
    const text = `${todo.title}\n${todo.description || ''}`.trim();
    navigator.clipboard.writeText(text);
    handleMenuClose();
  };

  const handleGenerateSubtasks = async () => {
    setIsGeneratingSubtasks(true);
    handleMenuClose();
    
    console.log('Generating subtasks for:', todo.title);
    console.log('API Key available:', !!openaiApiKey);
    
    const openaiService = new OpenAIService();

    if (!openaiApiKey) {
      console.error('No OpenAI API key, using demo mode');
      // Demo mode - generate mock subtasks for testing in the current task language
      const currentLang = todo.currentLanguage;
      const isSpanish = currentLang === 'spanish' || currentLang === 'español';
      const isFrench = currentLang === 'french' || currentLang === 'français';
      
      let demoSubtasks;
      if (isSpanish) {
        demoSubtasks = [
          `Investigar e informarse sobre "${todo.title}"`,
          `Crear un plan o esquema para "${todo.title}"`,
          `Comenzar a trabajar en los componentes principales`,
          `Revisar y probar el trabajo`,
          `Completar y finalizar "${todo.title}"`
        ];
      } else if (isFrench) {
        demoSubtasks = [
          `Rechercher et s'informer sur "${todo.title}"`,
          `Créer un plan ou un schéma pour "${todo.title}"`,
          `Commencer à travailler sur les composants principaux`,
          `Réviser et tester le travail`,
          `Terminer et finaliser "${todo.title}"`
        ];
      } else {
        demoSubtasks = [
          `Research and gather information about "${todo.title}"`,
          `Create a plan or outline for "${todo.title}"`,
          `Begin working on the main components`,
          `Review and test the work`,
          `Complete and finalize "${todo.title}"`
        ];
      }
      
      console.log('Generated demo subtasks in', currentLang, ':', demoSubtasks);
      addSubtask(todo.id, demoSubtasks);
      alert(`Generated ${demoSubtasks.length} demo subtasks in ${currentLang}! (Set OpenAI API key in Settings for AI-powered subtasks)`);
      setIsGeneratingSubtasks(false);
      return;
    }

    try {
      console.log('Calling generateSubtasks in language:', todo.currentLanguage);
      
      // Determine the target language for subtask generation
      let targetLanguage = 'English';
      if (todo.currentLanguage === 'spanish' || todo.currentLanguage === 'español') {
        targetLanguage = 'Spanish';
      } else if (todo.currentLanguage === 'french' || todo.currentLanguage === 'français') {
        targetLanguage = 'French';
      } else if (todo.currentLanguage !== 'en' && todo.currentLanguage !== 'english') {
        // For other languages, capitalize the first letter
        targetLanguage = todo.currentLanguage.charAt(0).toUpperCase() + todo.currentLanguage.slice(1);
      }
      
      console.log('Target language for subtasks:', targetLanguage);
      
      const subtaskTitles = await openaiService.generateSubtasks(
        todo.title,
        todo.description || '',
        openaiApiKey,
        targetLanguage
      );
      
      console.log('Generated subtasks:', subtaskTitles);
      addSubtask(todo.id, subtaskTitles);
      alert(`Generated ${subtaskTitles.length} subtasks in ${targetLanguage} successfully!`);
    } catch (err) {
      console.error('Subtask generation failed:', err);
      alert(`Subtask generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const completedSubtasks = todo.subtasks.filter(s => s.completed).length;
  const totalSubtasks = todo.subtasks.length;
  const hasTranslations = Object.keys(todo.translations).length > 0;

  return (
    <>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Checkbox
              checked={todo.completed}
              onChange={handleToggleComplete}
              sx={{ mt: -1 }}
              color="primary"
            />
            
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.7 : 1,
                    wordBreak: 'break-word',
                  }}
                >
                  {todo.title}
                </Typography>
                
                {totalSubtasks > 0 && (
                  <Chip
                    size="small"
                    label={`${completedSubtasks}/${totalSubtasks}`}
                    color={completedSubtasks === totalSubtasks ? 'success' : 'default'}
                    variant="outlined"
                  />
                )}
                
                {hasTranslations && (
                  <Chip
                    size="small"
                    icon={<TranslateIcon />}
                    label={todo.currentLanguage === todo.originalLanguage ? `${Object.keys(todo.translations).length} translations` : todo.currentLanguage}
                    color={todo.currentLanguage === todo.originalLanguage ? 'info' : 'primary'}
                    variant={todo.currentLanguage === todo.originalLanguage ? 'outlined' : 'filled'}
                  />
                )}
              </Box>

              {todo.description && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.7 : 1,
                    mb: 2,
                    wordBreak: 'break-word',
                  }}
                >
                  {todo.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="textSecondary">
                  Created: {formatDate(todo.createdAt)}
                  {todo.updatedAt !== todo.createdAt && (
                    <> • Updated: {formatDate(todo.updatedAt)}</>
                  )}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {totalSubtasks > 0 && (
                    <Tooltip title={expanded ? 'Hide subtasks' : 'Show subtasks'}>
                      <IconButton
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                      >
                        {expanded ? <CollapseIcon /> : <ExpandIcon />}
                      </IconButton>
                    </Tooltip>
                  )}

                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>

          {totalSubtasks > 0 && (
            <Collapse in={expanded} timeout={300}>
              <Divider sx={{ my: 2 }} />
              <SubtasksList todo={todo} />
            </Collapse>
          )}
        </CardContent>
      </Card>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { setTranslateOpen(true); handleMenuClose(); }}>
          <ListItemIcon>
            <TranslateIcon />
          </ListItemIcon>
          Translate
        </MenuItem>
        <MenuItem onClick={handleGenerateSubtasks} disabled={isGeneratingSubtasks}>
          <ListItemIcon>
            <AIIcon />
          </ListItemIcon>
          {isGeneratingSubtasks ? 'Generating...' : 
           totalSubtasks > 0 ? `Regenerate Subtasks (${todo.currentLanguage === todo.originalLanguage ? 'English' : todo.currentLanguage})` :
           `Generate Subtasks (${todo.currentLanguage === todo.originalLanguage ? 'English' : todo.currentLanguage})`}
        </MenuItem>
        <MenuItem onClick={handleCopy}>
          <ListItemIcon>
            <CopyIcon />
          </ListItemIcon>
          Copy Text
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setDeleteConfirmOpen(true); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <TranslateDialog
        open={translateOpen}
        onClose={() => setTranslateOpen(false)}
        todo={todo}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${todo.title}"? This action cannot be undone.`}
      />
    </>
  );
};

export default TodoItem;
import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material';
import { useTodos } from '../../context/TodoContext';

const AddTodoForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');
  
  const { addTodo } = useTodos();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    addTodo(title.trim(), description.trim() || undefined);
    setTitle('');
    setDescription('');
    setExpanded(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleSubmit(event);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            label="Add a new task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            error={!!error}
            helperText={error || 'Press Ctrl+Enter to submit'}
            variant="outlined"
            autoFocus
            placeholder="What needs to be done?"
          />
          
          <Tooltip title={expanded ? 'Less options' : 'More options'}>
            <IconButton
              onClick={() => setExpanded(!expanded)}
              sx={{ mt: 0.5 }}
            >
              {expanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          </Tooltip>
          
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ 
              mt: 0.5,
              px: 3,
              py: 1.5,
              minWidth: 120,
            }}
            disabled={!title.trim()}
          >
            Add Task
          </Button>
        </Box>

        <Collapse in={expanded} timeout={300}>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              rows={3}
              variant="outlined"
              placeholder="Add more details about this task..."
              helperText="Provide additional context or instructions for this task"
            />
          </Box>
        </Collapse>
      </Box>

      {expanded && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="textSecondary">
            💡 Pro tip: Use AI features to translate tasks or generate subtasks after creating them
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AddTodoForm;
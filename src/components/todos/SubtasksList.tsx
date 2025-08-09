import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  LinearProgress,
  Alert,
} from '@mui/material';
import { Todo } from '../../types';
import { useTodos } from '../../context/TodoContext';

interface SubtasksListProps {
  todo: Todo;
}

const SubtasksList: React.FC<SubtasksListProps> = ({ todo }) => {
  const { toggleSubtaskComplete } = useTodos();

  if (todo.subtasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="textSecondary">
          No subtasks yet. Use AI to generate subtasks for this task.
        </Typography>
      </Box>
    );
  }

  const completedSubtasks = todo.subtasks.filter(s => s.completed).length;
  const totalSubtasks = todo.subtasks.length;
  const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

  const handleToggleSubtask = (subtaskId: string) => {
    toggleSubtaskComplete(todo.id, subtaskId);
  };

  // Check if subtasks might be in a different language than the current task
  const taskIsTranslated = todo.currentLanguage !== todo.originalLanguage;
  const showLanguageHint = taskIsTranslated && totalSubtasks > 0;

  return (
    <Box>
      {showLanguageHint && (
        <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
          💡 Tip: These subtasks were generated in the original language. 
          Use "Regenerate Subtasks" to create new ones in {todo.currentLanguage}.
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Subtasks Progress
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {completedSubtasks} of {totalSubtasks} completed
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
            },
          }}
        />
      </Box>

      <List dense sx={{ width: '100%' }}>
        {todo.subtasks
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((subtask) => (
            <ListItem key={subtask.id} disablePadding>
              <ListItemButton
                onClick={() => handleToggleSubtask(subtask.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    edge="start"
                    checked={subtask.completed}
                    onChange={() => handleToggleSubtask(subtask.id)}
                    size="small"
                    color="primary"
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: subtask.completed ? 'line-through' : 'none',
                        opacity: subtask.completed ? 0.7 : 1,
                        fontWeight: subtask.completed ? 'normal' : 500,
                      }}
                    >
                      {subtask.title}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

export default SubtasksList;
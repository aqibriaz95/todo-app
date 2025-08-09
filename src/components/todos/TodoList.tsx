import React from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import {
  Assignment as EmptyIcon,
} from '@mui/icons-material';
import { Todo } from '../../types';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
}

const TodoList: React.FC<TodoListProps> = ({ todos }) => {
  if (todos.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          textAlign: 'center',
        }}
      >
        <EmptyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No tasks found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Your filtered tasks will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ space: 2 }}>
      {todos.map((todo) => (
        <Box key={todo.id} sx={{ mb: 2 }}>
          <Paper 
            elevation={1}
            sx={{ 
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                elevation: 3,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <TodoItem todo={todo} />
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default TodoList;
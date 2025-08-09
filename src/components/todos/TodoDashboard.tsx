import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Fade,
} from '@mui/material';
import {
  List as ListIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as ActiveIcon,
} from '@mui/icons-material';
import { useTodos } from '../../context/TodoContext';
import AddTodoForm from './AddTodoForm';
import TodoList from './TodoList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && (
        <Fade in={true} timeout={300}>
          <Box>{children}</Box>
        </Fade>
      )}
    </div>
  );
};

const TodoDashboard: React.FC = () => {
  const [filterTab, setFilterTab] = useState(0);
  const { todos } = useTodos();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setFilterTab(newValue);
  };

  const getFilteredTodos = () => {
    switch (filterTab) {
      case 1: // Active
        return todos.filter(todo => !todo.completed);
      case 2: // Completed
        return todos.filter(todo => todo.completed);
      default: // All
        return todos;
    }
  };

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          My Tasks
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', mb: 3 }}>
          {todos.length === 0 
            ? "You haven't created any tasks yet. Start by adding your first task!"
            : `${activeTodosCount} active, ${completedTodosCount} completed`
          }
        </Typography>
        
        <AddTodoForm />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={filterTab}
          onChange={handleTabChange}
          aria-label="todo filter tabs"
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
            },
          }}
        >
          <Tab 
            icon={<ListIcon />} 
            label={`All (${todos.length})`} 
            iconPosition="start" 
            sx={{ textTransform: 'none', fontSize: '0.95rem' }}
          />
          <Tab 
            icon={<ActiveIcon />} 
            label={`Active (${activeTodosCount})`} 
            iconPosition="start" 
            sx={{ textTransform: 'none', fontSize: '0.95rem' }}
          />
          <Tab 
            icon={<CompletedIcon />} 
            label={`Completed (${completedTodosCount})`} 
            iconPosition="start" 
            sx={{ textTransform: 'none', fontSize: '0.95rem' }}
          />
        </Tabs>
      </Box>

      <TabPanel value={filterTab} index={0}>
        <TodoList todos={getFilteredTodos()} />
      </TabPanel>
      <TabPanel value={filterTab} index={1}>
        <TodoList todos={getFilteredTodos()} />
      </TabPanel>
      <TabPanel value={filterTab} index={2}>
        <TodoList todos={getFilteredTodos()} />
      </TabPanel>
    </Container>
  );
};

export default TodoDashboard;
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TodoContextType, Todo, Subtask } from '../types';
import { LocalStorageService } from '../services/localStorage';
import { useAuth } from './AuthContext';

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const localStorageService = new LocalStorageService();

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const userTodos = localStorageService.getTodos(currentUser.id);
      setTodos(userTodos);
    } else {
      setTodos([]);
    }
  }, [currentUser]);

  const addTodo = (title: string, description?: string) => {
    if (!currentUser) return;

    try {
      const newTodo = localStorageService.addTodo(currentUser.id, {
        title,
        description: description || '',
        completed: false,
        originalLanguage: 'en',
        originalTitle: title,
        originalDescription: description || '',
        currentLanguage: 'en',
        translations: {},
        subtasks: [],
      });
      setTodos(prev => [...prev, newTodo]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const updateTodo = (todoId: string, updates: Partial<Todo>) => {
    if (!currentUser) return;

    console.log('TodoContext - updateTodo called:', { todoId, updates });

    try {
      const success = localStorageService.updateTodo(currentUser.id, todoId, updates);
      console.log('TodoContext - localStorage update success:', success);
      
      if (success) {
        setTodos(prev => {
          const newTodos = prev.map(todo => 
            todo.id === todoId 
              ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
              : todo
          );
          console.log('TodoContext - Updated todos in state:', newTodos);
          return newTodos;
        });
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = (todoId: string) => {
    if (!currentUser) return;

    try {
      const success = localStorageService.deleteTodo(currentUser.id, todoId);
      if (success) {
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const toggleComplete = (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      updateTodo(todoId, { completed: !todo.completed });
    }
  };

  const addSubtask = (todoId: string, subtaskTitles: string[]) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const newSubtasks: Subtask[] = subtaskTitles.map((title, index) => ({
      id: `subtask_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      completed: false,
      orderIndex: todo.subtasks.length + index,
    }));

    const updatedSubtasks = [...todo.subtasks, ...newSubtasks];
    updateTodo(todoId, { subtasks: updatedSubtasks });
  };

  const toggleSubtaskComplete = (todoId: string, subtaskId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const updatedSubtasks = todo.subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );

    updateTodo(todoId, { subtasks: updatedSubtasks });
  };

  const addTranslation = (todoId: string, language: string, translatedTitle: string, translatedDescription?: string) => {
    if (!currentUser) return;

    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const updatedTranslations = {
      ...todo.translations,
      [language.toLowerCase()]: {
        title: translatedTitle,
        description: translatedDescription,
      },
    };

    updateTodo(todoId, { translations: updatedTranslations });
  };

  const switchToLanguage = (todoId: string, language: string) => {
    if (!currentUser) return;

    const todo = todos.find(t => t.id === todoId);
    if (!todo) {
      console.error('Todo not found:', todoId);
      return;
    }

    console.log('Switching to language:', language);
    console.log('Available translations:', todo.translations);
    
    const translation = todo.translations[language.toLowerCase()];
    if (!translation) {
      console.error('Translation not found for language:', language.toLowerCase());
      console.error('Available languages:', Object.keys(todo.translations));
      return;
    }

    console.log('Found translation:', translation);

    updateTodo(todoId, {
      title: translation.title,
      description: translation.description || '',
      currentLanguage: language.toLowerCase(),
    });

    // Note: Subtasks remain in their original language for now
    // They can be regenerated in the new language if needed
    console.log('Subtasks remain in original language. Use "Generate Subtasks" to create new ones in', language);
  };

  const switchToOriginal = (todoId: string) => {
    if (!currentUser) return;

    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    updateTodo(todoId, {
      title: todo.originalTitle,
      description: todo.originalDescription || '',
      currentLanguage: todo.originalLanguage,
    });
  };

  const clearSubtasks = (todoId: string) => {
    if (!currentUser) return;

    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    updateTodo(todoId, { subtasks: [] });
  };

  const value: TodoContextType = {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    addSubtask,
    toggleSubtaskComplete,
    addTranslation,
    switchToLanguage,
    switchToOriginal,
    clearSubtasks,
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};
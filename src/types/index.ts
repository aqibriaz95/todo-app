export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  isLoggedIn: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  orderIndex: number;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  originalLanguage: string;
  originalTitle: string;
  originalDescription?: string;
  currentLanguage: string;
  translations: Record<string, { title: string; description?: string }>;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  currentUser: CurrentUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface TodoContextType {
  todos: Todo[];
  addTodo: (title: string, description?: string) => void;
  updateTodo: (todoId: string, updates: Partial<Todo>) => void;
  deleteTodo: (todoId: string) => void;
  toggleComplete: (todoId: string) => void;
  addSubtask: (todoId: string, subtaskTitles: string[]) => void;
  toggleSubtaskComplete: (todoId: string, subtaskId: string) => void;
  addTranslation: (todoId: string, language: string, translatedTitle: string, translatedDescription?: string) => void;
  switchToLanguage: (todoId: string, language: string) => void;
  switchToOriginal: (todoId: string) => void;
  clearSubtasks: (todoId: string) => void;
}

export interface UIContextType {
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleTheme: () => void;
}

export interface SettingsContextType {
  openaiApiKey: string | null;
  setOpenaiApiKey: (key: string) => void;
}

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  openaiKey: string;
}

export interface TranslationResponse {
  translatedText: string;
}

export interface SubtaskGenerationRequest {
  todoTitle: string;
  todoDescription?: string;
  openaiKey: string;
}

export interface SubtaskGenerationResponse {
  subtasks: string[];
}
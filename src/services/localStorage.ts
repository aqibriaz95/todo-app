import { User, CurrentUser, Todo } from '../types';

export class LocalStorageService {
  private readonly USERS_KEY = 'todo_users';
  private readonly CURRENT_USER_KEY = 'current_user';
  private readonly TODO_PREFIX = 'todo_items_';

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  createUser(username: string, password: string): Promise<User> {
    return new Promise(async (resolve, reject) => {
      try {
        const users = this.getUsers();
        
        if (users.find(u => u.username === username)) {
          reject(new Error('Username already exists'));
          return;
        }

        const hashedPassword = await this.hashPassword(password);
        const newUser: User = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          username,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        resolve(newUser);
      } catch (error) {
        reject(error);
      }
    });
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      const users = this.getUsers();
      const hashedPassword = await this.hashPassword(password);
      
      const user = users.find(u => u.username === username && u.password === hashedPassword);
      return user || null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  getCurrentUser(): CurrentUser | null {
    try {
      const stored = localStorage.getItem(this.CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  setCurrentUser(user: CurrentUser | null): void {
    try {
      if (user) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.CURRENT_USER_KEY);
      }
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  private getUsers(): User[] {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  getTodos(userId: string): Todo[] {
    try {
      const stored = localStorage.getItem(`${this.TODO_PREFIX}${userId}`);
      const todos = stored ? JSON.parse(stored) : [];
      
      // Migrate old todos to new structure
      return todos.map((todo: any) => {
        if (!todo.originalTitle) {
          // Migrate old translation format (string) to new format (object)
          const migratedTranslations: Record<string, { title: string; description?: string }> = {};
          if (todo.translations && typeof todo.translations === 'object') {
            Object.entries(todo.translations).forEach(([lang, translation]) => {
              if (typeof translation === 'string') {
                // Old format: translation was a single string
                migratedTranslations[lang] = {
                  title: translation,
                  description: undefined,
                };
              } else {
                // New format: translation is already an object
                migratedTranslations[lang] = translation as { title: string; description?: string };
              }
            });
          }

          return {
            ...todo,
            originalTitle: todo.title,
            originalDescription: todo.description || '',
            currentLanguage: todo.originalLanguage || 'en',
            translations: migratedTranslations,
          };
        }
        
        // Also migrate translations format for existing todos with originalTitle
        if (todo.translations && typeof todo.translations === 'object') {
          const migratedTranslations: Record<string, { title: string; description?: string }> = {};
          Object.entries(todo.translations).forEach(([lang, translation]) => {
            if (typeof translation === 'string') {
              migratedTranslations[lang] = {
                title: translation,
                description: undefined,
              };
            } else {
              migratedTranslations[lang] = translation as { title: string; description?: string };
            }
          });
          
          return {
            ...todo,
            translations: migratedTranslations,
          };
        }
        
        return todo;
      });
    } catch (error) {
      console.error('Error getting todos:', error);
      return [];
    }
  }

  saveTodos(userId: string, todos: Todo[]): void {
    try {
      localStorage.setItem(`${this.TODO_PREFIX}${userId}`, JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
      throw error;
    }
  }

  addTodo(userId: string, todo: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Todo {
    try {
      const todos = this.getTodos(userId);
      const newTodo: Todo = {
        ...todo,
        id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      todos.push(newTodo);
      this.saveTodos(userId, todos);
      return newTodo;
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  }

  updateTodo(userId: string, todoId: string, updates: Partial<Todo>): boolean {
    try {
      const todos = this.getTodos(userId);
      const todoIndex = todos.findIndex(t => t.id === todoId);
      
      if (todoIndex === -1) {
        return false;
      }

      todos[todoIndex] = {
        ...todos[todoIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      this.saveTodos(userId, todos);
      return true;
    } catch (error) {
      console.error('Error updating todo:', error);
      return false;
    }
  }

  deleteTodo(userId: string, todoId: string): boolean {
    try {
      const todos = this.getTodos(userId);
      const filteredTodos = todos.filter(t => t.id !== todoId);
      
      if (filteredTodos.length === todos.length) {
        return false;
      }
      
      this.saveTodos(userId, filteredTodos);
      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      return false;
    }
  }

  saveTranslation(userId: string, todoId: string, language: string, translatedTitle: string, translatedDescription?: string): void {
    try {
      const todos = this.getTodos(userId);
      const todo = todos.find(t => t.id === todoId);
      
      if (todo) {
        todo.translations[language.toLowerCase()] = {
          title: translatedTitle,
          description: translatedDescription,
        };
        todo.updatedAt = new Date().toISOString();
        this.saveTodos(userId, todos);
      }
    } catch (error) {
      console.error('Error saving translation:', error);
    }
  }

  getTranslation(userId: string, todoId: string, language: string): { title: string; description?: string } | null {
    try {
      const todos = this.getTodos(userId);
      const todo = todos.find(t => t.id === todoId);
      
      return todo?.translations[language.toLowerCase()] || null;
    } catch (error) {
      console.error('Error getting translation:', error);
      return null;
    }
  }

  clearAllData(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.TODO_PREFIX) || key === this.USERS_KEY || key === this.CURRENT_USER_KEY) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  exportUserData(userId: string): string {
    try {
      const todos = this.getTodos(userId);
      const currentUser = this.getCurrentUser();
      
      return JSON.stringify({
        user: currentUser,
        todos,
        exportedAt: new Date().toISOString(),
      }, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  importUserData(userId: string, jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.todos && Array.isArray(data.todos)) {
        this.saveTodos(userId, data.todos);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}
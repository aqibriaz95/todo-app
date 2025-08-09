# Claude Code Prompt: Free To-Do Application with localStorage

Build a complete React-based To-Do application with localStorage persistence, Vercel serverless functions, and OpenAI integration. 100% free deployment.

## Project Overview
Create a modern to-do application with AI-powered features including translation and subtask generation. All data stored locally in browser with simple authentication, deployed entirely on Vercel free tier.

## Tech Stack (100% Free)
- **Frontend**: React 18+ with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Storage**: localStorage (browser storage)
- **Authentication**: Simple localStorage-based matching
- **API Functions**: Vercel serverless functions
- **AI Services**: OpenAI API (user provides key)
- **Deployment**: Vercel (frontend + serverless functions)

## Project Structure
```
todo-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Login/Register components
│   │   ├── todos/          # Todo-related components
│   │   └── common/         # Shared components
│   ├── services/           # localStorage and API services
│   ├── context/            # React context for state
│   ├── hooks/              # Custom hooks
│   ├── types/              # TypeScript definitions
│   └── utils/              # Helper functions
├── api/                    # Vercel serverless functions
│   ├── translate.js        # OpenAI translation endpoint
│   └── generate-subtasks.js # OpenAI subtask generation
├── public/
├── package.json
└── vercel.json
```

## Core Features Implementation

### 1. Add To-Do Items ✅
- **Frontend**: Material-UI form with TextField and Button
- **Storage**: Save to localStorage with user_id association
- **Data Structure**: Array of todo objects with unique IDs
- **Features**: Title (required), description (optional), timestamps

### 2. Mark Items as Completed ✅
- **Frontend**: Checkbox component with visual feedback
- **Storage**: Update todo object in localStorage array
- **UI**: Strike-through completed items, color changes
- **Persistence**: All changes saved immediately to localStorage

### 3. Translate To-Do Items ✅
- **Frontend**: Translate button per item + language input dialog
- **API**: Vercel serverless function calls OpenAI
- **Storage**: Cache translations in localStorage to avoid re-API calls
- **Features**: 
  - Free-text language input (not dropdown)
  - Display original and translated text
  - Translation history per item
  - Error handling for API failures

### 4. AI-Generated Subtasks ✅
- **Frontend**: "Generate Subtasks" button per todo item
- **API**: Vercel serverless function with OpenAI integration
- **Storage**: Subtasks stored as nested array in todo object
- **Features**:
  - Generate 3-5 relevant subtasks per main task
  - Each subtask independently completable
  - Hierarchical display under parent item
  - Persist subtasks with parent todo

## Data Structure (localStorage)

### Users (localStorage key: 'todo_users')
```javascript
[
  {
    id: "user_123",
    username: "john_doe",
    password: "hashed_password", // simple hash
    createdAt: "2025-01-01T00:00:00Z"
  }
]
```

### Todos (localStorage key: 'todo_items_${userId}')
```javascript
[
  {
    id: "todo_456",
    userId: "user_123",
    title: "Learn React",
    description: "Complete React tutorial",
    completed: false,
    originalLanguage: "en",
    translations: {
      "spanish": "Aprender React",
      "french": "Apprendre React"
    },
    subtasks: [
      {
        id: "subtask_789",
        title: "Set up development environment",
        completed: true,
        orderIndex: 0
      }
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  }
]
```

### Current User (localStorage key: 'current_user')
```javascript
{
  id: "user_123",
  username: "john_doe",
  isLoggedIn: true
}
```

## Vercel Serverless Functions

### /api/translate.js
```javascript
// POST /api/translate
// Body: { text: string, targetLanguage: string, openaiKey: string }
// Returns: { translatedText: string }
```

### /api/generate-subtasks.js
```javascript
// POST /api/generate-subtasks
// Body: { todoTitle: string, todoDescription: string, openaiKey: string }
// Returns: { subtasks: string[] }
```

## Frontend Components

### Authentication Components
1. **AuthPage**: Login/Register toggle with tabs
2. **LoginForm**: Username/password with validation
3. **RegisterForm**: Username/password/confirm with validation
4. **AuthGuard**: Protect routes, redirect to login

### Todo Components
1. **TodoDashboard**: Main container with all todos
2. **TodoList**: Display todos with filters (all/active/completed)
3. **TodoItem**: Individual todo with all actions
4. **AddTodoForm**: Create new todos with validation
5. **TranslateDialog**: Language input and translation display
6. **SubtasksList**: Nested subtasks with checkboxes
7. **ConfirmDialog**: Delete confirmations

### Shared Components
1. **Layout**: App header with logout, theme toggle
2. **LoadingSpinner**: For API operations
3. **ErrorSnackbar**: Error message display
4. **SettingsDialog**: OpenAI API key input

## State Management

### React Context Providers
```typescript
// AuthContext: User state, login/logout functions
// TodoContext: Todos array, CRUD operations
// UIContext: Loading states, errors, theme
// SettingsContext: OpenAI API key management
```

### Custom Hooks
```typescript
// useLocalStorage: Generic localStorage hook
// useAuth: Authentication operations
// useTodos: Todo CRUD with localStorage
// useOpenAI: API calls to Vercel functions
// useTranslation: Translation management
// useSubtasks: Subtask generation and management
```

## Services Layer

### localStorage Service
```typescript
class LocalStorageService {
  // User management
  createUser(username: string, password: string): User
  authenticateUser(username: string, password: string): User | null
  getCurrentUser(): User | null
  
  // Todo management
  getTodos(userId: string): Todo[]
  saveTodos(userId: string, todos: Todo[]): void
  addTodo(userId: string, todo: Todo): void
  updateTodo(userId: string, todoId: string, updates: Partial<Todo>): void
  deleteTodo(userId: string, todoId: string): void
  
  // Translation cache
  saveTranslation(todoId: string, language: string, translation: string): void
  getTranslation(todoId: string, language: string): string | null
}
```

### OpenAI Service
```typescript
class OpenAIService {
  async translateText(text: string, targetLanguage: string, apiKey: string): Promise<string>
  async generateSubtasks(title: string, description: string, apiKey: string): Promise<string[]>
}
```

## Material-UI Implementation

### Theme Configuration
- Light/Dark mode toggle
- Custom color palette
- Responsive breakpoints
- Consistent spacing and typography

### Key Components Used
- **AppBar**: Top navigation with user info
- **Drawer**: Side navigation (optional)
- **Card**: Todo item containers
- **TextField**: All form inputs
- **Button/IconButton**: Actions
- **Checkbox**: Completion toggles
- **Dialog**: Modals for translate, settings
- **Snackbar**: Success/error messages
- **Tabs**: Auth page toggle
- **List/ListItem**: Todo and subtask display

## Authentication Implementation

### Simple Password Hashing
```javascript
// Use browser's SubtleCrypto API for basic hashing
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### Auth Flow
1. **Register**: Check username uniqueness, hash password, save to localStorage
2. **Login**: Verify username/password match, set current user
3. **Logout**: Clear current user from localStorage
4. **Auto-login**: Check for current user on app load

## OpenAI Integration

### Translation Function
```javascript
export default async function handler(req, res) {
  const { text, targetLanguage, openaiKey } = req.body;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "system",
      content: `Translate the following text to ${targetLanguage}. Return only the translation.`
    }, {
      role: "user",
      content: text
    }],
    max_tokens: 100
  });
  
  res.json({ translatedText: response.choices[0].message.content });
}
```

### Subtask Generation Function
```javascript
export default async function handler(req, res) {
  const { todoTitle, todoDescription, openaiKey } = req.body;
  
  const prompt = `Break down this task into 3-5 specific, actionable subtasks:
  
Title: ${todoTitle}
Description: ${todoDescription}

Return only a JSON array of subtask titles.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.0-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200
  });
  
  const subtasks = JSON.parse(response.choices[0].message.content);
  res.json({ subtasks });
}
```

## Error Handling & UX

### Error Scenarios
- OpenAI API failures (show cached translations, retry option)
- localStorage quota exceeded (cleanup old data)
- Network errors (offline functionality)
- Invalid JSON in localStorage (reset to defaults)

### Loading States
- Skeleton loaders for todo list
- Spinners for AI operations
- Disabled buttons during API calls
- Progress indicators for bulk operations

### User Experience
- Optimistic updates (instant UI feedback)
- Keyboard shortcuts (Enter to add, Escape to cancel)
- Auto-save all changes
- Responsive design for mobile
- Offline-first functionality

## Deployment Configuration

### vercel.json
```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Environment Variables (Vercel)
```
# Set in Vercel dashboard - these are public anyway in client-side
REACT_APP_OPENAI_MODEL=gpt-4o-mini
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "react-scripts start",
    "build": "react-scripts build",
    "deploy": "vercel --prod"
  }
}
```

## Success Criteria
The application should:
1. ✅ Work completely offline after first load
2. ✅ Simple username/password registration and login
3. ✅ Add, edit, complete todos with localStorage persistence
4. ✅ Translate todos to any language via OpenAI
5. ✅ Generate AI-powered subtasks for each todo
6. ✅ Beautiful Material-UI interface, responsive design
7. ✅ Deploy to Vercel free tier successfully
8. ✅ Handle errors gracefully with user feedback
9. ✅ Fast performance with optimistic updates
10. ✅ Data persists across browser sessions

## Additional Features
- Export/import data (JSON download/upload)
- Search and filter todos
- Keyboard navigation
- Dark/light theme persistence
- Usage statistics (todos completed, AI calls made)

## Getting Started Command
```bash
claude-code "Build a complete todo application using React, Material-UI, and localStorage for persistence. Deploy on Vercel with serverless functions for OpenAI API calls. Follow the exact specifications above - implement simple authentication with localStorage, todo CRUD operations, AI translation, and subtask generation. Make it responsive and handle all edge cases. The app should work completely offline except for AI features."
```
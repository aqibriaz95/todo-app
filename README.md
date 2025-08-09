# Todo App with AI Features

A modern, feature-rich Todo application built with React, TypeScript, and Material-UI. Includes AI-powered translation and subtask generation using OpenAI's API.

## 🚀 Features

### Core Features
- ✅ **Add/Edit/Delete Tasks** - Create and manage your todo items
- ✅ **Mark as Complete** - Track your progress with checkboxes
- ✅ **Subtasks** - Break down complex tasks into smaller steps
- ✅ **Persistent Storage** - All data stored locally in your browser
- ✅ **User Authentication** - Simple username/password system

### AI-Powered Features
- 🔤 **Translation** - Translate tasks to any language using OpenAI
- 🤖 **AI Subtask Generation** - Automatically generate actionable subtasks
- 💾 **Translation Cache** - Avoid re-translating the same content

### UI/UX Features
- 🎨 **Material-UI Design** - Clean, modern interface
- 🌙 **Dark/Light Theme** - Toggle between themes
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Optimistic Updates** - Instant UI feedback
- 🔍 **Filter & Search** - View all, active, or completed tasks

## 🛠️ Tech Stack

- **Frontend**: React 18+ with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Build Tool**: Vite
- **Storage**: localStorage (browser storage)
- **Authentication**: Simple localStorage-based matching
- **API Functions**: Vercel serverless functions
- **AI Services**: OpenAI GPT-4o-mini API (user provides key)
- **Deployment**: Vercel (frontend + serverless functions)

## 📋 Prerequisites

- Node.js 18+ and npm
- OpenAI API key (optional, for AI features)

## 🏃‍♂️ Quick Start

### Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd todo-app
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 🚀 Deployment on Vercel

### Option 1: Deploy via GitHub (Recommended)

1. Push your code to a GitHub repository
2. Visit [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your GitHub repository
4. Vercel will automatically detect the React app and deploy it
5. Your app will be available at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Follow the prompts** and your app will be deployed

## 🔧 Configuration

### OpenAI API Setup

To use AI features (translation and subtask generation):

1. **Get an OpenAI API key:**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account and generate an API key
   - Copy the key (starts with `sk-`)

2. **Add your API key in the app:**
   - Open the app and log in
   - Click the profile icon → Settings
   - Paste your OpenAI API key
   - Click Save

### Privacy & Security

- ✅ **Local Storage Only**: All user data stored in browser localStorage
- ✅ **No User Data Collection**: No personal data sent to external servers
- ✅ **API Key Security**: OpenAI keys stored locally, never on our servers
- ✅ **Direct API Calls**: Translation/AI requests go directly to OpenAI via Vercel functions

## 📖 How to Use

### Getting Started

1. **Create Account**: Register with a username and password
2. **Add Tasks**: Use the input field to create your first todo
3. **Manage Tasks**: Check off completed items, edit, or delete as needed

### AI Features

#### Translation
1. Click the menu (⋮) on any task
2. Select "Translate"
3. Enter target language (e.g., "Spanish", "French", "Japanese")
4. Click "Translate" - translation appears instantly
5. Previous translations are cached and accessible

#### Subtask Generation
1. Click the menu (⋮) on any task
2. Select "Generate Subtasks"
3. AI automatically creates 3-5 actionable subtasks
4. Check off subtasks as you complete them
5. Progress bar shows overall completion

### Tips
- **Keyboard Shortcuts**: Press Ctrl+Enter to quickly add tasks
- **Theme Toggle**: Click the sun/moon icon to switch themes
- **Bulk Actions**: Use filters to focus on specific task types
- **Data Export**: Use browser dev tools to backup localStorage data

## 🏗️ Project Structure

```
todo-app/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Login/Register components
│   │   ├── todos/          # Todo-related components
│   │   └── common/         # Shared components
│   ├── services/           # localStorage and API services
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── theme/              # Material-UI theme configuration
│   └── utils/              # Helper functions
├── api/                    # Vercel serverless functions
│   ├── translate.js        # OpenAI translation endpoint
│   └── generate-subtasks.js # OpenAI subtask generation
├── public/                 # Static assets
└── vercel.json            # Vercel deployment configuration
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

### Environment Variables

No environment variables required for basic functionality. The app works entirely client-side with localStorage.

For Vercel deployment, all API calls are handled through serverless functions that receive the OpenAI API key from the client.

## 📄 API Endpoints

### `/api/translate`
- **Method**: POST
- **Body**: `{ text: string, targetLanguage: string, openaiKey: string }`
- **Response**: `{ translatedText: string }`

### `/api/generate-subtasks`
- **Method**: POST  
- **Body**: `{ todoTitle: string, todoDescription: string, openaiKey: string }`
- **Response**: `{ subtasks: string[] }`

## 🐛 Troubleshooting

### Common Issues

**"Invalid OpenAI API key" error:**
- Ensure your API key starts with `sk-`
- Check that you have credits in your OpenAI account
- Verify the key hasn't been deleted or disabled

**Translation/AI features not working:**
- Set your OpenAI API key in Settings first
- Check your internet connection
- Verify you have OpenAI API credits

**Data not persisting:**
- Ensure you're not in private/incognito mode
- Check that localStorage is enabled in your browser
- Clear cache and reload if experiencing issues

**Build/deployment issues:**
- Run `npm run build` locally to test
- Check Node.js version (18+ required)
- Ensure all dependencies are installed

### Browser Compatibility

- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+

## 🤝 Contributing

This is a complete, production-ready application. Feel free to fork and modify for your own use!

## 📜 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Material-UI](https://mui.com/)
- AI powered by [OpenAI](https://openai.com/)
- Deployed on [Vercel](https://vercel.com/)

---

**Enjoy organizing your tasks with AI! 🚀**
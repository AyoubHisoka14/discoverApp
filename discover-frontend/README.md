# Discover Frontend

A modern React application for the Discover app, providing an intuitive interface for discovering movies, TV series, and anime with AI-powered recommendations.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with Material-UI
- **Content Discovery**: Browse and search movies, TV series, and anime
- **AI Recommendations**: Personalized content suggestions
- **User Authentication**: Secure login and registration
- **Watchlist Management**: Save and organize content you want to watch
- **Reviews & Ratings**: Rate and review content
- **Community Channels**: Join discussions about content
- **Real-time Chat**: Message other users in channels
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes

## 🛠️ Tech Stack

- **Framework**: React 18.2.0
- **Language**: TypeScript 4.9.5
- **UI Library**: Material-UI (MUI) 5.14.0
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router DOM 6.3.0
- **Animations**: Framer Motion 12.23.12
- **Data Fetching**: React Query 3.39.3
- **Carousel**: React Slick
- **Build Tool**: Create React App

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running (see backend README)

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd discover-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory (copy from `env.example`):
   ```env
   # API Configuration
   REACT_APP_API_URL=http://localhost:8080

   # External APIs
   REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
   REACT_APP_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

   # Feature Flags
   REACT_APP_ENABLE_ANALYTICS=false
   REACT_APP_ENABLE_PWA=false
   REACT_APP_ENABLE_DEBUG_MODE=true
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ContentCard.tsx
│   ├── Navigation.tsx
│   ├── SearchBar.tsx
│   └── ...
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Content.tsx
│   ├── Profile.tsx
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── services/           # API services
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── hooks/              # Custom React hooks
│   └── usePageState.ts
└── App.tsx             # Main app component
```

## 🎨 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App
npm run eject
```

## 🌐 Pages

- **Home**: Landing page with featured content
- **Search**: Search and filter content
- **Content Details**: Detailed view of movies/series/anime
- **Profile**: User profile and settings
- **Watchlist**: User's saved content
- **Channels**: Community discussion channels
- **AI**: AI-powered recommendations
- **Dashboard**: User dashboard (if authenticated)

## 🎯 Key Components

### ContentCard
Displays content information in a card format with hover effects.

### Navigation
Responsive navigation bar with mobile menu.

### SearchBar
Search functionality with autocomplete suggestions.

### ContentGrid
Grid layout for displaying multiple content items.

### ChannelCard
Displays channel information and member count.

## 🔒 Authentication

The app uses JWT tokens for authentication:
- Tokens are stored in localStorage
- Automatic token refresh
- Protected routes for authenticated users

## 🎨 Theming

The app supports both light and dark themes:
- Theme context manages global theme state
- Material-UI theme provider
- Smooth theme transitions

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly interactions
- Optimized for all screen sizes

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8080

# External APIs
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
REACT_APP_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_PWA=false
REACT_APP_ENABLE_DEBUG_MODE=true
```

### Proxy Configuration

The app is configured to proxy API requests to the backend:
```json
{
  "proxy": "http://localhost:8080"
}
```

## 🧪 Testing

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in CI mode
npm test -- --watchAll=false
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Error**
   - Ensure backend is running on port 8080
   - Check CORS configuration in backend

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npx tsc --noEmit`

3. **Performance Issues**
   - Use React DevTools Profiler
   - Check for unnecessary re-renders
   - Optimize images and assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 
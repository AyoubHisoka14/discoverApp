# Discover App

A full-stack application for discovering movies, TV series, and anime with AI-powered recommendations and community features.

## 🚀 Overview

Discover App is a comprehensive platform that helps users find and discuss their favorite content. It combines the power of multiple APIs (TMDB, Jikan, OpenAI, Gemini) to provide personalized recommendations and a rich community experience.

## 🏗️ Architecture

This is a monorepo containing both the backend and frontend applications:

```
discover-app/
├── discover-backend/     # Spring Boot API
├── discover-frontend/    # React Application
└── README.md            # This file
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.6
- **Language**: Java 17
- **Database**: PostgreSQL
- **Security**: JWT Authentication
- **APIs**: TMDB, Jikan (MyAnimeList), OpenAI, Gemini

### Frontend
- **Framework**: React 18.2.0
- **Language**: TypeScript 4.9.5
- **UI Library**: Material-UI (MUI) 5.14.0
- **State Management**: React Context API
- **HTTP Client**: Axios

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- PostgreSQL 12+
- Maven 3.6+

### 1. Clone the Repository
```bash
git clone <repository-url>
cd discover-app
```

### 2. Start the Backend
```bash
cd discover-backend

# Configure your database and API keys in application.properties
# Then run:
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080`

### 3. Start the Frontend
```bash
cd discover-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 📋 Features

### 🎬 Content Discovery
- Browse movies, TV series, and anime
- Search across multiple content types
- Filter by genres, ratings, and release dates
- Detailed content information and trailers

### 🤖 AI Recommendations
- Personalized content suggestions
- AI-powered recommendation engine
- Text-based content discovery
- Learning from user preferences

### 👥 Community Features
- Create and join discussion channels
- Real-time messaging system
- User reviews and ratings
- Content moderation tools

### 👤 User Management
- Secure authentication with JWT
- User profiles and preferences
- Watchlist management
- Activity tracking

### 📱 Modern UI/UX
- Responsive design for all devices
- Dark/light theme support
- Smooth animations and transitions
- Intuitive navigation

## 🔧 Configuration

### Backend Configuration
Create `discover-backend/.env` file (copy from `discover-backend/env.example`):

```env
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/discover_db
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_EXPIRATION=86400000

# External API Keys
TMDB_API_KEY=your_tmdb_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend Configuration
Create `discover-frontend/.env` file (copy from `discover-frontend/env.example`):

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

## 📚 API Documentation

Once the backend is running, access the Swagger UI at:
`http://localhost:8080/swagger-ui.html`

## 🧪 Testing

### Backend Tests
```bash
cd discover-backend
mvn test
```

### Frontend Tests
```bash
cd discover-frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
```bash
cd discover-backend
mvn clean package
java -jar target/discover-backend-0.0.1-SNAPSHOT.jar
```

### Frontend Deployment
```bash
cd discover-frontend
npm run build
# Deploy the 'build' folder to your hosting service
```

## 📁 Project Structure

### Backend Structure
```
discover-backend/
├── src/main/java/com/discoverapp/
│   ├── controller/     # REST API controllers
│   ├── service/        # Business logic
│   ├── repository/     # Data access layer
│   ├── entity/         # JPA entities
│   ├── dto/           # Data transfer objects
│   ├── security/      # Authentication & authorization
│   └── external/      # External API clients
└── src/main/resources/
    └── application.properties
```

### Frontend Structure
```
discover-frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts
│   ├── services/      # API services
│   ├── types/         # TypeScript definitions
│   └── hooks/         # Custom React hooks
└── public/            # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔗 Links

- [Backend Documentation](discover-backend/README.md)
- [Frontend Documentation](discover-frontend/README.md)
- [API Documentation](http://localhost:8080/swagger-ui.html)

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

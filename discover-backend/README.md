# Discover Backend

A Spring Boot backend application for the Discover app, providing APIs for movie, series, and anime discovery with AI-powered recommendations.

## 🚀 Features

- **Content Discovery**: Browse movies, TV series, and anime
- **AI Recommendations**: Personalized content suggestions using AI
- **User Management**: Authentication and user profiles
- **Watchlist Management**: Save and track content you want to watch
- **Reviews & Ratings**: User reviews and ratings system
- **Channel System**: Community channels for content discussion
- **Real-time Chat**: Messaging system within channels
- **External API Integration**: TMDB, Jikan (MyAnimeList), OpenAI, Gemini

## 🛠️ Tech Stack

- **Framework**: Spring Boot 3.2.6
- **Language**: Java 17
- **Database**: PostgreSQL
- **Security**: Spring Security with JWT
- **Documentation**: OpenAPI 3 (Swagger)
- **Build Tool**: Maven
- **External APIs**: TMDB, Jikan, OpenAI, Gemini

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- Docker (optional)

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd discover-backend
   ```

2. **Configure Database**
   - Create a PostgreSQL database
   - Update `application.properties` with your database credentials

3. **Configure External APIs**
   - Get API keys for:
     - TMDB (The Movie Database)
     - Jikan (MyAnimeList API)
     - OpenAI
     - Gemini (Google AI)
   - Add them to `application.properties`

4. **Run the Application**
   ```bash
   # Using Maven
   mvn spring-boot:run
   
   # Or using Docker
   docker-compose up
   ```

## 🌐 API Endpoints

The application runs on `http://localhost:8080`

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Content
- `GET /api/content` - Get content list
- `GET /api/content/{id}` - Get content details
- `GET /api/content/search` - Search content

### Recommendations
- `POST /api/recommendations` - Get AI recommendations

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add to watchlist
- `PUT /api/watchlist/{id}` - Update watchlist item

### Channels
- `GET /api/channels` - Get channels
- `POST /api/channels` - Create channel
- `GET /api/channels/{id}/messages` - Get channel messages

## 📚 API Documentation

Once the application is running, you can access the Swagger UI at:
`http://localhost:8080/swagger-ui.html`

## 🗄️ Database Schema

The application uses JPA entities for:
- Users
- Content (Movies, Series, Anime)
- Reviews
- Watchlist Items
- Channels
- Messages
- Genres

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Rate limiting
- CORS configuration

## 🧪 Testing

```bash
# Run tests
mvn test

# Run with coverage
mvn test jacoco:report
```

## 🐳 Docker

```bash
# Build image
docker build -t discover-backend .

# Run container
docker run -p 8080:8080 discover-backend
```

## 📝 Environment Variables

Create a `.env` file (copy from `env.example`) with:

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 
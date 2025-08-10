# Setup Guide - Discover App

This guide will help you set up the Discover App with proper configuration and API keys.

## 🚨 Security Notice

**Never commit API keys or sensitive configuration to version control!** This guide shows you how to properly configure your environment variables.

## 📋 Prerequisites

- Java 17+
- Node.js 16+
- PostgreSQL 12+
- Maven 3.6+

## 🔧 Backend Setup

### 1. Database Setup

1. **Install PostgreSQL** if you haven't already
2. **Create a database**:
   ```sql
   CREATE DATABASE discover_db;
   CREATE USER discover_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE discover_db TO discover_user;
   ```

### 2. API Keys Setup

You'll need to obtain API keys from the following services:

#### TMDB (The Movie Database)
1. Go to [TMDB](https://www.themoviedb.org/)
2. Create an account
3. Go to Settings → API
4. Request an API key
5. Copy your API key

#### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account
3. Go to API Keys
4. Create a new API key
5. Copy your API key

#### Gemini (Google AI)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create an API key
4. Copy your API key

### 3. Environment Configuration

1. **Navigate to the backend directory**:
   ```bash
   cd discover-backend
   ```

2. **Copy the example environment file**:
   ```bash
   cp env.example .env
   ```

3. **Edit the `.env` file** with your actual values:
   ```env
   # Database Configuration
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/discover_db
   SPRING_DATASOURCE_USERNAME=discover_user
   SPRING_DATASOURCE_PASSWORD=your_actual_password

   # JWT Configuration
   JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
   JWT_EXPIRATION=86400000

   # External API Keys
   TMDB_API_KEY=your_actual_tmdb_api_key_here
   OPENAI_API_KEY=your_actual_openai_api_key_here
   GEMINI_API_KEY=your_actual_gemini_api_key_here

   # CORS Configuration
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Start the backend**:
   ```bash
   mvn spring-boot:run
   ```

## 🔧 Frontend Setup

### 1. Environment Configuration

1. **Navigate to the frontend directory**:
   ```bash
   cd discover-frontend
   ```

2. **Copy the example environment file**:
   ```bash
   cp env.example .env
   ```

3. **Edit the `.env` file** with your actual values:
   ```env
   # API Configuration
   REACT_APP_API_URL=http://localhost:8080

   # External APIs
   REACT_APP_TMDB_API_KEY=your_actual_tmdb_api_key_here
   REACT_APP_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

   # Feature Flags
   REACT_APP_ENABLE_ANALYTICS=false
   REACT_APP_ENABLE_PWA=false
   REACT_APP_ENABLE_DEBUG_MODE=true
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Start the frontend**:
   ```bash
   npm start
   ```

## 🔍 Verification

### Backend Verification

1. **Check if the backend is running**:
   - Open `http://localhost:8080/api/health` (if health endpoint exists)
   - Or check `http://localhost:8080/swagger-ui.html` for API documentation

2. **Test API endpoints**:
   - Try accessing the Swagger UI
   - Test a simple endpoint like `/api/content`

### Frontend Verification

1. **Check if the frontend is running**:
   - Open `http://localhost:3000`
   - You should see the Discover App homepage

2. **Test functionality**:
   - Try searching for content
   - Test user registration/login
   - Check if content loads properly

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues

1. **Database Connection Error**:
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **API Key Errors**:
   - Verify all API keys are correct
   - Check if API keys have proper permissions
   - Ensure no extra spaces in `.env` file

3. **Port Already in Use**:
   - Change `SERVER_PORT` in `.env`
   - Or kill the process using port 8080

#### Frontend Issues

1. **API Connection Error**:
   - Ensure backend is running on port 8080
   - Check `REACT_APP_API_URL` in `.env`
   - Verify CORS configuration

2. **Build Errors**:
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check for TypeScript errors: `npx tsc --noEmit`

### Environment Variable Issues

1. **Variables not loading**:
   - Ensure `.env` files are in the correct directories
   - Check for typos in variable names
   - Restart the application after changing `.env`

2. **Sensitive data in logs**:
   - Never log API keys
   - Use environment variables for all sensitive data
   - Check application logs for exposed secrets

## 🔒 Security Best Practices

1. **Never commit `.env` files**:
   - They are already in `.gitignore`
   - Use `.env.example` files for documentation

2. **Use strong secrets**:
   - Generate strong JWT secrets
   - Use different API keys for development/production

3. **Environment separation**:
   - Use different databases for dev/staging/prod
   - Use different API keys for each environment

4. **Regular key rotation**:
   - Rotate API keys periodically
   - Monitor API usage for unusual activity

## 📚 Additional Resources

- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the application logs
3. Verify all environment variables are set correctly
4. Open an issue on GitHub with detailed error information

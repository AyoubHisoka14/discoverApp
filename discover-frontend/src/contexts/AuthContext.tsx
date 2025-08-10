import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, userAPI } from '../services/api';
import { User, LoginCredentials, RegisterData, AuthResponse, UserProfileDto } from '../types';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUserProfile: (profileData: Partial<UserProfileDto>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Function to decode JWT token (without verification - just for extracting claims)
const decodeJwtToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = decodeJwtToken(token);
        if (decodedToken && decodedToken.sub) {
          // Set user data from JWT token
          setUser({
            id: decodedToken.userId || 1, // Use userId from token, fallback to 1
            username: decodedToken.sub, // 'sub' is the standard JWT claim for subject/username
            email: decodedToken.email || `${decodedToken.sub}@example.com`,
            roles: decodedToken.roles || ['ROLE_USER'],
          });
          console.log('Initial user load:', decodedToken.sub, 'with ID:', decodedToken.userId);
        }
      } catch (error) {
        console.error('Error processing stored token:', error);
        localStorage.removeItem('token'); // Remove invalid token
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login with:', credentials);
      const response = await authAPI.login(credentials);
      const { token } = response.data;

      console.log('Received token:', token);
      localStorage.setItem('token', token);

      // Decode the JWT token to get user information
      const decodedToken = decodeJwtToken(token);
      console.log('Decoded token:', decodedToken);

      if (decodedToken && decodedToken.sub) {
        setUser({
          id: decodedToken.userId || 1, // Use userId from token, fallback to 1
          username: decodedToken.sub, // 'sub' is the standard JWT claim for subject/username
          email: decodedToken.email || `${decodedToken.sub}@example.com`,
          roles: decodedToken.roles || ['ROLE_USER'],
        });
        console.log('User set successfully:', decodedToken.sub, 'with ID:', decodedToken.userId);
        return { success: true };
      } else {
        throw new Error('Invalid token received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      await authAPI.register(userData);
      // After successful registration, log the user in
      await login(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (profileData: Partial<UserProfileDto>): Promise<void> => {
    if (!user) {
      throw new Error('User not logged in');
    }

    try {
      const response = await userAPI.updateProfile(user.id, profileData);
      const updatedProfile = response.data;

      // Update the user state with new profile data
      setUser(prev => prev ? {
        ...prev,
        username: updatedProfile.username || prev.username,
        bio: updatedProfile.bio || prev.bio,
        avatar: updatedProfile.avatar || prev.avatar,
        preferences: updatedProfile.preferences || prev.preferences,
        profileInfo: updatedProfile.profileInfo || prev.profileInfo,
      } : null);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ContentDto,
  ContentType,
  ChannelDto,
  CreateChannelRequest,
  MessageDto,
  CreateMessageRequest,
  WatchlistItemDto,
  AddToWatchListRequest,
  UpdateWatchListItem,
  ReviewDto,
  CreateReviewRequest,
  RecommendationRequest,
  UserProfileDto,
  ApiResponse,
  ErrorResponse,
  ContentDetailsDto
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request interceptor - URL:', config.url);
    console.log('Request interceptor - Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request interceptor - Authorization header set');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/api/auth/login', credentials),
  register: (userData: RegisterData): Promise<AxiosResponse<string>> =>
    api.post('/api/auth/register', userData),
};

// User API
export const userAPI = {
  getProfile: (userId: number): Promise<AxiosResponse<UserProfileDto>> =>
    api.get(`/api/users/${userId}/profile`),
  updateProfile: (userId: number, profileData: Partial<UserProfileDto>): Promise<AxiosResponse<UserProfileDto>> =>
    api.put(`/api/users/${userId}/profile`, profileData),
};

// Content API
export const contentAPI = {
  getContent: (id: number): Promise<AxiosResponse<ContentDto>> =>
    api.get(`/api/content/${id}`),
  getContentByExternalId: (externalId: string, contentType: ContentType): Promise<AxiosResponse<ContentDetailsDto>> =>
    api.get(`/api/content/details/${externalId}?type=${contentType}`),
  searchContent: (contentType: ContentType, query: string): Promise<AxiosResponse<ContentDto[]>> =>
    api.get(`/api/content/search/${contentType}?query=${encodeURIComponent(query)}`),
  getAllMovies: (): Promise<AxiosResponse<ContentDto[]>> =>
    api.get('/api/content/movies'),
  getAllSeries: (): Promise<AxiosResponse<ContentDto[]>> =>
    api.get('/api/content/series'),
  getAllAnime: (): Promise<AxiosResponse<ContentDto[]>> =>
    api.get('/api/content/anime'),
  getTrendingContent: (contentType: ContentType): Promise<AxiosResponse<ContentDto[]>> =>
      api.get(`/api/content/trending/${contentType}`),
};

// Channels API
export const channelsAPI = {
  getChannels: (): Promise<AxiosResponse<ChannelDto[]>> =>
    api.get('/api/channels'),
  getChannel: (channelId: number): Promise<AxiosResponse<ChannelDto>> =>
    api.get(`/api/channels/${channelId}`),
  createChannel: (data: CreateChannelRequest): Promise<AxiosResponse<ChannelDto>> =>
    api.post('/api/channels/create', data),
  deleteChannel: (channelId: number): Promise<AxiosResponse<void>> =>
    api.post(`/api/channels/delete/${channelId}`),
  joinChannel: (channelId: number): Promise<AxiosResponse<void>> => {
    console.log('API: Joining channel', channelId);
    return api.post(`/api/channels/join/${channelId}`);
  },
  leaveChannel: (channelId: number): Promise<AxiosResponse<void>> => {
    console.log('API: Leaving channel', channelId);
    return api.delete(`/api/channels/leave/${channelId}`);
  },
};

// Messages API
export const messagesAPI = {
  getMessages: (channelId: number) => api.get(`/api/messages/channel/${channelId}`),
  postMessage: (channelId: number, data: CreateMessageRequest) => api.post(`/api/messages/channel/${channelId}`, data),
};

// Watchlist API
export const watchlistAPI = {
  addToWatchlist: (request: AddToWatchListRequest): Promise<AxiosResponse<WatchlistItemDto>> =>
    api.post('/api/watchlist/add', request),
  updateWatchlistItem: (request: UpdateWatchListItem): Promise<AxiosResponse<WatchlistItemDto>> =>
    api.post('/api/watchlist/update', request),
  removeFromWatchlist: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/api/watchlist/remove/${id}`),
  getUserWatchlist: (): Promise<AxiosResponse<WatchlistItemDto[]>> =>
    api.get('/api/watchlist/user'),
};

// Reviews API
export const reviewsAPI = {
  getReviews: (contentId: number): Promise<AxiosResponse<ReviewDto[]>> =>
    api.get(`/api/reviews/movie/${contentId}`),
  createReview: (request: CreateReviewRequest): Promise<AxiosResponse<ReviewDto>> =>
    api.post('/api/reviews/add', request),
};

// Recommendations API
export const recommendationsAPI = {
  getRecommendations: (request: RecommendationRequest): Promise<AxiosResponse<ContentDto[]>> =>
    api.post('/api/recommendations', request),
};

// Moderation API (for admin/moderator use)
export const moderationAPI = {
  deleteMessage: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/api/moderation/message/${id}`),
  deleteChannel: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/api/moderation/channel/${id}`),
  deleteReview: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/api/moderation/review/${id}`),
};

export default api;

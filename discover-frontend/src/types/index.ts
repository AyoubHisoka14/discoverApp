// Authentication types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  preferences?: string;
  profileInfo?: string;
  bio?: string;
  avatar?: string;
}

export interface UserProfileDto {
  id: number;
  username: string;
  email: string;
  preferences?: string;
  profileInfo?: string;
  bio?: string;
  avatar?: string;
}

// Content types
export enum ContentType {
  MOVIE = 'MOVIE',
  SERIES = 'SERIES',
  ANIME = 'ANIME'
}

export enum PageType {
  HOME,
  CONTENT,
  WATCHLIST,
  AI
}

export interface ContentDto {
  id: number;
  title: string;
  description: string;
  genreIds?: number[];
  genreNames?: string[];
  posterUrl?: string;
  backdropPath?: string;
  trailerUrl?: string;
  release_date?: string;
  castList?: string;
  ratings?: number;
  type: ContentType;
  externalId?: string;
  imageUrls?: string[];
  recommendedContentIds?: string[];
  trailerId?: string;
}

export interface ContentDetailsDto {
  // Basic content information (from ContentDto)
  id: number;
  title: string;
  description: string;
  genreNames?: string[];
  posterUrl?: string;
  backdropPath?: string;
  release_date?: string;
  trailerUrl?: string;
  castList?: string;
  ratings?: number;
  type: ContentType;
  label?: string;
  externalId?: string;
  imageUrls?: string[];
  recommendedContentIds?: string[];
  trailerId?: string;
  
  // Enhanced content details
  recommendedContent?: ContentDto[];
}

// Channel types
export interface ChannelDto {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  createdById: number;
  createdByUsername: string;
  memberCount: number;
  joined: boolean; // true if the current user is a member
}

// Alias for backward compatibility
export type Channel = ChannelDto;

export interface CreateChannelRequest {
  name: string;
  description: string;
}

// Message types
export interface MessageDto {
  id: number;
  channelId: number;
  userId: number;
  username: string;
  content: string;
  parentMessageId?: number;
  createdAt: string;
  moderated: boolean;
}

export interface CreateMessageRequest {
  content: string;
  parentMessageId?: number;
}

// Watchlist types
export enum WatchListItemStatus {
  WATCHLIST = 'WATCHLIST',
  WATCHED = 'WATCHED',
  IN_PROGRESS = 'IN_PROGRESS'
}

export interface WatchlistItemDto {
  id: number;
  userId: number;
  contentId: number;
  content?: ContentDto;
  status: string;
  addedAt: string;
}

// Alias for backward compatibility
export type WatchlistItem = WatchlistItemDto;

export interface AddToWatchListRequest {
  movieId: number;
  status: string;
}

export interface UpdateWatchListItem {
  id: number;
  status: string;
}

// Review types
export interface ReviewDto {
  id: number;
  userId: number;
  contentId: number;
  rating: number;
  reviewText: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  movieId: number;
  rating: number;
  reviewText: string;
}

// Recommendation types
export interface RecommendationRequest {
  description: string;
  contentType?: ContentType;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  error: string;
  message: string;
}

// Frontend specific types for UI
export interface ContentItem extends ContentDto {
  // Additional UI properties
  year?: number;
  genre?: string;
  reason?: string;
}

export interface WatchlistItemWithContent extends WatchlistItemDto {
  content?: ContentDto;
}

export interface ReviewWithUser extends ReviewDto {
  username?: string;
}

// Form types
export interface FormData {
  [key: string]: string;
}

// Component props types
export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

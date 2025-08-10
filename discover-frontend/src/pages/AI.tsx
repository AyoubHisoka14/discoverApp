import React, {useEffect, useRef, useState} from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  SmartToy,
  Send,
  Movie,
  Tv,
  Animation,
  Star,
} from '@mui/icons-material';
import { useMutation } from 'react-query';
import { recommendationsAPI } from '../services/api';
import ContentCard from '../components/ContentCard';
import { ContentDto, ContentType, RecommendationRequest, PageType } from '../types';
import { useNavigate } from 'react-router-dom';
import { usePageState } from '../hooks/usePageState';
import { AIRecommendationsSkeleton } from '../components/SkeletonComponents';

// State persistence key
const AI_STATE_KEY = 'aiPageState';
const AI_SCROLL_KEY = 'aiScrollPosition';

interface AIPageState {
  description: string;
  contentType: ContentType | '';
  recommendations: ContentDto[];
  hasSearched: boolean;
}

const AI = () => {
  const navigate = useNavigate();
  const recommendationsRef = useRef<HTMLDivElement | null>(null);
  const aiContainerRef = useRef<HTMLDivElement | null>(null);

  // Use the enhanced page state hook with auto-reset
  const { state, updateState, clearSavedState } = usePageState<AIPageState>({
    key: AI_STATE_KEY,
    initialState: {
      description: '',
      contentType: '',
      recommendations: [],
      hasSearched: false,
    },
    persist: true,
    autoResetMinutes: 2, // Auto reset state after 2 minutes
  });

  const { description, contentType, recommendations, hasSearched } = state;

  // Save scroll position
  const saveScrollPosition = () => {
    if (aiContainerRef.current) {
      localStorage.setItem(AI_SCROLL_KEY, aiContainerRef.current.scrollTop.toString());
    }
  };

  // Restore scroll position
  const restoreScrollPosition = () => {
    const savedScroll = localStorage.getItem(AI_SCROLL_KEY);
    if (savedScroll && aiContainerRef.current) {
      setTimeout(() => {
        if (aiContainerRef.current) {
          aiContainerRef.current.scrollTop = parseInt(savedScroll);
        }
      }, 100);
    }
  };

  // AI recommendation mutation
  const { mutate: getRecommendations, isLoading } = useMutation<ContentDto[], Error, RecommendationRequest>(
    (request: RecommendationRequest) => recommendationsAPI.getRecommendations(request).then(res => res.data as ContentDto[]),
    {
    onSuccess: (data) => {
      updateState({ recommendations: data, hasSearched: true });
    },
    onError: (error) => {
        console.error('Error getting recommendations:', error);
    },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const request: RecommendationRequest = {
      description: description.trim(),
      contentType: contentType || undefined,
    };

    updateState({ description: description.trim(), contentType });
    getRecommendations(request);
  };

  const handleClear = () => {
    updateState({ 
      description: '', 
      contentType: '', 
      recommendations: [], 
      hasSearched: false 
    });
    clearSavedState();
  };

  useEffect(() => {
    if (recommendations.length > 0 && recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [recommendations]);

  // Restore scroll position on mount
  useEffect(() => {
    setTimeout(restoreScrollPosition, 200);
  }, []);

  // Save scroll position when component unmounts
  useEffect(() => {
    return () => {
      saveScrollPosition();
    };
  }, []);

  const getContentTypeIcon = () => {
    switch (contentType) {
      case ContentType.MOVIE:
        return <Movie />;
      case ContentType.SERIES:
        return <Tv />;
      case ContentType.ANIME:
        return <Animation />;
      default:
        return <SmartToy />;
    }
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case ContentType.MOVIE:
        return 'Movies';
      case ContentType.SERIES:
        return 'TV Series';
      case ContentType.ANIME:
        return 'Anime';
      default:
        return 'All Types';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <div ref={aiContainerRef}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SmartToy sx={{ mr: 1, fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4">
              AI Recommendations
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Describe what you're looking for and let our AI suggest the perfect movies, series, or anime for you.
          </Typography>
        </Box>

        {/* Input Form */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            What are you in the mood for?
          </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
                placeholder="Describe the type of content you're looking for... (e.g., 'A thrilling sci-fi movie with time travel and mind-bending plot twists')"
              value={description}
              onChange={(e) => updateState({ description: e.target.value })}
                disabled={isLoading}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Content Type (Optional)</InputLabel>
                <Select
                  value={contentType}
                  label="Content Type (Optional)"
                  onChange={(e) => updateState({ contentType: e.target.value as ContentType | '' })}
                  disabled={isLoading}
                >
                  <MenuItem value="">
                    <em>All Types</em>
                  </MenuItem>
                  <MenuItem value={ContentType.MOVIE}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Movie sx={{ mr: 1 }} />
                      Movies
                    </Box>
                  </MenuItem>
                  <MenuItem value={ContentType.SERIES}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tv sx={{ mr: 1 }} />
                      TV Series
                    </Box>
                  </MenuItem>
                  <MenuItem value={ContentType.ANIME}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Animation sx={{ mr: 1 }} />
                      Anime
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
              disabled={!description.trim() || !contentType || isLoading}
                  sx={{ minWidth: 120 }}
            >
              {isLoading ? 'Getting Recommendations...' : 'Get Recommendations'}
            </Button>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </Box>
          </Box>
          </form>

          {/* Error Display */}
          {/* Error handling removed temporarily */}
        </Paper>

        {/* Recommendations */}
        {(recommendations.length > 0 || hasSearched) && (
          <Paper ref={recommendationsRef} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              {getContentTypeIcon()}
              <Typography variant="h5" sx={{ ml: 1 }}>
                AI Recommendations
              </Typography>
              {contentType && (
                <Chip
                  label={getContentTypeLabel()}
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>

            {description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Based on your description: "{description}"
              </Typography>
            )}

            {isLoading ? (
              <AIRecommendationsSkeleton />
            ) : recommendations.length > 0 ? (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 2,
              }}>
                {recommendations.map((item) => (
                  <Box key={item.id} onClick={() => navigate(`/content/${item.externalId || item.id}/${item.type.toLowerCase()}`)} sx={{ cursor: 'pointer' }}>
                    <ContentCard item={item} showActions={true} page={PageType.AI} />
                  </Box>
                ))}
              </Box>
            ) : hasSearched && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No recommendations found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your description or content type preferences.
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Empty State */}
        {!isLoading && recommendations.length === 0 && !description && !hasSearched && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <SmartToy sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Ready for AI-powered recommendations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Describe what you're looking for above and let our AI find the perfect content for you.
            </Typography>
          </Paper>
        )}

        {/* Tips */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            💡 Tips for Better Recommendations
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              Be specific about genres, themes, or moods you enjoy
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Mention actors, directors, or similar titles you like
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Include preferences for tone (dark, lighthearted, intense, etc.)
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Specify if you want recent releases or classic content
            </Typography>
          </Box>
        </Paper>
      </div>
    </Container>
  );
};

export default AI;

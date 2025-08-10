import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Chip,
  Button,
  Rating,
  CircularProgress,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  Star,
  Movie,
  Tv,
  Animation, BookmarkAdd, Add, BrowseGallery, Image,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { contentAPI, watchlistAPI } from '../services/api';
import { ContentType, WatchListItemStatus, WatchlistItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ContentCard from '../components/ContentCard';
import TrailerPlayer from '../components/TrailerPlayer';
import ImageGallery from '../components/ImageGallery';
import RecommendedContent from '../components/RecommendedContent';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { ContentDetailsSkeleton } from '../components/SkeletonComponents';

const ContentDetails = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  // Determine content type from URL or fallback to MOVIE
  const contentType = type?.toUpperCase() as ContentType || ContentType.MOVIE;

  // Fetch comprehensive content details (basic info + enhanced details)
  const { data: contentResponse, isLoading, error } = useQuery(
    ['content-details', id, contentType],
    () => contentAPI.getContentByExternalId(id!, contentType),
    {
      enabled: !!id && !!contentType,
      staleTime: 10 * 60 * 1000, // Cache for 10 minutes
      retry: 2,
    }
  );

  // Extract content and enhanced details from response
  const content = contentResponse?.data;
  const enhancedDetails = contentResponse?.data;

  const queryClient = useQueryClient();

  // Fetch user's watchlist to check if item is already added
  const { data: userWatchlist = [] } = useQuery(
    ['watchlist'],
    () => watchlistAPI.getUserWatchlist().then(res => res.data),
    {
      enabled: !!user,
    }
  );

  // Check if the current content is already in the user's watchlist
  const isInWatchlist = content ? userWatchlist.some((watchlistItem: WatchlistItem) =>
    watchlistItem.contentId === content.id
  ) : false;

  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const [adding, setAdding] = React.useState(false);

  const addToWatchlistMutation = useMutation(
    () => {
      if (!content) throw new Error('No content loaded');
      setAdding(true);
      return watchlistAPI.addToWatchlist({ movieId: content.id, status: WatchListItemStatus.WATCHLIST });
    },
    {
      onSuccess: (response) => {
        setSnackbar({ open: true, message: 'Added to watchlist!', severity: 'success' });
        setAdding(false);
        queryClient.invalidateQueries(['watchlist']);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to add to watchlist.';
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        setAdding(false);
      },
    }
  );

  const handleAddToWatchlist = () => {
    if (!user) {
      setSnackbar({ open: true, message: 'You must be logged in.', severity: 'error' });
      return;
    }
    if (isInWatchlist) {
      setSnackbar({ open: true, message: 'This item is already in your watchlist!', severity: 'info' });
      return;
    }
    addToWatchlistMutation.mutate();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBack = () => {
    // Navigate back to the previous page or content list
    if (location.state?.from) {
      navigate(location.state.from, { replace: true });
    } else {
      // Fallback navigation based on content type
      switch (contentType) {
        case ContentType.MOVIE:
          navigate('/content');
          break;
        case ContentType.SERIES:
          navigate('/content');
          break;
        case ContentType.ANIME:
          navigate('/content');
          break;
        default:
          navigate('/content');
      }
    }
  };

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case ContentType.MOVIE:
        return <Movie />;
      case ContentType.SERIES:
        return <Tv />;
      case ContentType.ANIME:
        return <Animation />;
      default:
        return <Movie />;
    }
  };

  const getContentTypeLabel = (type: ContentType) => {
    switch (type) {
      case ContentType.MOVIE:
        return 'Movie';
      case ContentType.SERIES:
        return 'TV Series';
      case ContentType.ANIME:
        return 'Anime';
      default:
        return 'Content';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <ContentDetailsSkeleton />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error loading content
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We encountered an issue while loading the content details. Please try again later.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!content) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Content not found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The requested content could not be found.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{p: 2}}>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
      </Box>

      {/* Content Details */}
      <Grid container spacing={4}>
        {/* Poster Image */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardMedia
              component="img"
              height="500"
              image={content.posterUrl || 'https://via.placeholder.com/300x450?text=No+Image'}
              alt={content.title}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        </Grid>

        {/* Content Information */}
        <Grid item xs={12} md={8}>
          <Box>
            {/* Title and Type */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                {content.title}
              </Typography>
              <Chip
                icon={getContentIcon(content.type)}
                label={getContentTypeLabel(content.type)}
                color="primary"
                variant="outlined"
                size="medium"
              />
            </Box>

            {/* Rating */}
            {content.ratings && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Rating value={content.ratings / 2} precision={0.1} readOnly size="large" />
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                  {content.ratings.toFixed(1)}
                </Typography>
              </Box>
            )}

            {/* Release Date */}
            {content.release_date && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  Released: {new Date(content.release_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            )}

            {/* Genres */}
            {content.genreNames && content.genreNames.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Genres
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {content.genreNames.map((genre, index) => (
                    <Chip
                      key={index}
                      label={genre}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {content.description}
              </Typography>
            </Box>

            {/* Cast List */}
            {content.castList && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Cast
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {content.castList}
                </Typography>
              </Box>
            )}

            {/* External ID */}
            {content.externalId && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  External ID: {content.externalId}
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            {content && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  startIcon={<BookmarkAdd />}
                  variant="contained"
                  size="large"
                  sx={{ minWidth: 120 }}
                  onClick={() => { if (content) handleAddToWatchlist(); }}
                  disabled={adding || isInWatchlist}
                >
                  {adding ? 'Adding...' : isInWatchlist ? 'Already in Watchlist' : 'Add to Watchlist'}
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Trailer Section */}
      {(enhancedDetails?.trailerUrl || enhancedDetails?.trailerId) && (
        <Box sx={{ mt: 3 , p: 3}}>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ mr: 1 }}><Movie/></Box>
            <Typography variant="h5" gutterBottom>
              Trailer
            </Typography>
          </Box>
          <TrailerPlayer
            trailerUrl={enhancedDetails.trailerUrl}
            trailerId={enhancedDetails.trailerId}
            title={content.title}
          />
        </Box>
      )}

      {/* Image Gallery Section */}
      {enhancedDetails?.imageUrls && enhancedDetails.imageUrls.length > 0 && (
        <Box sx={{ p:3 }}>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ mr: 1 }}><Image/></Box>
              <Typography variant="h5" gutterBottom>
                Gallery
              </Typography>
          </Box>
          <ImageGallery
              images={enhancedDetails.imageUrls}
              title={content.title}
          />
        </Box>
      )}

      {/* Recommended Content Section */}
      {enhancedDetails?.recommendedContent && enhancedDetails.recommendedContent.length > 0 && (
        <Box>
          <Divider sx={{ mb: 3, ml: 3 }} />
          <RecommendedContent
            recommendedContent={enhancedDetails.recommendedContent}
            title="You might also like"
          />
        </Box>
      )}


    </Paper>
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
    </Container>

  );
};

export default ContentDetails;

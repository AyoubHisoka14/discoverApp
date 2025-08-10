import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider, Pagination,
} from '@mui/material';
import {Animation, Movie, Tv,} from '@mui/icons-material';
import {useQuery, useQueryClient} from 'react-query';
import {contentAPI} from '../services/api';
import {ContentDto, ContentType, PageType} from '../types';
import {useAuth} from '../contexts/AuthContext';
import ContentCard from "../components/ContentCard";
import { usePageState } from '../hooks/usePageState';
import { ContentGridSkeleton } from '../components/SkeletonComponents';

// State persistence keys
const CONTENT_STATE_KEY = 'contentPageState';
const CONTENT_SCROLL_KEY = 'contentScrollPosition';

interface ContentPageState {
  contentType: ContentType;
  selectedGenre: string;
  selectedYear: string;
  minRating: number;
  sortBy: string;
  currentPage: number;
}

const Content = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const itemsPerPage = 40;
  const contentTopRef = useRef<HTMLDivElement | null>(null);
  const contentContainerRef = useRef<HTMLDivElement | null>(null);

  // Use the enhanced page state hook with auto-reset
  const { state, updateState, clearSavedState } = usePageState<ContentPageState>({
    key: CONTENT_STATE_KEY,
    initialState: {
      contentType: ContentType.MOVIE,
      selectedGenre: '',
      selectedYear: '',
      minRating: 0,
      sortBy: 'title-asc',
      currentPage: 1,
    },
    persist: true,
    autoResetMinutes: 2, // Auto reset state after 2 minutes
  });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Destructure state for easier access
  const { contentType, selectedGenre, selectedYear, minRating, sortBy, currentPage } = state;

  // Save scroll position
  const saveScrollPosition = () => {
    if (contentContainerRef.current) {
      localStorage.setItem(CONTENT_SCROLL_KEY, contentContainerRef.current.scrollTop.toString());
    }
  };

  // Restore scroll position
  const restoreScrollPosition = () => {
    const savedScroll = localStorage.getItem(CONTENT_SCROLL_KEY);
    if (savedScroll && contentContainerRef.current) {
      setTimeout(() => {
        if (contentContainerRef.current) {
          contentContainerRef.current.scrollTop = parseInt(savedScroll);
        }
      }, 100);
    }
  };

  // Handle page change with scroll to top
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    updateState({ currentPage: value });
    // Scroll to top when page changes
    if (contentTopRef.current) {
      contentTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Save state whenever filters change
  useEffect(() => {
    updateState({ selectedGenre, selectedYear, minRating, sortBy });
  }, [selectedGenre, selectedYear, minRating, sortBy]);

  // Save state when page changes
  useEffect(() => {
    updateState({ currentPage });
  }, [currentPage]);

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

  // Fetch content based on type
  const { data: contentData = [], isLoading, error, refetch } = useQuery(
    ['content', contentType],
    () => {
      switch (contentType) {
        case ContentType.MOVIE:
          return contentAPI.getAllMovies().then(res => res.data);
        case ContentType.SERIES:
          return contentAPI.getAllSeries().then(res => res.data);
        case ContentType.ANIME:
          return contentAPI.getAllAnime().then(res => res.data);
        default:
          return Promise.resolve([]);
      }
    },
    {
      enabled: true,
      staleTime: 0, // Always consider data stale
      cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: true, // Always refetch when component mounts
      retry: 2, // Retry failed requests 2 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  // Extract unique genres and years from contentData
  const allGenres = Array.from(
    new Set(
      contentData.flatMap((item: any) => item.genreNames || [])
    )
  ).sort();
  const allYears = Array.from(
    new Set(
      contentData
        .map((item: any) => item.release_date && new Date(item.release_date).getFullYear())
        .filter(Boolean)
    )
  ).sort((a, b) => b - a);

  // Filtering
  const filteredContent = contentData.filter((item: any) => {
    const matchesGenre = selectedGenre ? (item.genreNames || []).includes(selectedGenre) : true;
    const matchesYear = selectedYear ? (item.release_date && new Date(item.release_date).getFullYear().toString() === selectedYear) : true;
    const matchesRating = item.ratings === undefined || item.ratings === null ? true : item.ratings >= minRating;
    return matchesGenre && matchesYear && matchesRating;
  });

  // Sorting
  const sortedContent = [...filteredContent].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'year-asc':
        return (a.release_date ? new Date(a.release_date).getFullYear() : 0) - (b.release_date ? new Date(b.release_date).getFullYear() : 0);
      case 'year-desc':
        return (b.release_date ? new Date(b.release_date).getFullYear() : 0) - (a.release_date ? new Date(b.release_date).getFullYear() : 0);
      case 'rating-asc':
        return (a.ratings || 0) - (b.ratings || 0);
      case 'rating-desc':
        return (b.ratings || 0) - (a.ratings || 0);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedContent.length / itemsPerPage);
  const paginatedContent = sortedContent.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleContentTypeChange = (event: React.SyntheticEvent, newType: ContentType) => {
    // Clear the cache for the current content type to force fresh data
    queryClient.removeQueries(['content', contentType]);
    updateState({ 
      contentType: newType,
      selectedGenre: '', 
      selectedYear: '', 
      minRating: 0, 
      sortBy: 'title-asc', 
      currentPage: 1 
    });
  };

  const handleRetry = () => {
    // Clear cache and refetch
    queryClient.removeQueries(['content', contentType]);
    refetch();
  };

  const handleResetFilters = () => {
    updateState({ 
      selectedGenre: '', 
      selectedYear: '', 
      minRating: 0, 
      sortBy: 'title-asc', 
      currentPage: 1 
    });
  };

  const getContentIcon = () => {
    switch (contentType) {
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

  const getContentTitle = () => {
    switch (contentType) {
      case ContentType.MOVIE:
        return 'Movies';
      case ContentType.SERIES:
        return 'TV Series';
      case ContentType.ANIME:
        return 'Anime';
      default:
        return 'Content';
    }
  };

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case ContentType.MOVIE:
        return 'primary' as const;
      case ContentType.SERIES:
        return 'secondary' as const;
      case ContentType.ANIME:
        return 'default' as const;
      default:
        return 'primary' as const;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <div ref={contentContainerRef}>
        <>
          {/* Content Type Toggle Buttons - Always visible */}
          <div ref={contentTopRef}/>
          <Paper sx={{mb: 4}}>
            <Tabs
                value={contentType}
                onChange={handleContentTypeChange}
                centered
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 64,
                    fontSize: '1rem',
                  },
                }}
            >
              <Tab
                  value={ContentType.MOVIE}
                  label="Movies"
                  icon={<Movie/>}
                  iconPosition="start"
              />
              <Tab
                  value={ContentType.SERIES}
                  label="Series"
                  icon={<Tv/>}
                  iconPosition="start"
              />
              <Tab
                  value={ContentType.ANIME}
                  label="Anime"
                  icon={<Animation/>}
                  iconPosition="start"
              />
            </Tabs>
          </Paper>

          {/* Filters and Sorting Controls */}
          <Paper
              sx={{
                mb: 4,
                p: 2,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                alignItems: 'center',
                justifyContent: 'center',
              }}
          >
            {/* Genre Filter */}
            <FormControl sx={{minWidth: 160}} size="small">
              <InputLabel>Genre</InputLabel>
              <Select
                  value={selectedGenre}
                  label="Genre"
                  onChange={e => updateState({ selectedGenre: e.target.value })}
              >
                <MenuItem value=""><em>All</em></MenuItem>
                {allGenres.map((genre) => (
                    <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Year Filter */}
            <FormControl sx={{minWidth: 120}} size="small">
              <InputLabel>Year</InputLabel>
              <Select
                  value={selectedYear}
                  label="Year"
                  onChange={e => updateState({ selectedYear: e.target.value })}
              >
                <MenuItem value=""><em>All</em></MenuItem>
                {allYears.map((year) => (
                    <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Rating Filter */}
            <Box sx={{minWidth: 180, display: 'flex', alignItems: 'center'}}>
              <Typography sx={{mr: 3}}>Min Rating</Typography>
              <Slider
                  value={minRating}
                  onChange={(_, value) => updateState({ minRating: value as number })}
                  min={0}
                  max={10}
                  step={0.5}
                  valueLabelDisplay="auto"
                  sx={{width: 100}}
              />
              <Typography sx={{ml: 1}}>{minRating}</Typography>
            </Box>
            {/* Sorting */}
            <FormControl sx={{minWidth: 180}} size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={e => updateState({ sortBy: e.target.value })}
              >
                <MenuItem value="title-asc">Title (A-Z)</MenuItem>
                <MenuItem value="title-desc">Title (Z-A)</MenuItem>
                <MenuItem value="year-desc">Year (Newest)</MenuItem>
                <MenuItem value="year-asc">Year (Oldest)</MenuItem>
                <MenuItem value="rating-desc">Rating (High-Low)</MenuItem>
                <MenuItem value="rating-asc">Rating (Low-High)</MenuItem>
              </Select>
            </FormControl>
            {/* Reset Filters Button */}
            <Button variant="outlined" size="small" onClick={handleResetFilters}>
              Reset
            </Button>
          </Paper>

          {/* Content Header - Always visible */}
          <Box sx={{mb: 4}}>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
              {getContentIcon()}
              <Typography variant="h4" sx={{ml: 1}}>
                {getContentTitle()}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Discover amazing {contentType.toLowerCase()} content. Browse, rate, and add to your watchlist.
            </Typography>
          </Box>

          {/* Loading State */}
          {isLoading && (
            <ContentGridSkeleton count={12} />
          )}

          {/* Error State */}
          {error && !isLoading && (
              <Paper sx={{p: 4, textAlign: 'center'}}>
                <Typography variant="h6" color="error" gutterBottom>
                  Error loading content
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                  We encountered an issue while loading {contentType.toLowerCase()}. Please try again later.
                </Typography>
                <Button
                    variant="contained"
                    onClick={handleRetry}
                    sx={{mt: 2}}
                >
                  Retry
                </Button>
              </Paper>
          )}

          {/* Content Grid - Only show when not loading and no error */}
          {!isLoading && !error && (
              <>
                <Grid container spacing={2}>
                  {paginatedContent.map((item: ContentDto) => (
                      <Grid item xs={12} sm={6} md={3} key={item.id}>
                        <ContentCard item={item} page={PageType.CONTENT}/>
                      </Grid>
                  ))}
                </Grid>

                {sortedContent.length === 0 && (
                    <Paper sx={{p: 4, textAlign: 'center'}}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No {contentType.toLowerCase()} found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try switching to a different content type or check back later for new releases.
                      </Typography>
                    </Paper>
                )}

                {totalPages > 1 && (
                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                      <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={handlePageChange}
                          color="primary"
                      />
                    </Box>
                )}
              </>
          )}

          <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              onClose={handleSnackbarClose}
              anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{width: '100%'}}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      </div>
    </Container>
  );
};

export default Content;
